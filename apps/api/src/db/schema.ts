import { randomUUID } from "node:crypto";
import { index, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

const time = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

/**
 * One row per account. Only what sign-in and consent need: no name, birth date or documents.
 * Learner data lives in `documents`, encrypted.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  /** "14-plus" or "guardian" (a parent or guardian consented, LOPDGDD art. 7). */
  ageBand: text("age_band").notNull(),
  privacyVersion: text("privacy_version").notNull(),
  consentAt: time("consent_at").notNull(),
  createdAt: time("created_at").notNull().defaultNow(),
  /** Drives the retention policy: accounts idle for RETENTION_DAYS are deleted. */
  lastSeenAt: time("last_seen_at").notNull().defaultNow(),
});

/** Single-use sign-in links. Only a SHA-256 hash of the token is stored. */
export const loginTokens = pgTable("login_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  email: text("email").notNull(),
  ageBand: text("age_band").notNull(),
  privacyVersion: text("privacy_version").notNull(),
  createdAt: time("created_at").notNull().defaultNow(),
  expiresAt: time("expires_at").notNull(),
  usedAt: time("used_at"),
}, (table) => [index("login_tokens_email_idx").on(table.email, table.createdAt)]);

/** Signed-in browsers. The cookie carries a random id; only its SHA-256 hash is stored. */
export const sessions = pgTable("sessions", {
  idHash: text("id_hash").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: time("created_at").notNull().defaultNow(),
  expiresAt: time("expires_at").notNull(),
}, (table) => [index("sessions_user_idx").on(table.userId)]);

/**
 * One synchronised localStorage entry per row (see @learnv/schemas/sync-keys).
 * `value` is AES-256-GCM ciphertext, or null for a deletion other devices must apply.
 * `revision` grows by one on every write and guards against lost updates.
 */
export const documents = pgTable("documents", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  revision: integer("revision").notNull(),
  value: text("value"),
  /** Plain-text length in UTF-16 code units, for the account storage limit. */
  chars: integer("chars").notNull().default(0),
  updatedAt: time("updated_at").notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.userId, table.key] })]);
