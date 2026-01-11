import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Database } from '../monitoring/entities/database.entity';
import { Incident } from '../monitoring/entities/incident.entity';
import { Metric } from '../monitoring/entities/metric.entity';
import { AgentAction } from '../actions/entities/agent-action.entity';
import { ActionHistory } from '../actions/entities/action-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Database,
      Incident,
      Metric,
      AgentAction,
      ActionHistory, // Add ActionHistory here
    ]),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
