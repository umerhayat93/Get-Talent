import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Captain } from './captain.entity';
import { User } from '../users/user.entity';

@Injectable()
export class CaptainsService {
  constructor(
    @InjectRepository(Captain) private captainRepo: Repository<Captain>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getByUserId(userId: string) {
    return this.captainRepo.findOne({ where: { user: { id: userId } } });
  }

  async uploadReceipt(userId: string, filename: string) {
    const captain = await this.captainRepo.findOne({ where: { user: { id: userId } } });
    if (!captain) throw new NotFoundException();
    captain.paymentReceipt = filename;
    return this.captainRepo.save(captain);
  }

  async uploadProfilePicture(userId: string, filename: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    user.profilePicture = filename;
    return this.userRepo.save(user);
  }
}
