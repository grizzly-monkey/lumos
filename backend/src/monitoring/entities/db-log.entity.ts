import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Database } from './database.entity';

@Entity('db_logs')
export class DbLog {
  // Since the log table doesn't have a single primary key in the simulation,
  // we'll use event_time and thread_id as a composite key for TypeORM's sake.
  @PrimaryColumn({ name: 'event_time' })
  eventTime: Date;

  @PrimaryColumn({ name: 'thread_id' })
  threadId: number;

  @Column({ name: 'user_host' })
  userHost: string;

  @Column({ name: 'server_id' })
  serverId: number;

  @Column({ name: 'command_type' })
  commandType: string;

  @Column()
  argument: string;

  @ManyToOne(() => Database)
  @JoinColumn({ name: 'database_id' })
  database: Database;
}
