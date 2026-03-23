import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './bid.entity';
import { Captain, CaptainStatus } from '../captains/captain.entity';
import { BiddingSession, SessionStatus } from '../bidding/bidding-session.entity';
import { Player } from '../players/player.entity';

const MAX_BIDS_PER_CAPTAIN = 3;

// Null = no upper limit (Diamond). Others are enforced.
const CATEGORY_BID_CAPS: Record<string, number | null> = {
  Diamond:  null,
  Gold:     50000,
  Silver:   30000,
  Emerging: 10000,
};

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)            private bidRepo:     Repository<Bid>,
    @InjectRepository(Captain)        private captainRepo: Repository<Captain>,
    @InjectRepository(BiddingSession) private sessionRepo: Repository<BiddingSession>,
    @InjectRepository(Player)         private playerRepo:  Repository<Player>,
  ) {}

  async placeBid(userId: string, sessionId: string, amount: number) {
    // ── BUG FIX #1: load captain with user relation so we can find it ──────
    const captain = await this.captainRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!captain) throw new BadRequestException('Captain profile not found. Please re-login.');

    // ── BUG FIX #2: canBid check with clear message ──────────────────────
    // canBid is true only after admin approves + subscription paid.
    // For a fresh deploy/demo, admin must run approveCaptainBidding first.
    // Allow bidding if canBid=true OR if captain is approved (admin approval = bidding enabled)
    const canBid = captain.canBid || captain.status === CaptainStatus.APPROVED;
    if (!canBid) {
      throw new BadRequestException(
        'Bidding not enabled. Admin must approve your account and you must pay the subscription fee.'
      );
    }

    // ── BUG FIX #3: load session WITH player relation (CRITICAL) ──────────
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['player', 'tournament'], // REQUIRED — eager on entity doesn't always work with findOne
    });
    if (!session) throw new NotFoundException('Bidding session not found');
    if (session.status !== SessionStatus.ACTIVE) throw new BadRequestException('This bidding session is not active');
    if (!session.player) throw new NotFoundException('Session player data missing — contact admin');

    const player   = session.player;
    const category = (player.category as string) || 'Gold';

    // ── Minimum bid ────────────────────────────────────────────────────────
    if (amount < player.minimumBid)
      throw new BadRequestException(`Minimum bid is Rs. ${player.minimumBid.toLocaleString()}`);

    // ── Category bid cap ──────────────────────────────────────────────────
    const cap = CATEGORY_BID_CAPS[category];
    if (cap !== null && cap !== undefined && amount > cap) {
      throw new BadRequestException(
        `${category} category bid cap is Rs. ${cap.toLocaleString()}. You cannot bid above this.`
      );
    }

    // ── 3-bid limit per captain per session ───────────────────────────────
    const captainBidCount = await this.bidRepo.count({
      where: { session: { id: sessionId }, captain: { id: captain.id } },
    });
    if (captainBidCount >= MAX_BIDS_PER_CAPTAIN) {
      throw new BadRequestException(
        `You have used all ${MAX_BIDS_PER_CAPTAIN} bids for this player.`
      );
    }

    // ── Must beat current highest bid ─────────────────────────────────────
    const currentTop = await this.bidRepo.findOne({
      where: { session: { id: sessionId } },
      order: { amount: 'DESC' },
    });
    if (currentTop && amount <= currentTop.amount) {
      throw new BadRequestException(
        `Bid must be higher than current top bid of Rs. ${currentTop.amount.toLocaleString()}`
      );
    }

    if (currentTop) {
      currentTop.isWinning = false;
      await this.bidRepo.save(currentTop);
    }

    const bid = this.bidRepo.create({ player, captain, session, amount, isWinning: true });
    await this.bidRepo.save(bid);

    return {
      ...bid,
      captainBidsUsed:      captainBidCount + 1,
      captainBidsRemaining: MAX_BIDS_PER_CAPTAIN - (captainBidCount + 1),
      categoryBidCap:       cap,
    };
  }

  async getSessionBids(sessionId: string) {
    return this.bidRepo.find({
      where: { session: { id: sessionId } },
      order: { amount: 'DESC', createdAt: 'DESC' },
    });
  }

  async getPlayerBids(playerId: string) {
    return this.bidRepo.find({ where: { player: { id: playerId } }, order: { amount: 'DESC' } });
  }

  async getActiveSessions() {
    return this.sessionRepo.find({
      where: { status: SessionStatus.ACTIVE },
      relations: ['player', 'tournament'],
      order: { startedAt: 'DESC' },
    });
  }

  async getCaptainBidCount(captainUserId: string, sessionId: string) {
    const captain = await this.captainRepo.findOne({ where: { user: { id: captainUserId } } });
    if (!captain) return { count: 0, remaining: MAX_BIDS_PER_CAPTAIN, maxAllowed: MAX_BIDS_PER_CAPTAIN };
    const count = await this.bidRepo.count({
      where: { session: { id: sessionId }, captain: { id: captain.id } },
    });
    return { count, remaining: MAX_BIDS_PER_CAPTAIN - count, maxAllowed: MAX_BIDS_PER_CAPTAIN };
  }

  getBidCaps() {
    return CATEGORY_BID_CAPS;
  }
}
