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
    <section className="device-backup" aria-labelledby="device-backup-title">
      <span className="eyebrow">{text.kicker}</span>
      <h2 id="device-backup-title">{text.title}</h2>
      <p>{text.intro}</p>

      {persisted !== null && (
        <p className={`device-backup__status${persisted ? " is-protected" : ""}`}>
          <span aria-hidden="true">{persisted ? "✓" : "!"}</span>
          {persisted ? text.protectedYes : text.protectedNo}
          {!persisted && (
            <button type="button" className="device-backup__link" onClick={() => void requestPersistentStorage().then((value) => setPersisted(value))}>
              {text.protect}
            </button>
          )}
        </p>
      )}

      <div className="device-backup__actions">
        <button type="button" onClick={download}>{text.export}</button>
        <button type="button" onClick={() => fileInput.current?.click()}>{text.import}</button>
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

      {issue && <p className="device-backup__issue" role="alert">{issue === "write" ? text.restoreFailed : text.issues[issue]}</p>}
      {restored && <p role="status">{text.restored}</p>}

      {pending && summary && (
        <div className="device-backup__preview" role="group" aria-labelledby="device-backup-preview">
          <h3 id="device-backup-preview">{text.previewTitle}</h3>
          <ul>
            <li><b>{summary.entries}</b> {text.previewEntries}</li>
            <li>{text.previewDate} {formattedDate}</li>
            {summary.languageTests && <li>✓ {text.previewTests}</li>}
            {summary.taskBoard && <li>✓ {text.previewBoard}</li>}
            {summary.drafts && <li>✓ {text.previewDrafts}</li>}
          </ul>
          <p>{text.replaceWarning}</p>
          <div className="device-backup__actions">
            <button ref={confirmButton} type="button" onClick={restore}>{text.confirm}</button>
            <button type="button" onClick={() => setPending(null)}>{text.cancel}</button>
          </div>
        </div>
      )}

      <p className="device-backup__privacy">{text.privacy}</p>
    </section>
  );
}
