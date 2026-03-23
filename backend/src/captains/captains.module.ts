import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CaptainsController } from './captains.controller';
import { CaptainsService } from './captains.service';
import { Captain } from './captain.entity';
import { User } from '../users/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Captain, User]),
    AuthModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [CaptainsController],
  providers: [CaptainsService],
  exports: [CaptainsService],
})
export class CaptainsModule {}
