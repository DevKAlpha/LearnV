import "@/styles/tailwind-study.css";
import { useDeferredValue, useId, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { useWritingLab } from "@/application/controllers/useWritingLab";
import { analyzeWriting, improvedChecks } from "@/domain/models/writing-feedback";
import { writingLabTasks, type ChartData, type WritingLabTask } from "@/infrastructure/data/writing-lab-tasks";
import { writingLabCopy } from "@/infrastructure/i18n/writing-lab-copy";
import { PageEmblem } from "@/shared/ui/PageEmblem";
import { WritingFeedbackPanel } from "../components/WritingFeedbackPanel";

type Copy = (typeof writingLabCopy)[keyof typeof writingLabCopy];

const panel = "grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-fg";
const button = "min-h-11 cursor-pointer rounded-full border-2 px-5 py-2 font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-50";

/** The chart as a data table with proportional bars: readable by screen readers as a table. */
function ChartTable({ chart, copy, locale }: { chart: ChartData; copy: Copy; locale: "es" | "en" | "ko" }) {
  const max = Math.max(...chart.series.flatMap((series) => series.values));
  return (
    <figure className="m-0 grid gap-2">
      <figcaption className="font-extrabold">{chart.title} ({chart.unit})</figcaption>
      <table className="w-full border-collapse text-left text-[0.95rem]">
        <caption className="sr-only">{copy.chartTable}</caption>
        <thead><tr><th className="p-1.5" scope="col"><span className="sr-only">{chart.title}</span></th>{chart.series.map((series) => <th key={series.label} className="p-1.5" scope="col">{series.label}</th>)}</tr></thead>
        <tbody>
          {chart.categories.map((category, index) => (
            <tr key={category} className="border-t border-current/25">
              <th className="p-1.5 font-bold" scope="row">{category}</th>
              {chart.series.map((series, seriesIndex) => (
                <td key={series.label} className="p-1.5">
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className={`block h-3 rounded-full border border-edge ${seriesIndex === 0 ? "bg-accent" : "bg-brand"}`} style={{ width: `${(series.values[index] / max) * 7}rem` }} />
                    <span>{series.values[index]}</span>
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <small>{locale === "es" ? chart.note.es : chart.note.en}</small>
    </figure>
  );
}

function TaskWorkspace({ task, copy, locale }: { task: WritingLabTask; copy: Copy; locale: "es" | "en" | "ko" }) {
  const id = useId();
  const { entry, setDraft, saveVersion } = useWritingLab(task.id);
  const deferred = useDeferredValue(entry.draft);
  const target = useMemo(() => ({ language: task.language, format: task.format, minimum: task.minimum, maximum: task.maximum, targetGrammar: task.targetGrammar }), [task]);
  const analysis = useMemo(() => analyzeWriting(deferred, target), [deferred, target]);
  const previous = entry.versions.at(-1);
  const improved = useMemo(() => previous === undefined ? [] : improvedChecks(analyzeWriting(previous, target), analysis), [previous, analysis, target]);
  const unit = task.language === "en" ? copy.words : copy.characters;
  const pick = (value: { es: string; en: string }) => locale === "es" ? value.es : value.en;
  const enough = task.language === "en" ? analysis.units >= 15 : analysis.units >= (task.minimum < 100 ? 4 : 40);

  return (
    <article className={panel} aria-labelledby={`${id}-title`}>
      <p className="m-0 flex flex-wrap gap-x-3 gap-y-1 text-sm font-extrabold uppercase tracking-wide">
        <span>{task.exam}</span><span>{task.minutes} {copy.minutes}</span><span>{copy.length(task.minimum, task.maximum, unit)}</span>
      </p>
      <h2 id={`${id}-title`} className="m-0 text-[clamp(1.25rem,4vw,1.6rem)] leading-tight">{pick(task.title)}</h2>
      <p className="m-0 font-bold leading-relaxed" lang={task.language}>{task.prompt}</p>
      {task.context && <blockquote className="m-0 whitespace-pre-line rounded-2xl border-l-4 border-edge bg-cream p-3 leading-relaxed" lang={task.language}>{task.context}</blockquote>}
      {task.chart && <ChartTable chart={task.chart} copy={copy} locale={locale} />}
      <details className="rounded-2xl border-2 border-current/30 p-3">
        <summary className="cursor-pointer font-extrabold">{copy.outline}</summary>
        <ol className="mb-0 mt-2 grid gap-1 pl-5">{task.outline.map((step) => <li key={step.en}>{pick(step)}</li>)}</ol>
      </details>

      <label htmlFor={`${id}-draft`} className="font-extrabold">{copy.draft}</label>
      <textarea
        id={`${id}-draft`}
        lang={task.language}
        className="min-h-56 w-full resize-y rounded-2xl border-2 border-edge bg-paper p-3 text-base leading-relaxed text-fg"
        value={entry.draft}
        aria-describedby={`${id}-count`}
        onChange={(event) => setDraft(event.target.value)}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span id={`${id}-count`} className="text-sm font-bold">{analysis.units} / {copy.length(task.minimum, task.maximum, unit)}</span>
        <span className="flex flex-wrap items-center gap-2">
          {entry.versions.length > 0 && <small>{copy.saved(entry.versions.length)}</small>}
          <button type="button" className={`${button} border-ink bg-accent text-ink`} disabled={!entry.draft.trim() || previous === entry.draft} onClick={saveVersion}>{copy.save}</button>
        </span>
      </div>
      <small>{copy.privacy}</small>

      {enough
        ? <WritingFeedbackPanel analysis={analysis} minimum={task.minimum} maximum={task.maximum} targetGrammar={task.targetGrammar} improved={improved} />
        : <p className="m-0 text-sm" role="status">{copy.feedbackHint}</p>}

      {task.model && (
        <details className="rounded-2xl border-2 border-current/30 p-3">
          <summary className="cursor-pointer font-extrabold">{copy.model}</summary>
          <p className="mb-0 mt-2 whitespace-pre-line" lang={task.language}>{task.model}</p>
        </details>
      )}
    </article>
  );
}

export function WritingLabPage() {
  const { locale } = useI18n();
  const copy = writingLabCopy[locale];
  const [params, setParams] = useSearchParams();
  const task = writingLabTasks.find((candidate) => candidate.id === params.get("task")) ?? writingLabTasks[0];

  return (
    <div className="page page--writing-lab">
      <header className="page-header">
        <PageEmblem icon="writing" />
        <span className="eyebrow">{copy.kicker}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>

      <div className="grid gap-4">
        <nav aria-label={copy.choose} className="flex flex-wrap gap-2">
          {writingLabTasks.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={candidate.id === task.id}
              className={`${button} ${candidate.id === task.id ? "border-ink bg-accent text-ink" : "border-edge bg-paper text-fg"}`}
              onClick={() => setParams({ task: candidate.id }, { replace: true })}
            >
              {candidate.exam}
            </button>
          ))}
        </nav>
        <TaskWorkspace key={task.id} task={task} copy={copy} locale={locale} />
        <p className="m-0 text-sm">{copy.disclaimer}</p>
      </div>
    </div>
  );
}
