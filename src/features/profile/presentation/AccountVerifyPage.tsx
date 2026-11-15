import "@/styles/tailwind-study.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { confirmSignIn } from "@/application/controllers/useAccount";
import { useI18n } from "@/application/i18n/I18nContext";
import { accountCopy } from "@/infrastructure/i18n/account-copy";

let pendingToken: string | null = null;

/**
 * Reads the token and removes it from the address bar and history. Kept for this page load,
 * so a repeated render (StrictMode) still finds it after the address was cleaned.
 */
function takeToken(): string | null {
  const match = /^#token=([A-Za-z0-9_-]{43})$/.exec(window.location.hash);
  if (match) pendingToken = match[1]!;
  if (window.location.hash) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  return pendingToken;
}

type State = "ready" | "confirming" | "done" | "invalid" | "error";

/**
 * Landing page of the emailed sign-in link. Signing in takes a tap, so mail scanners that
 * open links cannot spend the token.
 */
export function AccountVerifyPage() {
  const { locale } = useI18n();
  const copy = accountCopy[locale];
  const [token] = useState(takeToken);
  const [state, setState] = useState<State>(token ? "ready" : "invalid");
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (!token) return;
    setState("confirming");
    const result = await confirmSignIn(token);
    if (result === "ok" || result === "invalid") pendingToken = null;
    if (result === "ok") setState("done");
    else if (result === "invalid") setState("invalid");
    else {
      setError(copy.issues[result]);
      setState("error");
    }
  };

  const status = state === "done" ? copy.verify.done : state === "invalid" ? (token ? copy.verify.invalid : copy.verify.missing) : state === "error" ? error : null;

  return (
    <div className="page">
      <section className="mx-auto my-6 grid max-w-xl gap-4 rounded-3xl border-2 border-edge bg-paper p-[clamp(18px,5vw,32px)] text-left text-fg" aria-labelledby="account-verify-title">
        <h1 id="account-verify-title" className="m-0 text-[clamp(1.5rem,5vw,2rem)] leading-tight">{copy.verify.title}</h1>
        {(state === "ready" || state === "confirming" || state === "error") && <p className="m-0 leading-relaxed">{copy.verify.intro}</p>}
        {(state === "ready" || state === "confirming" || state === "error") && (
          <button type="button" className="min-h-11 w-fit cursor-pointer rounded-full border-2 border-ink bg-accent px-5 font-extrabold text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current disabled:opacity-60" disabled={state === "confirming"} onClick={() => void confirm()}>
            {state === "confirming" ? copy.verify.confirming : copy.verify.confirm}
          </button>
        )}
        <p className="m-0" role="status">{status}</p>
        {(state === "done" || state === "invalid") && <Link className="w-fit font-extrabold text-fg underline underline-offset-4" to="/profile">{copy.verify.back}</Link>}
      </section>
    </div>
  );
}
