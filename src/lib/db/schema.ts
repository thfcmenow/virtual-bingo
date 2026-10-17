import { bigint, index, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import type { BingoClaim, GameState, Player } from '@/types/bingo';

export const gameStateTable = pgTable('bingo_game_state', {
  key: text('key').primaryKey(),
  state: jsonb('state').$type<GameState>().notNull(),
});

export const playersTable = pgTable('bingo_players', {
  id: text('id').primaryKey(),
  data: jsonb('data').$type<Player>().notNull(),
});

export const claimsTable = pgTable(
  'bingo_claims',
  {
    id: text('id').primaryKey(),
    playerId: text('player_id').notNull(),
    status: text('status').$type<BingoClaim['status']>().notNull(),
    timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
    data: jsonb('data').$type<BingoClaim>().notNull(),
  },
  (table) => [
    index('bingo_claims_timestamp_idx').on(table.timestamp),
    index('bingo_claims_player_id_idx').on(table.playerId),
  ]
);
