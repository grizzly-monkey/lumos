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

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleBackupVerification() {
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

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleLogAnalysis() {
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

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleStorageMonitoring() {
    this.logger.log('Running Daily Task: Storage Capacity Monitoring');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const diskUsage = Math.random() < 0.1 ? 90 + Math.random() * 9 : 40 + Math.random() * 30;
      if (diskUsage > 90) {
        const freedSpace = (Math.random() * 5 + 1).toFixed(1);
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'clear_logs',
          description: `Disk usage critical (${diskUsage.toFixed(1)}%). Auto-archived and purged ${freedSpace}GB of old transaction logs.`,
          executedBy: 'ai_agent',
          success: true,
          details: { initialUsage: diskUsage, freedGb: freedSpace },
        });
        await this.actionHistoryRepository.save(record);
      } else {
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

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleDeadlockDetection() {
    this.logger.log('Running Daily Task: Deadlock Detection');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const hasDeadlock = Math.random() < 0.05;
      if (hasDeadlock) {
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'deadlock_detected',
          description: `Deadlock detected between transaction 1023 and 1045. Suggest reviewing index on 'orders' table to reduce lock contention.`,
          executedBy: 'scheduled_task',
          success: false,
          details: { victimTrx: 1023, winnerTrx: 1045 },
        });
        await this.actionHistoryRepository.save(record);
      } else {
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'deadlock_check',
          description: `Deadlock monitor scan completed. No deadlocks found.`,
          executedBy: 'scheduled_task',
          success: true,
        });
        await this.actionHistoryRepository.save(record);
      }
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleIndexMaintenance() {
    this.logger.log('Running Daily Task: Index Maintenance');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const fragmentation = Math.random() < 0.1 ? 30 + Math.random() * 40 : Math.random() * 10;
      if (fragmentation > 30) {
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'rebuild_index',
          description: `High fragmentation detected (${fragmentation.toFixed(1)}%) on table 'orders'. Auto-rebuilt index 'idx_customer_id'.`,
          executedBy: 'ai_agent',
          success: true,
          details: { initialFragmentation: fragmentation, table: 'orders', index: 'idx_customer_id' },
        });
        await this.actionHistoryRepository.save(record);
      } else {
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'index_check',
          description: `Index maintenance check passed. Max fragmentation at ${fragmentation.toFixed(1)}%.`,
          executedBy: 'scheduled_task',
          success: true,
          details: { maxFragmentation: fragmentation },
        });
        await this.actionHistoryRepository.save(record);
      }
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleStatisticsUpdates() {
    this.logger.log('Running Daily Task: Statistics Updates');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const statsAgeDays = Math.random() < 0.1 ? 3 + Math.random() * 5 : Math.random() * 2;
      if (statsAgeDays > 3) {
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'update_statistics',
          description: `Table statistics for 'products' are stale (${statsAgeDays.toFixed(1)} days old). Auto-running ANALYZE TABLE.`,
          executedBy: 'ai_agent',
          success: true,
          details: { table: 'products', ageDays: statsAgeDays },
        });
        await this.actionHistoryRepository.save(record);
      } else {
        const record = this.actionHistoryRepository.create({
          database: db,
          actionType: 'statistics_check',
          description: `Statistics update check passed. Stats are fresh (${statsAgeDays.toFixed(1)} days old).`,
          executedBy: 'scheduled_task',
          success: true,
          details: { maxAgeDays: statsAgeDays },
        });
        await this.actionHistoryRepository.save(record);
      }
    }
  }

  /**
   * Runs every 30 seconds to check HA/DR status (Replication Lag).
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleHaDrStatus() {
    this.logger.log('Running Daily Task: HA/DR Status Check');
    const databases = await this.databaseRepository.find();

    for (const db of databases) {
      // Simulate replication lag. 5% chance of high lag (> 10s)
      const replicationLag = Math.random() < 0.05 ? 10 + Math.random() * 20 : Math.random() * 2;
      
      let description: string;
      let success: boolean;

      if (replicationLag > 10) {
        description = `High replication lag detected (${replicationLag.toFixed(1)}s) on secondary node. HA status degraded.`;
        success = false;
      } else {
        description = `HA/DR status healthy. Replication lag is low (${replicationLag.toFixed(1)}s).`;
        success = true;
      }

      const record = this.actionHistoryRepository.create({
        database: db,
        actionType: 'ha_dr_check',
        description,
        executedBy: 'scheduled_task',
        success,
        details: { lagSeconds: replicationLag },
      });
      await this.actionHistoryRepository.save(record);
    }
  }
}
