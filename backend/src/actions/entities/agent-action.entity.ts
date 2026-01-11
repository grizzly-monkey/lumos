import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Incident } from '../../monitoring/entities/incident.entity';

@Entity('agent_actions')
export class AgentAction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Incident)
  @JoinColumn({ name: 'incident_id' })
  incident: Incident;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ name: 'action_type' })
  actionType: string;

  @Column({ name: 'action_details', type: 'text', nullable: true })
  actionDetails: string;

  @Column({ name: 'confidence_score', type: 'float' })
  confidenceScore: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'executing', 'success', 'failed', 'rolled_back'],
  })
  status: string;

  @Column({ name: 'execution_time_ms', nullable: true })
  executionTimeMs: number;

  @Column({ name: 'result_notes', type: 'text', nullable: true })
  resultNotes: string;

  @Column({ name: 'rollback_plan', type: 'text', nullable: true })
  rollbackPlan: string;
}
