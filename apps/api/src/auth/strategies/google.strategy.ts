import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    cfg: ConfigService,
    private auth: AuthService,
  ) {
    super({
      clientID: cfg.get<string>('GOOGLE_CLIENT_ID') ?? '',
      clientSecret: cfg.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
      callbackURL: cfg.get<string>('GOOGLE_CALLBACK_URL') ?? 'http://localhost:4200/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value ?? '';
    const displayName = profile.displayName;
    const avatarUrl = profile.photos?.[0]?.value;
    return this.auth.findOrCreateOAuthUser({ provider: 'google', providerId: profile.id, email, displayName, avatarUrl });
  }
}
