import { Component, lazy, Suspense, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  OPEN_INTERVIEW_CHATBOT_EVENT,
  type OpenInterviewChatbotDetail,
} from "@/application/controllers/interviewChatbotEvents";
import { useI18n } from "@/application/i18n/I18nContext";
import { isInterviewSignal } from "@/domain/models/interview-learning-link";
import type { InterviewSignal } from "@/domain/models/interview-chatbot";
import type { LearningSkill } from "@/domain/models/learning-journey";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";
import { AppIcon } from "@/shared/ui/AppIcon";

let panelPromise: ReturnType<typeof importPanel> | undefined;
const importPanel = () => import("./InterviewChatPanel");
const loadPanel = () => panelPromise ??= importPanel().catch((error) => {
  panelPromise = undefined;
  throw error;
});
const InterviewChatPanel = lazy(() => loadPanel().then((module) => ({ default: module.InterviewChatPanel })));

class InterviewChatErrorBoundary extends Component<{
  children: ReactNode;
  onFailure: () => void;
}, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    recordLearningError({
      area: "interview-chatbot",
      code: "chatbot-render-failed",
      error,
      context: { componentStack: info.componentStack ?? "" },
    });
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const labels = {
  es: { open: "Practicar entrevista GKS", short: "Entrevista GKS", loading: "Preparando entrevista…", close: "Cerrar entrevista" },
  en: { open: "Practise a GKS interview", short: "GKS interview", loading: "Preparing interview…", close: "Close interview" },
  ko: { open: "GKS 면접 연습", short: "GKS 면접", loading: "면접 준비 중…", close: "면접 닫기" },
};

export function InterviewChatbotLauncher({
  prioritySkill,
  adaptiveFocus,
}: {
  prioritySkill?: LearningSkill | null;
  adaptiveFocus?: InterviewSignal | null;
}) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [requestedFocus, setRequestedFocus] = useState<InterviewSignal | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const copy = labels[locale];
  const preloadPanel = () => {
    void loadPanel().catch((error) => recordLearningError({
      area: "interview-chatbot",
      code: "chatbot-chunk-preload-failed",
      error,
    }));
  };
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
        onPointerEnter={preloadPanel}
        onFocus={preloadPanel}
        onClick={() => { setRequestedFocus(null); setOpen(true); }}
      >
        <span aria-hidden="true"><AppIcon name="chat" /><i /></span>
        <strong>{copy.short}</strong>
      </button>
      {open && createPortal(
        <InterviewChatErrorBoundary onFailure={close}>
          <div className="interview-chat-layer">
            <button className="interview-chat-backdrop" type="button" aria-label={copy.close} onClick={close} />
            <Suspense fallback={<div className="interview-chat-loading" role="status"><AppIcon name="sparkle" />{copy.loading}</div>}>
              <InterviewChatPanel
                onClose={close}
                prioritySkill={prioritySkill}
                focusSignal={requestedFocus ?? adaptiveFocus}
              />
            </Suspense>
          </div>
        </InterviewChatErrorBoundary>,
        document.body,
      )}
    </>
  );
}
