import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import type { ScholarshipLifeId, ScholarshipStage } from "@/domain/models/scholarship-life";
import { scholarshipLifeCases, scholarshipLifeSources, scholarshipLifeReviewedAt, scholarshipStages } from "@/infrastructure/data/scholarship-life";
import { readScholarshipPreparation, saveScholarshipPreparation, scholarshipPreparationKey } from "@/infrastructure/data/scholarship-life-preparation";
import { scholarshipLifeCopy } from "@/infrastructure/i18n/scholarship-life-copy";
import "@/styles/scholarship-life.css";
import { copyText } from "@/shared/browser/copy-text";

export function ScholarshipLifeGuide() {
  const { locale } = useI18n();
  const text = scholarshipLifeCopy[locale];
  const [stage, setStage] = useState<ScholarshipStage>("arrival");
  const [active, setActive] = useState<ScholarshipLifeId>("residence");
  const [prepared, setPrepared] = useState(readScholarshipPreparation);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [copied, setCopied] = useState<boolean | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const selectionChanged = useRef(false);
  const clipboardRequest = useRef(0);
  const item = scholarshipLifeCases.find((entry) => entry.id === active)!;
  const currentStage = scholarshipStages.find((entry) => entry.id === stage)!;
  const template = `${text.templateIntro}\n\n${item.question[locale]}\n\n${text.templateEnd}`;

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === scholarshipPreparationKey || event.key === null) { setPrepared(readScholarshipPreparation()); setSaved(null); }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    clipboardRequest.current += 1;
    setCopied(null);
    if (!selectionChanged.current) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [active, locale]);
  useEffect(() => () => { clipboardRequest.current += 1; }, []);

  function selectCase(id: ScholarshipLifeId) { selectionChanged.current = true; setActive(id); }
  function selectStage(id: ScholarshipStage) {
    if (id === stage) return;
    setStage(id); selectCase(scholarshipLifeCases.find((entry) => entry.stage === id)!.id);
  }
  function togglePrepared() {
    const next = prepared.includes(active) ? prepared.filter((id) => id !== active) : [...prepared, active];
    setPrepared(next); setSaved(saveScholarshipPreparation(next));
  }
  async function copyOutline() {
    const request = ++clipboardRequest.current;
    try { await copyText(template); if (request === clipboardRequest.current) setCopied(true); }
    catch { if (request === clipboardRequest.current) setCopied(false); }
  }

  return <section className="scholarship-life" aria-labelledby="scholarship-life-title">
    <header className="scholarship-life__intro">
      <div><span className="eyebrow">GKS · 2026 → 2027</span><h3 id="scholarship-life-title">{text.title}</h3><p>{text.intro}</p></div>
      <div className="scholarship-life__count"><strong>{prepared.length}<small> / {scholarshipLifeCases.length}</small></strong><span>{text.count}</span></div>
    </header>
    <aside className="scholarship-life__scope"><p>{text.scope}</p><small>{text.version} · {text.reviewed}: <time dateTime={scholarshipLifeReviewedAt}>{scholarshipLifeReviewedAt}</time></small></aside>
    <nav className="scholarship-life__stages" aria-label={text.stages}>{scholarshipStages.map((entry, index) => <button key={entry.id} type="button" aria-pressed={entry.id === stage} aria-controls="scholarship-life-workspace" onClick={() => selectStage(entry.id)}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{entry.title[locale]}</button>)}</nav>
    <p className="scholarship-life__habit"><strong>{text.habit} · </strong>{currentStage.habit[locale]}</p>
    <div id="scholarship-life-workspace" className="scholarship-life__workspace">
      <nav className="scholarship-life__situations" aria-label={text.situations}>{scholarshipLifeCases.filter((entry) => entry.stage === stage).map((entry) => <button key={entry.id} type="button" aria-pressed={active === entry.id} aria-controls="scholarship-life-case" onClick={() => selectCase(entry.id)}><span aria-hidden="true">{prepared.includes(entry.id) ? "✓" : "◇"}</span>{entry.title[locale]}</button>)}</nav>
      <article className="scholarship-life__case" id="scholarship-life-case" aria-labelledby="scholarship-life-case-title">
        <header><span className="eyebrow">{currentStage.title[locale]}</span><h4 id="scholarship-life-case-title" tabIndex={-1} ref={heading}>{item.title[locale]}</h4><p>{item.situation[locale]}</p></header>
        <div className="scholarship-life__rule"><h5>{text.rule}</h5><p>{item.rule[locale]}</p><ul className="scholarship-life__references">{item.references.map((ref) => <li key={ref.source}><a target="_blank" rel="noopener noreferrer" href={scholarshipLifeSources[ref.source].url}>{scholarshipLifeSources[ref.source].title} ↗</a><small>{ref.section}</small></li>)}</ul></div>
        <div className="scholarship-life__actions"><h5>{text.actions}</h5><ol>{item.actions.map((action, index) => <li key={index}>{action[locale]}</li>)}</ol></div>
        <details className="scholarship-life__recovery" key={item.id}><summary>{text.resolve}<span aria-hidden="true">＋</span></summary><div><h5>{text.recovery}</h5><p>{item.recovery[locale]}</p></div></details>
        <div className="scholarship-life__contact"><span className="eyebrow">{text.contact}</span><p><strong>{item.contact[locale]}</strong></p><h5>{text.ask}</h5><p>{item.question[locale]}</p>
          <details><summary>{text.template}</summary><label className="sr-only" htmlFor="scholarship-life-outline">{text.template}</label><textarea id="scholarship-life-outline" value={template} readOnly rows={7} /><button type="button" onClick={() => void copyOutline()}>{text.copy} <span aria-hidden="true">↗</span></button>{copied !== null && <p role="status">{copied ? text.copied : text.copyFailed}</p>}</details>
        </div>
        <label className="scholarship-life__check"><input type="checkbox" checked={prepared.includes(active)} onChange={togglePrepared} /><span>{text.prepared}</span></label>
        {saved !== null && <p role="status" className="scholarship-life__save-status">{saved ? text.saved : text.unsaved}</p>}
      </article>
    </div>
    <p className="scholarship-life__privacy">{text.local}</p>
    <aside className="scholarship-life__help"><h4>{text.helpTitle}</h4><p>{text.helpText}</p></aside>
    <details className="scholarship-life__sources"><summary>{text.sources}</summary><p>{text.sourcesIntro}</p><ul>{Object.entries(scholarshipLifeSources).map(([id, source]) => <li key={id}><a target="_blank" rel="noopener noreferrer" href={source.url}>{source.title} ↗</a><p>{source.note[locale]}</p></li>)}</ul><a target="_blank" rel="noopener noreferrer" href="https://www.dongguk.edu/article/INTSTUNOTICE/detail/26763761">{text.revision}</a></details>
    <details className="scholarship-life__sources"><summary>{text.limits}</summary><p>{text.limitsText}</p></details>
  </section>;
}
