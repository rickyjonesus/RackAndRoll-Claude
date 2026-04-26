export type GameType = 'EIGHT_BALL' | 'NINE_BALL' | 'TEN_BALL' | 'STRAIGHT';
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
export type ChallengeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';
export type ContactStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
export type LeagueStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type Cadence = 'WEEKLY' | 'BIWEEKLY';

export interface UserSummary {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  rating: number;
}

export interface MatchSummary {
  id: string;
  homePlayer: UserSummary;
  awayPlayer: UserSummary;
  homeScore: number;
  awayScore: number;
  winnerId: string | null;
  gameType: GameType;
  status: MatchStatus;
  playedAt: string;
}

export interface StatsSummary {
  played: number;
  wins: number;
  losses: number;
  winPct: number;
  streak: number;
}

export interface RatingPoint {
  rating: number;
  createdAt: string;
  matchId: string | null;
}

export interface Challenge {
  id: string;
  challenger: UserSummary;
  challenged: UserSummary;
  gameType: GameType;
  proposedAt: string;
  status: ChallengeStatus;
}

export interface LeagueMemberStanding {
  userId: string;
  user: UserSummary;
  points: number;
  won: number;
  lost: number;
  played: number;
}
