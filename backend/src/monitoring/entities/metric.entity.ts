import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Database } from './database.entity';

@Entity('metrics')
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Database)
  @JoinColumn({ name: 'database_id' })
  database: Database;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'float', name: 'cpu_percent' })
  cpuPercent: number;

  @Column({ type: 'float', name: 'memory_percent' })
  memoryPercent: number;

  @Column({ name: 'active_connections' })
  activeConnections: number;

  @Column({ name: 'max_connections' })
  maxConnections: number;

  @Column({ name: 'slow_queries_count' })
  slowQueriesCount: number;

  @Column({ type: 'float', name: 'disk_usage_percent' })
  diskUsagePercent: number;

  @Column({ type: 'float', name: 'queries_per_second' })
  queriesPerSecond: number;

  @Column({ type: 'float', name: 'avg_query_time_ms' })
  avgQueryTimeMs: number;
}
