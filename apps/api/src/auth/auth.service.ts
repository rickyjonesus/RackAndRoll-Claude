import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

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

  private signToken(userId: string, email: string) {
    return { accessToken: this.jwt.sign({ sub: userId, email }) };
  }
}
