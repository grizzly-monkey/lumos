import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { ActionHistory } from '../actions/entities/action-history.entity';
import { Database } from '../monitoring/entities/database.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActionHistory, Database])],
  providers: [TasksService],
})
export class TasksModule {}
