import fs from 'node:fs/promises';
import path from 'node:path';
import { GameState, Player, BingoClaim, BingoBall, getLetterForNumber } from '@/types/bingo';

let cachedDataDir: string | null = null;

/**
 * Resolves the Bingo data directory.
 * Prioritizes '/data/bingo/' as requested.
 * Automatically creates the directory and its subdirectories if they do not exist.
 * Falls back to '<cwd>/data/bingo' if root filesystem is read-only (e.g. macOS system volume).
 */
export async function getBingoDataDir(): Promise<string> {
  if (cachedDataDir) {
    return cachedDataDir;
  }

  const preferredDir = process.env.BINGO_DATA_DIR || '/data/bingo';
  const fallbackDir = path.join(process.cwd(), 'data', 'bingo');

  // Attempt preferred directory first
  try {
    await fs.mkdir(preferredDir, { recursive: true });
    await fs.mkdir(path.join(preferredDir, 'players'), { recursive: true });
    // Write test to guarantee write permissions
    const testFile = path.join(preferredDir, '.write-test');
    await fs.writeFile(testFile, 'ok', 'utf8');
    await fs.unlink(testFile);
    cachedDataDir = preferredDir;
    console.log(`[Bingo Storage] Using primary storage directory: ${preferredDir}`);
    return preferredDir;
  } catch (err) {
    console.warn(
      `[Bingo Storage] Note: Could not write to ${preferredDir} (${(err as Error).message}). Falling back to local workspace directory: ${fallbackDir}`
    );
  }

  // Fallback to local directory
  await fs.mkdir(fallbackDir, { recursive: true });
  await fs.mkdir(path.join(fallbackDir, 'players'), { recursive: true });
  cachedDataDir = fallbackDir;
  console.log(`[Bingo Storage] Using storage directory: ${fallbackDir}`);
  return fallbackDir;
}

// File path helpers
async function getGameStatePath(): Promise<string> {
  const dir = await getBingoDataDir();
  return path.join(dir, 'game-state.json');
}

async function getClaimsPath(): Promise<string> {
  const dir = await getBingoDataDir();
  return path.join(dir, 'claims.json');
}

async function getPlayerPath(playerId: string): Promise<string> {
  const dir = await getBingoDataDir();
  // Sanitize playerId for safe filename
  const safeId = playerId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(dir, 'players', `${safeId}.json`);
}

// Initial game state factory
export function createDefaultGameState(): GameState {
  return {
    id: `session-${Date.now()}`,
    sessionStartTime: new Date().toISOString(),
    calledNumbers: [],
    currentBall: null,
    totalBallsPossible: 75,
  };
}

/**
 * Reads the persistent game state from /data/bingo/game-state.json
 */
export async function getGameState(): Promise<GameState> {
  const filePath = await getGameStatePath();
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const state = JSON.parse(raw) as GameState;
    return state;
  } catch {
    // If file doesn't exist, create it with default state
    const defaultState = createDefaultGameState();
    await saveGameState(defaultState);
    return defaultState;
  }
}

/**
 * Saves the persistent game state to /data/bingo/game-state.json
 */
export async function saveGameState(state: GameState): Promise<void> {
  const filePath = await getGameStatePath();
  await fs.writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Resets the game: clears called numbers, sets currentBall to null,
 * resets session id and clears active claims if requested.
 */
export async function resetGameState(): Promise<GameState> {
  const newState: GameState = {
    id: `session-${Date.now()}`,
    sessionStartTime: new Date().toISOString(),
    calledNumbers: [],
    currentBall: null,
    totalBallsPossible: 75,
  };
  await saveGameState(newState);
  await clearClaims();
  return newState;
}

/**
 * Draws the next uncalled number from 1 to 75.
 * Returns null if all 75 balls have been drawn.
 */
export async function drawNextBall(): Promise<{ state: GameState; ball: BingoBall | null }> {
  const state = await getGameState();
  const calledSet = new Set(state.calledNumbers);

  const available: number[] = [];
  for (let i = 1; i <= 75; i++) {
    if (!calledSet.has(i)) {
      available.push(i);
    }
  }

  if (available.length === 0) {
    return { state, ball: null };
  }

  // Pick random number from available
  const randomIndex = Math.floor(Math.random() * available.length);
  const pickedNumber = available[randomIndex];
  const ball: BingoBall = {
    number: pickedNumber,
    letter: getLetterForNumber(pickedNumber),
    timestamp: Date.now(),
  };

  state.calledNumbers.push(pickedNumber);
  state.currentBall = ball;

  await saveGameState(state);
  return { state, ball };
}

/**
 * Reads a player's card and state from /data/bingo/players/[playerId].json
 */
export async function getPlayer(playerId: string): Promise<Player | null> {
  try {
    const filePath = await getPlayerPath(playerId);
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as Player;
  } catch {
    return null;
  }
}

/**
 * Saves player info and card to /data/bingo/players/[playerId].json
 */
export async function savePlayer(player: Player): Promise<void> {
  const filePath = await getPlayerPath(player.id);
  await fs.writeFile(filePath, JSON.stringify(player, null, 2), 'utf8');
}

/**
 * Lists all registered players
 */
export async function listPlayers(): Promise<Player[]> {
  const dir = await getBingoDataDir();
  const playersDir = path.join(dir, 'players');
  try {
    const files = await fs.readdir(playersDir);
    const players: Player[] = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const raw = await fs.readFile(path.join(playersDir, file), 'utf8');
          players.push(JSON.parse(raw) as Player);
        } catch {
          // ignore corrupted files
        }
      }
    }
    return players;
  } catch {
    return [];
  }
}

/**
 * Reads all claims from /data/bingo/claims.json
 */
export async function getClaims(): Promise<BingoClaim[]> {
  const filePath = await getClaimsPath();
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as BingoClaim[];
  } catch {
    return [];
  }
}

/**
 * Saves or updates a claim in /data/bingo/claims.json
 */
export async function saveClaim(claim: BingoClaim): Promise<BingoClaim[]> {
  const claims = await getClaims();
  const existingIdx = claims.findIndex((c) => c.id === claim.id);
  if (existingIdx >= 0) {
    claims[existingIdx] = claim;
  } else {
    // New claim at front
    claims.unshift(claim);
  }
  const filePath = await getClaimsPath();
  await fs.writeFile(filePath, JSON.stringify(claims, null, 2), 'utf8');
  return claims;
}

/**
 * Updates a claim's status ('verified' | 'rejected' | 'cleared')
 */
export async function updateClaimStatus(
  claimId: string,
  status: BingoClaim['status']
): Promise<BingoClaim | null> {
  const claims = await getClaims();
  const claim = claims.find((c) => c.id === claimId);
  if (!claim) return null;

  claim.status = status;
  const filePath = await getClaimsPath();
  await fs.writeFile(filePath, JSON.stringify(claims, null, 2), 'utf8');
  return claim;
}

/**
 * Clears or wipes all claims
 */
export async function clearClaims(): Promise<void> {
  const filePath = await getClaimsPath();
  await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf8');
}
