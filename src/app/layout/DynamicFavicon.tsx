import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/application/theme/ThemeContext";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { TESTS_PER_LANGUAGE } from "@/infrastructure/data/practice-test-metadata";

type DynamicFaviconProps = {
  readiness: number;
};

type PassedTotals = { en: number; ko: number };

const share = (passed: number) => Math.round((passed / TESTS_PER_LANGUAGE) * 100);

function iconContext(pathname: string, readiness: number, passed: PassedTotals) {
  if (pathname.includes("/tests/en") || pathname.includes("/study/english")) {
    return { progress: share(passed.en), surface: "#dce8ff", accent: "#315fd6" };
  }
  if (pathname.includes("/tests/ko") || pathname.includes("/study/korean")) {
    return { progress: share(passed.ko), surface: "#f3dbea", accent: "#b7276b" };
  }
  if (pathname.startsWith("/checklist")) return { progress: readiness, surface: "#e5ecd9", accent: "#4c7137" };
  if (pathname.startsWith("/gks")) return { progress: readiness, surface: "#f1ddeb", accent: "#b7274e" };
  if (pathname.startsWith("/study")) return { progress: readiness, surface: "#e6d2f0", accent: "#78409a" };
  if (pathname.startsWith("/profile")) return { progress: readiness, surface: "#ead8f1", accent: "#825078" };
  return { progress: readiness, surface: "#ead8f1", accent: "#8d42aa" };
}

function createFaviconSvg(pathname: string, readiness: number, dark: boolean, passed: PassedTotals) {
  const context = iconContext(pathname, readiness, passed);
  const progress = Math.max(0, Math.min(100, context.progress));
  const circumference = 150.8;
  const dashOffset = circumference - (circumference * progress) / 100;
  const ink = dark ? "#fff8f2" : "#241a24";
  const base = dark ? "#211a24" : "#fffaf6";
  const ring = progress >= 100 ? "#66834d" : context.accent;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="18" fill="${base}"/><rect x="9" y="9" width="46" height="46" rx="14" fill="${context.surface}" stroke="${ink}" stroke-width="2.5"/><path d="M32 39v13" stroke="#557645" stroke-width="4" stroke-linecap="round"/><path d="M31 47c-6-4-10-2-12 2 5 3 9 2 12-2Zm3-3c5-4 9-3 12 0-5 3-9 3-12 0Z" fill="#78965a" stroke="${ink}" stroke-width="1.2"/><path d="M32 40c-10 0-17-7-17-18 6 1 10 4 13 8-1-7 1-13 4-19 3 6 5 12 4 19 3-4 7-7 13-8 0 11-7 18-17 18Z" fill="#b86bd2" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="m26 22 6 13 6-13" fill="none" stroke="#fffaf6" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="32" r="24" fill="none" stroke="${ring}" stroke-width="4" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" transform="rotate(-90 32 32)"/></svg>`;
}

export function DynamicFavicon({ readiness }: DynamicFaviconProps) {
  const location = useLocation();
  const { theme } = useTheme();
  const { totals } = useLanguageTestProgress();

  useEffect(() => {
    const svg = createFaviconSvg(location.pathname, readiness, theme === "dark", totals);
    const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.append(favicon);
    }
    favicon.type = "image/svg+xml";
    favicon.href = href;
    document.documentElement.dataset.appContext = location.pathname.includes("/tests/en") || location.pathname.includes("/study/english")
      ? "english"
      : location.pathname.includes("/tests/ko") || location.pathname.includes("/study/korean")
        ? "korean"
        : "general";
  }, [location.pathname, readiness, theme, totals]);

  return null;
}
