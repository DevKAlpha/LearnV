import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import type { CultureCaseId } from "@/domain/models/cultural-guide";
import { cultureCases, cultureSources, cultureStories } from "@/infrastructure/data/cultural-guide";
import { culturePreparationKey, readCulturePreparation, saveCulturePreparation } from "@/infrastructure/data/cultural-preparation";
import { culturalGuideCopy } from "@/infrastructure/i18n/cultural-guide-copy";
import "@/styles/cultural-guide.css";

export function CulturalGuide() {
  const { locale } = useI18n();
  const text = culturalGuideCopy[locale];
  const [active, setActive] = useState<CultureCaseId>("greetings");
  const [answers, setAnswers] = useState<Partial<Record<CultureCaseId, number>>>({});
  const [prepared, setPrepared] = useState(readCulturePreparation);
  const [saved, setSaved] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const heading = useRef<HTMLHeadingElement>(null);
  const focusRequested = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  const item = cultureCases.find((entry) => entry.id === active)!;
  const answer = answers[active];
  const related = cultureStories.find((story) => story.id === item.storyId);
  const emergencySource = cultureSources.find((source) => source.id === "spain")!;
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === null || event.key === culturePreparationKey) setPrepared(readCulturePreparation()); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const focusCase = () => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: "start", behavior: "auto" }); };
  useEffect(() => { if (focusRequested.current) { focusCase(); focusRequested.current = false; } }, [active]);
  const choose = (id: CultureCaseId) => {
    setCopyState("idle");
    if (id === active) { focusCase(); return; }
    focusRequested.current = true; setActive(id);
  };
  const togglePrepared = () => {
    const next = prepared.includes(active) ? prepared.filter((id) => id !== active) : [...prepared, active];
    setPrepared(next); setSaved(saveCulturePreparation(next));
  };
  const copyPhrase = async () => {
    const copying = active;
    try { await navigator.clipboard.writeText(item.phrase.ko); if (activeRef.current === copying) setCopyState("copied"); }
    catch { if (activeRef.current === copying) setCopyState("failed"); }
  };
  return <section className="cultural-guide" aria-labelledby="culture-guide-title">
    <header className="culture-guide-intro"><div><span className="eyebrow">ESPAÑA / 한국</span><h3 id="culture-guide-title">{text.title}</h3><p>{text.intro}</p></div><div className="culture-preparation-count"><span>{text.preparation}</span><strong aria-live="polite">{prepared.length}<small>/ {cultureCases.length}</small></strong><span>{text.progress}</span></div></header>
    <div className="culture-workspace">
      <nav className="culture-situations" aria-label={text.choose}>{cultureCases.map((entry, index) => <button type="button" key={entry.id} aria-pressed={active === entry.id} aria-controls="culture-case-panel" onClick={() => choose(entry.id)}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{entry.title[locale]}</strong>{prepared.includes(entry.id) && <small>{text.prepared} ✓</small>}</button>)}</nav>
      <article className={`culture-case culture-case--${active}`} id="culture-case-panel" aria-labelledby="culture-case-title">
        <header><span className="eyebrow">{text.selected} · {String(cultureCases.indexOf(item) + 1).padStart(2, "0")}</span><h4 ref={heading} id="culture-case-title" tabIndex={-1}>{item.title[locale]}</h4></header>
        <div className="culture-comparison"><div><b>ES</b><h5>{text.spain}</h5><p>{item.spain[locale]}</p></div><div><b>한</b><h5>{text.korea}</h5><p>{item.korea[locale]}</p></div></div>
        <div className="culture-actions"><h5>{text.actions}</h5><ol>{item.actions.map((action, index) => <li key={index}>{action[locale]}</li>)}</ol></div>
        <div className="culture-phrase"><div><span>{text.phrase}</span><p lang="ko">{item.phrase.ko}</p><small>{item.phrase.meaning[locale]}</small></div><button type="button" onClick={() => void copyPhrase()}>{copyState === "copied" ? text.copied : text.copy}</button>{copyState !== "idle" && <p className="culture-copy-status" role="status">{copyState === "copied" ? text.copied : text.copyFailed}</p>}</div>
        <fieldset className="culture-practice"><legend>{text.practice}</legend><p>{item.practice.prompt[locale]}</p><div>{item.practice.options.map((option, index) => <label key={`${active}-${index}`}><input type="radio" name={`culture-answer-${active}`} checked={answer === index} onChange={() => setAnswers((current) => ({ ...current, [active]: index }))} /><span>{option[locale]}</span></label>)}</div>{answer !== undefined && <div className={`culture-feedback${answer === item.practice.correct ? " culture-feedback--correct" : ""}`} role="status"><strong>{answer === item.practice.correct ? text.correct : text.reconsider}</strong><p>{item.practice.explanation[locale]}</p><small>{text.retry}</small></div>}<small className="culture-practice__scope">{text.simulation}</small></fieldset>
        <label className="culture-preparation-task"><input type="checkbox" checked={prepared.includes(active)} onChange={togglePrepared} /><span><strong>{item.preparation[locale]}</strong><small>{text.task}</small></span></label>
        <footer className="culture-case-sources">{related && <a href={`#culture-story-${related.id}`}>{text.relatedStory}: {related.person} ↓</a>}<div>{item.sourceIds.map((id) => { const source = cultureSources.find((entry) => entry.id === id)!; return <a key={id} href={source.url} target="_blank" rel="noopener noreferrer">{source.kind === "official" ? text.official : text.testimony} · {source.publisher} ↗</a>; })}</div></footer>
      </article>
    </div>
    <p className="culture-local-note">{text.local}</p>{!saved && <p role="status" className="culture-save-error">{text.unsaved}</p>}
    <section className="culture-stories" aria-labelledby="culture-stories-title"><header><span className="eyebrow">3 · {text.storiesKicker}</span><h3 id="culture-stories-title">{text.stories}</h3><p>{text.storiesIntro}</p></header><div>{cultureStories.map((story) => { const source = cultureSources.find((entry) => entry.id === story.sourceId)!; return <article id={`culture-story-${story.id}`} key={story.id}><span className="culture-story-mark" aria-hidden="true">{story.person.slice(0,1)}</span><h4>{story.person}</h4><small>{story.context[locale]}</small><p>{story.summary[locale]}</p><div className="culture-story-context">{source.context[locale]}</div><a href={source.url} target="_blank" rel="noopener noreferrer">{text.original} ↗</a></article>; })}</div></section>
    <aside className="culture-help" aria-labelledby="culture-help-title"><div><span className="eyebrow">{text.helpTitle}</span><h3 id="culture-help-title">{text.emergency}</h3><p>{text.helpText}</p><a href={emergencySource.url} target="_blank" rel="noopener noreferrer">{text.contacts} ↗</a></div><div className="culture-help-numbers"><p><strong>112</strong><span>{text.police}</span></p><p><strong>119</strong><span>{text.ambulance}</span></p><small>{text.helpNote}</small></div></aside>
    <details className="culture-source-register"><summary>{text.sources}</summary><p>{text.recommendation}</p><p>{text.currentRules}</p><ul>{cultureSources.map((source) => <li key={source.id}><span>{source.kind === "official" ? text.official : text.testimony}</span><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a><small>{source.publisher} · {text.checked}: <time dateTime={source.checkedAt}>{source.checkedAt}</time></small><p>{source.context[locale]}</p></li>)}</ul></details>
  </section>;
}
