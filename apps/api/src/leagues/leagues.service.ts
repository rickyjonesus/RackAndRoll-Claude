import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameType } from '@prisma/client';

@Injectable()
export class LeaguesService {
  constructor(private prisma: PrismaService) {}

  async createLeague(createdBy: string, name: string, gameType: GameType, startDate: Date, endDate: Date) {
    return this.prisma.league.create({
      data: {
        name,
        gameType,
        startDate,
        endDate,
        createdBy,
        members: { create: { userId: createdBy } },
      },
      include: { members: true },
    });
  }

  inviteMember(leagueId: string, userId: string) {
    return this.prisma.leagueMember.create({ data: { leagueId, userId } });
  }

  async generateSchedule(leagueId: string) {
    const members = await this.prisma.leagueMember.findMany({ where: { leagueId } });
    const pairs: { homeId: string; awayId: string }[] = [];

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        pairs.push({ homeId: members[i].userId, awayId: members[j].userId });
      }
    }

    await this.prisma.leagueMatch.createMany({
      data: pairs.map((p) => ({ leagueId, ...p })),
    });

    return this.prisma.league.update({ where: { id: leagueId }, data: { status: 'ACTIVE' } });
  }

  getStandings(leagueId: string) {
    return this.prisma.leagueMember.findMany({
      where: { leagueId },
      include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
      orderBy: [{ points: 'desc' }, { won: 'desc' }],
    });
  }

  async recordLeagueMatchResult(leagueMatchId: string, winnerId: string) {
    const lm = await this.prisma.leagueMatch.findUniqueOrThrow({ where: { id: leagueMatchId } });
    const loserId = winnerId === lm.homeId ? lm.awayId : lm.homeId;

    await Promise.all([
      this.prisma.leagueMember.updateMany({
        where: { leagueId: lm.leagueId, userId: winnerId },
        data: { points: { increment: 3 }, won: { increment: 1 }, played: { increment: 1 } },
      }),
      this.prisma.leagueMember.updateMany({
        where: { leagueId: lm.leagueId, userId: loserId },
        data: { lost: { increment: 1 }, played: { increment: 1 } },
      }),
      this.prisma.leagueMatch.update({ where: { id: leagueMatchId }, data: { status: 'COMPLETED' } }),
    ]);
  }
}
