import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentAction } from './entities/agent-action.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgentAction])],
  providers: [ActionsService],
  exports: [ActionsService],
})
export class ActionsModule {}
