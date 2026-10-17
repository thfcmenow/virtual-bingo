export type BingoLetter = 'B' | 'I' | 'N' | 'G' | 'O';

export interface BingoBall {
  number: number;
  letter: BingoLetter;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  card: number[][]; // 5x5: rows 0-4, cols 0-4 (center is 0 = FREE)
  daubed: boolean[][]; // 5x5 boolean
  createdAt: string;
  color?: string;
  avatarSeed?: string;
}

export interface BingoClaim {
  id: string;
  playerId: string;
  playerName: string;
  timestamp: number;
  status: 'pending' | 'verified' | 'rejected' | 'cleared';
  patternName?: string;
  winningNumbers?: number[];
  isLegitBingo?: boolean;
  uncalledDaubCount?: number;
  cardSnapshot?: number[][];
  daubedSnapshot?: boolean[][];
}

export interface GameState {
  id: string;
  sessionStartTime: string;
  calledNumbers: number[];
  currentBall: BingoBall | null;
  totalBallsPossible: number; // 75
}

export type SSEEventType =
  | 'INIT'
  | 'BALL_DRAWN'
  | 'GAME_RESET'
  | 'BINGO_CLAIMED'
  | 'CLAIM_UPDATED'
  | 'PING';

export interface SSEEventDataMap {
  INIT: {
    gameState: GameState;
    claims: BingoClaim[];
    storageBackend: string;
  };
  BALL_DRAWN: {
    ball: BingoBall;
    calledNumbers: number[];
    gameState: GameState;
  };
  GAME_RESET: {
    message: string;
    gameState: GameState;
    timestamp: number;
  };
  BINGO_CLAIMED: BingoClaim;
  CLAIM_UPDATED: BingoClaim;
  PING: Record<string, never>;
}

export type SSEMessage = {
  [Type in SSEEventType]: {
    type: Type;
    data: SSEEventDataMap[Type];
    timestamp: number;
  };
}[SSEEventType];

export function getLetterForNumber(num: number): BingoLetter {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  throw new Error(`Invalid bingo number: ${num}. Must be between 1 and 75.`);
}

export const LETTER_RANGES: Record<BingoLetter, [number, number]> = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};

export const LETTER_COLORS: Record<BingoLetter, { bg: string; text: string; border: string; glow: string }> = {
  B: { bg: 'bg-blue-600', text: 'text-blue-500', border: 'border-blue-500', glow: 'shadow-blue-500/50' },
  I: { bg: 'bg-rose-600', text: 'text-rose-500', border: 'border-rose-500', glow: 'shadow-rose-500/50' },
  N: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', glow: 'shadow-amber-500/50' },
  G: { bg: 'bg-emerald-600', text: 'text-emerald-500', border: 'border-emerald-500', glow: 'shadow-emerald-500/50' },
  O: { bg: 'bg-purple-600', text: 'text-purple-500', border: 'border-purple-500', glow: 'shadow-purple-500/50' },
};
