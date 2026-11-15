import { useCallback, useEffect, useRef, useState } from "react";
import { isDraftKey } from "@learnv/schemas/sync-keys";
import type { Locale } from "@/domain/models/i18n";
import { forgetAccount, rememberAccount, syncApi, syncNow } from "@/application/sync/sync-runner";
import { accountCopy } from "@/infrastructure/i18n/account-copy";
import { SyncApiError, type AgeBand } from "@/infrastructure/sync/sync-api-client";
import { syncMetaStore, type SyncIssue } from "@/infrastructure/sync/sync-meta-store";
import { useLocalStore } from "./useLocalStore";

export type AccountBusy = "link" | "sync" | "drafts" | "export" | "sign-out" | "delete" | null;
export type AccountMessage = { tone: "ok" | "error"; text: string } | null;

type IssueCode = keyof (typeof accountCopy)["es"]["issues"];

function codeFor(error: unknown): IssueCode {
  if (!(error instanceof SyncApiError)) return "unknown";
  if (error.status === 0) return "offline";
  if (error.status === 401) return "signed-out";
  if (error.status === 429 || error.code === "rate-limited") return "rate-limited";
  if (error.code === "invalid-request") return "invalid-email";
  if (error.code === "mail-unavailable" || error.code === "confirmation-mismatch") return error.code;
  return error.status >= 500 ? "server" : "unknown";
}

/** Account actions for Profile. Lazy: loaded with the account panel. */
export function useAccount(locale: Locale) {
  const meta = useLocalStore(syncMetaStore);
  const copy = accountCopy[locale];
  const [busy, setBusy] = useState<AccountBusy>(null);
  const [message, setMessage] = useState<AccountMessage>(null);
  const copyRef = useRef(copy);
  copyRef.current = copy;

  const fail = useCallback((error: unknown) => {
    const code = codeFor(error);
    setMessage({ tone: "error", text: copyRef.current.issues[code] });
    return code;
  }, []);

  const run = useCallback(async <T,>(kind: Exclude<AccountBusy, null>, work: () => Promise<T>): Promise<T | undefined> => {
    setBusy(kind);
    setMessage(null);
    try {
      return await work();
    } catch (error) {
      if (fail(error) === "signed-out") await forgetAccount();
      return undefined;
    } finally {
      setBusy(null);
    }
  }, [fail]);

  // A stored account may belong to an ended session: check it once.
  const signedInId = meta.account?.id;
  useEffect(() => {
    if (!signedInId) return;
    let active = true;
    syncApi().me().then(async (account) => {
      if (!active) return;
      if (account) await rememberAccount(account);
      else {
        await forgetAccount();
        setMessage({ tone: "error", text: copyRef.current.issues["signed-out"] });
      }
    }).catch(() => { /* Offline: keep the account and retry on the next sync. */ });
    return () => { active = false; };
  }, [signedInId]);

  const describe = (issue: SyncIssue | null, pulled: number, pushed: number, merged: number): AccountMessage => issue
    ? { tone: "error", text: copyRef.current.issues[issue] }
    : { tone: "ok", text: copyRef.current.synced(pulled, pushed, merged) };

  return {
    meta,
    busy,
    message,
    requestLink: (email: string, age: AgeBand) => run("link", async () => {
      await syncApi().requestMagicLink(email.trim(), locale, age);
      setMessage({ tone: "ok", text: copy.sent(email.trim()) });
      return true;
    }),
    syncNow: () => run("sync", async () => {
      const report = await syncNow();
      if (report) setMessage(describe(report.issue, report.pulled, report.pushed, report.merged));
    }),
    setIncludeDrafts: (include: boolean) => run("drafts", async () => {
      if (include) {
        syncMetaStore.set((current) => ({ ...current, includeDrafts: true }));
        const report = await syncNow();
        if (report) setMessage(describe(report.issue, report.pulled, report.pushed, report.merged));
        return;
      }
      await syncApi().deleteDrafts();
      syncMetaStore.set((current) => ({
        ...current,
        includeDrafts: false,
        docs: Object.fromEntries(Object.entries(current.docs).filter(([key]) => !isDraftKey(key))),
      }));
      setMessage({ tone: "ok", text: copy.draftsRemoved });
    }),
    exportData: () => run("export", async () => {
      const text = await syncApi().exportAccount();
      setMessage({ tone: "ok", text: copy.exported });
      return text;
    }),
    signOut: () => run("sign-out", async () => {
      // Forget locally even if the server cannot be reached; the session then just expires.
      await syncApi().logout().catch(() => undefined);
      await forgetAccount();
      setMessage({ tone: "ok", text: copy.signedOut });
    }),
    deleteAccount: (confirm: string) => run("delete", async () => {
      await syncApi().deleteAccount(confirm.trim());
      await forgetAccount();
      setMessage({ tone: "ok", text: copy.deleted });
      return true;
    }),
  };
}

/** Spends a sign-in link and records the account. "invalid": the link expired or was already used. */
export async function confirmSignIn(token: string): Promise<"ok" | "invalid" | IssueCode> {
  try {
    const account = await syncApi().verify(token);
    await rememberAccount(account);
    void syncNow();
    return "ok";
  } catch (error) {
    if (error instanceof SyncApiError && error.code === "invalid-token") return "invalid";
    if (error instanceof SyncApiError && error.code === "invalid-request") return "invalid";
    return codeFor(error);
  }
}
