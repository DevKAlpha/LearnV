import type { RequestHandler, Response } from "express";
import type { AppContext } from "../app.ts";
import { currentSession, type CurrentSession } from "../http/sessions.ts";

export function requireSession({ db, config, now }: AppContext): RequestHandler {
  return async (request, response, next) => {
    const session = await currentSession(db, config, request, response, now());
    if (!session) {
      response.status(401).json({ error: "signed-out" });
      return;
    }
    response.locals.session = session;
    next();
  };
}

export function sessionOf(response: Response): CurrentSession {
  return response.locals.session as CurrentSession;
}
