import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentAction } from './entities/agent-action.entity';
import { Incident } from '../monitoring/entities/incident.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentAction, Incident]),
    EventsModule,
  ],
  providers: [ActionsService],
  exports: [ActionsService],
})
export class ActionsModule {}
