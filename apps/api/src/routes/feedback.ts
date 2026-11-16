import { and, eq, sql } from "drizzle-orm";
import { Router, type Response } from "express";
import {
  AI_CONSENT_VERSION, consentRequestSchema, interviewFeedbackRequestSchema, writingFeedbackRequestSchema,
  type FeedbackStatus,
} from "@learnv/schemas/feedback-api";
import type { AppContext } from "../app.ts";
import { FeedbackUnavailableError, type FeedbackModel, type FeedbackOutcome } from "../ai/feedback-model.ts";
import { schema } from "../db/database.ts";
import { jsonBody } from "../http/guards.ts";
import type { SessionUser } from "../http/sessions.ts";
import { requireSession, sessionOf } from "./require-session.ts";

/** Quota days follow UTC, so every instance agrees on when a day starts. */
const utcDay = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Optional AI feedback. Off unless the server has a provider key. Each request needs a
 * session, the learner's current AI consent and quota. Nothing the learner sends or receives
 * is stored: only the number of requests per day.
 */
export function feedbackRoutes(context: AppContext, model: FeedbackModel | null) {
  const { db, config, now } = context;
  const limit = config.ai?.dailyLimit ?? 0;
  const router = Router();
  router.use(requireSession(context));

  const used = async (userId: string, day: string) => {
    const [row] = await db.select({ requests: schema.aiUsage.requests }).from(schema.aiUsage)
      .where(and(eq(schema.aiUsage.userId, userId), eq(schema.aiUsage.day, day)));
    return row?.requests ?? 0;
  };

  const status = async (user: SessionUser): Promise<FeedbackStatus> => ({
    enabled: model !== null,
    consent: user.aiConsentVersion && user.aiConsentAt ? { version: user.aiConsentVersion, at: user.aiConsentAt.toISOString() } : null,
    consentOutdated: Boolean(user.aiConsentVersion) && user.aiConsentVersion !== AI_CONSENT_VERSION,
    quota: { used: await used(user.id, utcDay(now())), limit },
  });

  router.get("/", async (_request, response) => {
    response.json(await status(sessionOf(response).user));
  });

  /** Explicit, versioned consent. Withdrawing it is one call, and takes effect at once. */
  router.put("/consent", jsonBody("1kb"), async (request, response) => {
    const { user } = sessionOf(response);
    const { version } = consentRequestSchema.parse(request.body);
    const at = now();
    await db.update(schema.users).set({ aiConsentVersion: version, aiConsentAt: at }).where(eq(schema.users.id, user.id));
    response.json(await status({ ...user, aiConsentVersion: version, aiConsentAt: at }));
  });

  router.delete("/consent", async (_request, response) => {
    const { user } = sessionOf(response);
    await db.update(schema.users).set({ aiConsentVersion: null, aiConsentAt: null }).where(eq(schema.users.id, user.id));
    response.status(204).end();
  });

  /** Reserves one request of today's quota atomically. Returns the new count, or null when spent. */
  const reserve = async (userId: string, day: string): Promise<number | null> => {
    const [global] = await db.select({ total: sql<number>`coalesce(sum(${schema.aiUsage.requests}), 0)::int` })
      .from(schema.aiUsage).where(eq(schema.aiUsage.day, day));
    if ((global?.total ?? 0) >= (config.ai?.globalDailyLimit ?? 0)) return -1;
    const rows = await db.insert(schema.aiUsage).values({ userId, day, requests: 1 })
      .onConflictDoUpdate({
        target: [schema.aiUsage.userId, schema.aiUsage.day],
        set: { requests: sql`${schema.aiUsage.requests} + 1` },
        setWhere: sql`${schema.aiUsage.requests} < ${limit}`,
      })
      .returning({ requests: schema.aiUsage.requests });
    return rows[0]?.requests ?? null;
  };

  const refund = (userId: string, day: string) => db.update(schema.aiUsage)
    .set({ requests: sql`greatest(${schema.aiUsage.requests} - 1, 0)` })
    .where(and(eq(schema.aiUsage.userId, userId), eq(schema.aiUsage.day, day)));

  /** Runs one validated request: consent, quota, the model call, and a refund when it fails. */
  const serve = async (response: Response, run: (model: FeedbackModel) => Promise<FeedbackOutcome>) => {
    const { user } = sessionOf(response);
    if (!model) {
      response.status(503).json({ error: "ai-disabled" });
      return;
    }
    if (user.aiConsentVersion !== AI_CONSENT_VERSION) {
      response.status(403).json({ error: "ai-consent-required" });
      return;
    }
    const day = utcDay(now());
    const count = await reserve(user.id, day);
    if (count === -1) {
      response.status(503).json({ error: "ai-busy" });
      return;
    }
    if (count === null) {
      response.status(429).json({ error: "ai-quota", quota: { used: limit, limit } });
      return;
    }
    let outcome: FeedbackOutcome;
    try {
      outcome = await run(model);
    } catch (error) {
      await refund(user.id, day);
      if (error instanceof FeedbackUnavailableError) {
        console.error(`[api] ai feedback ${error.reason}: ${error.cause instanceof Error ? error.cause.name : "unknown"}`);
        response.status(503).json({ error: error.reason === "busy" ? "ai-busy" : "ai-unavailable" });
        return;
      }
      throw error;
    }
    if (outcome.status !== "ok") {
      await refund(user.id, day);
      response.status(outcome.status === "declined" ? 422 : 502).json({ error: outcome.status === "declined" ? "ai-declined" : "ai-invalid" });
      return;
    }
    response.json({ feedback: outcome.feedback, quota: { used: count, limit } });
  };

  // The body is validated before any quota is spent.
  router.post("/writing", jsonBody("32kb"), context.limits.feedback, async (request, response) => {
    const parsed = writingFeedbackRequestSchema.parse(request.body);
    await serve(response, (current) => current.writing(parsed));
  });

  router.post("/interview", jsonBody("32kb"), context.limits.feedback, async (request, response) => {
    const parsed = interviewFeedbackRequestSchema.parse(request.body);
    await serve(response, (current) => current.interview(parsed));
  });

  return router;
}
