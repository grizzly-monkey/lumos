import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionHistory } from '../actions/entities/action-history.entity';
import { Database } from '../monitoring/entities/database.entity';
import { DbLog } from '../monitoring/entities/db-log.entity';
import { EventsGateway } from '../events/events.gateway';

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
    private eventsGateway: EventsGateway,
  ) {}

  private async logAction(data: Partial<ActionHistory>): Promise<ActionHistory | null> {
    const record = this.actionHistoryRepository.create({
      ...data,
      timestamp: new Date(),
    });
    const savedRecord = await this.actionHistoryRepository.save(record);

    const fullRecord = await this.actionHistoryRepository.findOne({
      where: { id: savedRecord.id },
      relations: ['relatedEvent', 'database'],
    });

    if (fullRecord) {
      this.eventsGateway.broadcast('action_logged', fullRecord);
    }

    return fullRecord;
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleBackupVerification() {
    this.logger.log('Running Daily Task: Backup Verification');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const isSuccess = Math.random() > 0.05;
      await this.logAction({
        database: db,
        actionType: 'backup_verification',
        description: isSuccess
          ? `Backup for ${db.name} verified successfully.`
          : `Backup for ${db.name} failed integrity check.`,
        executedBy: 'scheduled_task',
        success: isSuccess,
        details: { verificationMethod: 'checksum' },
      });
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
      await this.logAction({
        database: db,
        actionType: 'database_health_check',
        description,
        executedBy: 'scheduled_task',
        success: isHealthy,
        details: { checkMethod: 'connection_ping' },
      });
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handlePerformanceMonitoring() {
    this.logger.log('Running Daily Task: Performance Monitoring');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const slowQueries = Math.floor(Math.random() * 3);
      const isSuccess = slowQueries === 0;
      await this.logAction({
        database: db,
        actionType: 'performance_monitoring',
        description: isSuccess
          ? `Performance metrics for ${db.name} are within baseline.`
          : `Detected ${slowQueries} slow quer(ies) on ${db.name} exceeding baseline threshold.`,
        executedBy: 'scheduled_task',
        success: isSuccess,
        details: { checked: ['cpu', 'memory', 'slow_queries'] },
      });
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleConnectionManagement() {
    this.logger.log('Running Daily Task: Connection Pool Management');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const runawayQueries = Math.random() < 0.1 ? Math.floor(Math.random() * 2) + 1 : 0;
      if (runawayQueries > 0) {
        const detectionEvent = await this.logAction({
          database: db,
          actionType: 'connection_pool_check',
          description: `Warning: Detected ${runawayQueries} runaway quer(ies) lasting over 5 minutes.`,
          executedBy: 'scheduled_task',
          success: false,
        });

        if (detectionEvent) {
          await this.logAction({
            database: db,
            actionType: 'kill_query',
            description: `Auto-killed ${runawayQueries} runaway quer(ies). Connection pool stabilized.`,
            executedBy: 'ai_agent',
            success: true,
            details: { queryId: [1234, 5678].slice(0, runawayQueries) },
            relatedEvent: detectionEvent,
          });
        }
      } else {
        await this.logAction({
          database: db,
          actionType: 'connection_pool_check',
          description: `Connection pool for ${db.name} is healthy.`,
          executedBy: 'scheduled_task',
          success: true,
        });
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
        if (
          logContent.includes('error') ||
          logContent.includes('deadlock') ||
          logContent.includes('denied') ||
          logContent.includes('full')
        ) {
          description = `Log analysis found critical issue: "${lastLog.argument.substring(
            0,
            100,
          )}..."`;
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
      await this.logAction({
        database: db,
        actionType: 'log_analysis',
        description,
        executedBy: 'scheduled_task',
        success,
        details: lastLog ? { logId: lastLog.threadId, type: lastLog.commandType } : {},
      });
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleStorageMonitoring() {
    this.logger.log('Running Daily Task: Storage Capacity Monitoring');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const diskUsage = Math.random() < 0.1 ? 90 + Math.random() * 9 : 40 + Math.random() * 30;
      if (diskUsage > 90) {
        const detectionEvent = await this.logAction({
          database: db,
          actionType: 'storage_check',
          description: `Critical Warning: Disk usage at ${diskUsage.toFixed(
            1,
          )}%. Immediate cleanup required.`,
          executedBy: 'scheduled_task',
          success: false,
        });

        if (detectionEvent) {
          const freedSpace = (Math.random() * 5 + 1).toFixed(1);
          await this.logAction({
            database: db,
            actionType: 'clear_logs',
            description: `Auto-archived and purged ${freedSpace}GB of old transaction logs. Disk usage normalized.`,
            executedBy: 'ai_agent',
            success: true,
            details: { initialUsage: diskUsage, freedGb: freedSpace },
            relatedEvent: detectionEvent,
          });
        }
      } else {
        await this.logAction({
          database: db,
          actionType: 'storage_check',
          description: `Storage capacity check passed. Disk usage at ${diskUsage.toFixed(1)}%.`,
          executedBy: 'scheduled_task',
          success: true,
          details: { usagePercent: diskUsage },
        });
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
        await this.logAction({
          database: db,
          actionType: 'deadlock_detected',
          description: `Deadlock detected between transaction 1023 and 1045. Suggest reviewing index on 'orders' table.`,
          executedBy: 'scheduled_task',
          success: false,
          details: { victimTrx: 1023, winnerTrx: 1045 },
        });
      } else {
        await this.logAction({
          database: db,
          actionType: 'deadlock_check',
          description: `Deadlock monitor scan completed. No deadlocks found.`,
          executedBy: 'scheduled_task',
          success: true,
        });
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
        const detectionEvent = await this.logAction({
          database: db,
          actionType: 'index_check',
          description: `Warning: High fragmentation detected (${fragmentation.toFixed(
            1,
          )}%) on table 'orders'.`,
          executedBy: 'scheduled_task',
          success: false,
        });

        if (detectionEvent) {
          await this.logAction({
            database: db,
            actionType: 'rebuild_index',
            description: `Auto-rebuilt index 'idx_customer_id'. Fragmentation reduced to < 1%.`,
            executedBy: 'ai_agent',
            success: true,
            details: {
              initialFragmentation: fragmentation,
              table: 'orders',
              index: 'idx_customer_id',
            },
            relatedEvent: detectionEvent,
          });
        }
      } else {
        await this.logAction({
          database: db,
          actionType: 'index_check',
          description: `Index maintenance check passed. Max fragmentation at ${fragmentation.toFixed(
            1,
          )}%.`,
          executedBy: 'scheduled_task',
          success: true,
          details: { maxFragmentation: fragmentation },
        });
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
        const detectionEvent = await this.logAction({
          database: db,
          actionType: 'statistics_check',
          description: `Warning: Table statistics for 'products' are stale (${statsAgeDays.toFixed(
            1,
          )} days old).`,
          executedBy: 'scheduled_task',
          success: false,
        });

        if (detectionEvent) {
          await this.logAction({
            database: db,
            actionType: 'update_statistics',
            description: `Auto-ran ANALYZE TABLE on 'products'. Statistics updated successfully.`,
            executedBy: 'ai_agent',
            success: true,
            details: { table: 'products', ageDays: statsAgeDays },
            relatedEvent: detectionEvent,
          });
        }
      } else {
        await this.logAction({
          database: db,
          actionType: 'statistics_check',
          description: `Statistics update check passed. Stats are fresh (${statsAgeDays.toFixed(
            1,
          )} days old).`,
          executedBy: 'scheduled_task',
          success: true,
          details: { maxAgeDays: statsAgeDays },
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleHaDrStatus() {
    this.logger.log('Running Daily Task: HA/DR Status Check');
    const databases = await this.databaseRepository.find();
    for (const db of databases) {
      const replicationLag = Math.random() < 0.05 ? 10 + Math.random() * 20 : Math.random() * 2;
      let description: string;
      let success: boolean;
      if (replicationLag > 10) {
        description = `High replication lag detected (${replicationLag.toFixed(
          1,
        )}s) on secondary node. HA status degraded.`;
        success = false;
      } else {
        description = `HA/DR status healthy. Replication lag is low (${replicationLag.toFixed(
          1,
        )}s).`;
        success = true;
      }
      await this.logAction({
        database: db,
        actionType: 'ha_dr_check',
        description,
        executedBy: 'scheduled_task',
        success,
        details: { lagSeconds: replicationLag },
      });
    }
  }
}
