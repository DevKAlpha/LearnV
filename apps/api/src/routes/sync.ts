import { and, eq, inArray } from "drizzle-orm";
import { Router } from "express";
import { pullRequestSchema, pushRequestSchema, type PushResult, type SyncDocument } from "@learnv/schemas/sync-api";
import { isDraftKey, MAX_ACCOUNT_CHARS, MAX_SYNC_DOCUMENTS } from "@learnv/schemas/sync-keys";
import { schema } from "../db/database.ts";
import type { AppContext } from "../app.ts";
import { jsonBody } from "../http/guards.ts";
import { decryptValue, encryptValue } from "../security/crypto.ts";
import { requireSession, sessionOf } from "./require-session.ts";

type DocumentRow = typeof schema.documents.$inferSelect;

/**
 * Local-first synchronisation. The browser keeps the truth; the account keeps one copy of each
 * localStorage entry with a revision. Writes name the revision they are based on, so a write
 * made from stale data is refused with the current copy (the client merges and retries).
 */
export function syncRoutes(context: AppContext) {
  const { db, config, now } = context;
  const router = Router();
  router.use(requireSession(context));

  const aad = (userId: string, key: string) => `${userId}:${key}`;
  const toDocument = (userId: string, row: DocumentRow): SyncDocument => ({
    key: row.key,
    revision: row.revision,
    updatedAt: row.updatedAt.toISOString(),
    value: row.value === null ? null : decryptValue(config.dataKey, row.value, aad(userId, row.key)),
  });

  /** Revisions only, so devices can see what changed without downloading everything. */
  router.get("/manifest", async (_request, response) => {
    const { user } = sessionOf(response);
    const rows = await db.select({
      key: schema.documents.key,
      revision: schema.documents.revision,
      updatedAt: schema.documents.updatedAt,
      chars: schema.documents.chars,
      deleted: schema.documents.value,
    }).from(schema.documents).where(eq(schema.documents.userId, user.id));
    response.json({
      documents: rows.map((row) => ({ key: row.key, revision: row.revision, updatedAt: row.updatedAt.toISOString(), deleted: row.deleted === null })),
      usage: { chars: rows.reduce((sum, row) => sum + row.chars, 0), limit: MAX_ACCOUNT_CHARS },
    });
  });

  router.post("/pull", jsonBody("16kb"), async (request, response) => {
    const { user } = sessionOf(response);
    const { keys } = pullRequestSchema.parse(request.body);
    const rows = await db.select().from(schema.documents)
      .where(and(eq(schema.documents.userId, user.id), inArray(schema.documents.key, keys)));
    response.json({ documents: rows.map((row) => toDocument(user.id, row)) });
  });

  router.post("/push", jsonBody("8mb"), async (request, response) => {
    const { user } = sessionOf(response);
    const { changes } = pushRequestSchema.parse(request.body);
    const time = now();
    const results = await db.transaction(async (tx) => {
      // One writer per account at a time: revision checks and the storage limit stay exact.
      await tx.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.id, user.id)).for("update");
      const rows = await tx.select().from(schema.documents).where(eq(schema.documents.userId, user.id));
      const byKey = new Map(rows.map((row) => [row.key, row]));
      let usedChars = rows.reduce((sum, row) => sum + row.chars, 0);
      let liveDocuments = rows.filter((row) => row.value !== null).length;
      const out: PushResult[] = [];

      for (const change of changes) {
        const current = byKey.get(change.key);
        if (change.baseRevision !== (current?.revision ?? 0)) {
          out.push({ key: change.key, status: "conflict", current: current ? toDocument(user.id, current) : { key: change.key, revision: 0, updatedAt: time.toISOString(), value: null } });
          continue;
        }
        if (change.value === null) {
          if (!current || current.value === null) {
            out.push({ key: change.key, status: "ok", revision: current?.revision ?? 0, updatedAt: (current?.updatedAt ?? time).toISOString() });
            continue;
          }
          // A tombstone: other devices learn about the deletion instead of uploading the entry again.
          const [row] = await tx.update(schema.documents).set({ value: null, chars: 0, revision: current.revision + 1, updatedAt: time })
            .where(and(eq(schema.documents.userId, user.id), eq(schema.documents.key, change.key))).returning();
          usedChars -= current.chars;
          liveDocuments -= 1;
          byKey.set(change.key, row!);
          out.push({ key: change.key, status: "ok", revision: row!.revision, updatedAt: time.toISOString() });
          continue;
        }
        const nextChars = usedChars - (current?.chars ?? 0) + change.value.length;
        const creates = !current || current.value === null;
        if (nextChars > MAX_ACCOUNT_CHARS || (creates && liveDocuments >= MAX_SYNC_DOCUMENTS)) {
          out.push({ key: change.key, status: "quota" });
          continue;
        }
        const values = {
          value: encryptValue(config.dataKey, change.value, aad(user.id, change.key)),
          chars: change.value.length,
          revision: (current?.revision ?? 0) + 1,
          updatedAt: time,
        };
        const [row] = current
          ? await tx.update(schema.documents).set(values).where(and(eq(schema.documents.userId, user.id), eq(schema.documents.key, change.key))).returning()
          : await tx.insert(schema.documents).values({ userId: user.id, key: change.key, ...values }).returning();
        usedChars = nextChars;
        if (creates) liveDocuments += 1;
        byKey.set(change.key, row!);
        out.push({ key: change.key, status: "ok", revision: row!.revision, updatedAt: time.toISOString() });
      }
      return out;
    });
    response.json({ results });
  });

  /**
   * Removes the account copy of free-text drafts when the person stops syncing them.
   * Rows are erased, not tombstoned, so other devices keep their own drafts.
   */
  router.delete("/drafts", async (_request, response) => {
    const { user } = sessionOf(response);
    const rows = await db.select({ key: schema.documents.key }).from(schema.documents).where(eq(schema.documents.userId, user.id));
    const drafts = rows.map((row) => row.key).filter(isDraftKey);
    if (drafts.length) await db.delete(schema.documents).where(and(eq(schema.documents.userId, user.id), inArray(schema.documents.key, drafts)));
    response.status(204).end();
  });

  return router;
}
