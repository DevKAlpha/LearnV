import express, { type RequestHandler } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { sql } from "drizzle-orm";
import type { Config } from "./config.ts";
import type { Database } from "./db/database.ts";
import type { Mailer } from "./mail/mailer.ts";
import { corsAllowlist, errorHandler, noStore, trustedOrigin } from "./http/guards.ts";
import { accountRoutes } from "./routes/account.ts";
import { authRoutes } from "./routes/auth.ts";
import { syncRoutes } from "./routes/sync.ts";

export type RateLimits = { api: RequestHandler; magicLink: RequestHandler; verify: RequestHandler };

export type AppContext = {
  db: Database;
  config: Config;
  mailer: Mailer;
  now: () => Date;
  limits: RateLimits;
};

const limiter = (windowMinutes: number, limit: number): RequestHandler => rateLimit({
  windowMs: windowMinutes * 60_000,
  limit,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "rate-limited" },
});

/** Per client IP (behind TRUST_PROXY proxies). In-memory: one API instance. */
export function defaultRateLimits(): RateLimits {
  return {
    api: limiter(15, 900),
    magicLink: limiter(15, 10),
    verify: limiter(15, 30),
  };
}

export function createApp(options: { db: Database; config: Config; mailer: Mailer; now?: () => Date; limits?: RateLimits }) {
  const context: AppContext = { now: () => new Date(), limits: defaultRateLimits(), ...options };
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", context.config.trustProxy);
  app.use(helmet());

  const api = express.Router();
  api.use(noStore, corsAllowlist(context.config), context.limits.api, trustedOrigin(context.config));

  api.get("/health", async (_request, response) => {
    await context.db.execute(sql`select 1`);
    response.json({ ok: true, service: "learnv-api" });
  });
  api.use("/auth", authRoutes(context));
  api.use("/me", accountRoutes(context));
  api.use("/sync", syncRoutes(context));
  api.use((_request, response) => {
    response.status(404).json({ error: "not-found" });
  });

  app.use("/api/v1", api);
  app.use((_request, response) => {
    response.status(404).json({ error: "not-found" });
  });
  app.use(errorHandler);
  return app;
}
