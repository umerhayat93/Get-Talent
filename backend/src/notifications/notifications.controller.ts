import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get('vapid-public-key')
  getVapidKey() { return this.svc.getVapidPublicKey(); }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(@Request() req, @Body() body: any) {
    return this.svc.subscribe(req.user.sub, body);
  }

  @Post('subscribe/anonymous')
  subscribeAnon(@Body() body: any) {
    return this.svc.subscribe(null, body);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMine(@Request() req) { return this.svc.getForUser(req.user.sub); }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markRead(@Param('id') id: string) { return this.svc.markRead(id); }

  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  markAllRead(@Request() req) { return this.svc.markAllRead(req.user.sub); }

  @Post('broadcast')
  @UseGuards(AdminGuard)
  broadcast(@Body() body: { title: string; message: string; type?: string }) {
    return this.svc.broadcast(body.title, body.message, body.type);
  }
}
