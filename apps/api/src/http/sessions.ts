import { and, eq, gt } from "drizzle-orm";
import type { Request, Response } from "express";
import type { Config } from "../config.ts";
import { schema, type Database } from "../db/database.ts";
import { hashToken, randomToken } from "../security/crypto.ts";

const DAY_MS = 86_400_000;

/** `__Host-` pins the cookie to this exact origin and path (it requires Secure). */
export function sessionCookieName(config: Config) {
  return config.cookieSecure ? "__Host-learnv_session" : "learnv_session";
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return null;
}

function writeCookie(response: Response, config: Config, value: string, maxAgeMs: number) {
  response.cookie(sessionCookieName(config), value, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeMs,
  });
}

export function clearSessionCookie(response: Response, config: Config) {
  response.clearCookie(sessionCookieName(config), { httpOnly: true, secure: config.cookieSecure, sameSite: "lax", path: "/" });
}

export async function startSession(db: Database, config: Config, response: Response, userId: string, now: Date) {
  const id = randomToken();
  const expiresAt = new Date(now.getTime() + config.sessionDays * DAY_MS);
  await db.insert(schema.sessions).values({ idHash: hashToken(id), userId, createdAt: now, expiresAt });
  writeCookie(response, config, id, config.sessionDays * DAY_MS);
}

export type SessionUser = typeof schema.users.$inferSelect;
export type CurrentSession = { user: SessionUser; idHash: string };

/**
 * Resolves the signed-in account from the cookie. Sessions slide: once half their lifetime
 * has passed, the expiry is pushed forward and the cookie renewed.
 */
export async function currentSession(db: Database, config: Config, request: Request, response: Response, now: Date): Promise<CurrentSession | null> {
  const id = readCookie(request, sessionCookieName(config));
  if (!id || !/^[A-Za-z0-9_-]{43}$/.test(id)) return null;
  const idHash = hashToken(id);
  const [row] = await db.select({ user: schema.users, expiresAt: schema.sessions.expiresAt })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.idHash, idHash), gt(schema.sessions.expiresAt, now)))
    .limit(1);
  if (!row) return null;
  const lifetime = config.sessionDays * DAY_MS;
  if (row.expiresAt.getTime() - now.getTime() < lifetime / 2) {
    await db.update(schema.sessions).set({ expiresAt: new Date(now.getTime() + lifetime) }).where(eq(schema.sessions.idHash, idHash));
    writeCookie(response, config, id, lifetime);
  }
  if (now.getTime() - row.user.lastSeenAt.getTime() > DAY_MS) {
    await db.update(schema.users).set({ lastSeenAt: now }).where(eq(schema.users.id, row.user.id));
  }
  return { user: row.user, idHash };
}
