import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

export type TestDatabase = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Creates a fresh in-memory SQLite database for testing.
 * Each call returns a new isolated DB instance (no shared state between tests).
 */
export function getTestDb(): TestDatabase {
  const sqlite = new BetterSqlite3(':memory:');
  sqlite.pragma('foreign_keys = ON');
  return drizzle({ client: sqlite, schema });
}

export { schema };
