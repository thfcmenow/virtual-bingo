import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { claimsTable, gameStateTable, playersTable } from '@/lib/db/schema';
import type { BingoClaim, BingoBall, GameState, Player } from '@/types/bingo';
import { getLetterForNumber } from '@/types/bingo';
import { CURRENT_GAME_KEY, createDefaultGameState } from './common';

export async function getGameState(): Promise<GameState> {
  const [existing] = await db
    .select({ state: gameStateTable.state })
    .from(gameStateTable)
    .where(eq(gameStateTable.key, CURRENT_GAME_KEY))
    .limit(1);

  if (existing) return existing.state;

  const initialState = createDefaultGameState();
  await db
    .insert(gameStateTable)
    .values({ key: CURRENT_GAME_KEY, state: initialState })
    .onConflictDoNothing();

  const [created] = await db
    .select({ state: gameStateTable.state })
    .from(gameStateTable)
    .where(eq(gameStateTable.key, CURRENT_GAME_KEY))
    .limit(1);

  if (!created) throw new Error('Failed to initialize the Bingo game state');
  return created.state;
}

export async function saveGameState(state: GameState): Promise<void> {
  await db
    .insert(gameStateTable)
    .values({ key: CURRENT_GAME_KEY, state })
    .onConflictDoUpdate({
      target: gameStateTable.key,
      set: { state },
    });
}

export async function resetGameState(): Promise<GameState> {
  const newState = createDefaultGameState();

  await db.transaction(async (transaction) => {
    await transaction
      .insert(gameStateTable)
      .values({ key: CURRENT_GAME_KEY, state: newState })
      .onConflictDoUpdate({
        target: gameStateTable.key,
        set: { state: newState },
      });
    await transaction.delete(claimsTable);
  });

  return newState;
}

export async function drawNextBall(): Promise<{ state: GameState; ball: BingoBall | null }> {
  return db.transaction(async (transaction) => {
    await transaction
      .insert(gameStateTable)
      .values({ key: CURRENT_GAME_KEY, state: createDefaultGameState() })
      .onConflictDoNothing();

    const [row] = await transaction
      .select({ state: gameStateTable.state })
      .from(gameStateTable)
      .where(eq(gameStateTable.key, CURRENT_GAME_KEY))
      .for('update')
      .limit(1);

    if (!row) throw new Error('Failed to load the Bingo game state');

    const state = row.state;
    const calledSet = new Set(state.calledNumbers);
    const available: number[] = [];

    for (let number = 1; number <= 75; number++) {
      if (!calledSet.has(number)) available.push(number);
    }

    if (available.length === 0) return { state, ball: null };

    const pickedNumber = available[Math.floor(Math.random() * available.length)];
    const ball: BingoBall = {
      number: pickedNumber,
      letter: getLetterForNumber(pickedNumber),
      timestamp: Date.now(),
    };

    state.calledNumbers.push(pickedNumber);
    state.currentBall = ball;

    await transaction
      .update(gameStateTable)
      .set({ state })
      .where(eq(gameStateTable.key, CURRENT_GAME_KEY));

    return { state, ball };
  });
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  const [row] = await db
    .select({ data: playersTable.data })
    .from(playersTable)
    .where(eq(playersTable.id, playerId))
    .limit(1);

  return row?.data ?? null;
}

export async function savePlayer(player: Player): Promise<void> {
  await db
    .insert(playersTable)
    .values({ id: player.id, data: player })
    .onConflictDoUpdate({
      target: playersTable.id,
      set: { data: player },
    });
}

export async function listPlayers(): Promise<Player[]> {
  const rows = await db.select({ data: playersTable.data }).from(playersTable);
  return rows.map((row) => row.data);
}

export async function getClaims(): Promise<BingoClaim[]> {
  const rows = await db
    .select({ data: claimsTable.data })
    .from(claimsTable)
    .orderBy(desc(claimsTable.timestamp), desc(claimsTable.id));

  return rows.map((row) => row.data);
}

export async function saveClaim(claim: BingoClaim): Promise<BingoClaim[]> {
  await db
    .insert(claimsTable)
    .values({
      id: claim.id,
      playerId: claim.playerId,
      status: claim.status,
      timestamp: claim.timestamp,
      data: claim,
    })
    .onConflictDoUpdate({
      target: claimsTable.id,
      set: {
        playerId: claim.playerId,
        status: claim.status,
        timestamp: claim.timestamp,
        data: claim,
      },
    });

  return getClaims();
}

export async function updateClaimStatus(
  claimId: string,
  status: BingoClaim['status']
): Promise<BingoClaim | null> {
  return db.transaction(async (transaction) => {
    const [row] = await transaction
      .select({ data: claimsTable.data })
      .from(claimsTable)
      .where(eq(claimsTable.id, claimId))
      .for('update')
      .limit(1);

    if (!row) return null;

    const updatedClaim = { ...row.data, status };
    await transaction
      .update(claimsTable)
      .set({ status, data: updatedClaim })
      .where(eq(claimsTable.id, claimId));

    return updatedClaim;
  });
}

export async function clearClaims(): Promise<void> {
  await db.delete(claimsTable);
}
