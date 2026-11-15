import { and, count, eq, gt, isNull } from "drizzle-orm";
import { Router } from "express";
import { magicLinkRequestSchema, verifyRequestSchema } from "@learnv/schemas/sync-api";
import { schema } from "../db/database.ts";
import type { AppContext } from "../app.ts";
import { clearSessionCookie, currentSession, startSession } from "../http/sessions.ts";
import { jsonBody } from "../http/guards.ts";
import { hashToken, randomToken } from "../security/crypto.ts";
import { toAccount } from "./account.ts";

/** Sign-in links per address within LINK_WINDOW_MS; extra requests are accepted but not sent. */
const LINKS_PER_WINDOW = 3;
const LINK_WINDOW_MS = 15 * 60_000;

export function authRoutes({ db, config, mailer, now, limits }: AppContext) {
  const router = Router();

  /**
   * Always answers 202 for a valid request, whether or not the address has an account,
   * so the endpoint cannot be used to discover who uses LearnV.
   */
  router.post("/magic-link", limits.magicLink, jsonBody("4kb"), async (request, response) => {
    const body = magicLinkRequestSchema.parse(request.body);
    const time = now();
    const [recent] = await db.select({ total: count() }).from(schema.loginTokens)
      .where(and(eq(schema.loginTokens.email, body.email), gt(schema.loginTokens.createdAt, new Date(time.getTime() - LINK_WINDOW_MS))));
    if ((recent?.total ?? 0) >= LINKS_PER_WINDOW) {
      response.status(202).json({ status: "sent" });
      return;
    }
    const token = randomToken();
    await db.insert(schema.loginTokens).values({
      tokenHash: hashToken(token),
      email: body.email,
      ageBand: body.consent.age,
      privacyVersion: body.consent.privacy,
      createdAt: time,
      expiresAt: new Date(time.getTime() + config.loginTokenMinutes * 60_000),
    });
    // The token travels in the fragment: browsers never send it to a server, so it stays out of
    // access logs and Referer headers, and link scanners cannot spend it (the page asks for a tap).
    const link = new URL(`account/verify#token=${token}`, config.appUrl).href;
    try {
      await mailer.sendMagicLink({ to: body.email, link, locale: body.locale, minutes: config.loginTokenMinutes });
    } catch (error) {
      console.error(`[api] magic link could not be sent: ${error instanceof Error ? error.name : typeof error}`);
      response.status(503).json({ error: "mail-unavailable" });
      return;
    }
    response.status(202).json({ status: "sent" });
  });

  router.post("/verify", limits.verify, jsonBody("1kb"), async (request, response) => {
    const { token } = verifyRequestSchema.parse(request.body);
    const time = now();
    // Spending the token is one conditional update, so two tabs cannot both use it.
    const [login] = await db.update(schema.loginTokens).set({ usedAt: time })
      .where(and(eq(schema.loginTokens.tokenHash, hashToken(token)), isNull(schema.loginTokens.usedAt), gt(schema.loginTokens.expiresAt, time)))
      .returning();
    if (!login) {
      response.status(400).json({ error: "invalid-token" });
      return;
    }
    const consent = { ageBand: login.ageBand, privacyVersion: login.privacyVersion, consentAt: time, lastSeenAt: time };
    const [user] = await db.insert(schema.users).values({ email: login.email, createdAt: time, ...consent })
      .onConflictDoUpdate({ target: schema.users.email, set: consent })
      .returning();
    await startSession(db, config, response, user!.id, time);
    response.json({ account: toAccount(user!) });
  });

  router.post("/logout", async (request, response) => {
    const session = await currentSession(db, config, request, response, now());
    if (session) await db.delete(schema.sessions).where(eq(schema.sessions.idHash, session.idHash));
    clearSessionCookie(response, config);
    response.status(204).end();
  });

  return router;
}
