import type { BingoBall, BingoClaim, GameState, Player } from '@/types/bingo';

export type StorageEnvironment = 'DEFAULT' | 'DRIVE';

function getStorageEnvironment(): StorageEnvironment {
  const environment = process.env.ENVIRONMENT?.trim().toUpperCase() || 'DEFAULT';
  if (environment !== 'DEFAULT' && environment !== 'DRIVE') {
    throw new Error(`Unsupported ENVIRONMENT "${environment}". Use DEFAULT or DRIVE.`);
  }
  return environment;
}

async function getStorage() {
  if (getStorageEnvironment() === 'DRIVE') {
    return import('./storage/drive');
  }
  return import('./storage/postgres');
}

export function getStorageBackend(): string {
  return getStorageEnvironment() === 'DRIVE' ? 'Drive (persistent filesystem)' : 'Neon Postgres';
}

export async function getGameState(): Promise<GameState> {
  return (await getStorage()).getGameState();
}

export async function saveGameState(state: GameState): Promise<void> {
  return (await getStorage()).saveGameState(state);
}

export async function resetGameState(): Promise<GameState> {
  return (await getStorage()).resetGameState();
}

export async function drawNextBall(): Promise<{ state: GameState; ball: BingoBall | null }> {
  return (await getStorage()).drawNextBall();
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  return (await getStorage()).getPlayer(playerId);
}

export async function savePlayer(player: Player): Promise<void> {
  return (await getStorage()).savePlayer(player);
}

export async function listPlayers(): Promise<Player[]> {
  return (await getStorage()).listPlayers();
}

export async function getClaims(): Promise<BingoClaim[]> {
  return (await getStorage()).getClaims();
}

export async function saveClaim(claim: BingoClaim): Promise<BingoClaim[]> {
  return (await getStorage()).saveClaim(claim);
}

export async function updateClaimStatus(
  claimId: string,
  status: BingoClaim['status']
): Promise<BingoClaim | null> {
  return (await getStorage()).updateClaimStatus(claimId, status);
}

export async function clearClaims(): Promise<void> {
  return (await getStorage()).clearClaims();
}
