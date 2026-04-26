import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; displayName: string }) {
    return this.auth.register(body.email, body.password, body.displayName);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: { user: { id: string; email: string } }) {
    return this.auth.login(req.user.id, req.user.email);
  }
}
