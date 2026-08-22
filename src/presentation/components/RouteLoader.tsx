import { m } from "motion/react";

export function RouteLoader({ label }: { label: string }) {
  return (
    <div className="route-loader" role="status" aria-label={label}>
      <m.span
        className="route-loader__bar"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 0.72, 1], opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="route-loader__brand" aria-hidden="true">V</span>
    </div>
  );
}
