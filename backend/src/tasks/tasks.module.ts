import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { ActionHistory } from '../actions/entities/action-history.entity';
import { Database } from '../monitoring/entities/database.entity';
import { DbLog } from '../monitoring/entities/db-log.entity';
import { EventsModule } from '../events/events.module'; // Import EventsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([ActionHistory, Database, DbLog]),
    EventsModule, // Add to imports
  ],
  providers: [TasksService],
})
export class TasksModule {}
