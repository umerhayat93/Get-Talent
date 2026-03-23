import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum CaptainStatus { PENDING = 'pending', APPROVED = 'approved', REJECTED = 'rejected', BANNED = 'banned' }

@Entity('captains')
export class Captain {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User, { eager: true }) @JoinColumn() user: User;
  @Column() name: string;
  @Column() phone: string;
  @Column() teamName: string;
  @Column({ type: 'varchar', default: CaptainStatus.PENDING }) status: CaptainStatus;
  @Column({ default: false }) subscriptionPaid: boolean;
  @Column({ nullable: true }) paymentReceipt: string;
  @Column({ nullable: true }) remarks: string;
  @Column({ default: false }) canBid: boolean;
  @Column({ default: false }) isMismanaged: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
