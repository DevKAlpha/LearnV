import { scopedStorageKey } from "@/infrastructure/config/app-scope";

export const resourceProgressKey = scopedStorageKey("learnv-resource-progress-v1");

export function writeResourceProgress(completed: string[], storage?: Pick<Storage, "setItem">) {
  try {
    (storage ?? localStorage).setItem(resourceProgressKey, JSON.stringify(completed));
    return { saved: true, error: null };
  } catch (error) {
    return { saved: false, error };
  }
}
