import type { PropsWithChildren } from "react";

/** CSS animates a committed page without hiding sections behind suspended animation frames. */
export function AnimatedRouteView({ children, routeKey }: PropsWithChildren<{ routeKey: string }>) {
  return <div key={routeKey} className="route-stage">{children}</div>;
}
