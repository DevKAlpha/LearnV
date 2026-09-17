import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { trackLearning } from "@/application/controllers/learningJourneyEvents";
import type { Locale } from "@/domain/models/i18n";
import { localize } from "@/domain/models/i18n";
import { createInterviewStudyPath } from "@/domain/models/interview-learning-link";
import {
  chooseInterviewQuestionId,
  chooseInterviewPersonalityId,
  createAdaptiveInterviewFollowUp,
  createAdaptiveInterviewQuestion,
  createInterviewSessionAdvice,
  evaluateInterviewAnswer,
  INTERVIEW_STAGES,
  interviewSignalFromLearningSkill,
  summarizeInterviewSession,
  type InterviewAnswerEvaluation,
  type InterviewPersonalityId,
  type InterviewSignal,
} from "@/domain/models/interview-chatbot";
import type { LearningSkill } from "@/domain/models/learning-journey";
import { interviewChatbotCopy, interviewPersonalities } from "@/infrastructure/data/interview-chatbot";
import { interviewLearningLinkCopy } from "@/infrastructure/data/interview-learning-link";
import { interviewQuestions, type InterviewQuestion } from "@/infrastructure/data/interview-prep";
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
  focusSignal?: InterviewSignal | null;
};

const SIGNALS: InterviewSignal[] = ["direct", "evidence", "connection", "reflection"];

function messageId() {
  return Date.now() + Math.random();
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function InterviewChatPanel({ onClose, prioritySkill, focusSignal }: InterviewChatPanelProps) {
  const navigate = useNavigate();
  const [locale, setLocale] = useState<Locale>("es");
  const [phase, setPhase] = useState<"welcome" | "interview" | "report">("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [evaluations, setEvaluations] = useState<InterviewAnswerEvaluation[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [personalityId, setPersonalityId] = useState<InterviewPersonalityId>("analytical");
  const closeRef = useRef<HTMLButtonElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const nextSessionSeedRef = useRef(Math.floor(Date.now() / 1000));
  const activeSessionSeedRef = useRef(0);
  const copy = interviewChatbotCopy[locale];
  const learningLinkCopy = interviewLearningLinkCopy[locale];
  const personality = interviewPersonalities[personalityId];
  const summary = useMemo(() => summarizeInterviewSession(evaluations), [evaluations]);
  const advice = useMemo(() => createInterviewSessionAdvice(summary, locale), [summary, locale]);

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
    const sessionSeed = nextSessionSeedRef.current++;
    const nextPersonalityId = chooseInterviewPersonalityId(sessionSeed, personalityId);
    const nextPersonality = interviewPersonalities[nextPersonalityId];
    const initialFocus = focusSignal ?? interviewSignalFromLearningSkill(prioritySkill);
    const firstQuestionId = chooseInterviewQuestionId(INTERVIEW_STAGES[0], {
      priority: prioritySkill,
      focus: initialFocus,
      seed: sessionSeed,
    });
    const firstQuestion = interviewQuestions.find((question) => question.id === firstQuestionId);
    if (!firstQuestion) return;
    activeSessionSeedRef.current = sessionSeed;
    setPersonalityId(nextPersonalityId);
    setQuestionIndex(0);
    setAwaitingFollowUp(false);
    setAnswer("");
    setSeconds(0);
    setEvaluations([]);
    setQuestions([firstQuestion]);
    setMessages([{
      id: messageId(),
      role: "interviewer",
      text: `${localize(nextPersonality.opening, nextLocale)} ${createAdaptiveInterviewQuestion(
        localize(firstQuestion.question, nextLocale),
        nextLocale,
        initialFocus,
        sessionSeed,
      )}`,
    }]);
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
        text: `${localize(personality.followUpIntro, locale)} ${followUp}`,
      });
      setAwaitingFollowUp(true);
      setMessages(nextMessages);
      return;
    }

    if (questionIndex === INTERVIEW_STAGES.length - 1) {
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
    const currentSummary = summarizeInterviewSession(nextEvaluations);
    const nextQuestionId = chooseInterviewQuestionId(INTERVIEW_STAGES[nextIndex], {
      priority: prioritySkill,
      focus: currentSummary.priority,
      usedIds: questions.map((question) => question.id),
      seed: activeSessionSeedRef.current + nextIndex,
    });
    const nextQuestion = interviewQuestions.find((question) => question.id === nextQuestionId);
    if (!nextQuestion) return;
    nextMessages.push({
      id: messageId(),
      role: "interviewer",
      text: `${localize(personality.nextQuestionIntro, locale)} ${createAdaptiveInterviewQuestion(
        localize(nextQuestion.question, locale),
        locale,
        currentSummary.priority,
        activeSessionSeedRef.current + nextIndex,
      )}`,
    });
    setQuestions([...questions, nextQuestion]);
    setQuestionIndex(nextIndex);
    setAwaitingFollowUp(false);
    setMessages(nextMessages);
  };

  return (
    <section className="interview-chat" role="dialog" aria-modal="true" aria-labelledby="interview-chat-title">
      <header className="interview-chat__header">
        <span className="interview-chat__avatar" aria-hidden="true"><BrandMark showLetter={false} /></span>
        <div>
          <strong id="interview-chat-title">{phase === "welcome" ? copy.name : localize(personality.name, locale)}</strong>
          <small><i />{phase === "welcome" ? copy.role : localize(personality.role, locale)}</small>
        </div>
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
          <p className="interview-chat__adaptive"><AppIcon name="chat" />{copy.personalityNote}</p>
          {(focusSignal || prioritySkill) && <p className="interview-chat__adaptive"><AppIcon name="sparkle" />{copy.adaptive}</p>}
          <p className="interview-chat__privacy"><span aria-hidden="true">✓</span>{copy.privacy}</p>
          <button className="interview-chat__primary" type="button" onClick={() => startSession()}>{copy.start}<span>→</span></button>
        </div>
      )}

      {phase === "interview" && (
        <>
          <div className="interview-chat__status">
            <span>{copy.progress} {Math.min(questionIndex + 1, INTERVIEW_STAGES.length)}/{INTERVIEW_STAGES.length}{awaitingFollowUp ? " · +1" : ""}</span>
            {phase === "interview" && <time>{formatTime(seconds)} <small>/ 01:30</small></time>}
          </div>
          <div className="interview-chat__conversation" aria-live="polite">
            {messages.map((message) => (
              <article className={`interview-chat__message interview-chat__message--${message.role}`} key={message.id}>
                <small>{message.role === "candidate"
                  ? (locale === "ko" ? "나" : locale === "en" ? "You" : "Tú")
                  : message.role === "coach"
                    ? "LearnV Coach"
                    : localize(personality.name, locale)}</small>
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
          <p className="interview-chat__assessment">{advice.assessment}</p>
          <dl>
            <div><dt>{copy.strongest}</dt><dd>{advice.strength}</dd></div>
            <div><dt>{copy.priority}</dt><dd>{advice.priority}</dd></div>
            <div><dt>{copy.completed}</dt><dd>{summary.answered}</dd></div>
          </dl>

          <section className="interview-chat__report-section" aria-labelledby="interview-coverage-title">
            <h3 id="interview-coverage-title">{copy.coverage}</h3>
            <div className="interview-chat__coverage">
              {SIGNALS.map((signal) => (
                <div key={signal}>
                  <span>{copy.signals[signal]}</span>
                  <b>{summary.coverage[signal].total}/{summary.answered}</b>
                  <i aria-hidden="true"><span style={{ width: `${summary.coverage[signal].percentage}%` }} /></i>
                </div>
              ))}
            </div>
          </section>

          <section className="interview-chat__report-section" aria-labelledby="interview-evolution-title">
            <h3 id="interview-evolution-title">{copy.evolution}</h3>
            <p className={`interview-chat__trend interview-chat__trend--${summary.trend}`}>{advice.trend}</p>
          </section>

          <section className="interview-chat__report-section" aria-labelledby="interview-action-title">
            <h3 id="interview-action-title">{copy.actionPlan}</h3>
            <ol className="interview-chat__action-plan">
              {advice.actionPlan.map((step, index) => <li key={step}><span aria-hidden="true">{index + 1}</span>{step}</li>)}
            </ol>
          </section>

          <section className="interview-chat__report-section" aria-labelledby="interview-formula-title">
            <h3 id="interview-formula-title">{copy.answerFormula}</h3>
            <ol className="interview-chat__formula">
              {advice.formula.map((step, index) => <li key={step}><span aria-hidden="true">{index + 1}</span>{step}</li>)}
            </ol>
          </section>

          <aside className="interview-chat__next-target"><small>{copy.nextTarget}</small><strong>{advice.nextTarget}</strong></aside>
          <section className="interview-chat__study-bridge" aria-labelledby="interview-study-bridge-title">
            <span aria-hidden="true"><AppIcon name="book" /></span>
            <div>
              <small>{learningLinkCopy.kicker}</small>
              <h3 id="interview-study-bridge-title">{learningLinkCopy.chatbotMaterialTitle}</h3>
              <p>{learningLinkCopy.chatbotMaterialText}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const path = createInterviewStudyPath(summary.priority);
                onClose();
                navigate(path);
              }}
            >
              {learningLinkCopy.chatbotMaterialAction}<span aria-hidden="true">→</span>
            </button>
          </section>
          <p className="interview-chat__notice">{copy.notice}</p>
          <button className="interview-chat__primary" type="button" onClick={() => startSession()}>{copy.restart}<span>↻</span></button>
        </div>
      )}
    </section>
  );
}
