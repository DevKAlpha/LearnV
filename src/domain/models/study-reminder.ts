import { localDateKey } from "./learning-journey";

export type ReminderSettings = {
  enabled: boolean;
  /** Local time, HH:MM. */
  time: string;
  /** Local day of the last reminder shown, so there is at most one a day. */
  lastShown: string | null;
};

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
export const DEFAULT_REMINDER_TIME = "19:00";
export const defaultReminderSettings: ReminderSettings = { enabled: false, time: DEFAULT_REMINDER_TIME, lastShown: null };

export function normalizeReminderSettings(value: unknown): ReminderSettings {
  const record = typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return {
    enabled: record.enabled === true,
    time: typeof record.time === "string" && TIME.test(record.time) ? record.time : DEFAULT_REMINDER_TIME,
    lastShown: typeof record.lastShown === "string" && DAY.test(record.lastShown) ? record.lastShown : null,
  };
}

function todayAt(time: string, now: Date) {
  const [hours, minutes] = time.split(":").map(Number);
  const at = new Date(now);
  at.setHours(hours, minutes, 0, 0);
  return at;
}

/** Milliseconds until the next reminder time (later today, or tomorrow). */
export function nextReminderDelay(time: string, now: Date) {
  const at = todayAt(TIME.test(time) ? time : DEFAULT_REMINDER_TIME, now);
  if (at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);
  return at.getTime() - now.getTime();
}

/**
 * Remind once a day, after the chosen time, and only if there has been no practice today:
 * a learner who already studied is not nagged.
 */
export function shouldRemind(settings: ReminderSettings, now: Date, practisedToday: boolean) {
  if (!settings.enabled || practisedToday) return false;
  if (settings.lastShown === localDateKey(now)) return false;
  return now.getTime() >= todayAt(settings.time, now).getTime();
}
