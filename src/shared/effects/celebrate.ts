import type { Locale } from "@/domain/models/i18n";
import { planCelebration, type CelebrationKind } from "@/domain/models/effects";
import { earnSticker, type StickerId, type StoredStickerId } from "@/domain/models/milestones";
import { effectsStore } from "@/infrastructure/data/effects-store";
import { stickerStore } from "@/infrastructure/data/sticker-store";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Celebrates a moment. Startup-safe: the confetti, sound and their styles load on first use.
 * The message is always announced; motion, sound and vibration follow the learner's settings.
 */
export function celebrate(kind: CelebrationKind, locale: Locale, sticker?: StickerId): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const plan = planCelebration(kind, effectsStore.get(), prefersReducedMotion());
  return import("./celebration")
    .then((module) => module.runCelebration(kind, plan, locale, sticker))
    .catch(() => undefined);
}

/** Earns a stored sticker once and celebrates it. Returns true when the sticker is new. */
export function earnStoredSticker(id: StoredStickerId, locale: Locale, kind: CelebrationKind = "sticker"): boolean {
  if (stickerStore.refresh().earned[id]) {
    if (kind !== "sticker") void celebrate(kind, locale);
    return false;
  }
  stickerStore.set((current) => earnSticker(current, id, new Date().toISOString()));
  void celebrate(kind, locale, id);
  return true;
}
