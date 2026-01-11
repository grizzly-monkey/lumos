import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionHistory } from '../actions/entities/action-history.entity';
import { Database } from '../monitoring/entities/database.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(ActionHistory)
    private actionHistoryRepository: Repository<ActionHistory>,
    @InjectRepository(Database)
    private databaseRepository: Repository<Database>,
  ) {}

  /**
   * Runs every minute to simulate a daily backup verification task.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleBackupVerification() {
    this.logger.log('Running Daily Task: Backup Verification');
    const databases = await this.databaseRepository.find();

    for (const db of databases) {
      const isSuccess = Math.random() > 0.05; // 95% success rate
      const record = this.actionHistoryRepository.create({
        database: db,
        actionType: 'backup_verification',
        description: isSuccess
          ? `Backup for ${db.name} verified successfully.`
          : `Backup for ${db.name} failed integrity check.`,
        executedBy: 'scheduled_task',
        success: isSuccess,
        details: { verificationMethod: 'checksum' },
      });
      await this.actionHistoryRepository.save(record);
    }
  }

  /**
   * Runs every 45 seconds to simulate a database health check.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleHealthCheck() {
    this.logger.log('Running Daily Task: Database Health Check');
    const databases = await this.databaseRepository.find();

    for (const db of databases) {
      const isHealthy = Math.random() > 0.02; // 98% success rate
      let description: string;

      if (isHealthy) {
        description = `Health check for ${db.name} passed.`;
        if (db.status === 'offline') {
          db.status = 'healthy';
          await this.databaseRepository.save(db);
        }
      } else {
        description = `Health check for ${db.name} failed. Database is offline.`;
        db.status = 'offline';
        await this.databaseRepository.save(db);
      }

      const record = this.actionHistoryRepository.create({
        database: db,
        actionType: 'database_health_check',
        description,
        executedBy: 'scheduled_task',
        success: isHealthy,
        details: { checkMethod: 'connection_ping' },
      });
      await this.actionHistoryRepository.save(record);
    }
  }

  /**
   * Runs every 30 seconds to simulate performance monitoring.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handlePerformanceMonitoring() {
    this.logger.log('Running Daily Task: Performance Monitoring');
    const databases = await this.databaseRepository.find();

    for (const db of databases) {
      const slowQueries = Math.floor(Math.random() * 3);
      const isSuccess = slowQueries === 0;
      const record = this.actionHistoryRepository.create({
        database: db,
        actionType: 'performance_monitoring',
        description: isSuccess
          ? `Performance metrics for ${db.name} are within baseline.`
          : `Detected ${slowQueries} slow quer(ies) on ${db.name} exceeding baseline threshold.`,
        executedBy: 'scheduled_task',
        success: isSuccess,
        details: { checked: ['cpu', 'memory', 'slow_queries'] },
      });
      await this.actionHistoryRepository.save(record);
    }
  }

  /**
   * Runs every 20 seconds to manage connection pools and kill runaway queries.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleConnectionManagement() {
    this.logger.log('Running Daily Task: Connection Pool Management');
    const databases = await this.databaseRepository.find();

    for (const db of databases) {
      // Simulate detecting a runaway query (10% chance)
      const runawayQueries = Math.random() < 0.1 ? Math.floor(Math.random() * 2) + 1 : 0;

      if (runawayQueries > 0) {
        // Autonomous Action: Kill the query
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'kill_query',
          description: `Auto-killed ${runawayQueries} runaway quer(ies) lasting over 5 minutes.`,
          executedBy: 'ai_agent', // This is an autonomous action
          success: true,
          details: { queryId: [1234, 5678].slice(0, runawayQueries) },
        });
        await this.actionHistoryRepository.save(record);
      } else {
        // Log a routine check if no action was needed
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'connection_pool_check',
          description: `Connection pool for ${db.name} is healthy.`,
          executedBy: 'scheduled_task',
          success: true,
        });
        await this.actionHistoryRepository.save(record);
      }
    }
  }
}
