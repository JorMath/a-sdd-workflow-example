// Production database (PostgreSQL) - safe for Edge Runtime
export { getDb, type Database } from './client';
export { users, userRoleEnum, type User, type NewUser } from './schema';

// Test database (pglite) - ONLY for tests, never imported in app code
export { getTestDb, type TestDatabase } from './test-client';
