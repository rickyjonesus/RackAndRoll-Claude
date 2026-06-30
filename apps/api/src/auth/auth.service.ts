import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

interface OAuthUserParams {
  provider: 'google' | 'apple';
  providerId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string, displayName: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { displayName }] },
    });
    if (existing) throw new ConflictException('Email or display name already taken');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, displayName },
    });

    return this.signToken(user.id, user.email);
  }

  async validateLocal(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new UnauthorizedException();
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException();
    return user;
  }

  login(userId: string, email: string) {
    return this.signToken(userId, email);
  }

  async findOrCreateOAuthUser({ provider, providerId, email, displayName, avatarUrl }: OAuthUserParams) {
    const isGoogle = provider === 'google';

    let user = isGoogle
      ? await this.prisma.user.findUnique({ where: { googleId: providerId } })
      : await this.prisma.user.findUnique({ where: { appleId: providerId } });

    if (!user && email) {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        user = isGoogle
          ? await this.prisma.user.update({ where: { id: user.id }, data: { googleId: providerId } })
          : await this.prisma.user.update({ where: { id: user.id }, data: { appleId: providerId } });
      }
    }

    if (!user) {
      const base = displayName || email.split('@')[0] || 'user';
      let uniqueName = base;
      let suffix = 1;
      while (await this.prisma.user.findUnique({ where: { displayName: uniqueName } })) {
        uniqueName = `${base}${suffix++}`;
      }
      user = isGoogle
        ? await this.prisma.user.create({ data: { email, googleId: providerId, displayName: uniqueName, avatarUrl } })
        : await this.prisma.user.create({ data: { email, appleId: providerId, displayName: uniqueName, avatarUrl } });
    }

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    return { accessToken: this.jwt.sign({ sub: userId, email }) };
  }
}
