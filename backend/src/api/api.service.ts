import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Database } from '../monitoring/entities/database.entity';
import { Incident } from '../monitoring/entities/incident.entity';
import { Metric } from '../monitoring/entities/metric.entity';
import { AgentAction } from '../actions/entities/agent-action.entity';
import { ActionHistory } from '../actions/entities/action-history.entity';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(Database)
    private databaseRepository: Repository<Database>,
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
    @InjectRepository(Metric)
    private metricRepository: Repository<Metric>,
    @InjectRepository(AgentAction)
    private agentActionRepository: Repository<AgentAction>,
    @InjectRepository(ActionHistory)
    private actionHistoryRepository: Repository<ActionHistory>,
  ) {}

  async getStatus() {
    const databaseCount = await this.databaseRepository.count();
    const criticalIncidents = await this.incidentRepository.count({
      where: { severity: 'critical', status: 'open' },
    });
    return { databaseCount, criticalIncidents };
  }

  async getDatabases() {
    return this.databaseRepository.find();
  }

  async getMetricsForDatabase(databaseId: number, range: string) {
    // TODO: Implement date range filtering
    return this.metricRepository.find({
      where: { database: { id: databaseId } },
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }

  async getRecentIncidents(status: string) {
    return this.incidentRepository.find({
      where: { status: status || 'open' },
      order: { timestamp: 'DESC' },
      take: 10,
    });
  }

  async getRecentActions() {
    return this.agentActionRepository.find({
      order: { timestamp: 'DESC' },
      take: 10,
    });
  }

  async getActionHistory() {
    // Fetch the last 24 hours of activity
    return this.actionHistoryRepository.find({
      relations: ['database'],
      order: { timestamp: 'DESC' },
      take: 50, // Limit to the last 50 entries for performance
    });
  }
}
