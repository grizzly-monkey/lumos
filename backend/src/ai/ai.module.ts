import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { VectorService } from './vector.service';
import { AIProviderFactory } from './providers/factory';
import { GeminiProvider } from './providers/gemini.provider';
import { ActionsModule } from '../actions/actions.module';
import { Incident } from '../monitoring/entities/incident.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incident]), ActionsModule],
  providers: [AiService, VectorService, AIProviderFactory, GeminiProvider],
  exports: [AiService],
})
export class AiModule {}
