import { describe, expect, it } from "vitest";
import { buildCalendar, escapeText, foldLine } from "./calendar-export";
import { nextReminderDelay, normalizeReminderSettings, shouldRemind } from "./study-reminder";

describe("calendar export", () => {
  const now = new Date("2026-11-14T09:30:00Z");

  it("writes all-day GKS events with an inclusive end and a morning alarm", () => {
    const ics = buildCalendar({ name: "LearnV", now, events: [{ uid: "gks-2028-call@learnv", title: "GKS-U 2028 · Convocatoria", date: "2027-09-01", endDate: "2027-09-20", description: "Fecha estimada", alarmDaysBefore: 7 }] });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTAMP:20261114T093000Z");
    expect(ics).toContain("DTSTART;VALUE=DATE:20270901\r\nDTEND;VALUE=DATE:20270921");
    expect(ics).toContain("TRIGGER:-PT159H");
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it("adds a daily study session in the device's local time", () => {
    const ics = buildCalendar({ name: "LearnV", now, events: [], study: { time: "19:30", minutes: 25, title: "Plan de hoy", startDate: "2026-11-15" } });
    expect(ics).toContain("DTSTART:20261115T193000\r\nDURATION:PT25M\r\nRRULE:FREQ=DAILY");
    expect(ics).toContain("TRIGGER:PT0M");
    expect(buildCalendar({ name: "x", now, events: [], study: { time: "25:00", minutes: 5, title: "x", startDate: "2026-11-15" } })).not.toContain("RRULE");
  });

  it("escapes text and folds long lines without splitting characters", () => {
    expect(escapeText("a, b; c\\d\ne")).toBe("a\\, b\\; c\\\\d\\ne");
    const line = `SUMMARY:${"한국어 ".repeat(30)}`;
    const folded = foldLine(line);
    for (const part of folded.split("\r\n")) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    expect(folded.split("\r\n").map((part, index) => index ? part.slice(1) : part).join("")).toBe(line);
  });
});

describe("study reminder", () => {
  const settings = { enabled: true, time: "19:00", lastShown: null };

  it("reminds once, after the chosen time, and only without practice today", () => {
    expect(shouldRemind(settings, new Date(2026, 10, 14, 18, 59), false)).toBe(false);
    expect(shouldRemind(settings, new Date(2026, 10, 14, 19, 0), false)).toBe(true);
    expect(shouldRemind(settings, new Date(2026, 10, 14, 21, 0), true)).toBe(false);
    expect(shouldRemind({ ...settings, lastShown: "2026-11-14" }, new Date(2026, 10, 14, 21, 0), false)).toBe(false);
    expect(shouldRemind({ ...settings, enabled: false }, new Date(2026, 10, 14, 21, 0), false)).toBe(false);
  });

  it("waits until the next occurrence of the time", () => {
    expect(nextReminderDelay("19:00", new Date(2026, 10, 14, 18, 0))).toBe(3_600_000);
    expect(nextReminderDelay("19:00", new Date(2026, 10, 14, 20, 0))).toBe(23 * 3_600_000);
  });

  it("validates stored settings", () => {
    expect(normalizeReminderSettings({ enabled: "yes", time: "7pm", lastShown: 3 })).toEqual({ enabled: false, time: "19:00", lastShown: null });
    expect(normalizeReminderSettings({ enabled: true, time: "07:30", lastShown: "2026-11-14" })).toEqual({ enabled: true, time: "07:30", lastShown: "2026-11-14" });
  });
});
