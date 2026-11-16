import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PRIVACY_VERSION } from "@learnv/schemas/sync-api";
import { MAX_ACCOUNT_CHARS } from "@learnv/schemas/sync-keys";
import { createApp, type RateLimits } from "./app.ts";
import { loadConfig } from "./config.ts";
import { openPglite, schema, type DatabaseHandle } from "./db/database.ts";
import { MemoryMailer } from "./mail/mailer.ts";
import { purgeExpired } from "./maintenance.ts";

const ORIGIN = "https://learnv.test";
const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));
const config = loadConfig({
  NODE_ENV: "test",
  PUBLIC_APP_URL: `${ORIGIN}/app/`,
  DATA_KEY: Buffer.alloc(32, 7).toString("base64"),
  COOKIE_SECURE: "true",
});
const pass = (_request: unknown, _response: unknown, next: () => void) => next();
const noLimits: RateLimits = { api: pass, magicLink: pass, verify: pass, feedback: pass };

let handle: DatabaseHandle;
let mailer: MemoryMailer;
let clock: Date;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  handle = await openPglite(migrationsFolder);
}, 60_000);
afterAll(async () => handle.close());

beforeEach(async () => {
  await handle.db.delete(schema.users);
  await handle.db.delete(schema.loginTokens);
  mailer = new MemoryMailer();
  clock = new Date("2026-11-15T10:00:00Z");
  app = createApp({ db: handle.db, config, mailer, now: () => clock, limits: noLimits });
});

/** A browser request from the web app: allowed origin plus the client header. */
const web = (method: "get" | "post" | "delete", path: string) => request(app)[method](`/api/v1${path}`).set("Origin", ORIGIN).set("X-LearnV-Client", "web");
const consent = { age: "14-plus", privacy: PRIVACY_VERSION };

async function requestLink(email = "Ana@Example.com") {
  await web("post", "/auth/magic-link").send({ email, locale: "es", consent }).expect(202);
  const link = mailer.sent.at(-1)!.link;
  return new URL(link).hash.slice("#token=".length);
}

async function signIn(email?: string) {
  const token = await requestLink(email);
  const response = await web("post", "/auth/verify").send({ token }).expect(200);
  const cookie = response.headers["set-cookie"]![0]!.split(";")[0]!;
  return { cookie, account: response.body.account };
}

describe("security headers and guards", () => {
  it("answers health with hardened, uncacheable headers", async () => {
    const response = await request(app).get("/api/v1/health").expect(200);
    expect(response.body).toEqual({ ok: true, service: "learnv-api" });
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["content-security-policy"]).toContain("default-src 'self'");
  });

  it("refuses writes from other sites or without the client header", async () => {
    await request(app).post("/api/v1/auth/magic-link").set("Origin", "https://evil.test").set("X-LearnV-Client", "web").send({}).expect(403);
    await request(app).post("/api/v1/auth/magic-link").set("Origin", ORIGIN).send({}).expect(403);
    await request(app).post("/api/v1/auth/magic-link").set("X-LearnV-Client", "web").send({}).expect(403);
  });

  it("sends no CORS headers to origins outside the allowlist", async () => {
    const response = await request(app).options("/api/v1/sync/push").set("Origin", "https://evil.test");
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("rejects prototype-polluting JSON and malformed bodies without leaking details", async () => {
    const polluted = await web("post", "/auth/magic-link").set("Content-Type", "application/json")
      .send('{"email":"a@b.es","locale":"es","consent":{"age":"14-plus","privacy":"x"},"__proto__":{"admin":true}}').expect(400);
    expect(polluted.body).toEqual({ error: "invalid-json" });
    const broken = await web("post", "/auth/magic-link").set("Content-Type", "application/json").send("{oops").expect(400);
    expect(JSON.stringify(broken.body)).not.toMatch(/at |stack|SyntaxError/);
  });

  it("caps request bodies", async () => {
    const response = await web("post", "/auth/verify").send({ token: "x".repeat(5_000) }).expect(413);
    expect(response.body).toEqual({ error: "too-large" });
  });
});

describe("magic-link sign-in", () => {
  it("emails a single-use link whose token travels in the fragment", async () => {
    const token = await requestLink();
    const mail = mailer.sent[0]!;
    expect(mail.to).toBe("ana@example.com");
    expect(mail.link.startsWith(`${ORIGIN}/app/account/verify#token=`)).toBe(true);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const [stored] = await handle.db.select().from(schema.loginTokens);
    expect(stored!.tokenHash).not.toBe(token);

    const response = await web("post", "/auth/verify").send({ token }).expect(200);
    expect(response.body.account).toMatchObject({ email: "ana@example.com", consent: { age: "14-plus", privacy: PRIVACY_VERSION } });
    const cookie = response.headers["set-cookie"]![0]!;
    expect(cookie).toMatch(/^__Host-learnv_session=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).toMatch(/Path=\//);

    await web("post", "/auth/verify").send({ token }).expect(400, { error: "invalid-token" });
  });

  it("answers the same for every address and stops sending after three links in 15 minutes", async () => {
    for (let index = 0; index < 5; index += 1) {
      const response = await web("post", "/auth/magic-link").send({ email: "spam@example.com", locale: "en", consent }).expect(202);
      expect(response.body).toEqual({ status: "sent" });
    }
    expect(mailer.sent).toHaveLength(3);
  });

  it("requires the age declaration and the current privacy notice", async () => {
    await web("post", "/auth/magic-link").send({ email: "a@b.es", locale: "es" }).expect(400);
    await web("post", "/auth/magic-link").send({ email: "a@b.es", locale: "es", consent: { age: "13", privacy: PRIVACY_VERSION } }).expect(400);
    await web("post", "/auth/magic-link").send({ email: "a@b.es", locale: "es", consent: { age: "guardian", privacy: "2020-01" } }).expect(400);
    await web("post", "/auth/magic-link").send({ email: "not-an-email", locale: "es", consent }).expect(400);
  });

  it("refuses expired links", async () => {
    const token = await requestLink();
    clock = new Date(clock.getTime() + 16 * 60_000);
    await web("post", "/auth/verify").send({ token }).expect(400);
  });

  it("signs out and forgets the session", async () => {
    const { cookie } = await signIn();
    await web("get", "/me").set("Cookie", cookie).expect(200);
    const response = await web("post", "/auth/logout").set("Cookie", cookie).expect(204);
    expect(response.headers["set-cookie"]![0]).toMatch(/Expires=Thu, 01 Jan 1970/);
    await web("get", "/me").set("Cookie", cookie).expect(401, { error: "signed-out" });
  });

  it("expires sessions after the configured days and renews active ones", async () => {
    const { cookie } = await signIn();
    clock = new Date(clock.getTime() + 20 * 86_400_000);
    const renewed = await web("get", "/me").set("Cookie", cookie).expect(200);
    expect(renewed.headers["set-cookie"]?.[0]).toMatch(/Max-Age=2592000/);
    clock = new Date(clock.getTime() + 31 * 86_400_000);
    await web("get", "/me").set("Cookie", cookie).expect(401);
  });
});

describe("synchronisation", () => {
  it("stores documents encrypted, returns them decrypted and lists revisions", async () => {
    const { cookie, account } = await signIn();
    const value = JSON.stringify({ en: { "en-1": { attempts: 1 } }, ko: {} });
    const pushed = await web("post", "/sync/push").set("Cookie", cookie)
      .send({ changes: [{ key: "learnv-language-tests-v1", baseRevision: 0, value }] }).expect(200);
    expect(pushed.body.results).toEqual([{ key: "learnv-language-tests-v1", status: "ok", revision: 1, updatedAt: clock.toISOString() }]);

    const [row] = await handle.db.select().from(schema.documents).where(eq(schema.documents.userId, account.id));
    expect(row!.value).toMatch(/^v1:/);
    expect(row!.value).not.toContain("attempts");

    const manifest = await web("get", "/sync/manifest").set("Cookie", cookie).expect(200);
    expect(manifest.body).toEqual({
      documents: [{ key: "learnv-language-tests-v1", revision: 1, updatedAt: clock.toISOString(), deleted: false }],
      usage: { chars: value.length, limit: MAX_ACCOUNT_CHARS },
    });
    const pulled = await web("post", "/sync/pull").set("Cookie", cookie).send({ keys: ["learnv-language-tests-v1"] }).expect(200);
    expect(pulled.body.documents[0]).toMatchObject({ revision: 1, value });
  });

  it("refuses a write based on a stale revision and returns the current copy", async () => {
    const { cookie } = await signIn();
    const key = "learnv-task-board-v1";
    await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [{ key, baseRevision: 0, value: '{"phone":true}' }] }).expect(200);
    const stale = await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [{ key, baseRevision: 0, value: '{"laptop":true}' }] }).expect(200);
    expect(stale.body.results[0]).toMatchObject({ status: "conflict", current: { revision: 1, value: '{"phone":true}' } });
    const merged = await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [{ key, baseRevision: 1, value: '{"laptop":true,"phone":true}' }] }).expect(200);
    expect(merged.body.results[0]).toMatchObject({ status: "ok", revision: 2 });
  });

  it("is idempotent: replaying an applied push conflicts instead of applying twice", async () => {
    const { cookie } = await signIn();
    const change = { key: "learnv-review-v1", baseRevision: 0, value: "[1]" };
    await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [change] }).expect(200);
    const replay = await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [change] }).expect(200);
    expect(replay.body.results[0]).toMatchObject({ status: "conflict", current: { revision: 1, value: "[1]" } });
  });

  it("keeps deletions as tombstones so other devices apply them", async () => {
    const { cookie } = await signIn();
    const key = "learnv-placement-v1";
    await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [{ key, baseRevision: 0, value: "{}" }] }).expect(200);
    const deleted = await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [{ key, baseRevision: 1, value: null }] }).expect(200);
    expect(deleted.body.results[0]).toMatchObject({ status: "ok", revision: 2 });
    const manifest = await web("get", "/sync/manifest").set("Cookie", cookie).expect(200);
    expect(manifest.body.documents[0]).toMatchObject({ key, revision: 2, deleted: true });
  });

  it("only accepts syncable keys and safe JSON values", async () => {
    const { cookie } = await signIn();
    for (const change of [
      { key: "learnv-theme-v1", baseRevision: 0, value: '"dark"' },
      { key: "learnv-sync-v1", baseRevision: 0, value: "{}" },
      { key: "other-app", baseRevision: 0, value: "{}" },
      { key: "learnv-review-v1", baseRevision: 0, value: "not json" },
      { key: "learnv-review-v1", baseRevision: 0, value: '{"__proto__":{"x":1}}' },
    ]) {
      await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [change] }).expect(400);
    }
  });

  it("enforces the account storage limit", async () => {
    const { cookie } = await signIn();
    const big = JSON.stringify("x".repeat(1_400_000));
    const changes = ["a", "b", "c", "d"].map((name) => ({ key: `learnv-${name}-v1`, baseRevision: 0, value: big }));
    const response = await web("post", "/sync/push").set("Cookie", cookie).send({ changes }).expect(200);
    expect(response.body.results.map((result: { status: string }) => result.status)).toEqual(["ok", "ok", "ok", "quota"]);
  });

  it("isolates accounts", async () => {
    const ana = await signIn("ana@example.com");
    const ben = await signIn("ben@example.com");
    await web("post", "/sync/push").set("Cookie", ana.cookie).send({ changes: [{ key: "learnv-review-v1", baseRevision: 0, value: '{"ana":1}' }] }).expect(200);
    const manifest = await web("get", "/sync/manifest").set("Cookie", ben.cookie).expect(200);
    expect(manifest.body.documents).toEqual([]);
    await web("get", "/sync/manifest").expect(401);
  });

  it("erases draft copies without tombstones when draft sync is turned off", async () => {
    const { cookie } = await signIn();
    await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [
      { key: "learnv-written-simulator-v1", baseRevision: 0, value: '{"essay":"..."}' },
      { key: "learnv-review-v1", baseRevision: 0, value: "{}" },
    ] }).expect(200);
    await web("delete", "/sync/drafts").set("Cookie", cookie).expect(204);
    const manifest = await web("get", "/sync/manifest").set("Cookie", cookie).expect(200);
    expect(manifest.body.documents.map((entry: { key: string }) => entry.key)).toEqual(["learnv-review-v1"]);
  });
});

describe("account rights", () => {
  it("exports the account in the device backup format", async () => {
    const { cookie } = await signIn();
    await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [{ key: "learnv-review-v1", baseRevision: 0, value: '{"cards":{}}' }] }).expect(200);
    const response = await web("get", "/me/export").set("Cookie", cookie).expect(200);
    expect(response.headers["content-disposition"]).toContain("learnv-cuenta-2026-11-15.json");
    expect(response.body).toMatchObject({ app: "learnv", format: 1, account: { email: "ana@example.com" }, data: { "learnv-review-v1": '{"cards":{}}' } });
  });

  it("deletes the account and its documents after typing the address", async () => {
    const { cookie, account } = await signIn();
    await web("post", "/sync/push").set("Cookie", cookie).send({ changes: [{ key: "learnv-review-v1", baseRevision: 0, value: "{}" }] }).expect(200);
    await web("delete", "/me").set("Cookie", cookie).send({ confirm: "someone@else.com" }).expect(400);
    await web("delete", "/me").set("Cookie", cookie).send({ confirm: "ANA@example.com" }).expect(204);
    expect(await handle.db.select().from(schema.users).where(eq(schema.users.id, account.id))).toEqual([]);
    expect(await handle.db.select().from(schema.documents)).toEqual([]);
    await web("get", "/me").set("Cookie", cookie).expect(401);
  });

  it("purges idle accounts, expired sessions and spent links", async () => {
    await signIn("idle@example.com");
    await requestLink("pending@example.com");
    await purgeExpired(handle.db, config, new Date(clock.getTime() + 731 * 86_400_000));
    expect(await handle.db.select().from(schema.users)).toEqual([]);
    expect(await handle.db.select().from(schema.sessions)).toEqual([]);
    expect(await handle.db.select().from(schema.loginTokens)).toEqual([]);
  });
});

describe("configuration", () => {
  it("refuses unsafe production settings", () => {
    expect(() => loadConfig({ NODE_ENV: "production" })).toThrow(/DATABASE_URL.*\n.*PUBLIC_APP_URL.*\n.*DATA_KEY/s);
    expect(() => loadConfig({
      NODE_ENV: "production", DATABASE_URL: "postgres://db/learnv", PUBLIC_APP_URL: "https://learnv.test/",
      DATA_KEY: Buffer.alloc(32).toString("base64"), MAIL_TRANSPORT: "console",
    })).toThrow(/console/);
    expect(() => loadConfig({ NODE_ENV: "production", DATABASE_URL: "postgres://db/learnv", PUBLIC_APP_URL: "http://learnv.test/", DATA_KEY: "short", SMTP_URL: "smtp://x", MAIL_FROM: "a@b" }))
      .toThrow(/https[\s\S]*|DATA_KEY/);
  });
});
