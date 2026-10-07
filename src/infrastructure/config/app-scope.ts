export const isLearningQa = import.meta.env.VITE_APP_SCOPE === "learning-qa";

/** QA must never read or overwrite production learning evidence on the same origin. */
export function scopedStorageKey(key: string, qa = isLearningQa) {
  return qa ? `qa:${key}` : key;
}
