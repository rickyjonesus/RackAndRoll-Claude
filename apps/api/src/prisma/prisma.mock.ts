export const prismaMock = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  match: {
    create: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  rack: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  ratingHistory: {
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
  contactRequest: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  challenge: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  recurringSeries: {
    create: jest.fn(),
    update: jest.fn(),
  },
  league: {
    create: jest.fn(),
    update: jest.fn(),
  },
  leagueMember: {
    create: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  leagueMatch: {
    createMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
  },
};
