import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/** Restores the expected mobile reading position after every route change. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
