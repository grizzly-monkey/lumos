import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Database } from './entities/database.entity';
import { Incident } from './entities/incident.entity';
import { AiService } from '../ai/ai.service';
import { EventsGateway } from '../events/events.gateway';
import { Metric } from './entities/metric.entity';

interface Anomaly {
  issue_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    @InjectRepository(Database)
    private databaseRepository: Repository<Database>,
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
    private aiService: AiService,
    private eventsGateway: EventsGateway,
  ) {}

  @Cron(process.env.MONITOR_INTERVAL || CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    this.logger.log('Running monitoring cycle...');
    const databases = await this.databaseRepository.find();

    await Promise.all(
      databases.map(async (db) => {
        try {
          const metrics = this.collectMetrics(db);
          this.eventsGateway.broadcast('metrics_update', metrics);

          const anomaly = this.detectAnomaly(metrics);
          if (anomaly) {
            const incident = await this.createIncident(db, anomaly);
            if (incident) {
              this.eventsGateway.broadcast('incident_detected', incident);
              this.aiService.startIncidentAnalysis(incident);
            }
          }
        } catch (error) {
          this.logger.error(
            `Failed to process monitoring for database: ${db.name}`,
            error.stack,
          );
        }
      }),
    );
  }

  private collectMetrics(db: Database): Partial<Metric> {
    this.logger.log(`Collecting metrics for ${db.name}...`);
    return {
      database: db,
      timestamp: new Date(),
      cpuPercent: Math.random() * 100,
      memoryPercent: 40 + Math.random() * 30,
      activeConnections: Math.floor(Math.random() * 100),
      maxConnections: 150,
      slowQueriesCount: Math.floor(Math.random() * 5),
      diskUsagePercent: 60 + Math.random() * 10,
      queriesPerSecond: 500 + Math.random() * 1000,
      avgQueryTimeMs: 20 + Math.random() * 50,
    };
  }

  private detectAnomaly(metrics: Partial<Metric>): Anomaly | null {
    // 1. High CPU
    if (typeof metrics.cpuPercent === 'number' && metrics.cpuPercent > 90) {
      return {
        issue_type: 'high_cpu',
        severity: 'critical',
        symptoms: `CPU usage critical at ${metrics.cpuPercent.toFixed(1)}%. Possible runaway query or resource contention.`,
      };
    }

    // 2. Memory Leak / High Usage
    if (typeof metrics.memoryPercent === 'number' && metrics.memoryPercent > 85) {
      return {
        issue_type: 'memory_pressure',
        severity: 'high',
        symptoms: `Memory usage high at ${metrics.memoryPercent.toFixed(1)}%. Buffer pool may be undersized.`,
      };
    }

    // 3. Connection Spike
    if (typeof metrics.activeConnections === 'number' && metrics.activeConnections > 120) {
      return {
        issue_type: 'connection_spike',
        severity: 'medium',
        symptoms: `Active connections spiked to ${metrics.activeConnections} (Max: 150). Risk of connection refusal.`,
      };
    }

    // 4. Slow Query Storm
    if (typeof metrics.slowQueriesCount === 'number' && metrics.slowQueriesCount > 3) {
      return {
        issue_type: 'slow_query_storm',
        severity: 'high',
        symptoms: `Detected ${metrics.slowQueriesCount} slow queries in the last window. Application performance degrading.`,
      };
    }

    return null;
  }

  private async createIncident(db: Database, anomaly: Anomaly): Promise<Incident | null> {
    const newIncident = this.incidentRepository.create({
      database: db,
      issueType: anomaly.issue_type,
      severity: anomaly.severity,
      symptoms: anomaly.symptoms,
      status: 'open',
    });
    const saved = await this.incidentRepository.save(newIncident);
    return this.incidentRepository.findOne({ where: { id: saved.id }, relations: ['database'] });
  }
}
