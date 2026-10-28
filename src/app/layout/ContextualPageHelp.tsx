import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { localize } from "@/domain/models/i18n";
import { getDefinition } from "./section-help";
import { readPageHelpContext } from "./page-help-context";
import "@/styles/page-help.css";

const labels = {
  es: { current: "Ayuda de esta pantalla", timer: "El tiempo de esta práctica sigue corriendo mientras consultas la ayuda." },
  en: { current: "Help for this screen", timer: "This practice timer keeps running while you read help." },
  ko: { current: "이 화면 도움말", timer: "도움말을 읽는 동안에도 연습 시간은 계속 흐릅니다." },
};

export function ContextualPageHelp() {
  const { pathname } = useLocation();
  const { locale } = useI18n();
  const [context, setContext] = useState(() => typeof document === "undefined" ? {} : readPageHelpContext());
  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    const observer = new MutationObserver(() => setContext(readPageHelpContext()));
    observer.observe(main, { subtree: true, attributes: true, attributeFilter: ["data-help-practice", "data-help-written", "data-help-phase", "data-help-timed-running", "hidden"] });
    return () => observer.disconnect();
  }, []);
  const definition = getDefinition(pathname, context);
  const text = labels[locale];
  return <section className="page-help-current" aria-labelledby="page-help-current-title">
    <span className="eyebrow">{text.current}</span>
    <h3 id="page-help-current-title">{localize(definition.title, locale)}</h3>
    {context.timerRunning && <p className="page-help-current__timer" role="note">{text.timer}</p>}
    <ol>{definition.steps.map((item) => <li key={item.selector}><strong>{localize(item.title, locale)}</strong><p>{localize(item.text, locale)}</p></li>)}</ol>
  </section>;
}
