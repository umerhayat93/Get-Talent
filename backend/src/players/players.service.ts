import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Player, PlayerStatus, CATEGORY_FEES } from './player.entity';
import { User } from '../users/user.entity';
import { Tournament } from '../tournaments/tournament.entity';

// Category sort order: Diamond first
const CAT_ORDER: Record<string, number> = {
  Diamond: 1, Gold: 2, Silver: 3, Emerging: 4,
};

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)     private playerRepo:     Repository<Player>,
    @InjectRepository(User)       private userRepo:       Repository<User>,
    @InjectRepository(Tournament) private tournamentRepo: Repository<Tournament>,
  ) {}

  async getFeed(
    page    = 1,
    limit   = 12,
    category?: string,
    skill?:    string,
    tournamentId?: string,
    status?: string,
  ) {
    const where: any = {};

    // If specific status requested, filter by it; otherwise show all visible statuses
    if (status) {
      where.status = status as any;
    } else {
      where.status = In([
        PlayerStatus.PENDING,
        PlayerStatus.APPROVED,
        PlayerStatus.SOLD,
        PlayerStatus.UNSOLD,
      ]);
    }

    if (category) where.category = category;
    if (skill)    where.skill    = skill;

    // Fetch ALL matching (no pagination yet — we sort in JS then paginate)
    // This is safe because player counts are small (hundreds, not millions)
    const all = await this.playerRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });

    // Filter by tournament if requested (tournament is eager-loaded)
    const filtered = tournamentId
      ? all.filter(p => p.tournament?.id === tournamentId)
      : all;

    // Sort: Diamond first, then by createdAt desc within each category
    filtered.sort((a, b) => {
      const catA = CAT_ORDER[a.category] ?? 5;
      const catB = CAT_ORDER[b.category] ?? 5;
      if (catA !== catB) return catA - catB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Paginate in JS
    const total = filtered.length;
    const start = (page - 1) * limit;
    const players = filtered.slice(start, start + limit);

    return {
      players,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getByTournament(tournamentId: string) {
    const all = await this.playerRepo.find({
      where: { status: PlayerStatus.APPROVED },
    });

    // Filter by tournament (eager-loaded)
    const filtered = all.filter(p => p.tournament?.id === tournamentId);

    // Sort Diamond first
    filtered.sort((a, b) => {
      const catA = CAT_ORDER[a.category] ?? 5;
      const catB = CAT_ORDER[b.category] ?? 5;
      return catA - catB;
    });

    return filtered;
  }

  async getById(id: string) {
    const p = await this.playerRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Player not found');
    return p;
  }

  async getByUserId(userId: string) {
    return this.playerRepo.findOne({
      where: { user: { id: userId } },
    });
  }

  async updateProfile(userId: string, dto: any) {
    const player = await this.playerRepo.findOne({ where: { user: { id: userId } } });
    if (!player) throw new NotFoundException();
    if (dto.name)                  player.name       = dto.name;
    if (dto.address !== undefined) player.address    = dto.address;
    if (dto.phone)                 player.phone      = dto.phone;
    if (dto.minimumBid)            player.minimumBid = Number(dto.minimumBid);
    return this.playerRepo.save(player);
  }

  async requestReAuction(userId: string) {
    const player = await this.playerRepo.findOne({ where: { user: { id: userId } } });
    if (!player) throw new NotFoundException('Player profile not found');
    if (player.status !== PlayerStatus.SOLD && player.status !== PlayerStatus.UNSOLD)
      throw new BadRequestException('Only sold or unsold players can re-register');

    const fees = CATEGORY_FEES[player.category];
    if (!fees) throw new BadRequestException('Invalid player category');

    player.status        = PlayerStatus.PENDING;
    player.paymentStatus = 're-auction-pending';
    player.soldToTeam    = null;
    player.soldAmount    = null;
    await this.playerRepo.save(player);

    return {
      message:         `Re-registration submitted. Pay Rs. ${fees.registrationFee.toLocaleString()} to re-enter the auction pool.`,
      registrationFee: fees.registrationFee,
      playerId:        player.id,
    };
  }

  async joinTournament(userId: string, tournamentId: string) {
    const player = await this.playerRepo.findOne({ where: { user: { id: userId } } });
    if (!player) throw new NotFoundException('Player profile not found');
    if (player.status !== PlayerStatus.APPROVED)
      throw new BadRequestException('Your profile must be approved before joining a tournament');
    // Sold players cannot rejoin a tournament — must re-register after auction ends
    if (player.soldToTeam)
      throw new BadRequestException('Sold players cannot rejoin a tournament. Please re-register after your auction ends.');

    const tournament = await this.tournamentRepo.findOne({ where: { id: tournamentId } });
    if (!tournament) throw new NotFoundException('Tournament not found');

    player.tournament = tournament;
    await this.playerRepo.save(player);
    return { message: `Joined ${tournament.name}!`, player };
  }

  async leaveTournament(userId: string, tournamentId: string) {
    const player = await this.playerRepo.findOne({ where: { user: { id: userId } } });
    if (!player) throw new NotFoundException();
    if (player.tournament?.id === tournamentId) player.tournament = null;
    await this.playerRepo.save(player);
    return { message: 'Left tournament', player };
  }

  async updateProfilePicture(userId: string, filename: string) {
    const player = await this.playerRepo.findOne({ where: { user: { id: userId } } });
    if (!player) throw new NotFoundException();
    player.profilePicture = filename; // filename is now a base64 data URL
    await this.playerRepo.save(player);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) { user.profilePicture = filename; await this.userRepo.save(user); }
    return player;
  }

  async uploadReceipt(userId: string, filename: string) {
    const player = await this.playerRepo.findOne({ where: { user: { id: userId } } });
    if (!player) throw new NotFoundException();
    player.paymentReceipt = filename;
    player.paymentStatus  = 'submitted';
    return this.playerRepo.save(player);
  }
}
