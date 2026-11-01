import { memo, useEffect, useId, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { taskBoardTriggerCopy } from "@/infrastructure/i18n/task-board-trigger-copy";
import { TaskBoardEmblem } from "@/shared/ui/TaskBoardEmblem";
import "@/styles/task-board-trigger.css";

export const TaskBoardQuickAccess = memo(function TaskBoardQuickAccess() {
  const { locale } = useI18n(); const text = taskBoardTriggerCopy[locale];
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [Panel, setPanel] = useState<ComponentType<{ active: boolean }> | null>(null);
  const [failed, setFailed] = useState(false); const [retry, setRetry] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null); const closeButton = useRef<HTMLButtonElement>(null); const dialog = useRef<HTMLElement>(null); const id = useId();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open || Panel) return;
    let cancelled = false; setFailed(false);
    import("@/features/task-board/presentation/TaskBoardPanel").then((module) => { if (!cancelled) setPanel(() => module.TaskBoardPanel); }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [open, Panel, retry]);
  useLayoutEffect(() => {
    if (!open) return;
    const root = document.getElementById("root"); const wasInert = root?.hasAttribute("inert");
    const overflow = document.body.style.overflow; const htmlOverflow = document.documentElement.style.overflow;
    root?.setAttribute("inert", ""); document.body.style.overflow = "hidden"; document.documentElement.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
      if (event.key !== "Tab") return;
      const controls = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),summary') ?? [])].filter((element) => element.getClientRects().length > 0 && element.tabIndex >= 0);
      const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      if (!wasInert) root?.removeAttribute("inert");
      document.body.style.overflow = overflow; document.documentElement.style.overflow = htmlOverflow;
      document.removeEventListener("keydown", keydown);
      if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true });
    };
  }, [open]);
  return <div className="task-board-quick-access">
    <button ref={trigger} type="button" className="task-board-trigger" aria-label={text.open} title={text.open} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(true)}><TaskBoardEmblem /></button>
    {(open || Panel) && createPortal(<div className="task-board-layer" hidden={!open}>
      <button className="task-board-backdrop" type="button" tabIndex={-1} aria-label={text.close} onClick={() => setOpen(false)} />
      <section ref={dialog} className="task-board-dialog" id={id} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <header className="task-board-chrome"><span><TaskBoardEmblem /><strong id={`${id}-title`}>{text.title}</strong></span><button ref={closeButton} type="button" aria-label={text.close} onClick={() => setOpen(false)}>×</button></header>
        {Panel ? <Panel active={open} /> : <div className="task-board-loading" role={failed ? "alert" : "status"}><p>{failed ? text.error : text.loading}</p>{failed && <button type="button" onClick={() => setRetry((value) => value+1)}>{text.retry}</button>}</div>}
      </section>
    </div>, document.body)}
  </div>;
});
