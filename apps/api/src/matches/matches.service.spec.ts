import { MatchesService } from './matches.service';
import { prismaMock } from '../prisma/prisma.mock';
import { GameType } from '@prisma/client';

const makeService = () => new MatchesService(prismaMock as any);

const HOME_ID = 'home-user';
const AWAY_ID = 'away-user';
const MATCH_ID = 'match-1';

describe('MatchesService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createMatch', () => {
    it('creates a match against a registered opponent', async () => {
      prismaMock.match.create.mockResolvedValue({ id: MATCH_ID });

      await makeService().createMatch(HOME_ID, GameType.EIGHT_BALL, { opponentId: AWAY_ID, raceToRacks: 7 });

      expect(prismaMock.match.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ homePlayerId: HOME_ID, awayPlayerId: AWAY_ID }),
        }),
      );
    });

    it('creates a match against a guest opponent', async () => {
      prismaMock.match.create.mockResolvedValue({ id: MATCH_ID });

      await makeService().createMatch(HOME_ID, GameType.NINE_BALL, { guestName: 'Bar Stranger' });

      expect(prismaMock.match.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ guestName: 'Bar Stranger', awayPlayerId: undefined }),
        }),
      );
    });
  });

  describe('addRack', () => {
    it('creates a rack record', async () => {
      prismaMock.rack.create.mockResolvedValue({ id: 'r1' });

      await makeService().addRack(MATCH_ID, HOME_ID, 1);

      expect(prismaMock.rack.create).toHaveBeenCalledWith({
        data: { matchId: MATCH_ID, winnerId: HOME_ID, rackNum: 1 },
      });
    });
  });

  describe('undoLastRack', () => {
    it('deletes the highest-numbered rack and returns it', async () => {
      const rack = { id: 'r3', rackNum: 3 };
      prismaMock.rack.findFirst.mockResolvedValue(rack);
      prismaMock.rack.delete.mockResolvedValue(rack);

      const result = await makeService().undoLastRack(MATCH_ID);

      expect(prismaMock.rack.delete).toHaveBeenCalledWith({ where: { id: 'r3' } });
      expect(result).toEqual(rack);
    });

    it('does nothing when there are no racks', async () => {
      prismaMock.rack.findFirst.mockResolvedValue(null);

      const result = await makeService().undoLastRack(MATCH_ID);

      expect(prismaMock.rack.delete).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('finalizeMatch', () => {
    const baseMatch = { id: MATCH_ID, homePlayerId: HOME_ID, awayPlayerId: AWAY_ID };
    const racks = [
      { winnerId: HOME_ID }, { winnerId: HOME_ID }, { winnerId: HOME_ID }, // 3 home
      { winnerId: HOME_ID }, { winnerId: HOME_ID },                         // 5 home total
      { winnerId: AWAY_ID }, { winnerId: AWAY_ID },                         // 2 away
    ];

    it('sets home player as winner when they have more racks', async () => {
      prismaMock.rack.findMany.mockResolvedValue(racks);
      prismaMock.match.findUniqueOrThrow.mockResolvedValue(baseMatch);
      prismaMock.user.findUniqueOrThrow
        .mockResolvedValueOnce({ id: HOME_ID, rating: 1000 })
        .mockResolvedValueOnce({ id: AWAY_ID, rating: 1000 });
      prismaMock.user.update.mockResolvedValue({});
      prismaMock.ratingHistory.createMany.mockResolvedValue({});
      prismaMock.match.update.mockResolvedValue({ id: MATCH_ID, winnerId: HOME_ID });

      const result = await makeService().finalizeMatch(MATCH_ID);

      expect(prismaMock.match.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ winnerId: HOME_ID, homeScore: 5, awayScore: 2 }),
        }),
      );
      expect(result).toMatchObject({ winnerId: HOME_ID });
    });

    it('skips ELO update for guest matches', async () => {
      prismaMock.rack.findMany.mockResolvedValue([{ winnerId: HOME_ID }, { winnerId: '__guest__' }]);
      prismaMock.match.findUniqueOrThrow.mockResolvedValue({ ...baseMatch, awayPlayerId: null, guestName: 'Stranger' });
      prismaMock.match.update.mockResolvedValue({ id: MATCH_ID });

      await makeService().finalizeMatch(MATCH_ID);

      expect(prismaMock.user.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(prismaMock.ratingHistory.createMany).not.toHaveBeenCalled();
    });
  });
});
