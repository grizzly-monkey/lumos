import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { ApiModule } from './api/api.module';
import { EventsModule } from './events/events.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AiModule } from './ai/ai.module';
import { TasksModule } from './tasks/tasks.module'; // Import the new module
import configuration from './config/configuration';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, databaseConfig],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    ApiModule,
    EventsModule,
    MonitoringModule,
    AiModule,
    TasksModule, // Add the new module here
  ],
})
export class AppModule {}
