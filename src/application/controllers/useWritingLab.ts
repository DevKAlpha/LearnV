import { useCallback } from "react";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";
import { createLocalStore } from "@/infrastructure/storage/local-store";
import { useLocalStore } from "./useLocalStore";

/** Per task: the draft being written and up to five saved versions for the revision loop. */
export type WritingLabEntry = { draft: string; versions: string[] };
export type WritingLabState = Record<string, WritingLabEntry>;

const MAX_TEXT = 6_000;
const MAX_VERSIONS = 5;
const TASK_ID = /^[a-z0-9-]{1,60}$/;

export function normalizeWritingLab(raw: unknown): WritingLabState {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  const state: WritingLabState = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!TASK_ID.test(id) || typeof value !== "object" || value === null) continue;
    const entry = value as Record<string, unknown>;
    state[id] = {
      draft: typeof entry.draft === "string" ? entry.draft.slice(0, MAX_TEXT) : "",
      versions: Array.isArray(entry.versions)
        ? entry.versions.filter((version): version is string => typeof version === "string").map((version) => version.slice(0, MAX_TEXT)).slice(-MAX_VERSIONS)
        : [],
    };
  }
  return state;
}

export const writingLabStore = createLocalStore<WritingLabState>({
  key: scopedStorageKey("learnv-writing-lab-v1"),
  fallback: {},
  parse: normalizeWritingLab,
  onError: (code, error) => recordLearningError({ area: "written-simulator", code: `writing-lab-${code}`, error }),
});

const EMPTY: WritingLabEntry = { draft: "", versions: [] };

export function useWritingLab(taskId: string) {
  const state = useLocalStore(writingLabStore);
  const entry = state[taskId] ?? EMPTY;
  const setDraft = useCallback((draft: string) => writingLabStore.set((current) => ({
    ...current, [taskId]: { ...(current[taskId] ?? EMPTY), draft: draft.slice(0, MAX_TEXT) },
  })), [taskId]);
  const saveVersion = useCallback(() => writingLabStore.set((current) => {
    const existing = current[taskId] ?? EMPTY;
    if (!existing.draft.trim() || existing.versions.at(-1) === existing.draft) return current;
    return { ...current, [taskId]: { ...existing, versions: [...existing.versions, existing.draft].slice(-MAX_VERSIONS) } };
  }), [taskId]);
  return { entry, setDraft, saveVersion };
}
