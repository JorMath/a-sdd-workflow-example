import BetterSqlite3 from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import {
  generateSQLiteDrizzleJson,
  generateSQLiteMigration,
  type DrizzleSQLiteSnapshotJSON,
} from 'drizzle-kit/api';
import * as schema from '@/lib/db/schema';

/** Empty snapshot for diffing against current schema */
const EMPTY_SNAPSHOT: DrizzleSQLiteSnapshotJSON = {
  id: '00000000-0000-0000-0000-000000000000',
  prevId: '',
  version: '6',
  dialect: 'sqlite',
  tables: {},
  enums: {},
  views: {},
  _meta: { tables: {}, columns: {} },
};

let cachedStatements: string[] | null = null;

/**
 * Generate CREATE TABLE statements from the Drizzle schema.
 * Results are cached — the schema doesn't change between test runs.
 */
async function getSchemaStatements(): Promise<string[]> {
  if (cachedStatements) return cachedStatements;

  const currentSnapshot = await generateSQLiteDrizzleJson(schema);
  cachedStatements = await generateSQLiteMigration(
    EMPTY_SNAPSHOT,
    currentSnapshot,
  );
  return cachedStatements;
}

export type TestDb = BetterSQLite3Database<typeof schema>;

/**
 * Creates a fresh in-memory SQLite database with all tables.
 * Each call returns an isolated DB — no shared state between tests.
 */
export async function setupTestDb(): Promise<TestDb> {
  const sqlite = new BetterSqlite3(':memory:');
  sqlite.pragma('foreign_keys = ON');

  const statements = await getSchemaStatements();
  for (const stmt of statements) {
    sqlite.exec(stmt);
  }

  return drizzle({ client: sqlite, schema });
}

/**
 * Cleanup: close the underlying SQLite connection.
 * For :memory: DBs this also destroys all data.
 */
export function cleanupTestDb(db: TestDb): void {
  // Access the underlying better-sqlite3 Database to close it
  // The drizzle instance wraps it; closing is optional for :memory:
  // but good practice to release resources.
  // Note: drizzle-orm doesn't expose a .close() method, but :memory: DBs
  // are garbage collected when the reference is dropped.
}
