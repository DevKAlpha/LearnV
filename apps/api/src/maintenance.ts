import { and, isNull, lt } from "drizzle-orm";
import type { Config } from "./config.ts";
import { schema, type Database } from "./db/database.ts";

const DAY_MS = 86_400_000;
/** Deletions are remembered this long so offline devices learn about them. */
const TOMBSTONE_DAYS = 180;

/**
 * Retention policy, run hourly:
 * - spent or expired sign-in links after one day;
 * - expired sessions;
 * - accounts idle for RETENTION_DAYS (default two years), with all their documents;
 * - deletion markers older than TOMBSTONE_DAYS.
 */
export async function purgeExpired(db: Database, config: Config, now = new Date()) {
  const ago = (days: number) => new Date(now.getTime() - days * DAY_MS);
  await db.delete(schema.loginTokens).where(lt(schema.loginTokens.expiresAt, ago(1)));
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, now));
  await db.delete(schema.users).where(lt(schema.users.lastSeenAt, ago(config.retentionDays)));
  await db.delete(schema.documents).where(and(isNull(schema.documents.value), lt(schema.documents.updatedAt, ago(TOMBSTONE_DAYS))));
}
