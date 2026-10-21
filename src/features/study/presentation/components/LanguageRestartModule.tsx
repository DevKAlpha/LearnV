import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import type { Locale } from "@/domain/models/i18n";
import type { TestLanguage } from "@/domain/models/language-test";
import { restartAnswerIsCorrect } from "@/domain/models/learning-restart";
import { restartLessons } from "@/infrastructure/data/learning-restart-lessons";
import { readRestartProgress, restartStorageKey, saveRestartLesson } from "@/infrastructure/data/learning-restart-progress";
import { learningRestartCopy } from "@/infrastructure/i18n/learning-restart-copy";
import { SceneArt } from "@/shared/ui/SceneArt";
import "@/styles/learning-restart.css";

/** Keyed by language in the parent: a language switch never reuses another draft. */
export function LanguageRestartModule({ language }: { language: TestLanguage }) {
  const { baseLocale, locale } = useI18n();
  const [helpLocale, setHelpLocale] = useState<Locale>(baseLocale ?? locale);
  const copy = learningRestartCopy[helpLocale];
  const lessons = restartLessons[language];
  const [completed, setCompleted] = useState(() => readRestartProgress(language));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, lessons.findIndex((lesson) => !completed.includes(lesson.id))));
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState(true);
  const heading = useRef<HTMLHeadingElement>(null);
  const methodHeading = useRef<HTMLHeadingElement>(null);
  const opening = useRef(false);
  const focusLesson = useRef(false);
  const id = useId();
  const lesson = lessons[active];
  const help = lesson.help[helpLocale];
  const correct = checked && restartAnswerIsCorrect(lesson.correctIndex, selected);
  const complete = completed.length === lessons.length;

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === null || event.key === restartStorageKey(language)) setCompleted(readRestartProgress(language));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [language]);
  useEffect(() => {
    if (open && focusLesson.current) {
      (opening.current ? methodHeading.current : heading.current)?.focus();
      opening.current = false; focusLesson.current = false;
    }
  }, [open, active]);

  const chooseLesson = (index: number) => {
    setActive(index); setSelected(null); setChecked(false); focusLesson.current = true;
  };
  const check = () => {
    if (selected === null) return;
    setChecked(true);
    if (restartAnswerIsCorrect(lesson.correctIndex, selected)) {
      const result = saveRestartLesson(language, lesson.id, completed);
      setCompleted(result.progress); setSaved(result.saved);
    }
  };

  return <section className={`learning-restart learning-restart--${language}`} lang={helpLocale} aria-labelledby={`${id}-title`}>
    <div className="learning-restart__cover">
      <div>
        <span className="eyebrow">{copy.kicker}</span>
        <h2 id={`${id}-title`}>{copy.title[language]}</h2>
        <p>{copy.intro}</p>
        <span className="learning-restart__level">{copy.level[language]}</span>
      </div>
      <div className="learning-restart__art"><SceneArt scene={language === "en" ? "reader" : "seoul"} /></div>
    </div>
    <div className="learning-restart__toolbar">
      <label>{copy.help}<select value={helpLocale} onChange={(event) => setHelpLocale(event.target.value as Locale)}>
        <option value="es">Español</option><option value="en">English</option><option value="ko">한국어</option>
      </select></label>
      <span className="learning-restart__progress"><progress max={lessons.length} value={completed.length} aria-label={copy.completed} /><b>{completed.length}/{lessons.length}</b> {copy.completed}</span>
      <button className="learning-restart__action" type="button" aria-expanded={open} aria-controls={`${id}-body`} onClick={() => { opening.current = !open; focusLesson.current = !open; setOpen(!open); }}>
        {open ? copy.close : complete ? copy.review : completed.length ? copy.resume : copy.start}<span aria-hidden="true">{open ? "−" : "→"}</span>
      </button>
    </div>
    <p className="learning-restart__scope">{copy.scope}</p>
    {open && <div id={`${id}-body`} className="learning-restart__body">
      <aside className="learning-restart__method" aria-labelledby={`${id}-method`}>
        <h3 id={`${id}-method`} ref={methodHeading} tabIndex={-1}>{copy.how}</h3>
        <ol>{copy.method.map((step) => <li key={step}>{step}</li>)}</ol>
      </aside>
      <nav className="learning-restart__lessons" aria-label={copy.lesson}>
        {lessons.map((item, index) => <button type="button" key={item.id} aria-current={active === index ? "step" : undefined} onClick={() => chooseLesson(index)}>
          <b>{completed.includes(item.id) ? "✓" : `0${index + 1}`}</b><span>{item.help[helpLocale].title}</span>
        </button>)}
      </nav>
      <div className="learning-restart__exercise">
        <span className="eyebrow">{copy.lesson} {active + 1}/{lessons.length}</span>
        <h3 ref={heading} tabIndex={-1}>{help.title}</h3>
        <p>{help.lesson}</p>
        <figure><figcaption>{copy.example}</figcaption><blockquote lang={language}>{lesson.example}</blockquote></figure>
        <fieldset><legend>{help.question}</legend>
          {lesson.options.map((option, index) => <label key={option} className={selected === index ? "is-selected" : ""}>
            <input type="radio" name={`${id}-answer`} checked={selected === index} onChange={() => { setSelected(index); setChecked(false); }} />
            <span lang={language}>{option}</span>
          </label>)}
        </fieldset>
        <button className="learning-restart__action" type="button" disabled={selected === null} onClick={check}>{copy.check}</button>
        {selected === null && <p className="learning-restart__scope">{copy.choose}</p>}
        <div role="status" aria-live="polite" aria-atomic="true">
          {checked && <div className={`learning-restart__feedback${correct ? " is-correct" : ""}`}>
            <strong>{correct ? copy.correct : copy.retry}</strong>
            <p>{help.feedback}</p>
            {correct && <><h4>{copy.apply}</h4><p>{help.transfer}</p></>}
          </div>}
        </div>
        {correct && active < lessons.length - 1 && <button className="learning-restart__action" type="button" onClick={() => chooseLesson(active + 1)}>{copy.next}<span aria-hidden="true">→</span></button>}
      </div>
      {complete && <div className="learning-restart__finish"><h3>{copy.done}</h3><p>{copy.doneText}</p><Link className="learning-restart__action" to={`/tests/${language}`}>{copy.path}<span aria-hidden="true">→</span></Link></div>}
      <p className="learning-restart__scope" role={saved ? undefined : "status"}>{saved ? copy.saved : copy.unsaved}</p>
    </div>}
  </section>;
}
