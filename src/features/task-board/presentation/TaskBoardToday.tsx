import "@/styles/tailwind-study.css";
import { useRef } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { useBoardSuggestions } from "@/application/controllers/useDailyHabit";
import type { BoardCandidate } from "@/domain/models/board-plan";
import { MAX_BOARD_TASKS, todayBoardTasks, type BoardStatus, type BoardTask } from "@/domain/models/task-board";
import { dailyHabitCopy } from "@/infrastructure/i18n/daily-habit-copy";
import { gksProfileCopy } from "@/infrastructure/i18n/gks-profile-copy";
import { TaskNoteCard } from "./TaskNoteCard";

export type BoardView = "today" | "board";

// The board stylesheet styles every button; `board-primary` is its highlighted variant.
const pill = "min-h-11 cursor-pointer px-4 font-extrabold disabled:cursor-not-allowed disabled:opacity-60";

/** Switch between the board's "Today" view and the whole board. */
export function BoardViewSwitch({ view, onChange, todayCount }: { view: BoardView; onChange: (view: BoardView) => void; todayCount: number }) {
  const { locale } = useI18n();
  const copy = dailyHabitCopy[locale].board;
  return (
    <div className="my-2 flex flex-wrap gap-2" role="group" aria-label={`${copy.today} · ${copy.all}`}>
      <button type="button" aria-pressed={view === "today"} className={`${pill}${view === "today" ? " board-primary" : ""}`} onClick={() => onChange("today")}>
        {copy.today} <b>{todayCount}</b>
      </button>
      <button type="button" aria-pressed={view === "board"} className={`${pill}${view === "board" ? " board-primary" : ""}`} onClick={() => onChange("board")}>
        {copy.all}
      </button>
    </div>
  );
}

type Props = {
  tasks: BoardTask[];
  today: string;
  damaged: boolean;
  onAccept: (task: BoardTask) => boolean;
  onEdit: (task: BoardTask) => void;
  onMove: (id: string, status: BoardStatus) => void;
  onRemove: (task: BoardTask) => void;
};

/**
 * The board's "Today" view: what is due today or earlier and what is in progress, with
 * one-tap suggestions from the review queue, the GKS cycle and pending documents.
 */
export function TaskBoardToday({ tasks, today, damaged, onAccept, onEdit, onMove, onRemove }: Props) {
  const { locale, copy: app } = useI18n();
  const copy = dailyHabitCopy[locale].board;
  const actions = gksProfileCopy[locale].cycle.actions;
  const { candidates, dismiss } = useBoardSuggestions(tasks);
  const heading = useRef<HTMLHeadingElement>(null);
  const list = todayBoardTasks(tasks, today);
  const full = tasks.length >= MAX_BOARD_TASKS;
  const format = (date: string) => new Intl.DateTimeFormat({ es: "es-ES", en: "en-GB", ko: "ko-KR" }[locale], { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
  const documentLabel = (id: string) => (app.checklist.items as Record<string, { label: string } | undefined>)[id]?.label ?? id;

  const title = (candidate: BoardCandidate) => candidate.kind === "review" ? copy.reviewTask(candidate.count)
    : candidate.kind === "cycle" ? copy.cycleTask(actions[candidate.action].title)
    : copy.documentTask(documentLabel(candidate.documentId));

  const accept = (candidate: BoardCandidate) => {
    const now = Date.now();
    const added = onAccept({ id: candidate.id, title: title(candidate).slice(0, 100), area: candidate.area, status: "todo", dueDate: candidate.dueDate, createdAt: now, updatedAt: now });
    // The button disappears with the suggestion: keep focus inside the view.
    if (added) requestAnimationFrame(() => { if (!document.activeElement || document.activeElement === document.body) heading.current?.focus(); });
  };
  const setAside = (id: string) => {
    dismiss(id);
    requestAnimationFrame(() => heading.current?.focus());
  };

  return (
    <div className="grid gap-3 text-left text-fg">
      {list.length
        ? <div className="board-column__notes">{list.map((task) => <TaskNoteCard key={task.id} task={task} locale={locale} today={today} onEdit={onEdit} onMove={onMove} onRemove={onRemove} onDrag={() => {}} onDragEnd={() => {}} />)}</div>
        : <p className="m-0 rounded-2xl border-2 border-dashed border-edge p-3">{copy.todayEmpty}</p>}
      <section className="grid gap-2 rounded-3xl border-2 border-edge bg-paper p-3" aria-labelledby="board-suggestions-title">
        <h3 id="board-suggestions-title" ref={heading} tabIndex={-1} className="m-0 text-lg">{copy.suggestionsTitle}</h3>
        <p className="m-0 text-sm leading-relaxed">{copy.suggestionsIntro}</p>
        {candidates.length === 0 && <p className="m-0 text-sm">—</p>}
        <ul className="m-0 grid list-none gap-2 p-0">
          {candidates.map((candidate) => (
            <li key={candidate.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-current/25 px-3 py-2">
              <span className="grid">
                <small className="font-extrabold uppercase tracking-wide">{copy.reasons[candidate.kind]}</small>
                <strong>{title(candidate)}</strong>
                <small>{candidate.dueDate ? copy.due(format(candidate.dueDate)) : copy.noDate}</small>
              </span>
              <span className="flex flex-wrap gap-2">
                <button type="button" className={`${pill} board-primary`} disabled={damaged || full} aria-label={`${copy.accept}: ${title(candidate)}`} onClick={() => accept(candidate)}>{full ? copy.full : copy.accept}</button>
                <button type="button" className={pill} aria-label={`${copy.dismiss}: ${title(candidate)}`} onClick={() => setAside(candidate.id)}>{copy.dismiss}</button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
