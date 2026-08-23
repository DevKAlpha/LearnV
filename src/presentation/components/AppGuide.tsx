import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useI18n } from "../../application/i18n/I18nContext";

export function AppGuide() {
  const { copy } = useI18n();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button className="app-guide-trigger" type="button" aria-label={copy.guide.open} onClick={() => setOpen(true)}>
        <span aria-hidden="true">?</span>
      </button>
      {open && createPortal(
        <div className="app-guide-layer">
          <button className="app-guide-backdrop" type="button" aria-label={copy.guide.close} onClick={() => setOpen(false)} />
          <section className="app-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="app-guide-title">
            <header>
              <div>
                <span className="eyebrow">LearnV · Guide</span>
                <h2 id="app-guide-title">{copy.guide.title}</h2>
              </div>
              <button ref={closeRef} type="button" aria-label={copy.guide.close} onClick={() => setOpen(false)}>×</button>
            </header>
            <p className="app-guide-dialog__intro">{copy.guide.intro}</p>
            <div className="app-guide-controls">
              <strong>{copy.guide.controlsTitle}</strong>
              <ul>{copy.guide.controls.map((control) => <li key={control}>{control}</li>)}</ul>
            </div>
            <nav className="app-guide-sections" aria-label={copy.guide.title}>
              {copy.guide.sections.map((section, index) => (
                <article key={section.to}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{section.title}</strong><p>{section.text}</p></div>
                  <Link to={section.to} onClick={() => setOpen(false)}>{section.action}<span aria-hidden="true">→</span></Link>
                </article>
              ))}
            </nav>
            <p className="app-guide-local-note"><span aria-hidden="true">✓</span>{copy.guide.localNote}</p>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
