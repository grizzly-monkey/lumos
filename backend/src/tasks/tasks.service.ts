import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionHistory } from '../actions/entities/action-history.entity';
import { Database } from '../monitoring/entities/database.entity';
import { DbLog } from '../monitoring/entities/db-log.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(ActionHistory)
    private actionHistoryRepository: Repository<ActionHistory>,
    @InjectRepository(Database)
    private databaseRepository: Repository<Database>,
    @InjectRepository(DbLog)
    private dbLogRepository: Repository<DbLog>,
  ) {}

  // ... (Previous methods: handleBackupVerification, handleHealthCheck, handlePerformanceMonitoring, handleConnectionManagement, handleLogAnalysis remain unchanged)
  @Cron(CronExpression.EVERY_MINUTE)
  async handleBackupVerification() {
    // ... (Keep existing logic)
    this.logger.log('Running Daily Task: Backup Verification');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const isSuccess = Math.random() > 0.05;
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

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleHealthCheck() {
    // ... (Keep existing logic)
    this.logger.log('Running Daily Task: Database Health Check');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const isHealthy = Math.random() > 0.02;
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

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handlePerformanceMonitoring() {
    // ... (Keep existing logic)
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

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleConnectionManagement() {
    // ... (Keep existing logic)
    this.logger.log('Running Daily Task: Connection Pool Management');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const runawayQueries = Math.random() < 0.1 ? Math.floor(Math.random() * 2) + 1 : 0;
      if (runawayQueries > 0) {
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'kill_query',
          description: `Auto-killed ${runawayQueries} runaway quer(ies) lasting over 5 minutes.`,
          executedBy: 'ai_agent',
          success: true,
          details: { queryId: [1234, 5678].slice(0, runawayQueries) },
        });
        await this.actionHistoryRepository.save(record);
      } else {
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

  @Cron(CronExpression.EVERY_MINUTE)
  async handleLogAnalysis() {
    // ... (Keep existing logic)
    this.logger.log('Running Daily Task: Log Analysis');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const lastLog = await this.dbLogRepository.findOne({
        where: { database: { id: db.id } },
        order: { eventTime: 'DESC' },
      });
      let description: string;
      let success: boolean;
      if (lastLog) {
        const logContent = `${lastLog.commandType} ${lastLog.argument}`.toLowerCase();
        if (logContent.includes('error') || logContent.includes('deadlock') || logContent.includes('denied') || logContent.includes('full')) {
          description = `Log analysis found critical issue: "${lastLog.argument.substring(0, 100)}..."`;
          success = false;
        } else if (logContent.includes('duration') && logContent.includes('sec')) {
           description = `Log analysis found slow query: "${lastLog.argument.substring(0, 100)}..."`;
           success = false;
        } else {
          description = `Log analysis for ${db.name} completed. No critical errors found in recent logs.`;
          success = true;
        }
      } else {
        description = `Log analysis for ${db.name} completed. No recent log entries found.`;
        success = true;
      }
      const record = this.actionHistoryRepository.create({
        database: db,
        actionType: 'log_analysis',
        description,
        executedBy: 'scheduled_task',
        success,
        details: lastLog ? { logId: lastLog.threadId, type: lastLog.commandType } : {},
      });
      await this.actionHistoryRepository.save(record);
    }
  }

  /**
   * Runs every 40 seconds to monitor storage capacity and auto-clean logs if needed.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleStorageMonitoring() {
    this.logger.log('Running Daily Task: Storage Capacity Monitoring');
    const databases = await this.databaseRepository.find();

    for (const db of databases) {
      // Simulate disk usage. 10% chance of being critical (>90%)
      const diskUsage = Math.random() < 0.1 ? 90 + Math.random() * 9 : 40 + Math.random() * 30;
      
      if (diskUsage > 90) {
        // Autonomous Action: Clear logs
        const freedSpace = (Math.random() * 5 + 1).toFixed(1); // 1.0 to 6.0 GB
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'clear_logs',
          description: `Disk usage critical (${diskUsage.toFixed(1)}%). Auto-archived and purged ${freedSpace}GB of old transaction logs.`,
          executedBy: 'ai_agent', // Autonomous action
          success: true,
          details: { initialUsage: diskUsage, freedGb: freedSpace },
        });
        await this.actionHistoryRepository.save(record);
      } else {
        // Routine check
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'storage_check',
          description: `Storage capacity check passed. Disk usage at ${diskUsage.toFixed(1)}%.`,
          executedBy: 'scheduled_task',
          success: true,
          details: { usagePercent: diskUsage },
        });
        await this.actionHistoryRepository.save(record);
      }
    }
  }
}
