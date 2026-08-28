import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { preloadAppRoute } from "@/app/routing/AppRoutes";

const prefetched = new Set<string>();
const primaryRoutes = ["/gks", "/study", "/checklist", "/profile"];

function normalizePath(url: URL) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  if (base && url.pathname.startsWith(base)) return url.pathname.slice(base.length) || "/";
  return url.pathname;
}

function preload(pathname: string) {
  if (prefetched.has(pathname)) return;
  prefetched.add(pathname);
  preloadAppRoute(pathname);
}

function likelyNextRoutes(pathname: string) {
  let contextualRoutes: string[] = [];
  if (pathname === "/") contextualRoutes = ["/study"];
  else if (pathname === "/study") contextualRoutes = ["/study/english", "/study/korean", "/study/interviews", "/study/written-simulator"];
  else if (pathname === "/study/english") contextualRoutes = ["/tests/en", "/study/interviews"];
  else if (pathname === "/study/korean") contextualRoutes = ["/tests/ko", "/study/interviews"];
  else if (/^\/tests\/(en|ko)/.test(pathname)) contextualRoutes = [pathname.startsWith("/tests/en") ? "/study/english" : "/study/korean"];

  return [...new Set([
    ...contextualRoutes,
    ...primaryRoutes.filter((route) => route !== pathname),
  ])];
}

export function RoutePrefetcher() {
  const location = useLocation();

  useEffect(() => {
    const onIntent = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      preload(normalizePath(url));
    };

    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    document.addEventListener("touchstart", onIntent, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
      document.removeEventListener("touchstart", onIntent);
    };
  }, []);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const nextRoutes = likelyNextRoutes(location.pathname);
    if (nextRoutes.length === 0 || connection?.saveData || connection?.effectiveType?.includes("2g")) return;

    const run = () => nextRoutes.forEach(preload);
    const requestIdle = (window as unknown as { requestIdleCallback?: Window["requestIdleCallback"] }).requestIdleCallback;
    if (requestIdle) {
      const request = requestIdle(run, { timeout: 1600 });
      return () => window.cancelIdleCallback?.(request);
    }
    const timer = setTimeout(run, 700);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
}
