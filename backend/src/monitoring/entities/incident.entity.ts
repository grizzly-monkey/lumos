import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Database } from './database.entity';
import { VectorTransformer } from '../../shared/transformers/vector.transformer';

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Database)
  @JoinColumn({ name: 'database_id' })
  database: Database;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ name: 'issue_type' })
  issueType: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  severity: string;

  @Column('text')
  symptoms: string;

  @Column({ name: 'metrics_snapshot', type: 'json', nullable: true })
  metricsSnapshot: any;

  @Column({
    name: 'symptoms_embedding',
    type: 'blob', // Match the BLOB type in the new schema
    transformer: new VectorTransformer(),
    nullable: true,
  })
  symptomsEmbedding: number[];

  @Column({
    type: 'enum',
    enum: ['open', 'investigating', 'resolved', 'failed'],
    default: 'open',
  })
  status: string;

  @Column({ name: 'fix_applied', type: 'varchar', length: 255, nullable: true })
  fixApplied: string;

  @Column({ name: 'fix_details', type: 'text', nullable: true })
  fixDetails: string;

  @Column({ type: 'boolean', nullable: true })
  success: boolean;

  @Column({ name: 'performance_improvement', type: 'float', nullable: true })
  performanceImprovement: number;

  @Column({ name: 'time_to_resolve', type: 'int', nullable: true })
  timeToResolve: number;

  @Column({ name: 'auto_resolved', type: 'boolean', default: false })
  autoResolved: boolean;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;
}
