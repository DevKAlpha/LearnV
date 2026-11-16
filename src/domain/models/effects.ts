/**
 * Celebration and decoration preferences. Visual celebrations and the seasonal theme start on;
 * sound and vibration are opt-in because they reach people around the learner.
 * The system "reduce motion" setting always wins over `celebrations`.
 */
export type EffectsPreferences = {
  celebrations: boolean;
  sound: boolean;
  vibration: boolean;
  seasonal: boolean;
};

export const DEFAULT_EFFECTS: EffectsPreferences = { celebrations: true, sound: false, vibration: false, seasonal: true };

export function normalizeEffects(raw: unknown): EffectsPreferences {
  const record = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {};
  const flag = (key: keyof EffectsPreferences) => typeof record[key] === "boolean" ? record[key] as boolean : DEFAULT_EFFECTS[key];
  return { celebrations: flag("celebrations"), sound: flag("sound"), vibration: flag("vibration"), seasonal: flag("seasonal") };
}

export type CelebrationKind = "pass" | "review" | "plan" | "sticker" | "cheer" | "bloom";

export type CelebrationPlan = {
  /** Falling paper pieces. Never with reduced motion. */
  confetti: number;
  /** A short message shown in a polite status region (always, when there is one). */
  toast: boolean;
  sound: boolean;
  /** Vibration pattern in milliseconds, or null. */
  vibrate: number[] | null;
};

const PIECES: Record<CelebrationKind, number> = { pass: 36, review: 24, plan: 30, sticker: 18, cheer: 28, bloom: 0 };

/** What a celebration may do on this device, given the learner's settings and the system preference. */
export function planCelebration(kind: CelebrationKind, preferences: EffectsPreferences, reducedMotion: boolean): CelebrationPlan {
  const visual = preferences.celebrations && !reducedMotion;
  return {
    confetti: visual ? PIECES[kind] : 0,
    toast: true,
    sound: preferences.sound,
    vibrate: preferences.vibration ? (kind === "cheer" ? [40, 60, 40] : [30]) : null,
  };
}
