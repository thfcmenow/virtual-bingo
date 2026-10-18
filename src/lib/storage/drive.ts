import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { BingoBall, BingoClaim, GameState, Player } from '@/types/bingo';
import { getLetterForNumber } from '@/types/bingo';
import { createDefaultGameState } from './common';

interface DriveData {
  gameState: GameState | null;
  players: Record<string, Player>;
  claims: Record<string, BingoClaim>;
}

const storageDirectory = path.resolve(process.env.DRIVE_STORAGE_PATH || '/data/virutalbingo');
const dataFile = path.join(storageDirectory, 'bingo.json');
let operationQueue: Promise<void> = Promise.resolve();

function withStorageLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = operationQueue.then(operation, operation);
  operationQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

function emptyData(): DriveData {
  return { gameState: null, players: {}, claims: {} };
}

async function readData(): Promise<DriveData> {
  try {
    const content = await readFile(dataFile, 'utf8');
    return JSON.parse(content) as DriveData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyData();
    throw error;
  }
}

async function writeData(data: DriveData): Promise<void> {
  await mkdir(storageDirectory, { recursive: true });
  const temporaryFile = `${dataFile}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(data), 'utf8');
  await rename(temporaryFile, dataFile);
}

function sortedClaims(data: DriveData): BingoClaim[] {
  return Object.values(data.claims).sort(
    (a, b) => b.timestamp - a.timestamp || b.id.localeCompare(a.id)
  );
}

export async function getGameState(): Promise<GameState> {
  return withStorageLock(async () => {
    const data = await readData();
    if (data.gameState) return data.gameState;

    data.gameState = createDefaultGameState();
    await writeData(data);
    return data.gameState;
  });
}

export async function saveGameState(state: GameState): Promise<void> {
  await withStorageLock(async () => {
    const data = await readData();
    data.gameState = state;
    await writeData(data);
  });
}

export async function resetGameState(): Promise<GameState> {
  return withStorageLock(async () => {
    const data = await readData();
    const newState = createDefaultGameState();
    data.gameState = newState;
    data.claims = {};
    await writeData(data);
    return newState;
  });
}

export async function drawNextBall(): Promise<{ state: GameState; ball: BingoBall | null }> {
  return withStorageLock(async () => {
    const data = await readData();
    const state = data.gameState ?? createDefaultGameState();
    data.gameState = state;

    const calledSet = new Set(state.calledNumbers);
    const available: number[] = [];
    for (let number = 1; number <= 75; number++) {
      if (!calledSet.has(number)) available.push(number);
    }

    if (available.length === 0) {
      await writeData(data);
      return { state, ball: null };
    }

    const pickedNumber = available[Math.floor(Math.random() * available.length)];
    const ball: BingoBall = {
      number: pickedNumber,
      letter: getLetterForNumber(pickedNumber),
      timestamp: Date.now(),
    };

    state.calledNumbers.push(pickedNumber);
    state.currentBall = ball;
    await writeData(data);

    return { state, ball };
  });
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  return withStorageLock(async () => {
    const data = await readData();
    return data.players[playerId] ?? null;
  });
}

export async function savePlayer(player: Player): Promise<void> {
  await withStorageLock(async () => {
    const data = await readData();
    data.players[player.id] = player;
    await writeData(data);
  });
}

export async function listPlayers(): Promise<Player[]> {
  return withStorageLock(async () => {
    const data = await readData();
    return Object.values(data.players);
  });
}

export async function getClaims(): Promise<BingoClaim[]> {
  return withStorageLock(async () => sortedClaims(await readData()));
}

export async function saveClaim(claim: BingoClaim): Promise<BingoClaim[]> {
  return withStorageLock(async () => {
    const data = await readData();
    data.claims[claim.id] = claim;
    await writeData(data);
    return sortedClaims(data);
  });
}

export async function updateClaimStatus(
  claimId: string,
  status: BingoClaim['status']
): Promise<BingoClaim | null> {
  return withStorageLock(async () => {
    const data = await readData();
    const existingClaim = data.claims[claimId];
    if (!existingClaim) return null;

    const updatedClaim = { ...existingClaim, status };
    data.claims[claimId] = updatedClaim;
    await writeData(data);
    return updatedClaim;
  });
}

export async function clearClaims(): Promise<void> {
  await withStorageLock(async () => {
    const data = await readData();
    data.claims = {};
    await writeData(data);
  });
}
