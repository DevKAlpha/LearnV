import {
  meResponseSchema,
  manifestResponseSchema,
  PRIVACY_VERSION,
  pullResponseSchema,
  pushResponseSchema,
  type Account,
  type ManifestResponse,
  type PushChange,
  type PushResult,
  type SyncDocument,
} from "@learnv/schemas/sync-api";
import type { Locale } from "@/domain/models/i18n";

/**
 * HTTP client of the account API. Loaded lazily (it brings zod): only Profile, the sign-in
 * page and a signed-in device's background sync import it.
 */
export class SyncApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string) {
    super(code);
    this.name = "SyncApiError";
    this.status = status;
    this.code = code;
  }
}

export type AgeBand = "14-plus" | "guardian";

export type SyncApi = {
  requestMagicLink(email: string, locale: Locale, age: AgeBand): Promise<void>;
  verify(token: string): Promise<Account>;
  logout(): Promise<void>;
  /** The signed-in account, or null when the session ended. */
  me(): Promise<Account | null>;
  exportAccount(): Promise<string>;
  deleteAccount(confirm: string): Promise<void>;
  manifest(): Promise<ManifestResponse>;
  pull(keys: string[]): Promise<SyncDocument[]>;
  push(changes: PushChange[], options?: { keepalive?: boolean }): Promise<PushResult[]>;
  deleteDrafts(): Promise<void>;
};

const TIMEOUT_MS = 20_000;

export function createSyncApi(base: string, fetcher: typeof fetch = (...args) => fetch(...args)): SyncApi {
  async function call(path: string, init: { method?: string; body?: unknown; keepalive?: boolean } = {}): Promise<Response> {
    let response: Response;
    try {
      response = await fetcher(`${base}${path}`, {
        method: init.method ?? "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "X-LearnV-Client": "web", ...(init.body === undefined ? {} : { "Content-Type": "application/json" }) },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        keepalive: init.keepalive,
        signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(TIMEOUT_MS) : undefined,
      });
    } catch {
      throw new SyncApiError(0, "offline");
    }
    if (!response.ok) {
      let code = `http-${response.status}`;
      try {
        const body: unknown = await response.json();
        if (body && typeof body === "object" && typeof (body as { error?: unknown }).error === "string") code = (body as { error: string }).error;
      } catch { /* Not JSON: keep the status code. */ }
      throw new SyncApiError(response.status, code);
    }
    return response;
  }

  async function json<T>(schema: { parse(value: unknown): T }, path: string, init?: Parameters<typeof call>[1]): Promise<T> {
    const response = await call(path, init);
    try {
      return schema.parse(await response.json());
    } catch {
      throw new SyncApiError(response.status, "invalid-response");
    }
  }

  return {
    async requestMagicLink(email, locale, age) {
      await call("auth/magic-link", { method: "POST", body: { email, locale, consent: { age, privacy: PRIVACY_VERSION } } });
    },
    async verify(token) {
      return (await json(meResponseSchema, "auth/verify", { method: "POST", body: { token } })).account;
    },
    async logout() {
      await call("auth/logout", { method: "POST" });
    },
    async me() {
      try {
        return (await json(meResponseSchema, "me")).account;
      } catch (error) {
        if (error instanceof SyncApiError && error.status === 401) return null;
        throw error;
      }
    },
    async exportAccount() {
      return (await call("me/export")).text();
    },
    async deleteAccount(confirm) {
      await call("me", { method: "DELETE", body: { confirm } });
    },
    manifest: () => json(manifestResponseSchema, "sync/manifest"),
    async pull(keys) {
      return (await json(pullResponseSchema, "sync/pull", { method: "POST", body: { keys } })).documents;
    },
    async push(changes, options) {
      return (await json(pushResponseSchema, "sync/push", { method: "POST", body: { changes }, keepalive: options?.keepalive })).results;
    },
    async deleteDrafts() {
      await call("sync/drafts", { method: "DELETE" });
    },
  };
}
