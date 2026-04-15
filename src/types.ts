export type GameMode = 'race' | 'score_attack' | 'survival' | 'daily';

export type SabotageType = 'tile_bomb' | 'junk_row' | 'board_shuffle' | 'freeze' | 'blind';

export type Board = number[][];

export type Screen = 'landing' | 'home' | 'lobby' | 'game' | 'results' | 'leaderboard' | 'profile' | 'settings';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  status: 'searching' | 'ready' | 'playing' | 'finished';
  score: number;
  highestTile: number;
  rank?: number; // Match rank (1st, 2nd, etc)
  tier?: string;
  isEliminated?: boolean;
  elo?: number;
}

export interface MatchResult {
  userId: string;
  name: string;
  rank: number;
  score: number;
  highestTile: number;
  eloDelta: number;
}

export interface MatchStats {
  finalScore: number;
  highestTile: number;
  moves: number;
  sabotages: number;
  duration: string;
  xpEarned: number;
  bitsEarned: number;
}

export interface Sabotage {
  from: string;
  type: SabotageType;
  target?: string;
}

export interface ArenaLog {
  from: string;
  target?: string;
  type: string;
  timestamp: number;
}
