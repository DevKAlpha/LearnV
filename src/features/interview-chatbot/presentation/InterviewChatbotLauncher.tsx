import { lazy, Suspense, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import type { LearningSkill } from "@/domain/models/learning-journey";
import { AppIcon } from "@/shared/ui/AppIcon";

let panelPromise: ReturnType<typeof importPanel> | undefined;
const importPanel = () => import("./InterviewChatPanel");
const loadPanel = () => panelPromise ??= importPanel();
const InterviewChatPanel = lazy(() => loadPanel().then((module) => ({ default: module.InterviewChatPanel })));

const labels = {
  es: { open: "Practicar entrevista GKS", short: "Entrevista GKS", loading: "Preparando entrevista…", close: "Cerrar entrevista" },
  en: { open: "Practise a GKS interview", short: "GKS interview", loading: "Preparing interview…", close: "Close interview" },
  ko: { open: "GKS 면접 연습", short: "GKS 면접", loading: "면접 준비 중…", close: "면접 닫기" },
};

export function InterviewChatbotLauncher({ prioritySkill }: { prioritySkill?: LearningSkill | null }) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const copy = labels[locale];
  const close = () => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <>
      <button
        ref={triggerRef}
        className="interview-chat-launcher"
        type="button"
        aria-label={copy.open}
        aria-expanded={open}
        onPointerEnter={() => { void loadPanel(); }}
        onFocus={() => { void loadPanel(); }}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true"><AppIcon name="chat" /><i /></span>
        <strong>{copy.short}</strong>
      </button>
      {open && createPortal(
        <div className="interview-chat-layer">
          <button className="interview-chat-backdrop" type="button" aria-label={copy.close} onClick={close} />
          <Suspense fallback={<div className="interview-chat-loading" role="status"><AppIcon name="sparkle" />{copy.loading}</div>}>
            <InterviewChatPanel onClose={close} prioritySkill={prioritySkill} />
          </Suspense>
        </div>,
        document.body,
      )}
    </>
  );
}
