import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/jwt-auth.guard';

@Controller('tournaments')
export class TournamentsController {
  constructor(private svc: TournamentsService) {}

  @Get()           getAll()     { return this.svc.getAll(); }
  @Get('active')   getActive()  { return this.svc.getActive(); }
  @Get(':id')      getById(@Param('id') id: string) { return this.svc.getById(id); }

  // Organiser endpoints
  @Post('request')
  @UseGuards(JwtAuthGuard)
  submitRequest(@Request() req: any, @Body() body: any) {
    return this.svc.submitRequest(req.user.sub, body);
  }

  @Get('organiser/my-requests')
  @UseGuards(JwtAuthGuard)
  getMyRequests(@Request() req: any) { return this.svc.getMyRequests(req.user.sub); }

  // Admin endpoints
  @Get('admin/pending')
  @UseGuards(AdminGuard)
  getPending() { return this.svc.getPendingRequests(); }

  @Patch('admin/:id/approve')
  @UseGuards(AdminGuard)
  approve(@Param('id') id: string, @Body() b: any) {
    return this.svc.approve(id, b.biddingSchedule, b.remarks);
  }

  @Patch('admin/:id/reject')
  @UseGuards(AdminGuard)
  reject(@Param('id') id: string, @Body() b: any) { return this.svc.reject(id, b.remarks); }

  @Patch('admin/:id/schedule')
  @UseGuards(AdminGuard)
  setSchedule(@Param('id') id: string, @Body() b: any) { return this.svc.setBiddingSchedule(id, b.schedule); }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Delete(':id')
  @UseGuards(AdminGuard)
  delete(@Param('id') id: string) { return this.svc.delete(id); }
}
