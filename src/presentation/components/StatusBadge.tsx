import type { FactStatus } from "../../domain/models/gks";

const labels: Record<FactStatus, string> = {
  confirmed: "Confirmado",
  historical: "Referencia 2026",
  pending: "Pendiente 2027",
};

export function StatusBadge({ status }: { status: FactStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{labels[status]}</span>;
}
