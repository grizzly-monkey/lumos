import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('databases')
export class Database {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ['healthy', 'warning', 'critical'],
    default: 'healthy',
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
