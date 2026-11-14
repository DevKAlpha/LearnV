import { memo, useEffect, useId, useRef, useState, type ComponentType } from "react";
import { useModal } from "@/shared/ui/useModal";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { taskBoardTriggerCopy } from "@/infrastructure/i18n/task-board-trigger-copy";
import { TaskBoardEmblem } from "@/shared/ui/TaskBoardEmblem";
import { onLearnvEvent } from "@/infrastructure/events/learnv-events";
import "@/styles/task-board-trigger.css";

export const TaskBoardQuickAccess = memo(function TaskBoardQuickAccess() {
  const { locale } = useI18n(); const text = taskBoardTriggerCopy[locale];
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [Panel, setPanel] = useState<ComponentType<{ active: boolean; initialView?: "today" | "board" }> | null>(null);
  const [view, setView] = useState<"today" | "board">("board");
  const [failed, setFailed] = useState(false); const [retry, setRetry] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null); const closeButton = useRef<HTMLButtonElement>(null); const dialog = useRef<HTMLElement>(null); const id = useId();
  useEffect(() => { setOpen(false); }, [pathname]);
  // Other screens (the daily plan) can open the board on a given view.
  useEffect(() => onLearnvEvent("learnv:open-task-board", (detail) => { setView(detail?.view === "today" ? "today" : "board"); setOpen(true); }), []);
  useEffect(() => {
    if (!open || Panel) return;
    let cancelled = false; setFailed(false);
    import("@/features/task-board/presentation/TaskBoardPanel").then((module) => { if (!cancelled) setPanel(() => module.TaskBoardPanel); }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [open, Panel, retry]);
  useModal({ open, onClose: () => setOpen(false), dialogRef: dialog, initialFocusRef: closeButton, returnFocusRef: trigger });
  return <div className="task-board-quick-access">
    <button ref={trigger} type="button" className="task-board-trigger" aria-label={text.open} title={text.open} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => { setView("board"); setOpen(true); }}><TaskBoardEmblem /></button>
    {(open || Panel) && createPortal(<div className="task-board-layer" hidden={!open}>
      <button className="task-board-backdrop" type="button" tabIndex={-1} aria-label={text.close} onClick={() => setOpen(false)} />
      <section ref={dialog} className="task-board-dialog" id={id} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <header className="task-board-chrome"><span><TaskBoardEmblem /><strong id={`${id}-title`}>{text.title}</strong></span><button ref={closeButton} type="button" aria-label={text.close} onClick={() => setOpen(false)}>×</button></header>
        {Panel ? <Panel active={open} initialView={view} /> : <div className="task-board-loading" role={failed ? "alert" : "status"}><p>{failed ? text.error : text.loading}</p>{failed && <button type="button" onClick={() => setRetry((value) => value+1)}>{text.retry}</button>}</div>}
      </section>
    </div>, document.body)}
  </div>;
});
