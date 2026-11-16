import "@/styles/tailwind-study.css";
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { AI_CONSENT_VERSION } from "@learnv/schemas/feedback-api";
import { useI18n } from "@/application/i18n/I18nContext";
import { useAiFeedback, type AiFeedbackRequest } from "@/application/controllers/useAiFeedback";
import { aiFeedbackCopy } from "@/infrastructure/i18n/ai-feedback-copy";

const button = "min-h-11 w-fit cursor-pointer rounded-full border-2 px-4 font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-60";
const primary = `${button} border-ink bg-accent text-ink`;
const secondary = `${button} border-edge bg-paper text-fg`;

type Props = {
  /** Builds the request from the current screen; null while there is not enough to send. */
  request: () => AiFeedbackRequest | null;
  /** The learner's current text, to tell when a result no longer matches it. */
  text: string;
  /** Language of the learner's text, for quotes and suggestions. */
  textLanguage?: string;
};

/**
 * Optional AI feedback, with explicit consent first. Rendered only in builds with an account
 * API; without a session it points to Profile, and without a server key it renders nothing.
 */
export function AiFeedbackPanel({ request, text, textLanguage }: Props) {
  const { locale } = useI18n();
  const copy = aiFeedbackCopy[locale];
  const id = useId();
  const ai = useAiFeedback();
  const [checked, setChecked] = useState(false);

  if (ai.signedIn && (!ai.status || !ai.status.enabled)) {
    // Loading, or the server has no AI provider: show only a real error.
    return ai.error && ai.error !== "ai-disabled" ? <p className="m-0 text-sm" role="alert">{copy.errors[ai.error] ?? copy.errors.unknown}</p> : null;
  }

  const consented = ai.status?.consent?.version === AI_CONSENT_VERSION;
  const quota = ai.status?.quota;
  const spent = quota ? quota.used >= quota.limit : false;
  const body = request();
  const result = ai.result;

  return (
    <section className="grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,24px)] text-left text-fg" aria-labelledby={`${id}-title`} aria-busy={ai.busy === "ask"} data-ai-feedback>
      <div className="grid gap-1">
        <span className="eyebrow">{copy.kicker}</span>
        <h3 id={`${id}-title`} className="m-0 text-xl leading-tight">{copy.title}</h3>
        <p className="m-0 text-[0.95rem] leading-relaxed">{copy.intro}</p>
      </div>

      {!ai.signedIn ? (
        <p className="m-0 flex flex-wrap items-center gap-2">{copy.signIn} <Link className="font-extrabold text-fg underline underline-offset-4" to="/profile">{copy.openProfile} →</Link></p>
      ) : !consented ? (
        <div className="grid gap-2 rounded-2xl border-2 border-current/30 p-3" data-ai-consent>
          {ai.status?.consentOutdated && <p className="m-0 font-extrabold">{copy.outdated}</p>}
          {ai.withdrawn && <p className="m-0" role="status">{copy.withdrawn}</p>}
          <strong>{copy.consentTitle}</strong>
          <ul className="m-0 grid gap-1 pl-5 text-[0.95rem] leading-relaxed">{copy.consentPoints.map((point) => <li key={point}>{point}</li>)}</ul>
          <label className="flex min-h-11 items-start gap-2 font-bold">
            <input type="checkbox" className="mt-0.5 size-5 shrink-0" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
            <span>{copy.consentCheck}</span>
          </label>
          <button type="button" className={primary} disabled={!checked || ai.busy !== null} onClick={() => void ai.accept()}>{copy.accept}</button>
        </div>
      ) : (
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={primary} disabled={!body || spent || ai.busy !== null} onClick={() => { if (body) void ai.ask(body, text); }}>{copy.ask}</button>
            {quota && <small>{copy.quota(quota.used, quota.limit)}</small>}
          </div>
          {!body && <p className="m-0 text-sm">{copy.tooShort}</p>}
          {ai.busy === "ask" && <p className="m-0 text-sm" role="status">{copy.asking}</p>}
        </div>
      )}

      {ai.error && <p className="m-0 font-bold" role="alert">{copy.errors[ai.error] ?? copy.errors.unknown}</p>}

      {result && (
        <article className="grid gap-3 rounded-2xl bg-cream p-3" aria-label={copy.title} data-ai-result>
          {result.sent !== text && <p className="m-0 text-sm font-extrabold">{copy.stale}</p>}
          <p className="m-0 text-lg font-extrabold">{copy.total(result.feedback.total.score, result.feedback.total.max, result.feedback.total.kind)}</p>
          <p className="m-0 leading-relaxed">{result.feedback.summary}</p>
          <ul className="m-0 grid list-none gap-2 p-0">
            {result.feedback.criteria.map((item) => (
              <li key={item.id} className="grid gap-0.5 rounded-xl border-2 border-current/20 p-2">
                <span className="flex flex-wrap justify-between gap-2 font-extrabold"><span>{copy.criteria[item.id] ?? item.id}</span><span>{item.score} / {item.max}</span></span>
                <span className="text-[0.95rem]">{item.comment}</span>
              </li>
            ))}
          </ul>
          {result.feedback.strengths.length > 0 && (
            <div className="grid gap-1"><strong>{copy.strengths}</strong><ul className="m-0 grid gap-1 pl-5">{result.feedback.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
          )}
          {result.feedback.corrections.length > 0 && (
            <div className="grid gap-1">
              <strong>{copy.corrections}</strong>
              <ul className="m-0 grid list-none gap-2 p-0">
                {result.feedback.corrections.map((item, index) => (
                  <li key={`${item.original}-${index}`} className="grid gap-0.5 rounded-xl border-2 border-current/20 p-2">
                    <span><small className="font-extrabold">{copy.original}: </small><del lang={textLanguage}>{item.original}</del></span>
                    <span><small className="font-extrabold">{copy.suggestion}: </small><ins className="font-bold no-underline" lang={textLanguage}>{item.suggestion}</ins></span>
                    <span className="text-sm">{item.explanation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="m-0"><strong>{copy.nextStep}: </strong>{result.feedback.nextStep}</p>
          <small>{copy.disclaimer}</small>
        </article>
      )}

      {ai.signedIn && consented && <button type="button" className={secondary} disabled={ai.busy !== null} onClick={() => void ai.withdraw()}>{copy.withdraw}</button>}
    </section>
  );
}
