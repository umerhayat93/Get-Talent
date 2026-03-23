import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../users/user.entity';
import { Player, PlayerStatus, CATEGORY_FEES } from '../players/player.entity';
import { Captain, CaptainStatus } from '../captains/captain.entity';
import { Tournament } from '../tournaments/tournament.entity';

const JWT_SECRET = process.env.JWT_SECRET || 'gt-secret-2024';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)       private userRepo:       Repository<User>,
    @InjectRepository(Player)     private playerRepo:     Repository<Player>,
    @InjectRepository(Captain)    private captainRepo:    Repository<Captain>,
    @InjectRepository(Tournament) private tournamentRepo: Repository<Tournament>,
    private jwtService: JwtService,
  ) {}

  async adminLogin(password: string) {
    if (!password) throw new BadRequestException('Password is required');
    if (password.trim() !== 'umer0895') throw new UnauthorizedException('Invalid admin password');
    const token = this.jwtService.sign({ sub: 'admin', role: 'admin', name: 'Admin' }, { secret: JWT_SECRET });
    return { token, user: { id: 'admin', name: 'Admin', role: 'admin' } };
  }

  async registerPlayer(dto: any) {
    if (!dto.name?.trim())  throw new BadRequestException('Name is required');
    if (!dto.phone?.trim()) throw new BadRequestException('Phone is required');
    if (!dto.password || String(dto.password).length < 6) throw new BadRequestException('Password min 6 chars');
    const phone = dto.phone.trim();
    const existing = await this.userRepo.findOne({ where: { phone } });
    if (existing) throw new ConflictException('Phone already registered — please login');
    const hashed = await bcrypt.hash(String(dto.password), 10);
    const user = this.userRepo.create({ name: dto.name.trim(), phone, password: hashed, role: UserRole.PLAYER, status: UserStatus.PENDING });
    await this.userRepo.save(user);
    let tournament = null;
    if (dto.tournamentId) tournament = await this.tournamentRepo.findOne({ where: { id: dto.tournamentId } });
    const fees = CATEGORY_FEES[dto.category] || CATEGORY_FEES['Gold'];
    const player = this.playerRepo.create({
      user, name: dto.name.trim(), phone, skill: dto.skill || 'Batter', category: dto.category || 'Gold',
      registrationFee: fees.registrationFee, minimumBid: fees.minimumBid,
      paymentStatus: 'pending', status: PlayerStatus.PENDING, tournament,
    });
    await this.playerRepo.save(player);
    await this.seedTournaments();
    // Return token so frontend can immediately upload receipt without requiring login first
    const token = this.jwtService.sign({ sub: user.id, role: user.role, name: user.name }, { secret: JWT_SECRET });
    return { message: 'Registered successfully', playerId: player.id, token, user: { id: user.id, name: user.name, role: user.role, status: user.status } };
  }

  async registerCaptain(dto: any) {
    if (!dto.name?.trim())     throw new BadRequestException('Name is required');
    if (!dto.phone?.trim())    throw new BadRequestException('Phone is required');
    if (!dto.teamName?.trim()) throw new BadRequestException('Team name is required');
    if (!dto.password || String(dto.password).length < 6) throw new BadRequestException('Password min 6 chars');
    const phone = dto.phone.trim();
    const existing = await this.userRepo.findOne({ where: { phone } });
    if (existing) throw new ConflictException('Phone already registered — please login');
    const hashed = await bcrypt.hash(String(dto.password), 10);
    const user = this.userRepo.create({ name: dto.name.trim(), phone, password: hashed, role: UserRole.CAPTAIN, status: UserStatus.PENDING });
    await this.userRepo.save(user);
    const captain = this.captainRepo.create({ user, name: dto.name.trim(), phone, teamName: dto.teamName.trim(), status: CaptainStatus.PENDING, subscriptionPaid: false, canBid: false });
    await this.captainRepo.save(captain);
    const token = this.jwtService.sign({ sub: user.id, role: user.role, name: user.name }, { secret: JWT_SECRET });
    return { message: 'Registered successfully', captainId: captain.id, token, user: { id: user.id, name: user.name, role: user.role, status: user.status } };
  }

  async registerFan(dto: any) {
    if (!dto.name?.trim())  throw new BadRequestException('Name is required');
    if (!dto.phone?.trim()) throw new BadRequestException('Phone is required');
    if (!dto.password || String(dto.password).length < 6) throw new BadRequestException('Password min 6 chars');
    const phone = dto.phone.trim();
    const existing = await this.userRepo.findOne({ where: { phone } });
    if (existing) throw new ConflictException('Phone already registered — please login');
    const hashed = await bcrypt.hash(String(dto.password), 10);
    const user = this.userRepo.create({ name: dto.name.trim(), phone, password: hashed, role: UserRole.FAN, status: UserStatus.APPROVED });
    await this.userRepo.save(user);
    return { message: 'Fan registered! You can now watch live bidding.', userId: user.id };
  }

  async registerOrganiser(dto: any) {
    if (!dto.name?.trim())  throw new BadRequestException('Name is required');
    if (!dto.phone?.trim()) throw new BadRequestException('Phone is required');
    if (!dto.password || String(dto.password).length < 6) throw new BadRequestException('Password min 6 chars');
    const phone = dto.phone.trim();
    const existing = await this.userRepo.findOne({ where: { phone } });
    if (existing) throw new ConflictException('Phone already registered — please login');
    const hashed = await bcrypt.hash(String(dto.password), 10);
    const user = this.userRepo.create({
      name: dto.name.trim(), phone, password: hashed,
      role: UserRole.ORGANISER, status: UserStatus.APPROVED,
      address: dto.address?.trim() || null,
    });
    await this.userRepo.save(user);
    return { message: 'Organiser account created! You can now submit tournament requests.', userId: user.id };
  }

  async login(phone: string, password: string) {
    if (!phone?.trim() || !password) throw new BadRequestException('Phone and password required');
    const user = await this.userRepo.findOne({ where: { phone: phone.trim() } });
    if (!user) throw new UnauthorizedException('No account with this phone number');
    const valid = await bcrypt.compare(String(password), user.password);
    if (!valid) throw new UnauthorizedException('Incorrect password');
    if (user.status === UserStatus.BANNED) throw new UnauthorizedException('Account banned — contact admin');
    const token = this.jwtService.sign({ sub: user.id, role: user.role, name: user.name }, { secret: JWT_SECRET });
    return { token, user: { id: user.id, name: user.name, role: user.role, status: user.status } };
  }

  async updateProfilePicture(userId: string, filename: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    user.profilePicture = filename;
    await this.userRepo.save(user);
    return { message: 'Profile picture updated', filename };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (user.role === UserRole.PLAYER) {
      const player = await this.playerRepo.findOne({
        where: { user: { id: userId } },
        relations: ['user', 'tournament'],
      });
      if (player && player.status && user.status !== (player.status as any)) {
        user.status = player.status as any;
      }
      return { user, player };
    }
    if (user.role === UserRole.CAPTAIN) {
      const captain = await this.captainRepo.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      if (captain && captain.status && user.status !== (captain.status as any)) {
        user.status = captain.status as any;
      }
      return { user, captain };
    }
    return { user };
  }

  private async seedTournaments() {
    try {
      const count = await this.tournamentRepo.count();
      if (count === 0) {
        const ppl = this.tournamentRepo.create({ name: 'PPL', description: 'Pattan Premier League', location: 'Pattan, KPK', isActive: true, approvalStatus: 'approved' as any });
        const bpl = this.tournamentRepo.create({ name: 'BPL', description: 'Besham Premier League', location: 'Besham, KPK', isActive: true, approvalStatus: 'approved' as any });
        await this.tournamentRepo.save(ppl);
        await this.tournamentRepo.save(bpl);
      }
    } catch {}
  }
      }
