import { useEffect, useState, type ComponentType } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { cultureEntryCopy } from "@/infrastructure/i18n/culture-entry-copy";
import "@/styles/cultural-entry.css";

const isCultureHash = (hash: string) => hash === "#gks-culture" || /^#culture-story-(sara|alba|hema)$/.test(hash);

/** Sources and exercises are requested only after opening this section. */
export function CulturalGuideEntry() {
  const { locale } = useI18n();
  const text = cultureEntryCopy[locale];
  const [open, setOpen] = useState(false);
  const [Guide, setGuide] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const reveal = () => { if (isCultureHash(window.location.hash)) setOpen(true); };
    reveal(); window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);
  useEffect(() => {
    if (!open || Guide) return;
    let cancelled = false;
    setFailed(false);
    import("./CulturalGuide").then((module) => { if (!cancelled) setGuide(() => module.CulturalGuide); }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [open, Guide, retry]);
  useEffect(() => {
    if (!open || !Guide || !isCultureHash(window.location.hash)) return;
    const frame = requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start", behavior: "auto" }));
    return () => cancelAnimationFrame(frame);
  }, [open, Guide]);
  return <details className="culture-entry" id="gks-culture" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary className="culture-entry__summary">
      <div><span className="eyebrow">{text.kicker}</span><h2>{text.title}</h2><p>{text.intro}</p><span className="culture-entry__cta">{open ? text.close : text.open}<b aria-hidden="true">{open ? "−" : "+"}</b></span></div>
      <div className="culture-entry__art"><img src={`${import.meta.env.BASE_URL}illustrations/storybook/cultural-bridge.svg`} width="320" height="200" alt="" loading="lazy" decoding="async" /><small>{text.badge}</small></div>
    </summary>
    {open && <div className="culture-entry__content">{Guide ? <Guide /> : <div className="culture-entry__loading" role={failed ? "alert" : "status"}><p>{failed ? text.error : text.loading}</p>{failed && <button type="button" onClick={() => setRetry((value) => value + 1)}>{text.retry}</button>}</div>}</div>}
  </details>;
}
