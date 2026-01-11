import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Database } from '../monitoring/entities/database.entity';
import { Incident } from '../monitoring/entities/incident.entity';
import { Metric } from '../monitoring/entities/metric.entity';
import { AgentAction } from '../actions/entities/agent-action.entity';
import { BaselinePattern } from '../monitoring/entities/baseline-pattern.entity';
import { ActionHistory } from '../actions/entities/action-history.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [
          Database,
          Incident,
          Metric,
          AgentAction,
          BaselinePattern,
          ActionHistory, // Add ActionHistory here
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
