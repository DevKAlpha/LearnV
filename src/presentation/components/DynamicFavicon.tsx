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
    return { progress: Math.round((passed / 30) * 100), surface: "#dce8ff", accent: "#315fd6" };
  }
  if (pathname.includes("/tests/ko") || pathname.includes("/study/korean")) {
    const passed = getPassedTests("ko");
    return { progress: Math.round((passed / 30) * 100), surface: "#f3dbea", accent: "#b7276b" };
  }
  if (pathname.startsWith("/checklist")) return { progress: readiness, surface: "#e5ecd9", accent: "#4c7137" };
  if (pathname.startsWith("/gks")) return { progress: readiness, surface: "#f1ddeb", accent: "#b7274e" };
  if (pathname.startsWith("/study")) return { progress: readiness, surface: "#e6d2f0", accent: "#78409a" };
  if (pathname.startsWith("/profile")) return { progress: readiness, surface: "#ead8f1", accent: "#825078" };
  return { progress: readiness, surface: "#ead8f1", accent: "#8d42aa" };
}

function createFaviconSvg(pathname: string, readiness: number, dark: boolean) {
  const context = iconContext(pathname, readiness);
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
