import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentAction } from './entities/agent-action.entity';
import { Incident } from '../monitoring/entities/incident.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ActionsService {
  private readonly logger = new Logger(ActionsService.name);

  constructor(
    @InjectRepository(AgentAction)
    private agentActionRepository: Repository<AgentAction>,
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
    private eventsGateway: EventsGateway,
  ) {}

  async executeAction(incident: Incident, analysis: any) {
    this.logger.log(
      `Executing action ${analysis.action} for incident ${incident.id}`,
    );

    // 1. Create the Action Record
    const action = this.agentActionRepository.create({
      incident,
      actionType: analysis.action,
      actionDetails: analysis.reasoning,
      confidenceScore: analysis.confidence,
      status: 'success', // Assume success for simulation
      rollbackPlan: analysis.rollback_plan,
    });

    await this.agentActionRepository.save(action);

    // 2. Update the Incident Record
    incident.status = 'resolved';
    incident.fixApplied = analysis.action;
    incident.resolutionNotes = analysis.reasoning;
    incident.resolvedAt = new Date();
    
    const updatedIncident = await this.incidentRepository.save(incident);

    // 3. Broadcast the update so the frontend sees the resolution immediately
    // We need to fetch the relation to ensure the frontend has the DB name
    const fullIncident = await this.incidentRepository.findOne({
      where: { id: updatedIncident.id },
      relations: ['database'],
    });

    if (fullIncident) {
      this.eventsGateway.broadcast('incident_updated', fullIncident);
    }
  }
}
