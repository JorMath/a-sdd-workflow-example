import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema';

export type TestDatabase = ReturnType<typeof drizzlePglite>;

let testDb: TestDatabase | undefined;

export async function getTestDb(): Promise<TestDatabase> {
  if (!testDb) {
    const client = new PGlite();
    testDb = drizzlePglite(client, { schema });
  }
  return testDb;
}

export { schema };
