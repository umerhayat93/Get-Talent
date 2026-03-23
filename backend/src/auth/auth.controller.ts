import { Controller, Post, Body, Get, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('admin/login')
  adminLogin(@Body() body: { password: string }) { return this.authService.adminLogin(body.password); }

  @Post('register/player')
  registerPlayer(@Body() body: any) { return this.authService.registerPlayer(body); }

  @Post('register/captain')
  registerCaptain(@Body() body: any) { return this.authService.registerCaptain(body); }

  @Post('register/fan')
  registerFan(@Body() body: any) { return this.authService.registerFan(body); }

  @Post('register/organiser')
  registerOrganiser(@Body() body: any) { return this.authService.registerOrganiser(body); }

  @Post('login')
  login(@Body() body: { phone: string; password: string }) { return this.authService.login(body.phone, body.password); }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) { return this.authService.getProfile(req.user.sub); }

  // Universal profile picture — all roles (fan, organiser)
  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) { return this.authService.forgotPassword(body.email); }

  @Post('reset-password')
  resetPassword(@Body() body: { email: string; newPassword: string }) { return this.authService.resetPassword(body.email, body.newPassword); }

  @Post('profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePicture(@Request() req: any, @UploadedFile() file: any) {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.authService.updateProfilePicture(req.user.sub, base64);
  }
}
