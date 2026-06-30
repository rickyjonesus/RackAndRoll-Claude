import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../auth.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const AppleStrategy = require('passport-apple');

interface AppleIdTokenPayload {
  sub: string;
  email?: string;
}

interface AppleProfile {
  name?: { firstName?: string; lastName?: string };
}

@Injectable()
export class AppleOAuthStrategy extends PassportStrategy(AppleStrategy, 'apple') {
  constructor(
    cfg: ConfigService,
    private auth: AuthService,
  ) {
    super({
      clientID: cfg.get<string>('APPLE_CLIENT_ID') ?? '',
      teamID: cfg.get<string>('APPLE_TEAM_ID') ?? '',
      keyID: cfg.get<string>('APPLE_KEY_ID') ?? '',
      privateKeyString: cfg.get<string>('APPLE_PRIVATE_KEY') ?? '',
      callbackURL: cfg.get<string>('APPLE_CALLBACK_URL') ?? 'http://localhost:3000/api/auth/apple/callback',
      passReqToCallback: false,
    });
  }

  async validate(_accessToken: string, _refreshToken: string, idToken: string, profile: AppleProfile) {
    const payload = jwt.decode(idToken) as AppleIdTokenPayload | null;
    const sub = payload?.sub ?? '';
    const email = payload?.email ?? '';

    const firstName = profile?.name?.firstName ?? '';
    const lastName = profile?.name?.lastName ?? '';
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];

    return this.auth.findOrCreateOAuthUser({ provider: 'apple', providerId: sub, email, displayName });
  }
}
