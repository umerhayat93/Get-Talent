import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { CaptainsModule } from './captains/captains.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { BidsModule } from './bids/bids.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { User } from './users/user.entity';
import { Player } from './players/player.entity';
import { Captain } from './captains/captain.entity';
import { Tournament } from './tournaments/tournament.entity';
import { Bid } from './bids/bid.entity';
import { BiddingSession } from './bidding/bidding-session.entity';
import { Notification } from './notifications/notification.entity';
import { PushSubscription } from './notifications/push-subscription.entity';

const DB_URL = process.env.DATABASE_URL ||
  'postgresql://get_talent_db_user:cXN98VRvN7aMQTXegkFoRDT0agJXfgN2@dpg-d6vulchr0fns73che8lg-a/get_talent_db';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: DB_URL,
      ssl: { rejectUnauthorized: false },
      entities: [
        User, Player, Captain, Tournament,
        Bid, BiddingSession, Notification, PushSubscription,
      ],
      synchronize: true,
      logging: false,
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    AuthModule,
    PlayersModule,
    CaptainsModule,
    TournamentsModule,
    BidsModule,
    AdminModule,
    NotificationsModule,
  ],
})
export class AppModule {}
