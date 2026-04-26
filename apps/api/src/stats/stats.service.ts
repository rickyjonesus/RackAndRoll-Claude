import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameType } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string, gameType?: GameType, since?: Date) {
    const where = {
      OR: [{ homePlayerId: userId }, { awayPlayerId: userId }],
      status: 'COMPLETED' as const,
      ...(gameType ? { gameType } : {}),
      ...(since ? { playedAt: { gte: since } } : {}),
    };

    const matches = await this.prisma.match.findMany({ where });
    const wins = matches.filter((m) => m.winnerId === userId).length;
    const losses = matches.length - wins;

    const streak = this.calcStreak(userId, matches);

    return { played: matches.length, wins, losses, winPct: matches.length ? wins / matches.length : 0, streak };
  }

  getHeadToHead(userId: string, opponentId: string) {
    return this.prisma.match.findMany({
      where: {
        OR: [
          { homePlayerId: userId, awayPlayerId: opponentId },
          { homePlayerId: opponentId, awayPlayerId: userId },
        ],
        status: 'COMPLETED',
      },
      include: {
        homePlayer: { select: { id: true, displayName: true } },
        awayPlayer: { select: { id: true, displayName: true } },
        venue: true,
      },
      orderBy: { playedAt: 'desc' },
    });
  }

  getRatingHistory(userId: string) {
    return this.prisma.ratingHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { rating: true, createdAt: true, matchId: true },
    });
  }

  private calcStreak(userId: string, matches: { winnerId: string | null; playedAt: Date }[]) {
    const sorted = [...matches].sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
    if (!sorted.length) return 0;
    const isWin = (m: typeof sorted[0]) => m.winnerId === userId;
    const dir = isWin(sorted[0]);
    let count = 0;
    for (const m of sorted) {
      if (isWin(m) !== dir) break;
      count++;
    }
    return dir ? count : -count;
  }
}
