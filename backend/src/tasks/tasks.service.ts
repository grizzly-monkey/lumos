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
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleHealthCheck() {
    this.logger.log('Running Daily Task: Database Health Check');
    const databases = await this.databaseRepository.find();

    for (const db of databases) {
      // Simulate a 98% success rate for the health check.
      const isHealthy = Math.random() > 0.02;
      let description: string;
      let newStatus: 'healthy' | 'offline' | 'warning' | 'critical' = 'healthy';

      if (isHealthy) {
        description = `Health check for ${db.name} passed.`;
        // Only update if the status was previously offline
        if (db.status === 'offline') {
          db.status = 'healthy';
          await this.databaseRepository.save(db);
        }
      } else {
        description = `Health check for ${db.name} failed. Database is offline.`;
        newStatus = 'offline';
        db.status = newStatus;
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
}
