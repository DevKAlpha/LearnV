import { memo, useEffect, useRef, useState, type FormEvent } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { useTaskBoard } from "@/application/controllers/useTaskBoard";
import { boardAreas, boardStatuses, cleanTaskTitle, getBoardSuggestions, localBoardDate, MAX_TASK_TITLE, taskInputIssue, type BoardArea, type BoardIssue, type BoardStatus, type BoardTask, type TaskInput } from "@/domain/models/task-board";
import { taskBoardCopy } from "@/infrastructure/i18n/task-board-copy";
import { TaskNoteCard } from "./TaskNoteCard";
import { TaskNoteArt } from "./TaskNoteArt";
import { TaskBoardCopies } from "./TaskBoardCopies";
import { taskInputFromForm } from "./task-board-editor";
import "@/styles/task-board.css";

type Editor = TaskInput & { id: string | null; expectedUpdatedAt: number; showDate: boolean };
type Notice = { kind: "created" | "updated" | "moved" | "restored" | "imported"; title?: string; status?: BoardStatus };
export const TaskBoardPanel = memo(function TaskBoardPanel({ active }: { active: boolean }) {
  const { locale } = useI18n(); const text = taskBoardCopy[locale]; const board = useTaskBoard();
  const [editor, setEditor] = useState<Editor | null>(null); const [validation, setValidation] = useState<BoardIssue | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null); const [uiIssue, setUiIssue] = useState<BoardIssue | null>(null);
  const [removed, setRemoved] = useState<{ task: BoardTask; index: number } | null>(null);
  const [query, setQuery] = useState(""); const [area, setArea] = useState<BoardArea | "all">("all"); const [column, setColumn] = useState<BoardStatus>("todo");
  const [now, setNow] = useState(Date.now); const [dragging, setDragging] = useState<string | null>(null); const [over, setOver] = useState<BoardStatus | null>(null);
  const container = useRef<HTMLDivElement>(null); const titleInput = useRef<HTMLInputElement>(null); const addButton = useRef<HTMLButtonElement>(null); const pendingFocus = useRef<string | null>(null); const dragId = useRef<string | null>(null);
  const today = localBoardDate(new Date(now)); const tasks = board.board.tasks;
  const normalizedQuery = query.normalize("NFKC").trim().toLowerCase();
  const visible = tasks.filter((task) => (area === "all" || task.area === area) && `${task.title} ${text.areas[task.area]}`.normalize("NFKC").toLowerCase().includes(normalizedQuery));
  const filtered = !!query.trim() || area !== "all"; const suggestions = getBoardSuggestions(tasks, today, now); const issue = uiIssue ?? board.issue;
  const editorOpen = !!editor;
  useEffect(() => {
    if (filtered && !visible.some((task) => task.status === column) && visible[0]) setColumn(visible[0].status);
    // Only when the filter changes: re-running on column changes would undo the person's own column choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, area, locale]);
  useEffect(() => {
    if (!active) { dragId.current = null; setDragging(null); setOver(null); return; }
    setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer);
  }, [active]);
  useEffect(() => { if (editorOpen && active) titleInput.current?.focus(); }, [editorOpen, active]);
  useEffect(() => {
    if (!active || editorOpen || !pendingFocus.current) return;
    const target = document.getElementById(`board-task-${pendingFocus.current}`);
    if (target?.getClientRects().length) { target.focus({ preventScroll: true }); target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" }); pendingFocus.current = null; }
  }, [tasks, active, editorOpen, column, area, query]);
  const closeMenus = (except?: HTMLDetailsElement) => { container.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((details) => { if (details !== except) details.open = false; }); };
  const resetFilters = () => { setQuery(""); setArea("all"); };
  const reveal = (task: BoardTask) => { resetFilters(); setColumn(task.status); pendingFocus.current = task.id; closeMenus(); };
  const openEditor = (task?: BoardTask) => {
    setValidation(null); setUiIssue(null); closeMenus();
    setEditor(task ? { id: task.id, title: task.title, area: task.area, dueDate: task.dueDate, expectedUpdatedAt: task.updatedAt, showDate: !!task.dueDate } : { id: null, title: "", area: "korean", dueDate: null, expectedUpdatedAt: 0, showDate: false });
  };
  const addTask = (input: TaskInput) => {
    const timestamp = Date.now(); const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${timestamp.toString(36)}-${Math.random().toString(36).slice(2,12)}`;
    const task: BoardTask = { ...input, title: cleanTaskTitle(input.title), id, status: "todo", createdAt: timestamp, updatedAt: timestamp };
    if (!board.commit({ type: "add", task })) return false;
    setNotice({ kind: "created", title: task.title }); setUiIssue(null); reveal(task); return true;
  };
  const saveEditor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!editor) return;
    const input = taskInputFromForm(editor, new FormData(event.currentTarget));
    const error = taskInputIssue(input); if (error) { setValidation(error); return; }
    if (editor.id === null) { if (addTask(input)) setEditor(null); }
    else if (board.commit({ type: "edit", id: editor.id, input, expectedUpdatedAt: editor.expectedUpdatedAt })) {
      const task = tasks.find((task) => task.id === editor.id); if (task) reveal(task);
      setNotice({ kind: "updated", title: cleanTaskTitle(input.title) }); setUiIssue(null); setEditor(null);
    }
  };
  const move = (id: string, status: BoardStatus) => {
    const task = tasks.find((task) => task.id === id); if (!task || task.status === status) return;
    if (board.commit({ type: "move", id, status })) { reveal({ ...task, status }); setNotice({ kind: "moved", title: task.title, status }); setUiIssue(null); }
  };
  const remove = (task: BoardTask) => {
    if (board.commit({ type: "remove", id: task.id })) { setRemoved({ task, index: tasks.findIndex((item) => item.id === task.id) }); setNotice(null); setUiIssue(null); addButton.current?.focus(); }
  };
  const undo = () => { if (removed && board.commit({ type: "restore", task: removed.task, index: removed.index })) { reveal(removed.task); setRemoved(null); setNotice({ kind: "restored" }); setUiIssue(null); } };
  const clearDrag = () => { dragId.current = null; setDragging(null); setOver(null); };
  return <div className="task-board" ref={container}>
    <div className="board-toolbar">
      <div className="board-heading"><h2>{text.title}</h2><p>{text.intro}</p></div>
      {!editor && <div className="board-toolbar__actions"><button className="board-primary" ref={addButton} type="button" disabled={board.damaged} onClick={() => openEditor()}><span aria-hidden="true">＋</span>{text.add}</button>
        <details className="board-filter board-menu" onToggle={(event) => { if (event.currentTarget.open) closeMenus(event.currentTarget); }}><summary>{text.filters}{filtered && <b aria-hidden="true"> •</b>}</summary><div className="board-popover"><label>{text.search}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>{text.area}<select value={area} onChange={(event) => setArea(event.target.value as BoardArea | "all")}><option value="all">{text.allAreas}</option>{boardAreas.map((value) => <option key={value} value={value}>{text.areas[value]}</option>)}</select></label><button type="button" onClick={resetFilters}>{text.reset}</button><button type="button" onClick={(event) => { const details = event.currentTarget.closest("details"); if (details) { details.open = false; details.querySelector("summary")?.focus(); } }}>{text.closeMenu}</button></div></details>
        <TaskBoardCopies locale={locale} board={board.board} raw={board.raw} damaged={board.damaged} restore={board.restore} onIssue={setUiIssue} onOpen={closeMenus} onRestored={() => { setRemoved(null); resetFilters(); setColumn("todo"); closeMenus(); setUiIssue(null); setNotice({ kind: "imported" }); }} />
      </div>}
    </div>
    {issue && <p className="board-issue" role="alert">{text.issues[issue]}</p>}
    <div className="board-announcement" role="status" aria-live="polite">{notice && <span>{text[notice.kind]} {notice.title}{notice.status ? ` · ${text.statuses[notice.status]}` : ""}</span>}{removed && <span className="board-undo"><span>{text.deleted} {removed.task.title}</span><button type="button" onClick={undo}>{text.undo}</button></span>}</div>
    {editor ? <div className="board-editor-scroll"><form className="board-editor" onSubmit={saveEditor} noValidate><span className="eyebrow">{editor.id === null ? text.add : text.editTitle}</span><label>{text.task}<input ref={titleInput} type="text" maxLength={MAX_TASK_TITLE} value={editor.title} placeholder={text.placeholder} aria-required="true" aria-invalid={validation === "title"} aria-describedby="board-title-count" onChange={(event) => { setEditor({ ...editor, title: event.target.value }); setValidation(null); }} /></label><small id="board-title-count">{editor.title.length}/{MAX_TASK_TITLE} {text.count}</small><label>{text.area}<select value={editor.area} onChange={(event) => setEditor({ ...editor, area: event.target.value as BoardArea })}>{boardAreas.map((value) => <option key={value} value={value}>{text.areas[value]}</option>)}</select></label><label className="board-date-toggle"><input type="checkbox" checked={editor.showDate} onChange={(event) => setEditor({ ...editor, showDate: event.target.checked, dueDate: event.target.checked ? editor.dueDate : null })} />{text.optionalDate}</label>{editor.showDate && <label>{text.date}<input type="date" name="dueDate" value={editor.dueDate ?? ""} aria-invalid={validation === "date"} onChange={(event) => { setEditor({ ...editor, dueDate: event.target.value || null }); setValidation(null); }} /></label>}{validation && <p role="alert" className="board-editor-error">{text.issues[validation]}</p>}<div className="board-editor__actions"><button type="submit" className="board-primary" disabled={board.damaged}>{editor.id === null ? text.create : text.save}</button><button type="button" onClick={() => { setEditor(null); setValidation(null); setUiIssue(null); if (board.issue === "stale" || board.issue === "missing") board.clearIssue(); requestAnimationFrame(() => addButton.current?.focus()); }}>{text.cancel}</button></div><p className="board-draft-note">{text.draft}</p></form></div> : <>
      <details className="board-coach" onToggle={(event) => { if (event.currentTarget.open) closeMenus(event.currentTarget); }}><summary><span aria-hidden="true">✦</span><span>{text.coach}<strong>{text.suggestions[suggestions[0].kind][0]}</strong></span><b aria-hidden="true">＋</b></summary><div className="board-coach__content"><p>{text.coachScope}</p><div>{suggestions.map((suggestion) => {
        const target = tasks.find((task) => task.id === suggestion.taskId); const copy = text.suggestions[suggestion.kind];
        return <article key={suggestion.kind}><h3>{copy[0]}</h3><p>{copy[1].replace("{count}", String(suggestion.count))}</p>{target && <strong className="board-coach__task">{target.title}</strong>}{target && <button type="button" onClick={() => { if (suggestion.kind === "next") move(target.id,"doing"); else openEditor(target); }}>{suggestion.kind === "next" ? text.start : text.review}</button>}{suggestion.kind === "focus" && <button type="button" onClick={() => { resetFilters(); setColumn("doing"); const first = tasks.find((task) => task.status === "doing"); if (first) pendingFocus.current = first.id; closeMenus(); }}>{text.seeDoing}</button>}{suggestion.kind === "connect" && <button type="button" disabled={board.damaged} onClick={() => addTask({ title: text.templates.korean, area: "korean", dueDate: null })}>{text.addIdea}</button>}{suggestion.kind === "complete" && <button type="button" onClick={() => openEditor()}>{text.add}</button>}</article>;
      })}</div></div></details>
      {filtered && <div className="board-filter-state"><span>{visible.length} {text.of} {tasks.length} {text.notes}{!visible.length ? ` · ${text.noMatches}` : ""}</span><button type="button" onClick={resetFilters}>{text.reset}</button></div>}
      {tasks.length === 0 ? <div className="board-welcome"><div className="board-welcome__art"><TaskNoteArt /><span aria-hidden="true">한 걸음<br />One step</span></div><h2>{text.empty}</h2><p>{text.emptyIntro}</p><div className="board-starters">{boardAreas.map((value) => <button key={value} type="button" disabled={board.damaged} aria-label={`${text.addIdea}: ${text.templates[value]}`} onClick={() => addTask({ title: text.templates[value], area: value, dueDate: null })}><small>{text.areas[value]}</small><strong>{text.templates[value]}</strong><span aria-hidden="true">＋</span></button>)}</div></div> : <>
        <div className="board-column-tabs" role="group" aria-label={text.columns}>{boardStatuses.map((status) => <button key={status} type="button" aria-pressed={column === status} onClick={() => setColumn(status)}>{text.statuses[status]}<b>{visible.filter((task) => task.status === status).length}</b></button>)}</div>
        <div className="board-workspace" data-dragging={!!dragging}>{boardStatuses.map((status) => {
          const lane = visible.filter((task) => task.status === status); const total = tasks.filter((task) => task.status === status).length;
          return <section className={`board-column board-column--${status}`} key={status} data-active={column === status} data-over={over === status} aria-label={text.statuses[status]} onDragOver={(event) => { if (dragId.current) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setOver(status); } }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(null); }} onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain"); if (id && id === dragId.current) move(id,status); clearDrag(); }}><header><h2>{text.statuses[status]}</h2><span aria-label={`${lane.length} ${text.visible} ${text.of} ${total}`}>{filtered ? `${lane.length}/${total}` : total}</span></header><div className="board-column__notes">{lane.length ? lane.map((task) => <TaskNoteCard key={task.id} task={task} locale={locale} today={today} onEdit={openEditor} onMove={move} onRemove={remove} onDrag={(id) => { dragId.current = id; setDragging(id); }} onDragEnd={clearDrag} />) : <p className="board-column-empty">{text.emptyLane}</p>}</div></section>;
        })}</div>
      </>}
    </>}
    <footer className="board-save-state">{board.unsaved || board.issue === "unavailable" ? text.unsaved : board.damaged ? text.issues.invalid : text.local}</footer>
  </div>;
});
