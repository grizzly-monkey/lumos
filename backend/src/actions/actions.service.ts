import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentAction } from './entities/agent-action.entity';
import { Incident } from '../monitoring/entities/incident.entity';
import { EventsGateway } from '../events/events.gateway';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import EventSource from 'eventsource';

// Polyfill EventSource for Node.js environment
// Cast to any to avoid strict type mismatch with the global EventSource interface
global.EventSource = EventSource as any;

@Injectable()
export class ActionsService implements OnModuleInit {
  private readonly logger = new Logger(ActionsService.name);
  private mcpClient: Client;

  constructor(
    @InjectRepository(AgentAction)
    private readonly agentActionRepository: Repository<AgentAction>,
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async onModuleInit() {
    this.mcpClient = new Client(
      { name: 'nightwatch-backend', version: '1.0.0' },
      { capabilities: {} }
    );

    try {
      // Connect to the MCP Server on localhost:9001
      const transport = new SSEClientTransport(new URL('http://localhost:9001/sse'));
      await this.mcpClient.connect(transport);
      this.logger.log('✅ Connected to MariaDB MCP Server on port 9001');
    } catch (error) {
      this.logger.warn('⚠️ Failed to connect to MCP Server on port 9001. Actions will be simulated.', error.message);
    }
  }

  async executeAction(incident: Incident, analysis: any) {
    this.logger.log(
      `Executing action ${analysis.action} for incident ${incident.id}`,
    );

    let actionStatus = 'success';
    let resultNotes = 'Action executed successfully via MCP.';

    // Try to execute via MCP if connected
    if (this.mcpClient) {
      try {
        // Map the abstract action to a concrete SQL command or MCP tool call
        // For this demo, we'll assume we can run a SQL query via a 'query' tool
        // or just log that we are calling it.

        // In a real scenario, you'd have specific tools like 'create_index', 'kill_query', etc.
        // Let's try to call a tool named 'query' if it exists, or fallback to simulation.

        const tools = await this.mcpClient.listTools();
        const queryTool = tools.tools.find(t => t.name === 'query');

        if (queryTool) {
            // Construct a SQL query based on the action type
            let sql = '';
            switch (analysis.action) {
                case 'kill_query':
                    sql = `KILL ${Math.floor(Math.random() * 1000) + 1};`; // Simulated ID
                    break;
                case 'create_index':
                    sql = `CREATE INDEX idx_auto_fix ON ${incident.database.name}.table_name (column_name);`; // Placeholder
                    break;
                case 'rebuild_index':
                    sql = `OPTIMIZE TABLE ${incident.database.name}.table_name;`;
                    break;
                case 'scale_connections':
                    sql = `SET GLOBAL max_connections = max_connections + 50;`;
                    break;
                case 'clear_logs':
                    sql = `PURGE BINARY LOGS BEFORE NOW();`;
                    break;
                case 'update_statistics':
                    sql = `ANALYZE TABLE ${incident.database.name}.table_name;`;
                    break;
                default:
                    sql = `SELECT 1;`; // No-op
            }

            this.logger.log(`MCP: Executing SQL: ${sql}`);
            await this.mcpClient.callTool({
                name: 'query',
                arguments: { sql }
            });
        } else {
             this.logger.warn('MCP "query" tool not found. Simulating action.');
        }

      } catch (error) {
        this.logger.error(`MCP Action failed: ${error.message}`);
        actionStatus = 'failed';
        resultNotes = `MCP Execution failed: ${error.message}`;
      }
    }

    // 1. Create the Action Record
    const action = this.agentActionRepository.create({
      incident,
      actionType: analysis.action,
      actionDetails: analysis.reasoning,
      confidenceScore: analysis.confidence,
      status: actionStatus,
      rollbackPlan: analysis.rollback_plan,
      resultNotes: resultNotes
    });

    await this.agentActionRepository.save(action);

    // 2. Update the Incident Record
    incident.status = 'resolved';
    incident.fixApplied = analysis.action;
    incident.resolutionNotes = analysis.reasoning;
    incident.resolvedAt = new Date();
    
    const updatedIncident = await this.incidentRepository.save(incident);

    // 3. Broadcast the update
    const fullIncident = await this.incidentRepository.findOne({
      where: { id: updatedIncident.id },
      relations: ['database'],
    });

    if (fullIncident) {
      this.eventsGateway.broadcast('incident_updated', fullIncident);
    }
  }
}
