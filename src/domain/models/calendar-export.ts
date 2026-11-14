/**
 * iCalendar (RFC 5545) export: GKS dates, dated board tasks and a daily study session, so
 * the phone's own calendar can remind the learner even when LearnV is closed.
 */
export type CalendarEvent = {
  /** Stable id: importing the file again updates the event instead of duplicating it. */
  uid: string;
  title: string;
  /** All-day event: first day, and last day included (defaults to the first). */
  date: string;
  endDate?: string;
  description?: string;
  /** Alarm at 09:00 this many days before the first day; 0 = the same morning. */
  alarmDaysBefore?: number;
};

export type StudySession = {
  /** Local time, HH:MM. The event uses floating time: it follows the device's time zone. */
  time: string;
  minutes: number;
  title: string;
  description?: string;
  /** First day of the daily series. */
  startDate: string;
};

export type CalendarInput = { name: string; events: readonly CalendarEvent[]; study?: StudySession | null; now: Date };

const compact = (date: string) => date.replaceAll("-", "");
const nextDay = (date: string) => {
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
};
const stamp = (now: Date) => now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds a content line at 75 octets (UTF-8), never splitting a character. */
export function foldLine(line: string) {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    // Continuation lines start with a space, which counts towards their 75 octets.
    if (size + bytes > (parts.length ? 74 : 75)) { parts.push(current); current = ""; size = 0; }
    current += char;
    size += bytes;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function alarm(trigger: string, title: string) {
  return ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escapeText(title)}`, `TRIGGER:${trigger}`, "END:VALARM"];
}

export function buildCalendar({ name, events, study, now }: CalendarInput) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//LearnV//GKS study plan//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${escapeText(name)}`];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${compact(event.date)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(event.endDate ?? event.date))}`,
      `SUMMARY:${escapeText(event.title)}`,
      "TRANSP:TRANSPARENT",
    );
    if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    if (event.alarmDaysBefore !== undefined) {
      // All-day events start at midnight: 09:00 on the day is +PT9H, the days before go negative.
      const hours = 9 - event.alarmDaysBefore * 24;
      lines.push(...alarm(hours >= 0 ? `PT${hours}H` : `-PT${-hours}H`, event.title));
    }
    lines.push("END:VEVENT");
  }
  if (study && /^([01]\d|2[0-3]):[0-5]\d$/.test(study.time)) {
    lines.push(
      "BEGIN:VEVENT",
      "UID:learnv-daily-study@learnv",
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${compact(study.startDate)}T${study.time.replace(":", "")}00`,
      `DURATION:PT${Math.max(5, Math.round(study.minutes))}M`,
      "RRULE:FREQ=DAILY",
      `SUMMARY:${escapeText(study.title)}`,
    );
    if (study.description) lines.push(`DESCRIPTION:${escapeText(study.description)}`);
    lines.push(...alarm("PT0M", study.title), "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
