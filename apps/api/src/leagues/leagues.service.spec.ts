import { LeaguesService } from './leagues.service';
import { prismaMock } from '../prisma/prisma.mock';
import { GameType } from '@prisma/client';

const makeService = () => new LeaguesService(prismaMock as any);

const LEAGUE_ID = 'league-1';
const CREATOR_ID = 'user-1';

describe('LeaguesService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createLeague', () => {
    it('creates the league with the creator as a member', async () => {
      prismaMock.league.create.mockResolvedValue({ id: LEAGUE_ID });

      await makeService().createLeague(CREATOR_ID, 'Friday 8-Ball', GameType.EIGHT_BALL, new Date('2026-05-01'), new Date('2026-07-31'));

      expect(prismaMock.league.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            createdBy: CREATOR_ID,
            name: 'Friday 8-Ball',
            members: { create: { userId: CREATOR_ID } },
          }),
        }),
      );
    });
  });

  describe('generateSchedule', () => {
    it('creates N*(N-1)/2 match pairs for N members', async () => {
      const members = [
        { userId: 'u1' }, { userId: 'u2' }, { userId: 'u3' }, { userId: 'u4' },
      ];
      prismaMock.leagueMember.findMany.mockResolvedValue(members);
      prismaMock.leagueMatch.createMany.mockResolvedValue({ count: 6 });
      prismaMock.league.update.mockResolvedValue({ id: LEAGUE_ID, status: 'ACTIVE' });

      await makeService().generateSchedule(LEAGUE_ID);

      const call = prismaMock.leagueMatch.createMany.mock.calls[0][0];
      expect(call.data).toHaveLength(6); // 4*(4-1)/2 = 6
    });

    it('generates all unique pairings (no duplicates)', async () => {
      prismaMock.leagueMember.findMany.mockResolvedValue([
        { userId: 'u1' }, { userId: 'u2' }, { userId: 'u3' },
      ]);
      prismaMock.leagueMatch.createMany.mockResolvedValue({ count: 3 });
      prismaMock.league.update.mockResolvedValue({});

      await makeService().generateSchedule(LEAGUE_ID);

      const { data } = prismaMock.leagueMatch.createMany.mock.calls[0][0];
      const pairs = data.map((d: any) => [d.homeId, d.awayId].sort().join('-'));
      const unique = new Set(pairs);
      expect(unique.size).toBe(pairs.length);
    });

    it('sets league status to ACTIVE after schedule generation', async () => {
      prismaMock.leagueMember.findMany.mockResolvedValue([{ userId: 'u1' }, { userId: 'u2' }]);
      prismaMock.leagueMatch.createMany.mockResolvedValue({ count: 1 });
      prismaMock.league.update.mockResolvedValue({});

      await makeService().generateSchedule(LEAGUE_ID);

      expect(prismaMock.league.update).toHaveBeenCalledWith({
        where: { id: LEAGUE_ID },
        data: { status: 'ACTIVE' },
      });
    });
  });

  describe('recordLeagueMatchResult', () => {
    it('awards 3 points and a win to the winner, a loss to the loser', async () => {
      prismaMock.leagueMatch.findUniqueOrThrow.mockResolvedValue({
        id: 'lm1',
        leagueId: LEAGUE_ID,
        homeId: 'u1',
        awayId: 'u2',
      });
      prismaMock.leagueMember.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.leagueMatch.update.mockResolvedValue({});

      await makeService().recordLeagueMatchResult('lm1', 'u1');

      expect(prismaMock.leagueMember.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { leagueId: LEAGUE_ID, userId: 'u1' },
          data: expect.objectContaining({ points: { increment: 3 }, won: { increment: 1 } }),
        }),
      );
      expect(prismaMock.leagueMember.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { leagueId: LEAGUE_ID, userId: 'u2' },
          data: expect.objectContaining({ lost: { increment: 1 } }),
        }),
      );
    });
  });
});
