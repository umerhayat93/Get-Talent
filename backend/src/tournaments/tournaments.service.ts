import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament, TournamentStatus } from './tournament.entity';
import { User } from '../users/user.entity';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament) private repo: Repository<Tournament>,
    @InjectRepository(User)       private userRepo: Repository<User>,
  ) {}

  // Public: only approved active tournaments
  async getActive() {
    return this.repo.find({
      where: { isActive: true, approvalStatus: TournamentStatus.APPROVED },
      order: { createdAt: 'DESC' },
    });
  }

  async getAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async getById(id: string) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Tournament not found');
    return t;
  }

  // Organiser submits a tournament request
  async submitRequest(userId: string, dto: any) {
    if (!dto.name?.trim()) throw new BadRequestException('Tournament name is required');
    if (!dto.location?.trim()) throw new BadRequestException('Location is required');
    if (!dto.startDate) throw new BadRequestException('Expected start date is required');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check for duplicate name
    const existing = await this.repo.findOne({ where: { name: dto.name.trim() } });
    if (existing) throw new BadRequestException(`Tournament "${dto.name}" already exists`);

    const tournament = this.repo.create({
      name:             dto.name.trim(),
      location:         dto.location.trim(),
      description:      dto.description?.trim() || null,
      startDate:        dto.startDate,
      endDate:          dto.endDate || null,
      organizerName:    user.name,
      organizerPhone:   dto.contactPhone || user.phone,
      organizerAddress: user.address || dto.address || null,
      contactEmail:     dto.contactEmail || null,
      prizePool:        dto.prizePool || null,
      approvalStatus:   TournamentStatus.PENDING,
      isActive:         false,
      createdBy:        user,
    });
    await this.repo.save(tournament);
    return { message: 'Tournament request submitted! Admin will review within 24 hours.', tournamentId: tournament.id };
  }

  // Organiser views their own requests
  async getMyRequests(userId: string) {
    return this.repo.createQueryBuilder('t')
      .where('t.createdById = :userId', { userId })
      .orderBy('t.createdAt', 'DESC')
      .getMany();
  }

  // Admin: get all pending requests
  async getPendingRequests() {
    return this.repo.find({ where: { approvalStatus: TournamentStatus.PENDING }, order: { createdAt: 'DESC' } });
  }

  // Admin: approve tournament
  async approve(id: string, biddingSchedule?: any, remarks?: string) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException();
    t.approvalStatus = TournamentStatus.APPROVED;
    t.isActive       = true;
    if (remarks) t.adminRemarks = remarks;
    if (biddingSchedule) t.biddingSchedule = JSON.stringify(biddingSchedule);
    await this.repo.save(t);
    return t;
  }

  // Admin: reject tournament request
  async reject(id: string, remarks?: string) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException();
    t.approvalStatus = TournamentStatus.REJECTED;
    if (remarks) t.adminRemarks = remarks;
    await this.repo.save(t);
    return t;
  }

  // Admin: set bidding schedule per category
  async setBiddingSchedule(id: string, schedule: Record<string, string>) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException();
    t.biddingSchedule = JSON.stringify(schedule);
    await this.repo.save(t);
    return t;
  }

  async update(id: string, dto: Partial<Tournament>) {
    await this.repo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string) {
    await this.repo.delete(id); return { ok: true };
  }
}
