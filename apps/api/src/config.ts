import { createHash } from "node:crypto";
import { z } from "zod";

/** Runtime settings, read once from the environment. Production refuses unsafe defaults. */
export type Config = {
  production: boolean;
  port: number;
  /** postgres:// URL. Empty outside production: an embedded PGlite database is used instead. */
  databaseUrl: string | null;
  /** 32-byte AES-256-GCM key that encrypts stored documents. */
  dataKey: Buffer;
  /** Public address of the web app, with its base path and a trailing slash (magic links point here). */
  appUrl: URL;
  /** Origins allowed to make credentialed requests: the app's own origin plus CORS_ORIGINS. */
  allowedOrigins: Set<string>;
  /** Extra origins that get CORS headers (for a split web/API deployment). */
  corsOrigins: Set<string>;
  cookieSecure: boolean;
  /** Express "trust proxy" value: hops of reverse proxies in front of the API. */
  trustProxy: number;
  sessionDays: number;
  loginTokenMinutes: number;
  /** Accounts without any activity for this many days are deleted. */
  retentionDays: number;
  mail: { transport: "console" } | { transport: "smtp"; url: string; from: string } | { transport: "memory" };
  /** Optional AI feedback. Null when no provider key is configured: the feature is off. */
  ai: AiConfig | null;
};

export type AiConfig = {
  apiKey: string;
  model: string;
  effort: "low" | "medium" | "high" | "xhigh" | "max";
  /** Requests per learner per UTC day. */
  dailyLimit: number;
  /** Requests per UTC day for the whole service: a hard cap on spend. */
  globalDailyLimit: number;
};

const boolean = z.enum(["true", "false", "1", "0"]).transform((value) => value === "true" || value === "1");
const positive = (fallback: number) => z.coerce.number().int().positive().default(fallback);

const env = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: positive(3001),
  DATABASE_URL: z.string().url().optional(),
  DATA_KEY: z.string().optional(),
  PUBLIC_APP_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().default(""),
  COOKIE_SECURE: boolean.optional(),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(1),
  SESSION_DAYS: positive(30),
  LOGIN_TOKEN_MINUTES: positive(15),
  RETENTION_DAYS: positive(730),
  MAIL_TRANSPORT: z.enum(["console", "smtp"]).optional(),
  SMTP_URL: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_MODEL: z.string().regex(/^claude-[a-z0-9-]+$/).default("claude-opus-5-5"),
  AI_EFFORT: z.enum(["low", "medium", "high", "xhigh", "max"]).default("medium"),
  AI_DAILY_LIMIT: positive(10),
  AI_GLOBAL_DAILY_LIMIT: positive(300),
});

function origin(url: string) {
  return new URL(url).origin;
}

export function loadConfig(source: Record<string, string | undefined> = process.env): Config {
  const values = env.parse(source);
  const production = values.NODE_ENV === "production";
  const problems: string[] = [];

  if (production && !values.DATABASE_URL) problems.push("DATABASE_URL is required in production");
  if (production && !values.PUBLIC_APP_URL) problems.push("PUBLIC_APP_URL is required in production");

  let dataKey: Buffer;
  if (values.DATA_KEY) {
    dataKey = Buffer.from(values.DATA_KEY, "base64");
    if (dataKey.length !== 32) problems.push("DATA_KEY must be 32 bytes encoded as base64 (openssl rand -base64 32)");
  } else {
    if (production) problems.push("DATA_KEY is required in production");
    // Development only: a fixed, public key. Never protects real data.
    dataKey = createHash("sha256").update("learnv-development-only-key").digest();
  }

  const transport = values.MAIL_TRANSPORT ?? (production ? "smtp" : "console");
  if (production && transport === "console") problems.push("MAIL_TRANSPORT=console prints sign-in links to the log and is refused in production");
  if (transport === "smtp" && (!values.SMTP_URL || !values.MAIL_FROM)) problems.push("SMTP_URL and MAIL_FROM are required when MAIL_TRANSPORT=smtp");

  const appUrlText = values.PUBLIC_APP_URL ?? "http://localhost:5173/";
  const appUrl = new URL(appUrlText.endsWith("/") ? appUrlText : `${appUrlText}/`);
  if (production && appUrl.protocol !== "https:") problems.push("PUBLIC_APP_URL must use https in production");

  const corsOrigins = new Set(values.CORS_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean).map(origin));
  const allowedOrigins = new Set([appUrl.origin, ...corsOrigins]);
  if (!production) {
    // Vite dev server and preview.
    for (const port of [5173, 4173, 4180]) {
      allowedOrigins.add(`http://localhost:${port}`);
      allowedOrigins.add(`http://127.0.0.1:${port}`);
    }
  }

  if (problems.length) throw new Error(`Invalid API configuration:\n- ${problems.join("\n- ")}`);

  return {
    production,
    port: values.PORT,
    databaseUrl: values.DATABASE_URL ?? null,
    dataKey,
    appUrl,
    allowedOrigins,
    corsOrigins,
    cookieSecure: values.COOKIE_SECURE ?? production,
    trustProxy: values.TRUST_PROXY,
    sessionDays: values.SESSION_DAYS,
    loginTokenMinutes: values.LOGIN_TOKEN_MINUTES,
    retentionDays: values.RETENTION_DAYS,
    mail: transport === "smtp" ? { transport, url: values.SMTP_URL!, from: values.MAIL_FROM! } : { transport },
    ai: values.ANTHROPIC_API_KEY?.trim()
      ? { apiKey: values.ANTHROPIC_API_KEY.trim(), model: values.AI_MODEL, effort: values.AI_EFFORT, dailyLimit: values.AI_DAILY_LIMIT, globalDailyLimit: values.AI_GLOBAL_DAILY_LIMIT }
      : null,
  };
}
