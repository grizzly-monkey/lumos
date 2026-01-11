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
    this.logger.log('Running daily task: Backup Verification');
    const databases = await this.databaseRepository.find();

    for (const db of databases) {
      // Simulate a 95% success rate for backup verification.
      const isSuccess = Math.random() > 0.05;
      const description = isSuccess
        ? `Backup for ${db.name} verified successfully.`
        : `Backup for ${db.name} failed integrity check.`;

      const historyRecord = this.actionHistoryRepository.create({
        database: db,
        actionType: 'backup_verification',
        description,
        executedBy: 'scheduled_task',
        success: isSuccess,
        details: { verificationMethod: 'checksum' },
      });

      await this.actionHistoryRepository.save(historyRecord);
    }
  }
}
