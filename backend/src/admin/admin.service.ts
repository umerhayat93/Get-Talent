import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player, PlayerStatus } from '../players/player.entity';
import { Captain, CaptainStatus } from '../captains/captain.entity';
import { User, UserStatus } from '../users/user.entity';
import { BiddingSession, SessionStatus } from '../bidding/bidding-session.entity';
import { Tournament, TournamentStatus } from '../tournaments/tournament.entity';
import { Bid } from '../bids/bid.entity';
import { NotificationsService } from '../notifications/notifications.service';

const TIMER_24H = 86400; // 24 hours in seconds

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Player)         private playerRepo:     Repository<Player>,
    @InjectRepository(Captain)        private captainRepo:    Repository<Captain>,
    @InjectRepository(User)           private userRepo:       Repository<User>,
    @InjectRepository(BiddingSession) private sessionRepo:    Repository<BiddingSession>,
    @InjectRepository(Tournament)     private tournamentRepo: Repository<Tournament>,
    @InjectRepository(Bid)            private bidRepo:        Repository<Bid>,
    private notifSvc: NotificationsService,
  ) {}

  async getDashboard() {
    const [totalPlayers, pendingPlayers, approvedPlayers, soldPlayers, unsoldPlayers] = await Promise.all([
      this.playerRepo.count(),
      this.playerRepo.count({ where: { status: PlayerStatus.PENDING } }),
      this.playerRepo.count({ where: { status: PlayerStatus.APPROVED } }),
      this.playerRepo.count({ where: { status: PlayerStatus.SOLD } }),
      this.playerRepo.count({ where: { status: PlayerStatus.UNSOLD } }),
    ]);
    const [totalCaptains, pendingCaptains, approvedCaptains] = await Promise.all([
      this.captainRepo.count(),
      this.captainRepo.count({ where: { status: CaptainStatus.PENDING } }),
      this.captainRepo.count({ where: { status: CaptainStatus.APPROVED } }),
    ]);
    const activeSessions   = await this.sessionRepo.count({ where: { status: SessionStatus.ACTIVE } });
    const totalTournaments = await this.tournamentRepo.count({ where: { approvalStatus: TournamentStatus.APPROVED } });
    const pendingTournaments = await this.tournamentRepo.count({ where: { approvalStatus: TournamentStatus.PENDING } });
    return { totalPlayers, pendingPlayers, approvedPlayers, soldPlayers, unsoldPlayers, totalCaptains, pendingCaptains, approvedCaptains, activeSessions, totalTournaments, pendingTournaments };
  }

  // ── Players ───────────────────────────────────────────────────────────────
  async getPlayers(status?: string) {
    const where = status ? { status } : {};
    return this.playerRepo.find({ where: where as any, order: { createdAt: 'DESC' } });
  }

  async approvePlayer(id: string, remarks?: string) {
    // Load with user relation so we can send notification
    const p = await this.playerRepo.findOne({ where: { id }, relations: ['user'] });
    if (!p) throw new NotFoundException();
    p.status = PlayerStatus.APPROVED;
    p.paymentStatus = 'verified';
    if (remarks) p.remarks = remarks;
    await this.playerRepo.save(p);
    // Update user.status so login and getProfile return correct status
    if (p.user?.id) {
      await this.userRepo.update(p.user.id, { status: UserStatus.APPROVED });
    }
    // Notify user
    if (p.user?.id) {
      await this.notifSvc.notifyUser(p.user.id, '🔵 Profile Verified!', 'Your player profile is verified. You now have a blue badge and can join tournaments!', 'verified').catch(() => {});
    }
    return p;
  }

  async rejectPlayer(id: string, remarks?: string) {
    const p = await this.playerRepo.findOne({ where: { id }, relations: ['user'] });
    if (!p) throw new NotFoundException();
    p.status = PlayerStatus.REJECTED;
    if (remarks) p.remarks = remarks;
    await this.playerRepo.save(p);
    if (p.user?.id) {
      await this.notifSvc.notifyUser(p.user.id, '❌ Registration Rejected', remarks || 'Your registration was not approved.', 'rejection').catch(() => {});
    }
    return p;
  }

  async banPlayer(id: string, remarks?: string) {
    const p = await this.playerRepo.findOne({ where: { id }, relations: ['user'] });
    if (!p) throw new NotFoundException();
    p.status = PlayerStatus.BANNED;
    if (remarks) p.remarks = remarks;
    await this.playerRepo.save(p);
    if (p.user?.id) {
      const user = await this.userRepo.findOne({ where: { id: p.user.id } });
      if (user) { user.status = UserStatus.BANNED; await this.userRepo.save(user); }
    }
    return p;
  }

  // ── Captains ─────────────────────────────────────────────────────────────
  async getCaptains(status?: string) {
    const where = status ? { status } : {};
    return this.captainRepo.find({ where: where as any, order: { createdAt: 'DESC' } });
  }

  async approveCaptain(id: string, remarks?: string) {
    const c = await this.captainRepo.findOne({ where: { id }, relations: ['user'] });
    if (!c) throw new NotFoundException();
    c.status = CaptainStatus.APPROVED;
    c.canBid = true;          // auto-enable bidding on approval
    c.subscriptionPaid = true; // mark subscription as handled
    if (remarks) c.remarks = remarks;
    await this.captainRepo.save(c);
    // Update user.status so login shows correct approved status
    if (c.user?.id) {
      await this.userRepo.update(c.user.id, { status: UserStatus.APPROVED });
    }
    if (c.user?.id) {
      await this.notifSvc.notifyUser(c.user.id, '🔵 Captain Account Verified!', 'Your account is verified with a blue badge. Pay subscription to start bidding.', 'verified').catch(() => {});
    }
    return c;
  }

  async rejectCaptain(id: string, remarks?: string) {
    const c = await this.captainRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException();
    c.status = CaptainStatus.REJECTED;
    if (remarks) c.remarks = remarks;
    await this.captainRepo.save(c);
    return c;
  }

  async banCaptain(id: string, remarks?: string) {
    const c = await this.captainRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException();
    c.status = CaptainStatus.BANNED; c.canBid = false;
    if (remarks) c.remarks = remarks;
    await this.captainRepo.save(c);
    return c;
  }

  async approveCaptainBidding(id: string) {
    const c = await this.captainRepo.findOne({ where: { id }, relations: ['user'] });
    if (!c) throw new NotFoundException();
    c.canBid = true; c.subscriptionPaid = true;
    await this.captainRepo.save(c);
    if (c.user?.id) {
      await this.notifSvc.notifyUser(c.user.id, '⚡ Bidding Access Granted!', 'You can now participate in live player auctions!', 'bidding').catch(() => {});
    }
    return c;
  }

  async markMismanaged(captainId: string) {
    const c = await this.captainRepo.findOne({ where: { id: captainId } });
    if (!c) throw new NotFoundException();
    c.isMismanaged = true; c.canBid = false; c.status = CaptainStatus.BANNED;
    await this.captainRepo.save(c);
    return c;
  }

  // ── Tournaments ───────────────────────────────────────────────────────────
  async getTournaments() {
    return this.tournamentRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getPendingTournaments() {
    return this.tournamentRepo.find({ where: { approvalStatus: TournamentStatus.PENDING }, order: { createdAt: 'DESC' } });
  }

  async createTournament(dto: any) {
    const existing = await this.tournamentRepo.findOne({ where: { name: dto.name } });
    if (existing) {
      await this.tournamentRepo.update(existing.id, dto);
      return this.tournamentRepo.findOne({ where: { id: existing.id } });
    }
    // Store name before create() so TypeScript doesn't lose the type
    const tournamentName: string = String(dto.name || '');
    const entity = this.tournamentRepo.create({
      ...dto,
      approvalStatus: TournamentStatus.APPROVED,
      isActive: true,
    });
    await this.tournamentRepo.save(entity);
    const saved = await this.tournamentRepo.findOne({ where: { name: tournamentName } });
    if (saved) {
      await this.notifSvc.broadcast(
        `🏟️ New Tournament: ${saved.name}`,
        `${saved.description || saved.name} is now open! Location: ${saved.location || 'TBA'}`,
        'tournament',
      ).catch(() => {});
    }
    return saved;
  }

  async approveTournament(id: string, biddingSchedule?: any, remarks?: string) {
    const t = await this.tournamentRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException();
    t.approvalStatus = TournamentStatus.APPROVED;
    t.isActive = true;
    if (remarks) t.adminRemarks = remarks;
    if (biddingSchedule) t.biddingSchedule = JSON.stringify(biddingSchedule);
    await this.tournamentRepo.save(t);

    // Notify the organiser who created it
    if (t.createdBy?.id) {
      await this.notifSvc.notifyUser(t.createdBy.id, '✅ Tournament Approved!', `Your tournament "${t.name}" has been approved and is now live on the platform!`, 'approval');
    }
    // Broadcast to all users
    await this.notifSvc.broadcast(`🏟️ New Tournament Live: ${t.name}`, `${t.name} in ${t.location || 'TBA'} is now open for player registrations!`, 'tournament');
    return t;
  }

  async rejectTournament(id: string, remarks?: string) {
    const t = await this.tournamentRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException();
    t.approvalStatus = TournamentStatus.REJECTED;
    if (remarks) t.adminRemarks = remarks;
    await this.tournamentRepo.save(t);
    if (t.createdBy?.id) {
      await this.notifSvc.notifyUser(t.createdBy.id, '❌ Tournament Request Rejected', remarks || `Your tournament request for "${t.name}" was not approved.`, 'rejection');
    }
    return t;
  }

  // Set per-category bidding schedule for a tournament
  async setBiddingSchedule(id: string, schedule: Record<string, string>) {
    const t = await this.tournamentRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException();
    t.biddingSchedule = JSON.stringify(schedule);
    await this.tournamentRepo.save(t);

    // Notify all users about the schedule
    const scheduleText = Object.entries(schedule).map(([cat, date]) => `${cat}: ${date}`).join(', ');
    await this.notifSvc.broadcast(
      `📅 ${t.name} Bidding Schedule Set`,
      `Auction schedule for ${t.name}: ${scheduleText}. Save these dates!`,
      'bidding',
    );
    return t;
  }

  // Start bidding for a specific category in a tournament (all players of that category)
  async startCategoryBidding(tournamentId: string, category: string) {
    const tournament = await this.tournamentRepo.findOne({ where: { id: tournamentId } });
    if (!tournament) throw new NotFoundException('Tournament not found');

    // Use simple find() — avoids QueryBuilder join conflicts with eager relations
    const allPlayers = await this.playerRepo.find({
      where: { status: PlayerStatus.APPROVED, category: category as any },
    });

    // Filter by tournament (tournament is eager-loaded on player entity)
    const players = allPlayers.filter(p => p.tournament?.id === tournamentId);

    if (players.length === 0) {
      throw new NotFoundException(`No approved ${category} players in this tournament`);
    }

    const sessions = [];
    for (const player of players) {
      const existing = await this.sessionRepo.findOne({
        where: { player: { id: player.id }, tournament: { id: tournamentId }, status: SessionStatus.ACTIVE },
      });
      if (existing) continue;

      const session = this.sessionRepo.create({
        player, tournament,
        status: SessionStatus.ACTIVE,
        timerSeconds: TIMER_24H,
        startedAt: new Date(),
        category,
      });
      await this.sessionRepo.save(session);
      sessions.push(session);

      if (player.user?.id) {
        await this.notifSvc.notifyUser(
          player.user.id,
          `🏏 Your ${category} Bidding Started!`,
          `Bidding for you in ${tournament.name} is now live for 24 hours! Min bid: Rs. ${player.minimumBid.toLocaleString()}`,
          'bidding',
        ).catch(() => {});
      }
    }

    await this.notifSvc.broadcast(
      `⚡ ${category} Category Bidding Live! — ${tournament.name}`,
      `${category} player auctions are now open in ${tournament.name}! ${sessions.length} players available. Bidding lasts 24 hours.`,
      'bidding',
    ).catch(() => {});

    return { message: `Started ${sessions.length} bidding sessions for ${category} category`, sessions };
  }

  // ── Bidding Sessions ──────────────────────────────────────────────────────
  async startBiddingSession(playerId: string, tournamentId: string, timerSeconds: number) {
    const player     = await this.playerRepo.findOne({ where: { id: playerId } });
    const tournament = await this.tournamentRepo.findOne({ where: { id: tournamentId } });
    if (!player || !tournament) throw new NotFoundException();

    // Validate player has joined this tournament
    if (player.tournament?.id !== tournamentId) {
      throw new Error(`Player ${player.name} has not joined ${tournament.name}. Player must join the tournament first.`);
    }

    const session = this.sessionRepo.create({
      player, tournament,
      status: SessionStatus.ACTIVE,
      timerSeconds: timerSeconds || TIMER_24H,
      startedAt: new Date(),
      category: player.category,
    });
    await this.sessionRepo.save(session);

    if (player.user?.id) {
      await this.notifSvc.notifyUser(player.user.id, '🏏 Your Bidding Has Started!', `Bidding is now live for you in ${tournament.name}. Min bid: Rs. ${player.minimumBid.toLocaleString()}`, 'bidding').catch(() => {});
    }
    await this.notifSvc.broadcast(`⚡ Live Auction: ${player.name}`, `${player.name} (${player.category} ${player.skill}) is now up in ${tournament.name}! Min bid: Rs. ${player.minimumBid.toLocaleString()}`, 'bidding').catch(() => {});
    return session;
  }

  async endBiddingSession(sessionId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException();

    const topBid = await this.bidRepo.findOne({ where: { session: { id: sessionId } }, order: { amount: 'DESC' } });
    session.status = SessionStatus.ENDED;
    session.endedAt = new Date();

    if (topBid) {
      session.winnerId   = topBid.captain.id;
      session.winningBid = topBid.amount;
      topBid.isWon = true;
      await this.bidRepo.save(topBid);

      const player = session.player;
      player.status     = PlayerStatus.SOLD;
      player.soldToTeam = topBid.captain.teamName;
      player.soldAmount = topBid.amount;
      // Remove from all tournaments — must re-register with fee to auction again
      player.tournament  = null;
      await this.playerRepo.save(player);

      // Clear ManyToMany tournaments too (requires relation load)
      const fullPlayer = await this.playerRepo.findOne({
        where: { id: player.id },
        relations: ['tournaments'],
      });
      if (fullPlayer) {
        fullPlayer.tournaments = [];
        await this.playerRepo.save(fullPlayer);
      }

      await this.notifSvc.notifyUser(
        player.user.id,
        '🎉 You Were Sold!',
        `You were sold to ${topBid.captain.teamName} for Rs. ${topBid.amount.toLocaleString()} in ${session.tournament.name}. You have been removed from all tournaments. Pay re-registration fee to re-enter future auctions.`,
        'sold',
      ).catch(() => {});

      await this.notifSvc.notifyUser(
        topBid.captain.user.id,
        '🏆 Auction Won — Payment Required',
        `You won ${player.name} for Rs. ${topBid.amount.toLocaleString()} in ${session.tournament.name}.\n\n` +
        `⚠️ Pay Rs. ${topBid.amount.toLocaleString()} to the player before the tournament starts.\n\n` +
        `Contact: ${player.phone}\n\nFailure to pay = PERMANENT BAN.`,
        'payment_required',
      ).catch(() => {});

    } else {
      // Unsold — also remove from all tournaments
      const player = session.player;
      player.status    = PlayerStatus.UNSOLD;
      player.tournament = null;
      await this.playerRepo.save(player);

      const fullPlayer = await this.playerRepo.findOne({
        where: { id: player.id },
        relations: ['tournaments'],
      });
      if (fullPlayer) {
        fullPlayer.tournaments = [];
        await this.playerRepo.save(fullPlayer);
      }

      await this.notifSvc.notifyUser(
        player.user.id,
        'Auction Ended — Unsold',
        `Your bidding session in ${session.tournament.name} ended with no bids. You have been removed from tournaments. Pay re-registration fee to re-enter future auctions.`,
        'unsold',
      ).catch(() => {});
    }

    await this.sessionRepo.save(session);
    return session;
  }

  async getActiveSessions() {
    return this.sessionRepo.find({ where: { status: SessionStatus.ACTIVE }, order: { startedAt: 'DESC' } });
  }

  async getAllSessions() {
    return this.sessionRepo.find({ order: { createdAt: 'DESC' } });
  }

  async broadcast(title: string, message: string, type?: string) {
    return this.notifSvc.broadcast(title, message, type);
  }
}
