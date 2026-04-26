import { SchedulingService } from './scheduling.service';
import { prismaMock } from '../prisma/prisma.mock';
import { Cadence, GameType } from '@prisma/client';

const makeService = () => new SchedulingService(prismaMock as any);

const CHALLENGER_ID = 'user-1';
const CHALLENGED_ID = 'user-2';
const CHALLENGE_ID = 'ch-1';

describe('SchedulingService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createChallenge', () => {
    it('creates a challenge with PENDING status', async () => {
      prismaMock.challenge.create.mockResolvedValue({ id: CHALLENGE_ID });
      const proposedAt = new Date('2026-06-01T19:00:00Z');

      await makeService().createChallenge(CHALLENGER_ID, CHALLENGED_ID, GameType.EIGHT_BALL, proposedAt);

      expect(prismaMock.challenge.create).toHaveBeenCalledWith({
        data: { challengerId: CHALLENGER_ID, challengedId: CHALLENGED_ID, gameType: GameType.EIGHT_BALL, proposedAt, venueId: undefined },
      });
    });
  });

  describe('respondToChallenge', () => {
    it('sets status to ACCEPTED when accept is true', async () => {
      prismaMock.challenge.update.mockResolvedValue({ id: CHALLENGE_ID, status: 'ACCEPTED' });

      await makeService().respondToChallenge(CHALLENGE_ID, CHALLENGED_ID, true);

      expect(prismaMock.challenge.update).toHaveBeenCalledWith({
        where: { id: CHALLENGE_ID },
        data: { status: 'ACCEPTED' },
      });
    });

    it('sets status to DECLINED when accept is false', async () => {
      prismaMock.challenge.update.mockResolvedValue({ id: CHALLENGE_ID, status: 'DECLINED' });

      await makeService().respondToChallenge(CHALLENGE_ID, CHALLENGED_ID, false);

      expect(prismaMock.challenge.update).toHaveBeenCalledWith({
        where: { id: CHALLENGE_ID },
        data: { status: 'DECLINED' },
      });
    });
  });

  describe('reschedule', () => {
    it('updates proposedAt and resets status to PENDING', async () => {
      prismaMock.challenge.update.mockResolvedValue({});
      const newDate = new Date('2026-06-15T19:00:00Z');

      await makeService().reschedule(CHALLENGE_ID, CHALLENGED_ID, newDate);

      expect(prismaMock.challenge.update).toHaveBeenCalledWith({
        where: { id: CHALLENGE_ID },
        data: { proposedAt: newDate, status: 'PENDING' },
      });
    });
  });

  describe('cancel', () => {
    it('sets status to CANCELLED', async () => {
      prismaMock.challenge.update.mockResolvedValue({});

      await makeService().cancel(CHALLENGE_ID);

      expect(prismaMock.challenge.update).toHaveBeenCalledWith({
        where: { id: CHALLENGE_ID },
        data: { status: 'CANCELLED' },
      });
    });
  });

  describe('createRecurringSeries', () => {
    it('creates a series with the first occurrence', async () => {
      prismaMock.recurringSeries.create.mockResolvedValue({ id: 'series-1' });
      const startDate = new Date('2026-05-01T19:00:00Z');

      await makeService().createRecurringSeries(CHALLENGER_ID, CHALLENGED_ID, GameType.NINE_BALL, startDate, Cadence.WEEKLY);

      expect(prismaMock.recurringSeries.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cadence: Cadence.WEEKLY,
            startDate,
            occurrences: {
              create: expect.objectContaining({
                challengerId: CHALLENGER_ID,
                challengedId: CHALLENGED_ID,
                proposedAt: startDate,
              }),
            },
          }),
        }),
      );
    });
  });

  describe('endSeries', () => {
    it('sets endedAt on the series', async () => {
      prismaMock.recurringSeries.update.mockResolvedValue({});
      const before = new Date();

      await makeService().endSeries('series-1');

      const call = prismaMock.recurringSeries.update.mock.calls[0][0];
      expect(call.where).toEqual({ id: 'series-1' });
      expect(call.data.endedAt).toBeInstanceOf(Date);
      expect(call.data.endedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });
});
