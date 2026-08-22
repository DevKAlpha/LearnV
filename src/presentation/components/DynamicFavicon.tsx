import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../../application/i18n/I18nContext";
import { useTheme } from "../../application/theme/ThemeContext";

const TEST_STORAGE_KEY = "learnv-language-tests-v1";

type DynamicFaviconProps = {
  readiness: number;
};

function getPassedTests(language: "en" | "ko") {
  try {
    const saved = JSON.parse(localStorage.getItem(TEST_STORAGE_KEY) ?? "{}") as Record<string, Record<string, { passed?: boolean }>>;
    return Object.values(saved[language] ?? {}).filter((stage) => stage.passed).length;
  } catch {
    return 0;
  }
}

function iconContext(pathname: string, readiness: number) {
  if (pathname.includes("/tests/en") || pathname.includes("/study/english")) {
    const passed = getPassedTests("en");
    return { symbol: "A", progress: Math.round((passed / 30) * 100), surface: "#b6cffc", accent: "#315fd6" };
  }
  if (pathname.includes("/tests/ko") || pathname.includes("/study/korean")) {
    const passed = getPassedTests("ko");
    return { symbol: "한", progress: Math.round((passed / 30) * 100), surface: "#f6a1b8", accent: "#9b367d" };
  }
  if (pathname.startsWith("/checklist")) return { symbol: "✓", progress: readiness, surface: "#b9d58a", accent: "#4c7137" };
  if (pathname.startsWith("/gks")) return { symbol: "G", progress: readiness, surface: "#ff8c73", accent: "#b7273d" };
  if (pathname.startsWith("/study")) return { symbol: "V", progress: readiness, surface: "#cba5e5", accent: "#78409a" };
  if (pathname.startsWith("/profile")) return { symbol: "V", progress: readiness, surface: "#d7acd8", accent: "#825078" };
  return { symbol: "V", progress: readiness, surface: "#ffca45", accent: "#9b367d" };
}

function createFaviconSvg(pathname: string, readiness: number, dark: boolean) {
  const context = iconContext(pathname, readiness);
  const progress = Math.max(0, Math.min(100, context.progress));
  const circumference = 150.8;
  const dashOffset = circumference - (circumference * progress) / 100;
  const ink = dark ? "#fff8f2" : "#241a24";
  const base = dark ? "#211a24" : "#fffaf6";
  const complete = progress >= 100;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="18" fill="${base}"/><rect x="9" y="9" width="46" height="46" rx="14" fill="${context.surface}" stroke="${ink}" stroke-width="3"/><path d="M18 48h28" stroke="${context.accent}" stroke-width="4" stroke-linecap="square"/><text x="32" y="39" text-anchor="middle" font-family="Arial Black,Segoe UI,sans-serif" font-size="25" font-weight="900" fill="${ink}">${context.symbol}</text><circle cx="32" cy="32" r="24" fill="none" stroke="${complete ? "#66834d" : context.accent}" stroke-width="4" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" transform="rotate(-90 32 32)"/>${complete ? `<path d="m45 13 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill="#ffca45" stroke="${ink}" stroke-width="1.5"/>` : ""}</svg>`;
}

export function DynamicFavicon({ readiness }: DynamicFaviconProps) {
  const location = useLocation();
  const { locale } = useI18n();
  const { theme } = useTheme();
  const [progressVersion, setProgressVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setProgressVersion((version) => version + 1);
    window.addEventListener("learnv:progress", refresh);
    return () => window.removeEventListener("learnv:progress", refresh);
  }, []);

  useEffect(() => {
    const svg = createFaviconSvg(location.pathname, readiness, theme === "dark");
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
  }, [location.pathname, locale, progressVersion, readiness, theme]);

  return null;
}
