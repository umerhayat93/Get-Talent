import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { Bid } from './bid.entity';
import { Captain } from '../captains/captain.entity';
import { BiddingSession } from '../bidding/bidding-session.entity';
import { Player } from '../players/player.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Captain, BiddingSession, Player]), AuthModule],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}
