import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Database } from '../../monitoring/entities/database.entity';

@Entity('action_history')
export class ActionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => Database)
  @JoinColumn({ name: 'database_id' })
  database: Database;

  @Column({ name: 'action_type' })
  actionType: string;

  @Column()
  description: string;

  @Column({
    name: 'executed_by',
    type: 'enum',
    enum: ['ai_agent', 'dba', 'scheduled_task'],
    default: 'ai_agent',
  })
  executedBy: string;

  @Column()
  success: boolean;

  @Column({ type: 'json', nullable: true })
  details: any;

  // Allow null for the relation property to match the database and TypeORM behavior
  @OneToOne(() => ActionHistory, { nullable: true })
  @JoinColumn({ name: 'related_event_id' })
  relatedEvent: ActionHistory | null;
}
