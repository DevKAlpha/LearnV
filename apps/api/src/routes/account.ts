import { and, eq, isNotNull } from "drizzle-orm";
import { Router } from "express";
import { deleteAccountRequestSchema, type Account } from "@learnv/schemas/sync-api";
import { schema } from "../db/database.ts";
import type { AppContext } from "../app.ts";
import { clearSessionCookie, type SessionUser } from "../http/sessions.ts";
import { jsonBody } from "../http/guards.ts";
import { decryptValue } from "../security/crypto.ts";
import { requireSession, sessionOf } from "./require-session.ts";

export function toAccount(user: SessionUser): Account {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    consent: { age: user.ageBand as Account["consent"]["age"], privacy: user.privacyVersion, at: user.consentAt.toISOString() },
  };
}

/** GDPR rights: access (me), portability (export) and erasure (delete). */
export function accountRoutes(context: AppContext) {
  const { db, config, now } = context;
  const router = Router();
  router.use(requireSession(context));

  router.get("/", (_request, response) => {
    response.json({ account: toAccount(sessionOf(response).user) });
  });

  /** Same format as the in-app device backup, so the file can be restored on any device. */
  router.get("/export", async (_request, response) => {
    const { user } = sessionOf(response);
    const rows = await db.select().from(schema.documents)
      .where(and(eq(schema.documents.userId, user.id), isNotNull(schema.documents.value)));
    const data: Record<string, string> = {};
    for (const row of rows) data[row.key] = decryptValue(config.dataKey, row.value!, `${user.id}:${row.key}`);
    const exportedAt = now().toISOString();
    response.attachment(`learnv-cuenta-${exportedAt.slice(0, 10)}.json`);
    response.json({ app: "learnv", format: 1, exportedAt, account: toAccount(user), data });
  });

  /** Deletes the account and every synchronised document. Typing the address confirms it. */
  router.delete("/", jsonBody("1kb"), async (request, response) => {
    const { user } = sessionOf(response);
    const { confirm } = deleteAccountRequestSchema.parse(request.body);
    if (confirm !== user.email) {
      response.status(400).json({ error: "confirmation-mismatch" });
      return;
    }
    await db.delete(schema.users).where(eq(schema.users.id, user.id));
    clearSessionCookie(response, config);
    response.status(204).end();
  });

  return router;
}
