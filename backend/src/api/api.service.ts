import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
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
    return this.actionHistoryRepository.find({
      relations: ['database'],
      order: { timestamp: 'DESC' },
      take: 50,
    });
  }

  async getAgentSummary() {
    // Calculate summary stats for the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const history = await this.actionHistoryRepository.find({
      where: { timestamp: MoreThan(oneDayAgo) },
    });

    const backups = history.filter(h => h.actionType === 'backup_verification' && h.success).length;
    const killedQueries = history.filter(h => h.actionType === 'kill_query').length;
    const rebuiltIndexes = history.filter(h => h.actionType === 'rebuild_index').length;
    
    // Calculate cleared logs size
    const clearedLogsEvents = history.filter(h => h.actionType === 'clear_logs');
    let clearedGb = 0;
    clearedLogsEvents.forEach(e => {
      if (e.details && e.details.freedGb) {
        clearedGb += parseFloat(e.details.freedGb);
      }
    });

    // Count warnings/criticals
    const warnings = history.filter(h => !h.success).length;

    // Estimate impact
    const dbaPagesAvoided = warnings + killedQueries; 
    const timeSavedHours = (backups * 0.1) + (killedQueries * 0.5) + (rebuiltIndexes * 1.0) + (clearedLogsEvents.length * 0.5);

    const lastAction = await this.actionHistoryRepository.findOne({
      where: { executedBy: 'ai_agent' },
      order: { timestamp: 'DESC' },
    });

    const dbCount = await this.databaseRepository.count();

    return {
      status: 'Active',
      monitoredDatabases: dbCount,
      lastActionTime: lastAction ? lastAction.timestamp : null,
      backupsCompleted: backups,
      queriesKilled: killedQueries,
      indexesRebuilt: rebuiltIndexes,
      logsClearedGb: clearedGb.toFixed(1),
      warningsDetected: warnings,
      dbaPagesAvoided: dbaPagesAvoided,
      timeSavedHours: timeSavedHours.toFixed(1),
    };
  }
}
