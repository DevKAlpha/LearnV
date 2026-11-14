import "@/styles/tailwind-study.css";
import { useState } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { useCalendarExport, type CalendarParts } from "@/application/controllers/useCalendarExport";
import { useLocalStore } from "@/application/controllers/useLocalStore";
import { showStudyNotification } from "@/application/controllers/useStudyReminder";
import { isLearningQa } from "@/application/qa/qa-learning-scope";
import { localDateKey } from "@/domain/models/learning-journey";
import { reminderStore } from "@/infrastructure/data/reminder-store";
import { dailyHabitCopy } from "@/infrastructure/i18n/daily-habit-copy";
import { downloadText } from "@/shared/ui/download-text";

const button = "min-h-11 cursor-pointer rounded-full border-2 px-4 font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-60";
const primary = `${button} border-ink bg-accent text-ink`;
const secondary = `${button} border-edge bg-paper text-fg`;

type Permission = NotificationPermission | "unsupported";
const currentPermission = (): Permission => typeof Notification === "undefined" ? "unsupported" : Notification.permission;

/**
 * Daily reminder (explicit permission, at most once a day, never after practice) and the
 * calendar export, which is the reliable channel when the app is closed.
 */
export function RemindersPanel() {
  const { locale } = useI18n();
  const copy = dailyHabitCopy[locale].reminders;
  const settings = useLocalStore(reminderStore);
  const buildCalendar = useCalendarExport(locale);
  const [permission, setPermission] = useState<Permission>(currentPermission);
  const [parts, setParts] = useState<CalendarParts>({ gks: !isLearningQa, board: true, study: true });
  const [message, setMessage] = useState<string | null>(null);

  const enable = async () => {
    if (permission === "unsupported") return;
    const result = permission === "granted" ? "granted" : await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      reminderStore.set({ ...settings, enabled: true });
      setMessage(copy.enabled(settings.time));
    } else setMessage(copy.denied);
  };
  const disable = () => { reminderStore.set({ ...settings, enabled: false }); setMessage(copy.disabled); };
  const download = () => {
    downloadText(buildCalendar(parts), `learnv-calendario-${localDateKey(new Date())}.ics`, "text/calendar");
    setMessage(copy.downloaded);
  };
  const toggle = (key: keyof CalendarParts) => setParts((current) => ({ ...current, [key]: !current[key] }));

  return (
    <section className="my-4 grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-left text-fg" aria-labelledby="reminders-title">
      <div className="grid gap-1">
        <h2 id="reminders-title" className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">{copy.title}</h2>
        <p className="m-0 text-[0.95rem] leading-relaxed">{copy.intro}</p>
        <p className="m-0 text-sm leading-relaxed">{copy.honest}</p>
      </div>
      <label className="grid w-fit gap-1 font-extrabold">
        {copy.time}
        <input type="time" className="min-h-11 rounded-xl border-2 border-edge bg-paper px-3 font-normal text-fg" value={settings.time} onChange={(event) => { if (event.target.value) reminderStore.set({ ...settings, time: event.target.value, lastShown: null }); }} />
      </label>
      {permission === "unsupported" ? <p className="m-0">{copy.unsupported}</p> : (
        <div className="flex flex-wrap gap-2">
          {settings.enabled && permission === "granted"
            ? <button type="button" className={secondary} onClick={disable}>{copy.disable}</button>
            : <button type="button" className={primary} onClick={() => void enable()}>{copy.enable}</button>}
          {settings.enabled && permission === "granted" && <button type="button" className={secondary} onClick={() => void showStudyNotification(locale).catch(() => setMessage(copy.denied))}>{copy.test}</button>}
        </div>
      )}
      <p className="m-0 text-sm" role="status">{message ?? (permission === "denied" ? copy.denied : settings.enabled && permission === "granted" ? copy.enabled(settings.time) : copy.disabled)}</p>
      <fieldset className="m-0 grid gap-2 rounded-2xl border-2 border-current/25 p-3">
        <legend className="px-1 font-extrabold">{copy.calendarTitle}</legend>
        <p className="m-0 text-sm leading-relaxed">{copy.calendarIntro}</p>
        {!isLearningQa && <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="size-5" checked={parts.gks} onChange={() => toggle("gks")} />{copy.includeGks}</label>}
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="size-5" checked={parts.board} onChange={() => toggle("board")} />{copy.includeBoard}</label>
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="size-5" checked={parts.study} onChange={() => toggle("study")} />{copy.includeStudy(settings.time)}</label>
        <button type="button" className={`${primary} w-fit`} disabled={!parts.gks && !parts.board && !parts.study} onClick={download}>{copy.download}</button>
      </fieldset>
    </section>
  );
}
