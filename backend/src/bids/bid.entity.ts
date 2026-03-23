import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from '../players/player.entity';
import { Captain } from '../captains/captain.entity';
import { BiddingSession } from '../bidding/bidding-session.entity';

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Player, { eager: true }) @JoinColumn() player: Player;
  @ManyToOne(() => Captain, { eager: true }) @JoinColumn() captain: Captain;
  @ManyToOne(() => BiddingSession, { nullable: true }) @JoinColumn() session: BiddingSession;
  @Column({ type: 'integer' }) amount: number;
  @Column({ default: false }) isWinning: boolean;
  @Column({ default: false }) isWon: boolean;
  @CreateDateColumn() createdAt: Date;
}
