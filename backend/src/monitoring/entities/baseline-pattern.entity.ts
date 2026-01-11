import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Database } from './database.entity';
import { VectorTransformer } from '../../shared/transformers/vector.transformer';

@Entity('baseline_patterns')
@Unique(['database', 'patternName'])
export class BaselinePattern {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Database)
  @JoinColumn({ name: 'database_id' })
  database: Database;

  @Column({ name: 'pattern_name' })
  patternName: string;

  @Column({ name: 'pattern_type', type: 'varchar', length: 100, default: 'hourly' })
  patternType: string;

  @Column({ name: 'time_period', type: 'varchar', length: 50, nullable: true })
  timePeriod: string;

  @Column({ name: 'pattern_data', type: 'json' })
  patternData: any;

  @Column({
    name: 'pattern_embedding',
    type: 'blob', // Match the BLOB type in the new schema
    transformer: new VectorTransformer(),
    nullable: true,
  })
  patternEmbedding: number[];

  @Column({ name: 'sample_count', type: 'int', default: 0 })
  sampleCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
