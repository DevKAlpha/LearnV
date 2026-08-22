import { useEffect, useRef, type PropsWithChildren } from "react";
import { animate, m, useReducedMotion } from "motion/react";

type Props = PropsWithChildren<{
  routeKey: string;
}>;

export function AnimatedRouteView({ children, routeKey }: Props) {
  const routeRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const route = routeRef.current;
    if (!route || reduceMotion) return;

    const revealTargets = Array.from(
      route.querySelectorAll<HTMLElement>(".page > header, .page > section, .page > article"),
    );
    if (!revealTargets.length) return;

    const observers: IntersectionObserver[] = [];
    const controls: Array<ReturnType<typeof animate>> = [];

    revealTargets.forEach((target, index) => {
      target.style.opacity = "0";
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          const control = animate(
            target,
            { opacity: [0, 1], y: [14, 0] },
            {
              duration: 0.38,
              delay: Math.min(index, 3) * 0.045,
              ease: [0.22, 1, 0.36, 1],
            },
          );
          controls.push(control);
          observer.unobserve(target);
        },
        { rootMargin: "0px 0px -28px", threshold: 0.06 },
      );
      observer.observe(target);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
      controls.forEach((control) => control.stop());
      revealTargets.forEach((target) => {
        target.style.removeProperty("opacity");
        target.style.removeProperty("transform");
      });
    };
  }, [reduceMotion, routeKey]);

  return (
    <m.div
      ref={routeRef}
      className="route-stage"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
