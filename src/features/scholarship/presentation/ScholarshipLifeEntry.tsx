import { useEffect, useState, type ComponentType } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { scholarshipLifeEntryCopy } from "@/infrastructure/i18n/scholarship-life-entry-copy";
import "@/styles/cultural-entry.css";

export function ScholarshipLifeEntry() {
  const { locale } = useI18n();
  const text = scholarshipLifeEntryCopy[locale];
  const [open, setOpen] = useState(false);
  const [Guide, setGuide] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const reveal = () => { if (window.location.hash === "#gks-life") setOpen(true); };
    reveal(); window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);
  useEffect(() => {
    if (!open || Guide) return;
    let cancelled = false;
    setFailed(false);
    import("./ScholarshipLifeGuide").then((module) => { if (!cancelled) setGuide(() => module.ScholarshipLifeGuide); }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [open, Guide, retry]);
  return <details className="culture-entry scholarship-life-entry" id="gks-life" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary className="culture-entry__summary">
      <div><span className="eyebrow">{text.kicker}</span><h2>{text.title}</h2><p>{text.intro}</p><span className="culture-entry__cta">{open ? text.close : text.open}<b aria-hidden="true">{open ? "−" : "+"}</b></span></div>
      <div className="culture-entry__art"><img src={`${import.meta.env.BASE_URL}illustrations/storybook/scholarship-journey.svg`} width="320" height="200" alt="" loading="lazy" decoding="async" /><small>{text.badge}</small></div>
    </summary>
    {open && <div className="culture-entry__content">{Guide ? <Guide /> : <div className="culture-entry__loading" role={failed ? "alert" : "status"}><p>{failed ? text.error : text.loading}</p>{failed && <button type="button" onClick={() => setRetry((value) => value + 1)}>{text.retry}</button>}</div>}</div>}
  </details>;
}
