import { config as loadDotenv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

loadDotenv({ path: process.env.DRIZZLE_ENV_FILE ?? '.env.local' });
loadDotenv({ path: '.env' });

const migrationUrl = process.env.DATABASE_URL_UNPOOLED;
if (!migrationUrl) {
  throw new Error('DATABASE_URL_UNPOOLED is required for schema migrations');
}
const secureMigrationUrl = new URL(migrationUrl);
secureMigrationUrl.searchParams.set('sslmode', 'verify-full');

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: secureMigrationUrl.toString(),
  },
});
