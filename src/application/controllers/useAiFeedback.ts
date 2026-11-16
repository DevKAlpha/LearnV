import { useCallback, useEffect, useState } from "react";
import type { FeedbackStatus, InterviewFeedbackRequest, WritingFeedbackRequest } from "@learnv/schemas/feedback-api";
import { forgetAccount, syncApi } from "@/application/sync/sync-runner";
import { SyncApiError, type AiFeedback } from "@/infrastructure/sync/sync-api-client";
import { syncMetaStore } from "@/infrastructure/sync/sync-meta-store";
import { useLocalStore } from "./useLocalStore";

export type AiFeedbackRequest = { kind: "writing"; body: WritingFeedbackRequest } | { kind: "interview"; body: InterviewFeedbackRequest };
export type AiFeedbackBusy = "status" | "consent" | "ask" | null;

const codeOf = (error: unknown) => error instanceof SyncApiError
  ? (error.status === 401 ? "signed-out" : error.status === 0 ? "offline" : error.code)
  : "unknown";

/**
 * Optional AI feedback for one screen. Loaded lazily with its panel, only in builds with an
 * account API. Nothing is kept on the device: the result lives in this component's state.
 */
export function useAiFeedback() {
  const signedIn = Boolean(useLocalStore(syncMetaStore).account);
  const [status, setStatus] = useState<FeedbackStatus | null>(null);
  const [busy, setBusy] = useState<AiFeedbackBusy>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(AiFeedback & { sent: string }) | null>(null);
  const [withdrawn, setWithdrawn] = useState(false);

  const fail = useCallback(async (reason: unknown) => {
    const code = codeOf(reason);
    setError(code);
    if (code === "signed-out") await forgetAccount();
    if (code === "ai-consent-required") setStatus((current) => current && { ...current, consent: null });
  }, []);

  useEffect(() => {
    if (!signedIn) { setStatus(null); return; }
    let active = true;
    setBusy("status");
    syncApi().feedbackStatus()
      .then((next) => { if (active) setStatus(next); })
      .catch((reason: unknown) => { if (active) void fail(reason); })
      .finally(() => { if (active) setBusy(null); });
    return () => { active = false; };
  }, [signedIn, fail]);

  const accept = async () => {
    setBusy("consent"); setError(null); setWithdrawn(false);
    try { setStatus(await syncApi().acceptAiConsent()); } catch (reason) { await fail(reason); } finally { setBusy(null); }
  };

  const withdraw = async () => {
    setBusy("consent"); setError(null);
    try {
      await syncApi().withdrawAiConsent();
      setStatus((current) => current && { ...current, consent: null, consentOutdated: false });
      setResult(null);
      setWithdrawn(true);
    } catch (reason) { await fail(reason); } finally { setBusy(null); }
  };

  /** `sent` is the learner's text at the time of the request, to tell when the result is stale. */
  const ask = async (request: AiFeedbackRequest, sent: string) => {
    setBusy("ask"); setError(null);
    try {
      const response = request.kind === "writing" ? await syncApi().writingFeedback(request.body) : await syncApi().interviewFeedback(request.body);
      setResult({ ...response, sent });
      setStatus((current) => current && { ...current, quota: response.quota });
    } catch (reason) {
      await fail(reason);
      if (reason instanceof SyncApiError && reason.code === "ai-quota") setStatus((current) => current && { ...current, quota: { used: current.quota.limit, limit: current.quota.limit } });
    } finally { setBusy(null); }
  };

  return { signedIn, status, busy, error, result, withdrawn, accept, withdraw, ask };
}
