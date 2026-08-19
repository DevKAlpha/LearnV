import { sources } from "../../infrastructure/data/gks-2026";
import { useI18n } from "../../application/i18n/I18nContext";

export function SourceLink({ sourceId }: { sourceId: string }) {
  const { copy } = useI18n();
  const source = sources.find((item) => item.id === sourceId);
  if (!source) return null;

  return (
    <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
      {copy.common.officialSource} <span aria-hidden="true">↗</span>
    </a>
  );
}
