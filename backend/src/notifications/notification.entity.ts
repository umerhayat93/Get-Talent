import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn() user: User;
  @Column() title: string;
  @Column() message: string;
  @Column({ default: false }) isRead: boolean;
  @Column({ nullable: true }) type: string;
  @Column({ default: false }) isBroadcast: boolean;
  @CreateDateColumn() createdAt: Date;
}
