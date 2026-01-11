import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { AiModule } from '../ai/ai.module';
import { EventsModule } from '../events/events.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Database } from './entities/database.entity';
import { Incident } from './entities/incident.entity';
import { Metric } from './entities/metric.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Database, Incident, Metric]),
    AiModule,
    EventsModule,
  ],
  providers: [MonitoringService],
})
export class MonitoringModule {}
