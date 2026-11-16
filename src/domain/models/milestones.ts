import type { LevelBand } from "./measured-level";

/**
 * Story volumes and cultural stickers. Milestone volumes and progress stickers are derived
 * from saved practice every time, so they can never disagree with it. Only stickers that
 * cannot be derived (festivals, easter eggs) are stored, with the date they were earned.
 */
export type VolumeId = "hangul-first" | "topik-bridge" | "c1-summit";
export const volumeIds: readonly VolumeId[] = ["hangul-first", "topik-bridge", "c1-summit"];

export type ProgressStickerId = VolumeId | "streak-7" | "streak-30";
export type EventStickerId = "seollal" | "chuseok" | "hangeul-day" | "childrens-day" | "suneung" | "samiljeol" | "pepero-day" | "dongji";
export type SecretStickerId = "hwaiting" | "tulip" | "credit";
export type StickerId = ProgressStickerId | EventStickerId | SecretStickerId;
export type StoredStickerId = EventStickerId | SecretStickerId;

export const stickerIds: readonly StickerId[] = [
  "hangul-first", "topik-bridge", "c1-summit", "streak-7", "streak-30",
  "seollal", "samiljeol", "childrens-day", "chuseok", "hangeul-day", "suneung", "pepero-day", "dongji",
  "hwaiting", "tulip", "credit",
];

const storedIds = new Set<string>(stickerIds.filter((id) => !["hangul-first", "topik-bridge", "c1-summit", "streak-7", "streak-30"].includes(id)));
export const isStoredStickerId = (value: string): value is StoredStickerId => storedIds.has(value);

export type MilestoneInput = {
  /** Passed state of every Korean and English stage, by stage id. */
  passed: ReadonlySet<string>;
  koreanBand: LevelBand;
  englishAdvancedUnlocked: boolean;
  longestStreak: number;
};

/** Writing stages are the first time the learner produces a sentence in Hangul. */
const KOREAN_WRITING = /^ko-writing-\d{2}$/;
const BRIDGE_BANDS: readonly LevelBand[] = ["band2", "band3", "band4"];

export function reachedVolumes(input: MilestoneInput): Set<VolumeId> {
  const reached = new Set<VolumeId>();
  if ([...input.passed].some((id) => KOREAN_WRITING.test(id))) reached.add("hangul-first");
  if (BRIDGE_BANDS.includes(input.koreanBand)) reached.add("topik-bridge");
  if (input.englishAdvancedUnlocked) reached.add("c1-summit");
  return reached;
}

export type StickerState = { version: 1; earned: Partial<Record<StoredStickerId, string>> };
export const EMPTY_STICKERS: StickerState = { version: 1, earned: {} };

const ISO = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/;

export function normalizeStickers(raw: unknown): StickerState {
  const earned = typeof raw === "object" && raw !== null ? (raw as { earned?: unknown }).earned : null;
  if (typeof earned !== "object" || earned === null || Array.isArray(earned)) return EMPTY_STICKERS;
  const result: StickerState["earned"] = {};
  for (const [id, date] of Object.entries(earned)) {
    if (isStoredStickerId(id) && typeof date === "string" && ISO.test(date) && Number.isFinite(Date.parse(date))) result[id] = date;
  }
  return { version: 1, earned: result };
}

/** Every sticker the learner holds, with the earn date when it is known. */
export function collectStickers(input: MilestoneInput, stored: StickerState): Map<StickerId, string | null> {
  const held = new Map<StickerId, string | null>();
  for (const volume of reachedVolumes(input)) held.set(volume, null);
  if (input.longestStreak >= 7) held.set("streak-7", null);
  if (input.longestStreak >= 30) held.set("streak-30", null);
  for (const [id, date] of Object.entries(stored.earned)) held.set(id as StoredStickerId, date ?? null);
  return held;
}

/** Earns a stored sticker once; the first date is kept. */
export function earnSticker(state: StickerState, id: StoredStickerId, at: string): StickerState {
  if (state.earned[id]) return state;
  return { version: 1, earned: { ...state.earned, [id]: at } };
}

/** Typing one of these in a task title cheers the learner on (화이팅 = "you can do it"). */
export function hasCheer(text: string): boolean {
  const normalized = text.normalize("NFKC").toLowerCase();
  return normalized.includes("화이팅") || normalized.includes("파이팅") || /\bfighting\b/.test(normalized);
}

/**
 * Secret words typed anywhere outside a text field. Returns the word that the buffer now
 * ends with, if any. Keys are compared lowercased; the buffer is capped by the caller.
 */
export function matchSecret(buffer: string, words: readonly string[]): string | null {
  const lowered = buffer.toLowerCase();
  return words.find((word) => lowered.endsWith(word)) ?? null;
}

/**
 * The item of the day: stable for the whole local day and the same on every device,
 * different from yesterday's whenever the list has more than one item.
 */
export function pickOfTheDay<T>(items: readonly T[], dateKey: string, salt = ""): T | null {
  if (items.length === 0) return null;
  let hash = 2166136261;
  for (const char of `${salt}:${dateKey.slice(0, 4)}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  const [year, month, day] = dateKey.split("-").map(Number);
  const dayOfYear = Math.floor((Date.UTC(year!, month! - 1, day!) - Date.UTC(year!, 0, 1)) / 86_400_000);
  // A fixed per-year offset plus the day: consecutive days never repeat (for lists longer than one).
  return items[(hash + dayOfYear) % items.length]!;
}
