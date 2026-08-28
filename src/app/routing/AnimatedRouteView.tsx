import { useLayoutEffect, useRef, type PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  routeKey: string;
}>;

/** Applies route-level transitions without coupling feature pages to Motion. */
export function AnimatedRouteView({ children, routeKey }: Props) {
  const routeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const route = routeRef.current;
    if (!route || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observed = new Set<Element>();
    const discover = () => {
      route.querySelectorAll<HTMLElement>(".page > header, .page > section, .page > article").forEach((target, index) => {
        if (observed.has(target)) return;
        observed.add(target);
        target.classList.add("route-reveal-item");
        target.style.setProperty("--reveal-delay", `${Math.min(index, 3) * 45}ms`);
        target.classList.add("is-revealed");
      });
    };

    discover();
    const mutationObserver = new MutationObserver(discover);
    mutationObserver.observe(route, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observed.forEach((target) => {
        target.classList.remove("route-reveal-item", "is-revealed");
        (target as HTMLElement).style.removeProperty("--reveal-delay");
      });
    };
  }, [routeKey]);

  return (
    <div ref={routeRef} className="route-stage">{children}</div>
  );
}
