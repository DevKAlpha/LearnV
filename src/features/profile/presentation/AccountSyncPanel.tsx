import "@/styles/tailwind-study.css";
import { useId, useState, type FormEvent } from "react";
import type { Locale } from "@/domain/models/i18n";
import { localDateKey } from "@/domain/models/learning-journey";
import { useAccount } from "@/application/controllers/useAccount";
import { accountCopy } from "@/infrastructure/i18n/account-copy";
import type { AgeBand } from "@/infrastructure/sync/sync-api-client";
import { downloadText } from "@/shared/ui/download-text";

const button = "min-h-11 cursor-pointer rounded-full border-2 px-4 font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-60";
const primary = `${button} border-ink bg-accent text-ink`;
const secondary = `${button} border-edge bg-paper text-fg`;
const field = "min-h-11 w-full max-w-md rounded-xl border-2 border-edge bg-paper px-3 text-fg";
const dateLocales: Record<Locale, string> = { es: "es-ES", en: "en-GB", ko: "ko-KR" };

/**
 * Optional account: magic-link sign-in, sync status and the GDPR controls (export, delete).
 * Rendered only by builds with an account API (see sync-config).
 */
export function AccountSyncPanel({ locale }: { locale: Locale }) {
  const copy = accountCopy[locale];
  const account = useAccount(locale);
  const { meta, busy } = account;
  const ids = useId();
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<AgeBand | null>(null);
  const [consent, setConsent] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!age || !consent) return;
    await account.requestLink(email, age);
  };
  const download = async () => {
    const text = await account.exportData();
    if (text) downloadText(text, `learnv-cuenta-${localDateKey(new Date())}.json`, "application/json");
  };
  const remove = async (event: FormEvent) => {
    event.preventDefault();
    if (await account.deleteAccount(confirmEmail)) setConfirmEmail("");
  };
  const when = meta.lastSyncAt ? new Intl.DateTimeFormat(dateLocales[locale], { dateStyle: "medium", timeStyle: "short" }).format(new Date(meta.lastSyncAt)) : null;

  return (
    <section className="my-4 grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-left text-fg" aria-labelledby={`${ids}-title`}>
      <div className="grid gap-1">
        <h2 id={`${ids}-title`} className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">{copy.title}</h2>
        <p className="m-0 text-[0.95rem] leading-relaxed">{copy.intro}</p>
      </div>

      <details className="rounded-2xl border-2 border-current/25 p-3">
        <summary className="min-h-11 cursor-pointer content-center font-extrabold">{copy.privacyTitle}</summary>
        <ul className="m-0 mt-2 grid gap-1 pl-5 text-sm leading-relaxed">
          {copy.privacy.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </details>

      {meta.account ? (
        <div className="grid gap-3">
          <p className="m-0 font-extrabold">{copy.signedInAs(meta.account.email)}</p>
          <p className="m-0 text-sm">{when ? copy.lastSync(when) : copy.neverSynced}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primary} disabled={busy !== null} onClick={() => void account.syncNow()}>{busy === "sync" ? copy.syncing : copy.syncNow}</button>
            <button type="button" className={secondary} disabled={busy !== null} onClick={() => void download()}>{copy.export}</button>
            <button type="button" className={secondary} disabled={busy !== null} onClick={() => void account.signOut()}>{copy.signOut}</button>
          </div>
          <label className="flex min-h-11 items-start gap-2">
            <input type="checkbox" className="mt-1 size-5 shrink-0" checked={meta.includeDrafts} disabled={busy !== null} onChange={(event) => void account.setIncludeDrafts(event.target.checked)} aria-describedby={`${ids}-drafts`} />
            <span className="grid gap-0.5"><strong>{copy.drafts}</strong><small id={`${ids}-drafts`} className="text-sm">{copy.draftsHint}</small></span>
          </label>
          <form className="grid gap-2 rounded-2xl border-2 border-current/25 p-3" onSubmit={(event) => void remove(event)}>
            <h3 className="m-0 text-base">{copy.deleteTitle}</h3>
            <p className="m-0 text-sm leading-relaxed">{copy.deleteHint}</p>
            <label className="grid gap-1 font-extrabold">
              {copy.deleteLabel}
              <input type="email" className={field} autoComplete="off" value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} />
            </label>
            <button type="submit" className={`${secondary} w-fit`} disabled={busy !== null || confirmEmail.trim().toLowerCase() !== meta.account.email}>{copy.deleteButton}</button>
          </form>
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={(event) => void submit(event)}>
          <label className="grid gap-1 font-extrabold">
            {copy.email}
            <input type="email" className={field} required autoComplete="email" inputMode="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <fieldset className="m-0 grid gap-1 border-0 p-0">
            <legend className="mb-1 font-extrabold">{copy.ageLegend}</legend>
            <label className="flex min-h-11 items-center gap-2"><input type="radio" className="size-5 shrink-0" name={`${ids}-age`} required checked={age === "14-plus"} onChange={() => setAge("14-plus")} />{copy.age14}</label>
            <label className="flex min-h-11 items-center gap-2"><input type="radio" className="size-5 shrink-0" name={`${ids}-age`} checked={age === "guardian"} onChange={() => setAge("guardian")} />{copy.ageGuardian}</label>
          </fieldset>
          <label className="flex min-h-11 items-start gap-2">
            <input type="checkbox" className="mt-1 size-5 shrink-0" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>{copy.consent}</span>
          </label>
          <button type="submit" className={`${primary} w-fit`} disabled={busy !== null}>{busy === "link" ? copy.sending : copy.send}</button>
        </form>
      )}

      <p className={`m-0 text-sm ${account.message?.tone === "error" ? "font-extrabold" : ""}`} role="status">
        {account.message?.text ?? (meta.account && meta.lastIssue ? copy.issues[meta.lastIssue] : "")}
      </p>
    </section>
  );
}
