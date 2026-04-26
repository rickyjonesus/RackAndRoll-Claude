import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { prismaMock } from '../prisma/prisma.mock';

jest.mock('bcryptjs');

const mockJwt = { sign: jest.fn().mockReturnValue('signed-token') } as unknown as JwtService;

const makeService = () => new AuthService(prismaMock as any, mockJwt);

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('returns an access token on success', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prismaMock.user.create.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

      const result = await makeService().register('a@b.com', 'password123', 'Player1');

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { email: 'a@b.com', passwordHash: 'hashed-pw', displayName: 'Player1' },
      });
      expect(result).toEqual({ accessToken: 'signed-token' });
    });

    it('throws ConflictException when email or displayName is taken', async () => {
      prismaMock.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(makeService().register('a@b.com', 'password123', 'Player1'))
        .rejects.toThrow(ConflictException);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('validateLocal', () => {
    it('returns the user when credentials are valid', async () => {
      const user = { id: 'u1', email: 'a@b.com', passwordHash: 'hashed' };
      prismaMock.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await makeService().validateLocal('a@b.com', 'password123');
      expect(result).toEqual(user);
    });

    it('throws UnauthorizedException when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(makeService().validateLocal('x@y.com', 'pw'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', passwordHash: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(makeService().validateLocal('a@b.com', 'wrong'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('returns a signed token', () => {
      const result = makeService().login('u1', 'a@b.com');
      expect(mockJwt.sign).toHaveBeenCalledWith({ sub: 'u1', email: 'a@b.com' });
      expect(result).toEqual({ accessToken: 'signed-token' });
    });
  });
});
