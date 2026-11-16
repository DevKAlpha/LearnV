import { describe, expect, it } from "vitest";
import { activeFestival, daysUntil, festivalOccurrences, upcomingFestival, type Festival } from "@/domain/models/cultural-calendar";
import { DEFAULT_EFFECTS, normalizeEffects, planCelebration } from "@/domain/models/effects";
import {
  collectStickers, earnSticker, EMPTY_STICKERS, hasCheer, matchSecret, normalizeStickers, pickOfTheDay, reachedVolumes, stickerIds, type MilestoneInput,
} from "@/domain/models/milestones";
import { mergeStoredText } from "@/domain/models/sync-merge";
import { festivals, CALENDAR_COVERED_UNTIL } from "@/infrastructure/data/cultural-calendar";
import { festivalLessons } from "@/infrastructure/i18n/cultural-calendar-copy";
import { immersionCopy } from "@/infrastructure/i18n/immersion-copy";

describe("effects preferences", () => {
  it("falls back field by field and starts with sound and vibration off", () => {
    expect(normalizeEffects(null)).toEqual(DEFAULT_EFFECTS);
    expect(DEFAULT_EFFECTS).toMatchObject({ celebrations: true, sound: false, vibration: false, seasonal: true });
    expect(normalizeEffects({ sound: true, celebrations: "yes", seasonal: false })).toEqual({ ...DEFAULT_EFFECTS, sound: true, seasonal: false });
  });

  it("drops motion when the system asks for reduced motion, but keeps the message", () => {
    const loud = { celebrations: true, sound: true, vibration: true, seasonal: true };
    expect(planCelebration("pass", loud, false)).toMatchObject({ toast: true, sound: true, vibrate: [30] });
    expect(planCelebration("pass", loud, false).confetti).toBeGreaterThan(0);
    expect(planCelebration("pass", loud, true)).toMatchObject({ confetti: 0, toast: true });
    expect(planCelebration("cheer", { ...loud, celebrations: false, vibration: false }, false)).toMatchObject({ confetti: 0, vibrate: null });
    expect(planCelebration("bloom", loud, false).confetti).toBe(0);
  });
});

describe("cultural calendar", () => {
  const sample: Festival[] = [
    { id: "hangeul-day", fixed: "10-09", around: 1 },
    { id: "chuseok", dates: ["2026-09-25"], around: 2 },
  ];

  it("expands fixed and explicit dates, and never guesses a missing year", () => {
    expect(festivalOccurrences(sample[0]!, 2027)).toEqual([{ id: "hangeul-day", date: "2027-10-09", start: "2027-10-08", end: "2027-10-10" }]);
    expect(festivalOccurrences(sample[1]!, 2027)).toEqual([]);
  });

  it("finds the active festival inside its period, across month edges", () => {
    expect(activeFestival("2026-09-23", sample)?.id).toBe("chuseok");
    expect(activeFestival("2026-09-28", sample)).toBeNull();
    expect(activeFestival("2026-10-10", sample)?.id).toBe("hangeul-day");
  });

  it("finds the next festival within the horizon, including next year", () => {
    expect(upcomingFestival("2026-10-01", sample)?.date).toBe("2026-10-09");
    expect(upcomingFestival("2026-10-10", sample, 30)).toBeNull();
    expect(upcomingFestival("2026-12-30", [{ id: "samiljeol", fixed: "03-01", around: 0 }], 90)?.date).toBe("2027-03-01");
    expect(daysUntil("2026-11-16", "2026-11-19")).toBe(3);
  });

  it("knows the real calendar around the Suneung and has a lesson for every festival", () => {
    expect(upcomingFestival("2026-11-16", festivals)?.id).toBe("suneung");
    expect(activeFestival("2026-11-19", festivals)?.id).toBe("suneung");
    expect(activeFestival("2027-02-07", festivals)?.id).toBe("seollal");
    for (const festival of festivals) {
      const lesson = festivalLessons[festival.id];
      expect(lesson.phrases).toHaveLength(3);
      for (const locale of ["es", "en", "ko"] as const) expect(lesson.about[locale].length).toBeGreaterThan(20);
    }
  });

  it("covers the moving festivals for this year and the next (extend the dates when this fails)", () => {
    const year = new Date().getFullYear();
    expect(CALENDAR_COVERED_UNTIL).toBeGreaterThanOrEqual(year + 1);
    for (const id of ["seollal", "chuseok", "dongji"] as const) {
      const festival = festivals.find((item) => item.id === id)!;
      expect(festivalOccurrences(festival, year)).toHaveLength(1);
      expect(festivalOccurrences(festival, year + 1)).toHaveLength(1);
    }
  });
});

describe("milestones and stickers", () => {
  const input = (overrides: Partial<MilestoneInput> = {}): MilestoneInput => ({
    passed: new Set(), koreanBand: "none", englishAdvancedUnlocked: false, longestStreak: 0, ...overrides,
  });

  it("opens each volume from saved practice only", () => {
    expect(reachedVolumes(input()).size).toBe(0);
    expect([...reachedVolumes(input({ passed: new Set(["ko-reading-01"]) }))]).toEqual([]);
    expect([...reachedVolumes(input({ passed: new Set(["ko-writing-01"]) }))]).toEqual(["hangul-first"]);
    expect(reachedVolumes(input({ koreanBand: "band1" })).has("topik-bridge")).toBe(false);
    expect(reachedVolumes(input({ koreanBand: "band2" })).has("topik-bridge")).toBe(true);
    expect(reachedVolumes(input({ englishAdvancedUnlocked: true })).has("c1-summit")).toBe(true);
  });

  it("validates stored stickers and keeps the first earn date", () => {
    expect(normalizeStickers({ earned: { tulip: "2026-11-16T10:00:00.000Z", "hangul-first": "2026-11-16T10:00:00.000Z", __proto__: "x", credit: "nope" } }))
      .toEqual({ version: 1, earned: { tulip: "2026-11-16T10:00:00.000Z" } });
    const first = earnSticker(EMPTY_STICKERS, "hwaiting", "2026-11-16T10:00:00.000Z");
    expect(earnSticker(first, "hwaiting", "2026-12-01T10:00:00.000Z")).toBe(first);
  });

  it("collects derived and stored stickers together", () => {
    const held = collectStickers(input({ longestStreak: 8, passed: new Set(["ko-writing-02"]) }), { version: 1, earned: { credit: "2026-11-16T10:00:00.000Z" } });
    expect([...held.keys()].sort()).toEqual(["credit", "hangul-first", "streak-7"]);
    expect(held.get("credit")).toBe("2026-11-16T10:00:00.000Z");
  });

  it("names and hints every sticker in every language", () => {
    for (const locale of ["es", "en", "ko"] as const) {
      for (const id of stickerIds) {
        expect(immersionCopy[locale].stickers.items[id].name).toBeTruthy();
        expect(immersionCopy[locale].stickers.items[id].hint).toBeTruthy();
      }
    }
  });

  it("merges stickers from two devices keeping the first date", () => {
    const local = JSON.stringify({ version: 1, earned: { tulip: "2026-11-10T10:00:00.000Z", credit: "2026-11-12T10:00:00.000Z" } });
    const remote = JSON.stringify({ version: 1, earned: { tulip: "2026-11-08T10:00:00.000Z", hwaiting: "2026-11-09T10:00:00.000Z" } });
    const merged = JSON.parse(mergeStoredText("learnv-stickers-v1", null, local, remote, "local")!);
    expect(merged.earned).toEqual({ tulip: "2026-11-08T10:00:00.000Z", credit: "2026-11-12T10:00:00.000Z", hwaiting: "2026-11-09T10:00:00.000Z" });
  });

  it("recognises cheers and secret words", () => {
    expect(hasCheer("TOPIK 화이팅!")).toBe(true);
    expect(hasCheer("Fighting for C1")).toBe(true);
    expect(hasCheer("firefighting drill")).toBe(false);
    expect(matchSecret("xxtulip", ["tulip"])).toBe("tulip");
    expect(matchSecret("tulipx", ["tulip"])).toBeNull();
  });

  it("picks a stable item of the day that changes the next day", () => {
    const items = ["a", "b", "c", "d"];
    expect(pickOfTheDay(items, "2026-11-16", "ko")).toBe(pickOfTheDay(items, "2026-11-16", "ko"));
    expect(pickOfTheDay(items, "2026-11-16", "ko")).not.toBe(pickOfTheDay(items, "2026-11-17", "ko"));
    expect(pickOfTheDay([], "2026-11-16")).toBeNull();
  });
});
