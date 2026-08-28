import { BrandMark } from "@/shared/ui/BrandMark";

export function RouteLoader({ label, leaving = false }: { label: string; leaving?: boolean }) {
  return (
    <div className={leaving ? "route-loader is-leaving" : "route-loader"} role="status" aria-live="polite" aria-label={label}>
      <span className="route-loader__bar" />
      <div className="route-loader__scene" aria-hidden="true">
        <div className="route-loader__tulip"><BrandMark showLetter={false} /></div>
        <div className="route-loader__books">{[0, 1, 2].map((book) => <span key={book} />)}</div>
        <strong>LearnV</strong>
      </div>
    </div>
  );
}
