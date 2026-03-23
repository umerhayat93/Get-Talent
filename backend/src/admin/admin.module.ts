import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Player } from '../players/player.entity';
import { Captain } from '../captains/captain.entity';
import { User } from '../users/user.entity';
import { BiddingSession } from '../bidding/bidding-session.entity';
import { Tournament } from '../tournaments/tournament.entity';
import { Bid } from '../bids/bid.entity';
import { Notification } from '../notifications/notification.entity';
import { PushSubscription } from '../notifications/push-subscription.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Captain, User, BiddingSession, Tournament, Bid, Notification, PushSubscription]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
