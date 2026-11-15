import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import { safeJsonReviver } from "@learnv/schemas/sync-keys";
import { ZodError } from "zod";
import type { Config } from "../config.ts";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
/** Sent by the LearnV web client. A custom header cannot be added cross-site without a CORS preflight. */
export const CLIENT_HEADER = "x-learnv-client";

/**
 * CSRF protection for cookie-authenticated writes, on top of SameSite=Lax:
 * the request must come from an allowed origin and carry the client header.
 */
export function trustedOrigin(config: Config): RequestHandler {
  return (request, response, next) => {
    if (SAFE_METHODS.has(request.method)) return next();
    const origin = request.get("origin");
    const trusted = origin ? config.allowedOrigins.has(origin) : request.get("sec-fetch-site") === "same-origin";
    if (!trusted || request.get(CLIENT_HEADER) !== "web") {
      response.status(403).json({ error: "forbidden-origin" });
      return;
    }
    next();
  };
}

/** CORS only for origins listed in CORS_ORIGINS. The same-origin deployment sends none. */
export function corsAllowlist(config: Config): RequestHandler {
  return (request, response, next) => {
    const origin = request.get("origin");
    if (!origin || !config.corsOrigins.has(origin)) return next();
    response.vary("Origin");
    response.set("Access-Control-Allow-Origin", origin);
    response.set("Access-Control-Allow-Credentials", "true");
    if (request.method === "OPTIONS") {
      response.set("Access-Control-Allow-Methods", "GET, POST, DELETE");
      response.set("Access-Control-Allow-Headers", `Content-Type, ${CLIENT_HEADER}`);
      response.set("Access-Control-Max-Age", "600");
      response.status(204).end();
      return;
    }
    next();
  };
}

/** JSON bodies only, size-capped, and parsed without prototype-polluting property names. */
export const jsonBody = (limit: string) => express.json({ limit, strict: true, reviver: safeJsonReviver });

export const noStore: RequestHandler = (_request, response, next) => {
  response.set("Cache-Control", "no-store");
  next();
};

/** Errors never expose stack traces or internals to the client. */
export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (response.headersSent) return;
  if (error instanceof ZodError) {
    response.status(400).json({ error: "invalid-request" });
    return;
  }
  const type = typeof error === "object" && error !== null && "type" in error ? String(error.type) : "";
  if (type === "entity.too.large") {
    response.status(413).json({ error: "too-large" });
    return;
  }
  if (type === "entity.parse.failed" || type === "encoding.unsupported" || type === "charset.unsupported") {
    response.status(400).json({ error: "invalid-json" });
    return;
  }
  // Only the error class: messages may contain request data.
  console.error(`[api] ${request.method} ${request.path} failed: ${error instanceof Error ? error.name : typeof error}`);
  response.status(500).json({ error: "internal" });
};
