import { Page } from '@playwright/test';

/**
 * Sets localStorage auth state before the Angular app initialises,
 * simulating a logged-in user without going through the login flow.
 */
export async function loginAs(page: Page, userId = 'user-1'): Promise<void> {
  await page.addInitScript(
    ({ token, userId }: { token: string; userId: string }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
    },
    { token: 'mock-jwt-token', userId },
  );
}

/** Shared fixture data used across specs. */
export const fixtures = {
  statsSummary: { played: 10, wins: 7, losses: 3, winPct: 0.7, streak: 3 },

  userMe: {
    id: 'user-1',
    displayName: 'Test User',
    email: 'test@example.com',
    homeVenue: 'The Cue Club',
  },

  matchesHistory: [
    {
      id: 'match-1',
      homePlayer: { id: 'user-1', displayName: 'Test User' },
      awayPlayer: { id: 'player-2', displayName: 'Bob Smith' },
      homeScore: 5,
      awayScore: 3,
      gameType: 'EIGHT_BALL',
    },
    {
      id: 'match-2',
      homePlayer: { id: 'user-1', displayName: 'Test User' },
      awayPlayer: { id: 'player-3', displayName: 'Alice Chen' },
      homeScore: 2,
      awayScore: 7,
      gameType: 'NINE_BALL',
    },
  ],

  matchDetail: {
    id: 'match-live',
    homePlayer: { id: 'user-1', displayName: 'Test User' },
    awayPlayer: { id: 'player-2', displayName: 'Bob Smith' },
    homeScore: 0,
    awayScore: 0,
    gameType: 'EIGHT_BALL',
  },

  guestMatchDetail: {
    id: 'match-guest',
    homePlayer: { id: 'user-1', displayName: 'Test User' },
    awayPlayer: null,
    guestName: 'Guest Player',
    homeScore: 0,
    awayScore: 0,
    gameType: 'EIGHT_BALL',
  },

  playerSearch: [
    { id: 'player-2', displayName: 'Bob Smith', rating: 1520 },
    { id: 'player-3', displayName: 'Bob Jones', rating: 1480 },
  ],

  leagues: [
    { id: 'league-1', name: 'Spring 8-Ball League', gameType: 'EIGHT_BALL', status: 'ACTIVE' },
    { id: 'league-2', name: 'Winter 9-Ball', gameType: 'NINE_BALL', status: 'PENDING' },
  ],

  standings: [
    { userId: 'user-1', user: { displayName: 'Test User' }, played: 5, won: 4, lost: 1, points: 12 },
    { userId: 'player-2', user: { displayName: 'Bob Smith' }, played: 5, won: 3, lost: 2, points: 9 },
    { userId: 'player-3', user: { displayName: 'Alice Chen' }, played: 4, won: 1, lost: 3, points: 3 },
  ],

  challenges: [
    {
      id: 'challenge-1',
      challenged: { displayName: 'Bob Smith' },
      proposedAt: '2026-05-01T18:00:00.000Z',
      gameType: 'EIGHT_BALL',
      status: 'PENDING',
    },
  ],

  h2hMatches: [
    {
      id: 'h2h-1',
      homePlayer: { id: 'user-1', displayName: 'Test User' },
      awayPlayer: { id: 'player-2', displayName: 'Bob Smith' },
      homeScore: 7,
      awayScore: 5,
      playedAt: '2026-04-15T20:00:00.000Z',
      gameType: 'EIGHT_BALL',
    },
    {
      id: 'h2h-2',
      homePlayer: { id: 'player-2', displayName: 'Bob Smith' },
      awayPlayer: { id: 'user-1', displayName: 'Test User' },
      homeScore: 7,
      awayScore: 3,
      playedAt: '2026-03-20T19:00:00.000Z',
      gameType: 'NINE_BALL',
    },
  ],
};
