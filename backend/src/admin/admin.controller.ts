import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private svc: AdminService) {}

  @Get('dashboard') getDashboard() { return this.svc.getDashboard(); }

  // Players
  @Get('players')             getPlayers(@Query('status') s?: string) { return this.svc.getPlayers(s); }
  @Patch('players/:id/approve') approvePlayer(@Param('id') id: string, @Body() b: any) { return this.svc.approvePlayer(id, b.remarks); }
  @Patch('players/:id/reject')  rejectPlayer (@Param('id') id: string, @Body() b: any) { return this.svc.rejectPlayer(id, b.remarks); }
  @Patch('players/:id/ban')     banPlayer    (@Param('id') id: string, @Body() b: any) { return this.svc.banPlayer(id, b.remarks); }

  // Captains
  @Get('captains')              getCaptains(@Query('status') s?: string) { return this.svc.getCaptains(s); }
  @Patch('captains/:id/approve')       approveCaptain  (@Param('id') id: string, @Body() b: any) { return this.svc.approveCaptain(id, b.remarks); }
  @Patch('captains/:id/reject')        rejectCaptain   (@Param('id') id: string, @Body() b: any) { return this.svc.rejectCaptain(id, b.remarks); }
  @Patch('captains/:id/ban')           banCaptain      (@Param('id') id: string, @Body() b: any) { return this.svc.banCaptain(id, b.remarks); }
  @Patch('captains/:id/approve-bidding') approveBidding(@Param('id') id: string) { return this.svc.approveCaptainBidding(id); }
  @Patch('captains/:id/mismanaged')    markMismanaged  (@Param('id') id: string) { return this.svc.markMismanaged(id); }

  // Tournaments
  @Post('tournaments')                createTournament (@Body() b: any) { return this.svc.createTournament(b); }
  @Get('tournaments')                 getTournaments   () { return this.svc.getTournaments(); }
  @Get('tournaments/pending')         getPending       () { return this.svc.getPendingTournaments(); }
  @Patch('tournaments/:id/approve')   approveTournament(@Param('id') id: string, @Body() b: any) { return this.svc.approveTournament(id, b.biddingSchedule, b.remarks); }
  @Patch('tournaments/:id/reject')    rejectTournament (@Param('id') id: string, @Body() b: any) { return this.svc.rejectTournament(id, b.remarks); }
  @Patch('tournaments/:id/schedule')  setSchedule      (@Param('id') id: string, @Body() b: any) { return this.svc.setBiddingSchedule(id, b.schedule); }

  // Category bidding
  @Post('bidding/start-category')
  startCategoryBidding(@Body() b: { tournamentId: string; category: string }) {
    return this.svc.startCategoryBidding(b.tournamentId, b.category);
  }

  // Individual bidding sessions
  @Post('sessions/start') startSession(@Body() b: { playerId: string; tournamentId: string; timerSeconds?: number }) {
    return this.svc.startBiddingSession(b.playerId, b.tournamentId, b.timerSeconds || 86400);
  }
  @Patch('sessions/:id/end') endSession(@Param('id') id: string) { return this.svc.endBiddingSession(id); }
  @Get('sessions/active')   getActiveSessions() { return this.svc.getActiveSessions(); }
  @Get('sessions')          getAllSessions   () { return this.svc.getAllSessions(); }

  // Broadcast
  @Post('broadcast') broadcast(@Body() b: { title: string; message: string; type?: string }) {
    return this.svc.broadcast(b.title, b.message, b.type);
  }
}
