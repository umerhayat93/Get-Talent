import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum TournamentStatus {
  PENDING  = 'pending',   // organiser submitted, waiting admin
  APPROVED = 'approved',  // admin approved, visible in app
  REJECTED = 'rejected',
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @Column({ nullable: true }) location: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) startDate: string;
  @Column({ nullable: true }) endDate: string;
  @Column({ nullable: true }) prizePool: string;
  @Column({ nullable: true }) organizerName: string;
  @Column({ nullable: true }) organizerPhone: string;
  @Column({ nullable: true }) organizerAddress: string;
  @Column({ nullable: true }) contactEmail: string;
  @Column({ nullable: true }) bannerImage: string;

  // Who created this tournament request
  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn()
  createdBy: User;

  @Column({ type: 'varchar', default: TournamentStatus.PENDING })
  approvalStatus: TournamentStatus;

  @Column({ default: false }) isActive: boolean;
  @Column({ default: false }) biddingOpen: boolean;
  @Column({ nullable: true }) adminRemarks: string;

  // Per-category bidding schedule (JSON)
  // { Diamond: "2025-03-25", Gold: "2025-03-26", Silver: "2025-03-27", Emerging: "2025-03-28" }
  @Column({ type: 'text', nullable: true }) biddingSchedule: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
