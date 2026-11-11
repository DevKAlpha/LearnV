import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { emitLearnvEvent } from "@/infrastructure/events/learnv-events";
export const WRITTEN_SIMULATOR_STORAGE_KEY = scopedStorageKey("learnv-written-simulator-v1");

export function hasActiveWrittenSimulator() {
  try {
    const stored = localStorage.getItem(WRITTEN_SIMULATOR_STORAGE_KEY);
    if (!stored) return false;
    const state = JSON.parse(stored) as { step?: string; startedAt?: string | null };
    return state.step !== "intro" && typeof state.startedAt === "string";
  } catch {
    return false;
  }
}

export function announceWrittenSimulatorState(active: boolean) {
  emitLearnvEvent("learnv:written-state", { active });
}
