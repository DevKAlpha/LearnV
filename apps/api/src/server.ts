import { fileURLToPath } from "node:url";
import { createApp } from "./app.ts";
import { loadConfig } from "./config.ts";
import { openPglite, openPostgres } from "./db/database.ts";
import { createMailer } from "./mail/mailer.ts";
import { purgeExpired } from "./maintenance.ts";
import { AnthropicFeedbackModel } from "./ai/feedback-model.ts";

// Same relative path from src/server.ts (development) and dist/server.mjs (bundle).
const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));

const config = loadConfig();
const { db, close } = config.databaseUrl
  ? await openPostgres(config.databaseUrl, migrationsFolder)
  : await openPglite(migrationsFolder, fileURLToPath(new URL("../.data/pglite", import.meta.url)));

if (!config.databaseUrl) console.warn("[api] DATABASE_URL is not set: using the embedded development database in apps/api/.data");
if (config.mail.transport === "console") console.warn("[api] MAIL_TRANSPORT=console: sign-in links are printed here, not emailed");

if (!config.ai) console.warn("[api] ANTHROPIC_API_KEY is not set: AI feedback is off");
const feedback = config.ai ? new AnthropicFeedbackModel(config.ai) : null;
const app = createApp({ db, config, mailer: createMailer(config.mail), feedback });
const server = app.listen(config.port, () => console.warn(`[api] listening on :${config.port}`));

const purge = () => purgeExpired(db, config).catch((error: unknown) => console.error(`[api] purge failed: ${error instanceof Error ? error.name : typeof error}`));
void purge();
const timer = setInterval(purge, 60 * 60_000);
timer.unref();

const shutdown = () => {
  clearInterval(timer);
  server.close(() => void close().finally(() => process.exit(0)));
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
