export const RADAR_STALE_AFTER_HOURS = 48;

/** Whole days since the radar last checked official sources, and whether it is out of date. */
export function radarFreshness(checkedAt: string, now = new Date()) {
  const checked = Date.parse(checkedAt);
  if (!Number.isFinite(checked)) return { stale: true, daysAgo: null as number | null };
  const hours = (now.getTime() - checked) / 3_600_000;
  return { stale: hours > RADAR_STALE_AFTER_HOURS, daysAgo: Math.max(0, Math.floor(hours / 24)) };
}
