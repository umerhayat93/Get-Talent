import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from '../players/player.entity';
import { Tournament } from '../tournaments/tournament.entity';

export enum SessionStatus { SCHEDULED = 'scheduled', ACTIVE = 'active', ENDED = 'ended' }

@Entity('bidding_sessions')
export class BiddingSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Player, { eager: true })  @JoinColumn() player: Player;
  @ManyToOne(() => Tournament, { eager: true }) @JoinColumn() tournament: Tournament;
  @Column({ type: 'varchar', default: SessionStatus.SCHEDULED }) status: SessionStatus;
  // Default 24 hours = 86400 seconds
  @Column({ type: 'integer', default: 86400 }) timerSeconds: number;
  @Column({ nullable: true }) startedAt: Date;
  @Column({ nullable: true }) endedAt: Date;
  @Column({ nullable: true }) winnerId: string;
  @Column({ nullable: true }) winningBid: number;
  // Category of this session's player (for per-category scheduling)
  @Column({ nullable: true }) category: string;
  @CreateDateColumn() createdAt: Date;
}
