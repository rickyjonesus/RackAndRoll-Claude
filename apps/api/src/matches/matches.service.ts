import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameType } from '@prisma/client';

const ELO_K = 32;
const GUEST_WINNER_ID = '__guest__';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async createMatch(
    homePlayerId: string,
    gameType: GameType,
    options: { opponentId?: string; guestName?: string; raceToRacks?: number; venueId?: string },
  ) {
    return this.prisma.match.create({
      data: {
        homePlayerId,
        awayPlayerId: options.opponentId ?? undefined,
        guestName: options.guestName ?? undefined,
        gameType,
        raceToRacks: options.raceToRacks,
        venueId: options.venueId,
        status: 'IN_PROGRESS',
      },
      include: {
        homePlayer: { select: { id: true, displayName: true, avatarUrl: true } },
        awayPlayer: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  getMatch(id: string) {
    return this.prisma.match.findUniqueOrThrow({
      where: { id },
      include: {
        homePlayer: { select: { id: true, displayName: true, avatarUrl: true } },
        awayPlayer: { select: { id: true, displayName: true, avatarUrl: true } },
        venue: true,
      },
    });
  }

  addRack(matchId: string, winnerId: string, rackNum: number) {
    return this.prisma.rack.create({ data: { matchId, winnerId, rackNum } });
  }

  async undoLastRack(matchId: string) {
    const last = await this.prisma.rack.findFirst({
      where: { matchId },
      orderBy: { rackNum: 'desc' },
    });
    if (last) await this.prisma.rack.delete({ where: { id: last.id } });
    return last;
  }

  async finalizeMatch(matchId: string) {
    const racks = await this.prisma.rack.findMany({ where: { matchId } });
    const match = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });

    const homeScore = racks.filter((r) => r.winnerId === match.homePlayerId).length;
    const awayScore = racks.filter((r) => r.winnerId !== match.homePlayerId).length;
    const homeWon = homeScore >= awayScore;
    const winnerId = homeWon ? match.homePlayerId : (match.awayPlayerId ?? GUEST_WINNER_ID);

    if (match.awayPlayerId) {
      await this.updateElo(match.homePlayerId, match.awayPlayerId, winnerId, matchId);
    }

    return this.prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, winnerId, status: 'COMPLETED' },
    });
  }

  async disputeMatch(matchId: string, userId: string) {
    const match = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (match.homePlayerId !== userId && match.awayPlayerId !== userId) {
      throw new ForbiddenException();
    }
    return this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'DISPUTED', disputedAt: new Date(), disputedBy: userId },
    });
  }

  getMatchHistory(userId: string) {
    return this.prisma.match.findMany({
      where: {
        OR: [{ homePlayerId: userId }, { awayPlayerId: userId }],
        status: 'COMPLETED',
      },
      include: {
        homePlayer: { select: { id: true, displayName: true, avatarUrl: true } },
        awayPlayer: { select: { id: true, displayName: true, avatarUrl: true } },
        venue: true,
      },
      orderBy: { playedAt: 'desc' },
    });
  }

  private async updateElo(homeId: string, awayId: string, winnerId: string, matchId: string) {
    const [home, away] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: homeId } }),
      this.prisma.user.findUniqueOrThrow({ where: { id: awayId } }),
    ]);

    const expectedHome = 1 / (1 + Math.pow(10, (away.rating - home.rating) / 400));
    const actualHome = winnerId === homeId ? 1 : 0;

    const newHomeRating = home.rating + ELO_K * (actualHome - expectedHome);
    const newAwayRating = away.rating + ELO_K * (1 - actualHome - (1 - expectedHome));

    await Promise.all([
      this.prisma.user.update({ where: { id: homeId }, data: { rating: newHomeRating } }),
      this.prisma.user.update({ where: { id: awayId }, data: { rating: newAwayRating } }),
      this.prisma.ratingHistory.createMany({
        data: [
          { userId: homeId, rating: newHomeRating, matchId },
          { userId: awayId, rating: newAwayRating, matchId },
        ],
      }),
    ]);
  }
}
