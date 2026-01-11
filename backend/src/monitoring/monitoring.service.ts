import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Database } from './entities/database.entity';
import { Incident } from './entities/incident.entity';
import { AiService } from '../ai/ai.service';
import { EventsGateway } from '../events/events.gateway';
import { Metric } from './entities/metric.entity';

// Define a specific type for anomaly data for better type safety.
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

    // Process all databases in parallel for better performance.
    await Promise.all(
      databases.map(async (db) => {
        try {
          const metrics = this.collectMetrics(db);
          this.eventsGateway.broadcast('metrics_update', metrics);

          const anomaly = this.detectAnomaly(metrics);
          if (anomaly) {
            const incident = await this.createIncident(db, anomaly);
            this.eventsGateway.broadcast('incident_detected', incident);
            // Do not await this, let it run in the background.
            this.aiService.startIncidentAnalysis(incident);
          }
        } catch (error) {
          // Catch errors per-database to prevent crashing the whole cron job.
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
    // Add a type guard to ensure cpuPercent is defined and is a number.
    if (typeof metrics.cpuPercent === 'number' && metrics.cpuPercent > 90) {
      return {
        issue_type: 'high_cpu',
        severity: 'critical',
        symptoms: `CPU at ${metrics.cpuPercent.toFixed(2)}%`,
      };
    }
    return null;
  }

  private async createIncident(db: Database, anomaly: Anomaly): Promise<Incident> {
    const newIncident = this.incidentRepository.create({
      database: db,
      issueType: anomaly.issue_type,
      severity: anomaly.severity,
      symptoms: anomaly.symptoms,
      status: 'open',
    });
    return this.incidentRepository.save(newIncident);
  }
}
