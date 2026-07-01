import { Controller, Post, Get, Body, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, TokenResponseDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ type: TokenResponseDto })
  register(@Body() body: RegisterDto) {
    return this.auth.register(body.email, body.password, body.displayName);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Log in with email + password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: TokenResponseDto })
  login(@Request() req: { user: { id: string; email: string } }) {
    return this.auth.login(req.user.id, req.user.email);
  }

  @Get('google')
  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // passport redirects to Google
  }

  @Get('google/callback')
  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard('google'))
  googleCallback(
    @Request() req: { user: { accessToken: string } },
    @Res() res: ExpressResponse,
  ) {
    const webOrigin = this.config.get<string>('WEB_ORIGIN') ?? 'http://localhost:4200';
    res.redirect(`${webOrigin}/auth/callback?token=${req.user.accessToken}`);
  }

  @Get('apple')
  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard('apple'))
  appleAuth() {
    // passport redirects to Apple
  }

  @Post('apple/callback')
  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard('apple'))
  appleCallback(
    @Request() req: { user: { accessToken: string } },
    @Res() res: ExpressResponse,
  ) {
    const webOrigin = this.config.get<string>('WEB_ORIGIN') ?? 'http://localhost:4200';
    res.redirect(`${webOrigin}/auth/callback?token=${req.user.accessToken}`);
  }
}
