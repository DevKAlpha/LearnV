import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { trackLearning } from "@/application/controllers/learningJourneyEvents";
import type { Locale } from "@/domain/models/i18n";
import { localize } from "@/domain/models/i18n";
import {
  chooseInterviewQuestionIds,
  createAdaptiveInterviewFollowUp,
  evaluateInterviewAnswer,
  summarizeInterviewSession,
  type InterviewAnswerEvaluation,
  type InterviewSignal,
} from "@/domain/models/interview-chatbot";
import type { LearningSkill } from "@/domain/models/learning-journey";
import { interviewChatbotCopy } from "@/infrastructure/data/interview-chatbot";
import { interviewQuestions } from "@/infrastructure/data/interview-prep";
import { AppIcon } from "@/shared/ui/AppIcon";
import { BrandMark } from "@/shared/ui/BrandMark";

type ChatMessage = {
  id: number;
  role: "interviewer" | "candidate" | "coach";
  text: string;
  evaluation?: InterviewAnswerEvaluation;
};

type InterviewChatPanelProps = {
  onClose: () => void;
  prioritySkill?: LearningSkill | null;
};

const SIGNALS: InterviewSignal[] = ["direct", "evidence", "connection", "reflection"];

function messageId() {
  return Date.now() + Math.random();
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function InterviewChatPanel({ onClose, prioritySkill }: InterviewChatPanelProps) {
  const [locale, setLocale] = useState<Locale>("es");
  const [phase, setPhase] = useState<"welcome" | "interview" | "report">("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [evaluations, setEvaluations] = useState<InterviewAnswerEvaluation[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const copy = interviewChatbotCopy[locale];
  const questions = useMemo(() => {
    const ids = chooseInterviewQuestionIds(prioritySkill);
    return ids.map((id) => interviewQuestions.find((question) => question.id === id)).filter(Boolean) as typeof interviewQuestions;
  }, [prioritySkill]);
  const summary = useMemo(() => summarizeInterviewSession(evaluations), [evaluations]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (phase !== "interview") return;
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase, questionIndex, awaitingFollowUp]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const startSession = (nextLocale = locale) => {
    const firstQuestion = questions[0];
    setQuestionIndex(0);
    setAwaitingFollowUp(false);
    setAnswer("");
    setSeconds(0);
    setEvaluations([]);
    setMessages([{ id: messageId(), role: "interviewer", text: localize(firstQuestion.question, nextLocale) }]);
    setPhase("interview");
  };

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    if (phase === "interview") startSession(nextLocale);
  };

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault();
    const submitted = answer.trim();
    if (submitted.length < 3) return;

    const evaluation = evaluateInterviewAnswer(submitted, locale);
    const nextEvaluations = [...evaluations, evaluation];
    const currentQuestion = questions[questionIndex];
    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: messageId(), role: "candidate", text: submitted },
      { id: messageId(), role: "coach", text: copy.primaryFeedback, evaluation },
    ];

    setAnswer("");
    setSeconds(0);
    setEvaluations(nextEvaluations);

    if (!awaitingFollowUp) {
      const followUp = createAdaptiveInterviewFollowUp(
        submitted,
        locale,
        evaluation,
        localize(currentQuestion.followUp, locale),
      );
      nextMessages.push({
        id: messageId(),
        role: "interviewer",
        text: `${copy.followUpIntro} ${followUp}`,
      });
      setAwaitingFollowUp(true);
      setMessages(nextMessages);
      return;
    }

    if (questionIndex === questions.length - 1) {
      const result = summarizeInterviewSession(nextEvaluations);
      trackLearning({
        kind: "practice",
        itemId: "gks-interview-chatbot",
        language: "general",
        skill: "interview",
        score: result.average,
        passed: result.average >= 70,
      });
      setMessages(nextMessages);
      setPhase("report");
      return;
    }

    const nextIndex = questionIndex + 1;
    nextMessages.push({
      id: messageId(),
      role: "interviewer",
      text: `${copy.nextQuestionIntro} ${localize(questions[nextIndex].question, locale)}`,
    });
    setQuestionIndex(nextIndex);
    setAwaitingFollowUp(false);
    setMessages(nextMessages);
  };

  return (
    <section className="interview-chat" role="dialog" aria-modal="true" aria-labelledby="interview-chat-title">
      <header className="interview-chat__header">
        <span className="interview-chat__avatar" aria-hidden="true"><BrandMark showLetter={false} /></span>
        <div><strong id="interview-chat-title">{copy.name}</strong><small><i />{copy.role}</small></div>
        <button ref={closeRef} className="interview-chat__close" type="button" aria-label={copy.close} onClick={onClose}>×</button>
      </header>

      <div className="interview-chat__language" role="group" aria-label={copy.language}>
        <span>{copy.language}</span>
        <div>{(["es", "en", "ko"] as Locale[]).map((item) => (
          <button type="button" key={item} aria-pressed={locale === item} onClick={() => changeLocale(item)}>
            {item === "es" ? "ES" : item === "en" ? "EN" : "한"}
          </button>
        ))}</div>
      </div>

      {phase === "welcome" && (
        <div className="interview-chat__welcome">
          <span className="interview-chat__welcome-icon" aria-hidden="true"><AppIcon name="chat" /></span>
          <span className="eyebrow">LearnV · Interview Coach</span>
          <h2>{copy.welcome}</h2>
          <p>{copy.introduction}</p>
          <strong>{copy.sessionPlan}</strong>
          {prioritySkill && <p className="interview-chat__adaptive"><AppIcon name="sparkle" />{copy.adaptive}</p>}
          <p className="interview-chat__privacy"><span aria-hidden="true">✓</span>{copy.privacy}</p>
          <button className="interview-chat__primary" type="button" onClick={() => startSession()}>{copy.start}<span>→</span></button>
        </div>
      )}

      {phase === "interview" && (
        <>
          <div className="interview-chat__status">
            <span>{copy.progress} {Math.min(questionIndex + 1, questions.length)}/{questions.length}{awaitingFollowUp ? " · +1" : ""}</span>
            {phase === "interview" && <time>{formatTime(seconds)} <small>/ 01:30</small></time>}
          </div>
          <div className="interview-chat__conversation" aria-live="polite">
            {messages.map((message) => (
              <article className={`interview-chat__message interview-chat__message--${message.role}`} key={message.id}>
                <small>{message.role === "candidate" ? (locale === "ko" ? "나" : locale === "en" ? "You" : "Tú") : message.role === "coach" ? "LearnV Coach" : copy.name}</small>
                <p>{message.text}</p>
                {message.evaluation && (
                  <div className="interview-chat__feedback">
                    <b>{message.evaluation.score}/100</b>
                    <ul>{SIGNALS.map((signal) => (
                      <li className={message.evaluation?.signals[signal] ? "is-present" : "is-missing"} key={signal}>
                        <span aria-hidden="true">{message.evaluation?.signals[signal] ? "✓" : "→"}</span>
                        <span className="interview-chat__feedback-copy">
                          <strong>{message.evaluation?.signals[signal] ? copy.signals[signal] : copy.improvements[signal]}</strong>
                          <small>{message.evaluation?.feedback[signal]}</small>
                        </span>
                      </li>
                    ))}</ul>
                  </div>
                )}
              </article>
            ))}
            <div ref={conversationEndRef} />
          </div>
        </>
      )}

      {phase === "interview" && (
        <form className="interview-chat__composer" onSubmit={submitAnswer}>
          <label htmlFor="interview-chat-answer">{copy.target}</label>
          <textarea id="interview-chat-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={copy.placeholder} rows={3} />
          <button type="submit" disabled={answer.trim().length < 3}>{copy.send}<AppIcon name="send" /></button>
        </form>
      )}

      {phase === "report" && (
        <div className="interview-chat__report">
          <span className="eyebrow">{copy.reportKicker}</span>
          <h2>{copy.reportTitle}</h2>
          <div className="interview-chat__score"><strong>{summary.average}</strong><span>/100<br />{copy.average}</span></div>
          <dl>
            <div><dt>{copy.strongest}</dt><dd>{copy.signals[summary.strongest]}</dd></div>
            <div><dt>{copy.priority}</dt><dd>{summary.average >= 90 ? copy.refine : copy.improvements[summary.priority]}</dd></div>
            <div><dt>{copy.completed}</dt><dd>{summary.answered}</dd></div>
          </dl>
          <p>{copy.reportText}</p>
          <p className="interview-chat__notice">{copy.notice}</p>
          <button className="interview-chat__primary" type="button" onClick={() => startSession()}>{copy.restart}<span>↻</span></button>
        </div>
      )}
    </section>
  );
}
