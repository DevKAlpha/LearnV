import { sources } from "../../infrastructure/data/gks-2026";

export function SourceLink({ sourceId }: { sourceId: string }) {
  const source = sources.find((item) => item.id === sourceId);
  if (!source) return null;

  return (
    <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
      Fuente oficial <span aria-hidden="true">↗</span>
    </a>
  );
}
