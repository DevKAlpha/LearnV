export const isLearningQa = import.meta.env.VITE_APP_SCOPE === "learning-qa";

/** QA must never read or overwrite production learning evidence on the same origin. */
export function scopedStorageKey(key: string, qa = isLearningQa) {
  return qa ? `qa:${key}` : key;
}

/** Removes the deployment base (e.g. `/LearnV/` on GitHub Pages) so route rules see app paths. */
export function appRelativePath(pathname: string, base: string = import.meta.env.BASE_URL ?? "/") {
  const root = base.endsWith("/") ? base.slice(0, -1) : base;
  if (!root || root === "") return pathname || "/";
  if (pathname === root) return "/";
  return pathname.startsWith(`${root}/`) ? pathname.slice(root.length) : pathname;
}
