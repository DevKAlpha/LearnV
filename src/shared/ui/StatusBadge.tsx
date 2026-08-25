import type { FactStatus } from "@/domain/models/gks";
import { useI18n } from "@/application/i18n/I18nContext";

export function StatusBadge({ status }: { status: FactStatus }) {
  const { copy } = useI18n();
  const labels: Record<FactStatus, string> = copy.status;
  return <span className={`status-badge status-badge--${status}`}>{labels[status]}</span>;
}
