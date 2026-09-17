import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  OPEN_INTERVIEW_CHATBOT_EVENT,
  type OpenInterviewChatbotDetail,
} from "@/application/controllers/interviewChatbotEvents";
import { useI18n } from "@/application/i18n/I18nContext";
import { isInterviewSignal } from "@/domain/models/interview-learning-link";
import type { InterviewSignal } from "@/domain/models/interview-chatbot";
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
  const [requestedFocus, setRequestedFocus] = useState<InterviewSignal | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const copy = labels[locale];
  const close = () => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  useEffect(() => {
    const openFromLearningMaterial = (event: Event) => {
      const focus = (event as CustomEvent<OpenInterviewChatbotDetail>).detail?.focus;
      setRequestedFocus(isInterviewSignal(focus) ? focus : null);
      setOpen(true);
    };
    window.addEventListener(OPEN_INTERVIEW_CHATBOT_EVENT, openFromLearningMaterial);
    return () => window.removeEventListener(OPEN_INTERVIEW_CHATBOT_EVENT, openFromLearningMaterial);
  }, []);

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
        onClick={() => { setRequestedFocus(null); setOpen(true); }}
      >
        <span aria-hidden="true"><AppIcon name="chat" /><i /></span>
        <strong>{copy.short}</strong>
      </button>
      {open && createPortal(
        <div className="interview-chat-layer">
          <button className="interview-chat-backdrop" type="button" aria-label={copy.close} onClick={close} />
          <Suspense fallback={<div className="interview-chat-loading" role="status"><AppIcon name="sparkle" />{copy.loading}</div>}>
            <InterviewChatPanel onClose={close} prioritySkill={prioritySkill} focusSignal={requestedFocus} />
          </Suspense>
        </div>,
        document.body,
      )}
    </>
  );
}
