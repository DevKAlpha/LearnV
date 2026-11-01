import { boardStatuses, isBoardTaskOverdue, type BoardTask, type BoardStatus } from "@/domain/models/task-board";
import type { Locale } from "@/domain/models/i18n";
import { taskBoardCopy } from "@/infrastructure/i18n/task-board-copy";
import { TaskNoteArt } from "./TaskNoteArt";

export function TaskNoteCard({ task, locale, today, onEdit, onMove, onRemove, onDrag, onDragEnd }: {
  task: BoardTask; locale: Locale; today: string;
  onEdit: (task: BoardTask) => void; onMove: (id: string, status: BoardStatus) => void; onRemove: (task: BoardTask) => void;
  onDrag: (id: string) => void; onDragEnd: () => void;
}) {
  const text = taskBoardCopy[locale];
  const next = task.status === "todo" ? "doing" : "done";
  const dueLabel = task.dueDate ? new Intl.DateTimeFormat({ es: "es-ES", en: "en-GB", ko: "ko-KR" }[locale], { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${task.dueDate}T12:00:00`)) : text.noDate;
  return <article className={`task-note task-note--${task.area}${task.status === "done" ? " task-note--done" : ""}`} aria-labelledby={`board-task-${task.id}`}>
    <TaskNoteArt />
    <div className="task-note__content">
      <div className="task-note__top"><span>{text.areas[task.area]}</span><span className="task-note__handle" draggable title={text.drag} aria-hidden="true" onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", task.id); onDrag(task.id); }} onDragEnd={onDragEnd}>⠿</span></div>
      <h3 id={`board-task-${task.id}`} tabIndex={-1}>{task.title}</h3>
      <div className="task-note__date">{task.dueDate ? <time dateTime={task.dueDate}>{dueLabel}</time> : <span>{dueLabel}</span>}{isBoardTaskOverdue(task, today) && <strong>{text.overdue}</strong>}{task.status !== "done" && task.dueDate === today && <strong>{text.today}</strong>}</div>
      <div className="task-note__move"><label><span>{text.move}</span><select aria-label={`${text.move}: ${task.title}`} value={task.status} onChange={(event) => onMove(task.id, event.target.value as BoardStatus)}>{boardStatuses.map((status) => <option key={status} value={status}>{text.statuses[status]}</option>)}</select></label>{task.status !== "done" && <button type="button" onClick={() => onMove(task.id, next)} aria-label={`${task.status === "todo" ? text.start : text.finish}: ${task.title}`}>{task.status === "todo" ? text.start : text.finish}<span aria-hidden="true">→</span></button>}</div>
      <footer><button type="button" onClick={() => onEdit(task)} aria-label={`${text.edit}: ${task.title}`}>{text.edit}</button><button type="button" onClick={() => onRemove(task)} aria-label={`${text.remove}: ${task.title}`}>{text.remove}</button></footer>
    </div>
  </article>;
}
