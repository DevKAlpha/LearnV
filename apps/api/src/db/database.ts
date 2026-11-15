import { mkdir } from "node:fs/promises";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema.ts";

export { schema };

/** Either node-postgres (production) or PGlite (development and tests): same query API. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export type DatabaseHandle = { db: Database; close: () => Promise<void> };

/** Connects to PostgreSQL and applies pending migrations. */
export async function openPostgres(url: string, migrationsFolder: string): Promise<DatabaseHandle> {
  const { default: pg } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  const pool = new pg.Pool({ connectionString: url, max: 10 });
  const db = drizzle(pool, { schema });
  await migrate(db, { migrationsFolder });
  return { db: db as unknown as Database, close: () => pool.end() };
}

/**
 * Embedded PostgreSQL (WASM) for development and tests. `dataDir` keeps data between runs;
 * omit it for an in-memory database. PGlite is a development dependency: never used in production.
 */
export async function openPglite(migrationsFolder: string, dataDir?: string): Promise<DatabaseHandle> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  if (dataDir) await mkdir(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder });
  return { db: db as unknown as Database, close: () => client.close() };
}
