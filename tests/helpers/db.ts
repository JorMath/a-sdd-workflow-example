import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';

export async function createTestDb() {
  const client = new PGlite();
  const db = drizzlePglite(client);

  // --- Enums (must be created before tables) ---

  await db.execute(`
    CREATE TYPE "user_role" AS ENUM ('super_admin', 'admin_torneo', 'arbitro', 'capitan', 'jugador')
  `);

  await db.execute(`
    CREATE TYPE "tournament_category" AS ENUM ('libre', 'sub_20', 'sub_17', 'femenino', 'veteranos')
  `);

  await db.execute(`
    CREATE TYPE "tournament_format" AS ENUM ('liga', 'copa', 'liga_copa')
  `);

  await db.execute(`
    CREATE TYPE "tournament_status" AS ENUM ('inscripciones', 'en_curso', 'finalizado', 'cancelado')
  `);

  // --- Tables (ordered by FK dependencies) ---

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

  await db.execute(`
    CREATE TABLE "torneos" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "nombre" varchar(150) NOT NULL,
      "slug" varchar(200) NOT NULL UNIQUE,
      "temporada" varchar(20) NOT NULL,
      "categoria" "tournament_category" NOT NULL,
      "formato" "tournament_format" NOT NULL,
      "estado" "tournament_status" NOT NULL DEFAULT 'inscripciones',
      "fecha_inicio" date NOT NULL,
      "fecha_fin" date,
      "max_equipos" integer NOT NULL,
      "partidos_ida_vuelta" boolean NOT NULL DEFAULT false,
      "puntos_victoria" integer NOT NULL DEFAULT 3,
      "puntos_empate" integer NOT NULL DEFAULT 1,
      "puntos_derrota" integer NOT NULL DEFAULT 0,
      "criterio_desempate" json NOT NULL DEFAULT '["diferencia_goles","goles_favor","resultado_directo","tarjetas_amarillas","tarjetas_rojas","sorteo"]',
      "tarjetas_suspension" integer NOT NULL DEFAULT 5,
      "inscripcion_precio" numeric(8, 2) NOT NULL DEFAULT '0.00',
      "reglas_descripcion" text,
      "cancel_reason" text,
      "created_by" uuid NOT NULL REFERENCES "users"("id"),
      "created_at" timestamptz NOT NULL DEFAULT NOW(),
      "updated_at" timestamptz NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(`
    CREATE TABLE "tournament_admin_assignments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "tournament_id" uuid NOT NULL REFERENCES "torneos"("id"),
      "user_id" uuid NOT NULL REFERENCES "users"("id"),
      "assigned_at" timestamptz NOT NULL DEFAULT NOW(),
      "assigned_by" uuid NOT NULL REFERENCES "users"("id"),
      UNIQUE ("tournament_id", "user_id")
    )
  `);

  return db;
}