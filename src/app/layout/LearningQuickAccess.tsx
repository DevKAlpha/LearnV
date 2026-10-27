import { useEffect, useId, useRef, useState } from "react";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { useI18n } from "@/application/i18n/I18nContext";
import { JourneyEmblem } from "@/shared/ui/JourneyArtwork";
import { LearningJourneyPanel } from "@/shared/ui/LearningJourneyPanel";
import "@/styles/learning-quick-access.css";

const closeLabels = { es: "Cerrar tu aprendizaje", en: "Close your learning", ko: "학습 요약 닫기" };

/** A quiet disclosure: no timers, badges, auto-opening or additional tracking. */
export function LearningQuickAccess({ learning }: { learning: LearningJourneyController }) {
  const { copy, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const close = () => { setOpen(false); trigger.current?.focus({ preventScroll: true }); };

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus({ preventScroll: true });
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const dismissEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", dismissOutside, true);
    document.addEventListener("keydown", dismissEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside, true);
      document.removeEventListener("keydown", dismissEscape);
    };
  }, [open]);

  return <div className="learning-quick-access" ref={root} onBlur={(event) => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button className="learning-quick-trigger" type="button" ref={trigger}
      aria-label={copy.journey.kicker} title={copy.journey.kicker} aria-haspopup="dialog"
      aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => setOpen(!open)}>
      <JourneyEmblem />
    </button>
    <div id={`${id}-panel`} className="learning-quick-panel" role="dialog" aria-modal="false"
      aria-label={copy.journey.kicker} hidden={!open} onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("a")) close();
      }}>
      {open && <>
        <header className="learning-quick-panel__header">
          <strong>{copy.journey.kicker}</strong>
          <button type="button" ref={closeButton} aria-label={closeLabels[locale]} onClick={close}>×</button>
        </header>
        <div className="learning-quick-panel__body">
          <LearningJourneyPanel learning={learning} compact illustrated headingId={`${id}-title`} />
          <p className="learning-quick-panel__privacy">{copy.journey.privacy}</p>
        </div>
      </>}
    </div>
  </div>;
}
