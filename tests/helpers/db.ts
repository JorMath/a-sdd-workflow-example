import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';

export async function createTestDb() {
  const client = new PGlite();
  const db = drizzlePglite(client);

  await db.execute(`
    CREATE TYPE "user_role" AS ENUM ('super_admin', 'admin_torneo', 'arbitro', 'capitan', 'jugador')
  `);

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