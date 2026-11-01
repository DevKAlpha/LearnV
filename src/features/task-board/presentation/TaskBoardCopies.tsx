import { useRef, useState } from "react";
import type { Locale } from "@/domain/models/i18n";
import { localBoardDate, parseTaskBoard, type BoardIssue, type TaskBoard } from "@/domain/models/task-board";
import { readTaskBoardBackup } from "@/infrastructure/data/task-board-storage";
import { taskBoardCopy } from "@/infrastructure/i18n/task-board-copy";

export function TaskBoardCopies({ board, raw, damaged, locale, restore, onIssue, onRestored, onOpen }: {
  board: TaskBoard; raw: string | null; damaged: boolean; locale: Locale;
  restore: (board: TaskBoard) => boolean; onIssue: (issue: BoardIssue | null) => void; onRestored: () => void; onOpen: (details: HTMLDetailsElement) => void;
}) {
  const text = taskBoardCopy[locale]; const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<TaskBoard | null>(null); const [noPrevious, setNoPrevious] = useState(false);
  const download = () => {
    const content = damaged && !board.tasks.length && raw !== null ? raw : JSON.stringify(board, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `learnv-tablero-${localBoardDate(new Date())}.json`;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <details className="board-copies board-menu" onToggle={(event) => { if (event.currentTarget.open) onOpen(event.currentTarget); }}>
    <summary>{text.copies}</summary><div className="board-popover">
      <p>{text.privacy}</p><p>{text.dragHelp}</p>
      <div className="board-copy-actions"><button type="button" onClick={download}>{text.export}</button><button type="button" onClick={() => fileInput.current?.click()}>{text.import}</button><button type="button" onClick={() => { onIssue(null); const previous = readTaskBoardBackup(); setPending(previous); setNoPrevious(!previous); }}>{text.previous}</button></div>
      <input ref={fileInput} type="file" accept=".json,application/json" aria-label={text.import} tabIndex={-1} hidden onChange={async (event) => {
        const file = event.currentTarget.files?.[0]; event.currentTarget.value = "";
        if (!file) return;
        setNoPrevious(false); setPending(null); onIssue(null);
        try { if (file.size > 512000) { onIssue("file"); return; } const parsed = parseTaskBoard(await file.text()); if (!parsed) onIssue("file"); else setPending(parsed); }
        catch { onIssue("file"); }
      }} />
      {noPrevious && <p role="status">{text.noPrevious}</p>}
      {pending && <section className="board-restore-preview" aria-label={text.preview}><h3>{text.preview}</h3><strong>{pending.tasks.length} {text.notes}</strong><p>{text.replaceNote}</p><div><button type="button" onClick={() => { if (restore(pending)) { setPending(null); onRestored(); } }}>{text.replace}</button><button type="button" onClick={() => setPending(null)}>{text.cancel}</button></div></section>}
      <button type="button" className="board-menu-close" onClick={(event) => { const details = event.currentTarget.closest("details"); if (details) { details.open = false; details.querySelector("summary")?.focus(); } }}>{text.closeMenu}</button>
    </div>
  </details>;
}
