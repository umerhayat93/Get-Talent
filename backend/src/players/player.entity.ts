import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, ManyToMany, JoinColumn, JoinTable,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Tournament } from '../tournaments/tournament.entity';

export enum PlayerSkill    { BATTER = 'Batter', BOWLER = 'Bowler', ALL_ROUNDER = 'All-Rounder' }
export enum PlayerCategory { DIAMOND = 'Diamond', GOLD = 'Gold', SILVER = 'Silver', EMERGING = 'Emerging' }
export enum PlayerStatus   { PENDING = 'pending', APPROVED = 'approved', REJECTED = 'rejected', AVAILABLE = 'available', SOLD = 'sold', UNSOLD = 'unsold', BANNED = 'banned' }

export const CATEGORY_FEES = {
  Diamond:  { registrationFee: 10000, minimumBid: 20000 },
  Gold:     { registrationFee: 7000,  minimumBid: 10000 },
  Silver:   { registrationFee: 5000,  minimumBid: 8000  },
  Emerging: { registrationFee: 3000,  minimumBid: 6000  },
};

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')           id: string;
  @ManyToOne(() => User, { eager: true })   @JoinColumn() user: User;
  @Column()                                 name: string;
  @Column()                                 phone: string;
  @Column({ nullable: true })               address: string;
  @Column({ type: 'varchar' })              skill: PlayerSkill;
  @Column({ type: 'varchar' })              category: PlayerCategory;
  @Column({ type: 'varchar', default: PlayerStatus.PENDING }) status: PlayerStatus;
  @Column({ type: 'integer' })              registrationFee: number;
  @Column({ type: 'integer' })              minimumBid: number;
  @Column({ nullable: true })               paymentReceipt: string;
  @Column({ type: 'varchar', default: 'pending' }) paymentStatus: string;
  @Column({ nullable: true })               profilePicture: string;

  // FIX: eager: false — never auto-load this or it crashes every query
  // when the player_tournaments table doesn't exist yet
  @ManyToMany(() => Tournament, { eager: false })
  @JoinTable({ name: 'player_tournaments' })
  tournaments: Tournament[];

  // Primary single tournament — still eager (safe, always exists)
  @ManyToOne(() => Tournament, { nullable: true, eager: true })
  @JoinColumn()
  tournament: Tournament;

  @Column({ nullable: true })  soldToTeam: string;
  @Column({ nullable: true })  soldAmount: number;
  @Column({ nullable: true })  remarks: string;
  @CreateDateColumn()          createdAt: Date;
  @UpdateDateColumn()          updatedAt: Date;
}
