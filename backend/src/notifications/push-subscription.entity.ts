import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('push_subscriptions')
export class PushSubscription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn() user: User;
  @Column({ type: 'text' }) endpoint: string;
  @Column({ type: 'text' }) p256dh: string;
  @Column({ type: 'text' }) auth: string;
  @CreateDateColumn() createdAt: Date;
}
