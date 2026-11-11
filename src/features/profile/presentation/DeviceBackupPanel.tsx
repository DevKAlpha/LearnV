import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/domain/models/i18n";
import { localDateKey } from "@/domain/models/learning-journey";
import {
  createDeviceBackup,
  DEVICE_BACKUP_MAX_BYTES,
  parseDeviceBackup,
  restoreDeviceBackup,
  summarizeDeviceBackup,
  type DeviceBackup,
  type DeviceBackupIssue,
} from "@/infrastructure/data/device-backup";
import { isStoragePersisted, requestPersistentStorage } from "@/infrastructure/data/storage-persistence";
import { deviceBackupCopy } from "@/infrastructure/i18n/device-backup-copy";

const dateLocales: Record<Locale, string> = { es: "es-ES", en: "en-GB", ko: "ko-KR" };

// Tailwind utilities (see styles/tailwind.css). Colours follow the theme through CSS variables.
const button = "min-h-11 cursor-pointer rounded-full border-2 px-4 py-2.5 font-extrabold focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-current";
const primaryButton = `${button} border-ink bg-accent text-[#241a24] shadow-[2px_3px_0_var(--ink)]`;
const secondaryButton = `${button} border-current bg-transparent text-inherit`;

export function DeviceBackupPanel({ locale }: { locale: Locale }) {
  const text = deviceBackupCopy[locale];
  const fileInput = useRef<HTMLInputElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState<DeviceBackup | null>(null);
  const [issue, setIssue] = useState<DeviceBackupIssue | "write" | null>(null);
  const [restored, setRestored] = useState(false);
  const [persisted, setPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void isStoragePersisted().then((value) => { if (active) setPersisted(value); });
    return () => { active = false; };
  }, []);

  useEffect(() => { if (pending) confirmButton.current?.focus(); }, [pending]);

  const download = () => {
    const content = JSON.stringify(createDeviceBackup(localStorage), null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `learnv-copia-${localDateKey(new Date())}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const choose = async (file: File | undefined) => {
    setIssue(null);
    setPending(null);
    if (!file) return;
    if (file.size > DEVICE_BACKUP_MAX_BYTES) { setIssue("too-large"); return; }
    const result = parseDeviceBackup(await file.text());
    if ("issue" in result) setIssue(result.issue);
    else setPending(result.backup);
  };

  const restore = () => {
    if (!pending) return;
    if (!restoreDeviceBackup(localStorage, pending)) { setIssue("write"); return; }
    setPending(null);
    setRestored(true);
    // Every module re-reads and re-validates its own data on start-up.
    window.setTimeout(() => window.location.reload(), 600);
  };

  const summary = pending ? summarizeDeviceBackup(pending) : null;
  const formattedDate = summary
    ? new Intl.DateTimeFormat(dateLocales[locale], { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(summary.exportedAt))
    : "";

  return (
    <section className="device-backup mt-[18px] grid gap-2.5 rounded-[20px] border-[1.5px] border-current/35 bg-paper p-[clamp(16px,3vw,24px)] text-left text-inherit" aria-labelledby="device-backup-title">
      <span className="eyebrow">{text.kicker}</span>
      <h2 id="device-backup-title" className="m-0 text-[clamp(1.15rem,2.6vw,1.5rem)] leading-tight">{text.title}</h2>
      <p className="m-0 text-[0.9rem] leading-relaxed">{text.intro}</p>

      {persisted !== null && (
        <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-[14px] border border-dashed border-current px-3 py-2.5 text-[0.9rem] leading-relaxed">
          <span aria-hidden="true" className={`inline-grid size-[22px] place-items-center rounded-full font-black text-white ${persisted ? "bg-[#3d7a4d]" : "bg-[#9a5a10]"}`}>{persisted ? "✓" : "!"}</span>
          <span className="min-w-0 flex-[1_1_12rem]">{persisted ? text.protectedYes : text.protectedNo}</span>
          {!persisted && (
            <button type="button" className="min-h-8 cursor-pointer border-0 bg-transparent px-1 font-extrabold text-inherit underline underline-offset-3 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-current" onClick={() => void requestPersistentStorage().then((value) => setPersisted(value))}>
              {text.protect}
            </button>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-2.5">
        <button type="button" className={primaryButton} onClick={download}>{text.export}</button>
        <button type="button" className={secondaryButton} onClick={() => fileInput.current?.click()}>{text.import}</button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        aria-label={text.import}
        tabIndex={-1}
        hidden
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          void choose(file);
        }}
      />

      {issue && <p className="m-0 font-extrabold text-[#b3263e] in-data-[theme=dark]:text-[#ff9cad]" role="alert">{issue === "write" ? text.restoreFailed : text.issues[issue]}</p>}
      {restored && <p className="m-0" role="status">{text.restored}</p>}

      {pending && summary && (
        <div className="grid gap-2 rounded-2xl border-[1.5px] border-current/45 bg-[color-mix(in_srgb,var(--yellow)_18%,var(--paper))] p-3.5" role="group" aria-labelledby="device-backup-preview">
          <h3 id="device-backup-preview" className="m-0 mb-1.5 text-base">{text.previewTitle}</h3>
          <ul className="m-0 grid gap-1 pl-[18px] text-[0.9rem]">
            <li><b>{summary.entries}</b> {text.previewEntries}</li>
            <li>{text.previewDate} {formattedDate}</li>
            {summary.languageTests && <li>✓ {text.previewTests}</li>}
            {summary.taskBoard && <li>✓ {text.previewBoard}</li>}
            {summary.drafts && <li>✓ {text.previewDrafts}</li>}
          </ul>
          <p className="m-0 text-[0.9rem] leading-relaxed">{text.replaceWarning}</p>
          <div className="flex flex-wrap gap-2.5">
            <button ref={confirmButton} type="button" className={primaryButton} onClick={restore}>{text.confirm}</button>
            <button type="button" className={secondaryButton} onClick={() => setPending(null)}>{text.cancel}</button>
          </div>
        </div>
      )}

      <p className="m-0 text-[0.8rem] leading-relaxed opacity-85">{text.privacy}</p>
    </section>
  );
}
