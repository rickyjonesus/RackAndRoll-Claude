import { UsersService } from './users.service';
import { prismaMock } from '../prisma/prisma.mock';

const makeService = () => new UsersService(prismaMock as any);

describe('UsersService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findById', () => {
    it('returns the user', async () => {
      const user = { id: 'u1', displayName: 'Player1' };
      prismaMock.user.findUniqueOrThrow.mockResolvedValue(user);

      const result = await makeService().findById('u1');
      expect(result).toEqual(user);
    });
  });

  describe('search', () => {
    it('queries by displayName and email with case-insensitive matching', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      await makeService().search('rack');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { displayName: { contains: 'rack', mode: 'insensitive' } },
              { email: { contains: 'rack', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('limits results to 20', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      await makeService().search('test');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });
  });

  describe('sendContactRequest', () => {
    it('creates a contact request between two users', async () => {
      prismaMock.contactRequest.create.mockResolvedValue({ id: 'cr1' });

      await makeService().sendContactRequest('u1', 'u2');

      expect(prismaMock.contactRequest.create).toHaveBeenCalledWith({
        data: { requesterId: 'u1', recipientId: 'u2' },
      });
    });
  });

  describe('respondToContactRequest', () => {
    it('accepts the request', async () => {
      prismaMock.contactRequest.update.mockResolvedValue({ id: 'cr1', status: 'ACCEPTED' });

      await makeService().respondToContactRequest('cr1', true);

      expect(prismaMock.contactRequest.update).toHaveBeenCalledWith({
        where: { id: 'cr1' },
        data: { status: 'ACCEPTED' },
      });
    });

    it('declines the request', async () => {
      prismaMock.contactRequest.update.mockResolvedValue({ id: 'cr1', status: 'DECLINED' });

      await makeService().respondToContactRequest('cr1', false);

      expect(prismaMock.contactRequest.update).toHaveBeenCalledWith({
        where: { id: 'cr1' },
        data: { status: 'DECLINED' },
      });
    });
  });
});
