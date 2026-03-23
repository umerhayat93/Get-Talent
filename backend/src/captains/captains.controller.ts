import { Controller, Get, Post, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CaptainsService } from './captains.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('captains')
export class CaptainsController {
  constructor(private svc: CaptainsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: any) { return this.svc.getByUserId(req.user.sub); }

  @Post('upload-receipt')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadReceipt(@Request() req: any, @UploadedFile() file: any) {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.svc.uploadReceipt(req.user.sub, base64);
  }

  @Post('profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadPic(@Request() req: any, @UploadedFile() file: any) {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.svc.uploadProfilePicture(req.user.sub, base64);
  }
}
