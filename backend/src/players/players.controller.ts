import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('players')
export class PlayersController {
  constructor(private svc: PlayersService) {}

  @Get('feed')
  getFeed(
    @Query('page') page = 1,
    @Query('limit') limit = 12,
    @Query('category') category?: string,
    @Query('skill') skill?: string,
    @Query('tournamentId') tournamentId?: string,
  ) { return this.svc.getFeed(+page, +limit, category, skill, tournamentId); }

  @Get('by-tournament/:tournamentId')
  getByTournament(@Param('tournamentId') tid: string) { return this.svc.getByTournament(tid); }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: any) { return this.svc.getByUserId(req.user.sub); }

  @Get(':id')
  getById(@Param('id') id: string) { return this.svc.getById(id); }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req: any, @Body() body: any) { return this.svc.updateProfile(req.user.sub, body); }

  @Post('re-auction')
  @UseGuards(JwtAuthGuard)
  requestReAuction(@Request() req: any) { return this.svc.requestReAuction(req.user.sub); }

  @Post('join-tournament/:tournamentId')
  @UseGuards(JwtAuthGuard)
  joinTournament(@Request() req: any, @Param('tournamentId') tid: string) { return this.svc.joinTournament(req.user.sub, tid); }

  @Delete('leave-tournament/:tournamentId')
  @UseGuards(JwtAuthGuard)
  leaveTournament(@Request() req: any, @Param('tournamentId') tid: string) { return this.svc.leaveTournament(req.user.sub, tid); }

  @Post('profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadPic(@Request() req: any, @UploadedFile() file: any) {
    // Store as base64 data URL — survives Render redeploys (stored in PostgreSQL)
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.svc.updateProfilePicture(req.user.sub, base64);
  }

  @Post('upload-receipt')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadReceipt(@Request() req: any, @UploadedFile() file: any) {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.svc.uploadReceipt(req.user.sub, base64);
  }
}
