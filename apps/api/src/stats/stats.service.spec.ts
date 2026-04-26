import { StatsService } from './stats.service';
import { prismaMock } from '../prisma/prisma.mock';

const makeService = () => new StatsService(prismaMock as any);

const USER_ID = 'user-1';
const OTHER_ID = 'user-2';

const makeMatch = (winnerId: string | null, daysAgo: number) => ({
  winnerId,
  playedAt: new Date(Date.now() - daysAgo * 86400000),
  homePlayerId: USER_ID,
  awayPlayerId: OTHER_ID,
  status: 'COMPLETED',
});

describe('StatsService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getSummary', () => {
    it('returns correct win/loss counts and percentage', async () => {
      prismaMock.match.findMany.mockResolvedValue([
        makeMatch(USER_ID, 1),
        makeMatch(USER_ID, 2),
        makeMatch(OTHER_ID, 3),
      ]);

      const result = await makeService().getSummary(USER_ID);

      expect(result.played).toBe(3);
      expect(result.wins).toBe(2);
      expect(result.losses).toBe(1);
      expect(result.winPct).toBeCloseTo(2 / 3);
    });

    it('returns zeros when no matches played', async () => {
      prismaMock.match.findMany.mockResolvedValue([]);

      const result = await makeService().getSummary(USER_ID);

      expect(result).toEqual({ played: 0, wins: 0, losses: 0, winPct: 0, streak: 0 });
    });

    it('returns a positive streak for consecutive wins', async () => {
      prismaMock.match.findMany.mockResolvedValue([
        makeMatch(USER_ID, 1),
        makeMatch(USER_ID, 2),
        makeMatch(USER_ID, 3),
        makeMatch(OTHER_ID, 4),
      ]);

      const result = await makeService().getSummary(USER_ID);
      expect(result.streak).toBe(3);
    });

    it('returns a negative streak for consecutive losses', async () => {
      prismaMock.match.findMany.mockResolvedValue([
        makeMatch(OTHER_ID, 1),
        makeMatch(OTHER_ID, 2),
        makeMatch(USER_ID, 3),
      ]);

      const result = await makeService().getSummary(USER_ID);
      expect(result.streak).toBe(-2);
    });

    it('passes gameType and since filters to the query', async () => {
      prismaMock.match.findMany.mockResolvedValue([]);
      const since = new Date('2026-01-01');

      await makeService().getSummary(USER_ID, 'EIGHT_BALL' as any, since);

      expect(prismaMock.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            gameType: 'EIGHT_BALL',
            playedAt: { gte: since },
          }),
        }),
      );
    });
  });

  describe('getHeadToHead', () => {
    it('queries matches in both directions between two players', async () => {
      prismaMock.match.findMany.mockResolvedValue([]);

      await makeService().getHeadToHead(USER_ID, OTHER_ID);

      expect(prismaMock.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { homePlayerId: USER_ID, awayPlayerId: OTHER_ID },
              { homePlayerId: OTHER_ID, awayPlayerId: USER_ID },
            ],
          }),
        }),
      );
    });
  });

  describe('getRatingHistory', () => {
    it('returns rating history ordered by date ascending', async () => {
      prismaMock.ratingHistory.findMany.mockResolvedValue([]);

      await makeService().getRatingHistory(USER_ID);

      expect(prismaMock.ratingHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID },
          orderBy: { createdAt: 'asc' },
        }),
      );
    });
  });
});
