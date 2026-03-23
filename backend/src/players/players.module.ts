import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { Player } from './player.entity';
import { User } from '../users/user.entity';
import { Tournament } from '../tournaments/tournament.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, User, Tournament]),
    AuthModule,
    MulterModule.register({
      storage: memoryStorage(), // store in memory, convert to base64 for DB
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
