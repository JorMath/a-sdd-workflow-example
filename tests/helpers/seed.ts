import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { users } from '@/lib/db/schema';
import type { NewUser } from '@/lib/db/schema';

export type UserRole = 'super_admin' | 'admin_torneo' | 'arbitro' | 'capitan' | 'jugador';

export interface CreateUserOptions {
  email?: string;
  name?: string;
  role?: UserRole;
  cedula?: string;
  passwordHash?: string;
  isActive?: boolean;
}

const DEFAULT_USER: CreateUserOptions = {
  email: 'test@example.com',
  name: 'Test User',
  role: 'jugador',
  isActive: true,
};

function generateUniqueEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

export async function createTestDatabase() {
  const client = new PGlite();
  const db = drizzlePglite(client);

  await db.execute(`CREATE TYPE "user_role" AS ENUM ('super_admin', 'admin_torneo', 'arbitro', 'capitan', 'jugador')`);

  await db.execute(`
    CREATE TABLE "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "email" varchar(255) NOT NULL UNIQUE,
      "password_hash" varchar(255) NOT NULL,
      "name" varchar(255) NOT NULL,
      "role" "user_role" NOT NULL DEFAULT 'jugador',
      "cedula" varchar(10) UNIQUE,
      "is_active" boolean NOT NULL DEFAULT true,
      "created_at" timestamptz NOT NULL DEFAULT NOW(),
      "updated_at" timestamptz NOT NULL DEFAULT NOW()
    )
  `);

  return db;
}

export async function createUser(db: ReturnType<typeof drizzlePglite>, options: CreateUserOptions = {}): Promise<NewUser> {
  const userData: NewUser = {
    email: options.email ?? generateUniqueEmail(),
    name: options.name ?? DEFAULT_USER.name!,
    role: options.role ?? DEFAULT_USER.role!,
    passwordHash: options.passwordHash ?? 'hashed_password_' + Math.random().toString(36),
    cedula: options.cedula,
    isActive: options.isActive ?? DEFAULT_USER.isActive!,
  };

  const [created] = await db.insert(users).values(userData).returning();
  return created;
}

export async function cleanupUsers(db: ReturnType<typeof drizzlePglite>): Promise<void> {
  await db.delete(users);
}
