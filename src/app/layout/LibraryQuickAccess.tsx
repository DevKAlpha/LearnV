import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { libraryTriggerLabels } from "@/infrastructure/i18n/library-trigger-copy";
import { LibraryEmblem } from "@/shared/ui/LibraryArtwork";
import "@/styles/library-trigger.css";

export function LibraryQuickAccess() {
  const { locale } = useI18n();
  const text = libraryTriggerLabels[locale];
  const [open, setOpen] = useState(false);
  const [Panel, setPanel] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open || Panel) return;
    let cancelled = false;
    setFailed(false);
    import("@/features/library/presentation/LibraryPanel").then((module) => {
      if (!cancelled) setPanel(() => module.LibraryPanel);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [open, Panel, retry]);

  useLayoutEffect(() => {
    if (!open) return;
    const root = document.getElementById("root");
    const wasInert = root?.hasAttribute("inert");
    const overflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    root?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      if (event.key !== "Tab") return;
      const controls = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input,select') ?? [])].filter((item) => item.getClientRects().length > 0);
      const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      if (!wasInert) root?.removeAttribute("inert");
      document.body.style.overflow = overflow;
      document.documentElement.style.overflow = htmlOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true });
    };
  }, [open]);

  return <div className="library-quick-access">
    <button ref={trigger} className="library-quick-trigger" type="button" title={text.open} aria-label={text.open} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(true)}><LibraryEmblem /></button>
    {open && createPortal(<div className="library-layer">
      <button type="button" className="library-backdrop" aria-label={text.close} tabIndex={-1} onClick={() => setOpen(false)} />
      <section ref={dialog} id={id} className="library-dialog" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <header className="library-dialog__chrome"><span><LibraryEmblem /><strong id={`${id}-title`}>{text.kicker}</strong></span><button ref={closeButton} type="button" aria-label={text.close} onClick={() => setOpen(false)}>×</button></header>
        {Panel ? <Panel /> : <div className="library-load" role={failed ? "alert" : "status"}><p>{failed ? text.error : text.loading}</p>{failed && <button type="button" onClick={() => setRetry((value) => value + 1)}>{text.retry}</button>}</div>}
      </section>
    </div>, document.body)}
  </div>;
}
