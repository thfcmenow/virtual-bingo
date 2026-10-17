import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to connect to Neon Postgres');
}

declare global {
  var bingoPostgresPool: Pool | undefined;
}

const runtimeUrl = new URL(connectionString);
runtimeUrl.searchParams.set('sslmode', 'verify-full');

const pool =
  global.bingoPostgresPool ??
  new Pool({
    connectionString: runtimeUrl.toString(),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== 'production') {
  global.bingoPostgresPool = pool;
}

export const db = drizzle(pool, { schema });
