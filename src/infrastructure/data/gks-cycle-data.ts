import type { ConfirmedWindows } from "@/domain/models/gks-cycle";

/**
 * Phase dates confirmed by an official guideline, per entry year. Phases missing here use
 * the estimate in gks-cycle.ts and are shown as estimated. Add a cycle when its guideline
 * is published, with the source in gks-2026.ts.
 */
export const confirmedCycleWindows: Record<number, { windows: ConfirmedWindows; sourceId: string }> = {
  2027: {
    // 2027 GKS-U guideline published on 9 September 2026 (study-in-korea-2027).
    windows: { call: { start: "2026-09-09", end: "2026-09-20" } },
    sourceId: "study-in-korea-2027",
  },
};
