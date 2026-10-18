import type { GameState } from '@/types/bingo';

export const CURRENT_GAME_KEY = 'current';

export function createDefaultGameState(): GameState {
  return {
    id: `session-${Date.now()}`,
    sessionStartTime: new Date().toISOString(),
    calledNumbers: [],
    currentBall: null,
    totalBallsPossible: 75,
  };
}
