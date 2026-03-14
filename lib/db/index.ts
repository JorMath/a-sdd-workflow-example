// Production database (SQLite via better-sqlite3) 
export { getDb, type Database } from './client';
export { users, userRoleValues, type User, type NewUser } from './schema';

// Test database (better-sqlite3 :memory:) - ONLY for tests, never imported in app code
export { getTestDb, type TestDatabase } from './test-client';
