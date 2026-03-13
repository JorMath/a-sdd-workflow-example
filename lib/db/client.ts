import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

function createPostgresClient() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return postgres(databaseUrl);
}

export type Database = ReturnType<typeof drizzle>;

let db: Database | undefined;

export function getDb(): Database {
  if (!db) {
    const client = createPostgresClient();
    db = drizzle(client, { schema });
  }
  return db;
}

export { schema };
