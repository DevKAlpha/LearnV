import { m, useReducedMotion } from "motion/react";
import { BrandMark } from "@/shared/ui/BrandMark";

export function RouteLoader({ label }: { label: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="route-loader" role="status" aria-label={label}>
      <m.span
        className="route-loader__bar"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 0.72, 1], opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      <m.div
        className="route-loader__scene"
        aria-hidden="true"
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <m.div
          className="route-loader__tulip"
          animate={reduceMotion ? undefined : { rotate: [-2.5, 2.5, -2.5], y: [0, -4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <BrandMark showLetter={false} />
        </m.div>
        <div className="route-loader__books">
          {[0, 1, 2].map((book) => (
            <m.span
              key={book}
              animate={reduceMotion ? undefined : { x: [0, book % 2 ? 2 : -2, 0] }}
              transition={{ duration: 1.2, delay: book * 0.12, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
        <strong>LearnV</strong>
      </m.div>
    </div>
  );
}
