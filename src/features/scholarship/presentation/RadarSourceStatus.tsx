import "@/styles/tailwind-study.css";
import type { GksSourceCheck } from "@/application/controllers/useGksRadar";
import { useI18n } from "@/application/i18n/I18nContext";
import { sources } from "@/infrastructure/data/gks-2026";
import { gksProfileCopy } from "@/infrastructure/i18n/gks-profile-copy";

/** Per-source result of the last radar check, so a failing source is visible, not averaged away. */
export function RadarSourceStatus({ checks, checkedAt }: { checks: readonly GksSourceCheck[]; checkedAt: string }) {
  const { locale } = useI18n();
  const copy = gksProfileCopy[locale].radar;
  return (
    <ul className="m-0 grid list-none gap-1.5 p-0">
      {checks.map((check) => (
        <li key={check.id} className="flex flex-wrap items-baseline justify-between gap-x-3 rounded-xl border border-current/25 px-3 py-2">
          <span>{sources.find((source) => source.id === check.id)?.title ?? check.id}</span>
          <strong>{check.changed ? copy.changed : check.ok ? copy.ok : copy.failed} · {checkedAt}</strong>
        </li>
      ))}
    </ul>
  );
}
