export const WRITTEN_SIMULATOR_STORAGE_KEY = "learnv-written-simulator-v1";
export const WRITTEN_SIMULATOR_STATE_EVENT = "learnv:written-state";

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
  window.dispatchEvent(new CustomEvent(WRITTEN_SIMULATOR_STATE_EVENT, {
    detail: { active },
  }));
}
