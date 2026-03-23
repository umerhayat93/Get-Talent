import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bids')
export class BidsController {
  constructor(private svc: BidsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  placeBid(@Request() req: any, @Body() body: { sessionId: string; amount: number }) {
    return this.svc.placeBid(req.user.sub, body.sessionId, body.amount);
  }

  @Get('session/:sessionId')
  getSessionBids(@Param('sessionId') sessionId: string) {
    return this.svc.getSessionBids(sessionId);
  }

  @Get('player/:playerId')
  getPlayerBids(@Param('playerId') playerId: string) {
    return this.svc.getPlayerBids(playerId);
  }

  // Public — no admin auth needed
  @Get('sessions/active')
  getActiveSessions() {
    return this.svc.getActiveSessions();
  }

  // Get category bid caps
  @Get('caps')
  getBidCaps() {
    return this.svc.getBidCaps();
  }

  // Get how many bids current captain placed in session
  @Get('count/:sessionId')
  @UseGuards(JwtAuthGuard)
  getCaptainBidCount(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.svc.getCaptainBidCount(req.user.sub, sessionId);
  }
}
