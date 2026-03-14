import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const DB_PATH = './data/liga.db';

function createSqliteClient(): Database.Database {
  // Ensure the data/ directory exists
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return sqlite;
}

export type DatabaseClient = ReturnType<typeof drizzle<typeof schema>>;

let db: DatabaseClient | undefined;

export function getDb(): DatabaseClient {
  if (!db) {
    const client = createSqliteClient();
    db = drizzle({ client, schema });
  }
  return db;
}

// Keep backward-compatible type export
export type Database = DatabaseClient;

export { schema };
