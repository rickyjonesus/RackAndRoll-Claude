import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameType, Cadence } from '@prisma/client';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  createChallenge(challengerId: string, challengedId: string, gameType: GameType, proposedAt: Date, venueId?: string) {
    return this.prisma.challenge.create({
      data: { challengerId, challengedId, gameType, proposedAt, venueId },
    });
  }

  respondToChallenge(id: string, userId: string, accept: boolean) {
    return this.prisma.challenge.update({
      where: { id },
      data: { status: accept ? 'ACCEPTED' : 'DECLINED' },
    });
  }

  reschedule(id: string, userId: string, proposedAt: Date) {
    return this.prisma.challenge.update({
      where: { id },
      data: { proposedAt, status: 'PENDING' },
    });
  }

  cancel(id: string) {
    return this.prisma.challenge.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  getUpcoming(userId: string) {
    return this.prisma.challenge.findMany({
      where: {
        OR: [{ challengerId: userId }, { challengedId: userId }],
        status: 'ACCEPTED',
        proposedAt: { gte: new Date() },
      },
      include: {
        challenger: { select: { id: true, displayName: true, avatarUrl: true } },
        challenged: { select: { id: true, displayName: true, avatarUrl: true } },
        venue: true,
      },
      orderBy: { proposedAt: 'asc' },
    });
  }

  createRecurringSeries(challengerId: string, challengedId: string, gameType: GameType, startDate: Date, cadence: Cadence, venueId?: string) {
    return this.prisma.recurringSeries.create({
      data: {
        cadence,
        startDate,
        occurrences: {
          create: { challengerId, challengedId, gameType, proposedAt: startDate, venueId },
        },
      },
      include: { occurrences: true },
    });
  }

  endSeries(seriesId: string) {
    return this.prisma.recurringSeries.update({
      where: { id: seriesId },
      data: { endedAt: new Date() },
    });
  }
}
