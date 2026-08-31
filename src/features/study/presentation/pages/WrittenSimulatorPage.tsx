import { useEffect, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useWrittenSimulator } from "@/application/controllers/useWrittenSimulator";
import { useI18n } from "@/application/i18n/I18nContext";
import { localize } from "@/domain/models/i18n";
import { getWrittenCharacterLimit } from "@/domain/models/written-simulator";
import {
  writtenSimulatorQuestions,
  writtenSimulatorRubricIds,
} from "@/infrastructure/data/written-simulator";
import { SourceLink } from "@/shared/ui/SourceLink";
import { trackLearning } from "@/application/controllers/learningJourneyEvents";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export function WrittenSimulatorPage() {
  const { locale, copy } = useI18n();
  const simulator = useWrittenSimulator();
  const { state } = simulator;
  const limit = getWrittenCharacterLimit(state.language);
  const answeredAll = writtenSimulatorQuestions.every((question) => state.answers[question.id] !== undefined);
  const stepIndex = { knowledge: 0, personal: 1, plan: 2, review: 3, result: 4, intro: -1 }[state.step];
  const resultMessage = simulator.score.total >= 85
    ? copy.written.resultReady
    : simulator.score.total >= 65
      ? copy.written.resultDeveloping
      : copy.written.resultRevise;
  const draftChecks = [
    { ok: state.personalStatement.trim().length >= 600, label: locale === "ko" ? "자기소개서 초안이 최소 연습 길이에 도달했습니다." : locale === "en" ? "The Personal Statement reaches the practice length." : "El Personal Statement alcanza la extensión de práctica." },
    { ok: state.studyPlan.trim().length >= 600, label: locale === "ko" ? "학업계획서 초안이 최소 연습 길이에 도달했습니다." : locale === "en" ? "The Study Plan reaches the practice length." : "El Study Plan alcanza la extensión de práctica." },
    { ok: /\d/u.test(`${state.personalStatement} ${state.studyPlan}`), label: locale === "ko" ? "확인 가능한 숫자 또는 기간이 포함되어 있습니다." : locale === "en" ? "A verifiable number or timeline is included." : "Incluye una cifra o plazo verificable." },
    { ok: state.personalStatement.trim() !== state.studyPlan.trim(), label: locale === "ko" ? "두 글이 서로 다른 목적을 수행합니다." : locale === "en" ? "The two drafts serve different purposes." : "Los dos borradores cumplen propósitos distintos." },
  ];

  useEffect(() => {
    const reset = () => simulator.reset();
    window.addEventListener("learnv:written-reset", reset);
    return () => window.removeEventListener("learnv:written-reset", reset);
  }, [simulator.reset]);

  return (
    <div className="page written-simulator-page">
      <header className="written-simulator-hero">
        <Link className="test-back-link" to="/study"><span aria-hidden="true">←</span>{copy.written.back}</Link>
        <span className="sticker sticker--pink">{copy.written.sticker}</span>
        <h1>{copy.written.title}</h1>
        <p>{copy.written.intro}</p>
        <div className="written-simulator-hero__meta">
          <span>{copy.written.referenceBadge}</span>
          <span>{copy.written.savedLocal}</span>
        </div>
      </header>

      <aside className="written-official-note" aria-label={copy.written.referenceBadge}>
        <strong>{copy.written.officialNotice}</strong>
        <div><SourceLink sourceId="study-in-korea-2026" /><SourceLink sourceId="spain-embassy-notices" /></div>
      </aside>

      {state.step !== "intro" && state.step !== "result" && (
        <div className="written-session-bar">
          <div>
            <span>{copy.written.timer}</span>
            <strong>{formatTime(simulator.secondsLeft)}</strong>
          </div>
          <ol aria-label={copy.written.title}>
            {copy.written.steps.map((step, index) => (
              <li className={index === stepIndex ? "is-current" : index < stepIndex ? "is-complete" : ""} key={step}>
                <span>{index < stepIndex ? "✓" : index + 1}</span><small>{step}</small>
              </li>
            ))}
          </ol>
          {simulator.secondsLeft === 0 && <p role="status">{copy.written.timeUp}</p>}
        </div>
      )}

      {state.step === "intro" && (
        <section className="written-stage written-stage--intro">
          <span className="eyebrow">{copy.written.focusTime}</span>
          <h2>{copy.written.languageTitle}</h2>
          <p>{copy.written.languageIntro}</p>
          <div className="written-language-options" role="group" aria-label={copy.written.languageTitle}>
            <button className={state.language === "en" ? "is-selected" : ""} type="button" aria-pressed={state.language === "en"} onClick={() => simulator.setLanguage("en")}>
              <span>A+</span><strong>{copy.written.english}</strong>
            </button>
            <button className={state.language === "ko" ? "is-selected" : ""} type="button" aria-pressed={state.language === "ko"} onClick={() => simulator.setLanguage("ko")}>
              <span>한</span><strong>{copy.written.korean}</strong>
            </button>
          </div>
          <button className="test-primary-action" type="button" onClick={simulator.begin}>{copy.written.start}<span aria-hidden="true">→</span></button>
        </section>
      )}

      {state.step === "knowledge" && (
        <section className="written-stage">
          <span className="eyebrow">01 · {copy.written.steps[0]}</span>
          <h2>{copy.written.knowledgeTitle}</h2>
          <p>{copy.written.knowledgeIntro}</p>
          <div className="written-question-list">
            {writtenSimulatorQuestions.map((question, questionIndex) => {
              const selected = state.answers[question.id];
              return (
                <fieldset className="written-question" key={question.id}>
                  <legend><span>{String(questionIndex + 1).padStart(2, "0")}</span>{localize(question.prompt, locale)}</legend>
                  <div>
                    {question.options.map((option, optionIndex) => (
                      <label className={selected === optionIndex ? "is-selected" : ""} key={localize(option, locale)}>
                        <input type="radio" name={question.id} checked={selected === optionIndex} onChange={() => simulator.answer(question.id, optionIndex)} />
                        <span>{localize(option, locale)}</span>
                      </label>
                    ))}
                  </div>
                  {selected !== undefined && <p className="written-question__explanation"><strong>{copy.written.explanation}:</strong> {localize(question.explanation, locale)}</p>}
                </fieldset>
              );
            })}
          </div>
          {!answeredAll && <p className="written-stage__hint">{copy.written.answerAll}</p>}
          <div className="written-stage__actions">
            <button className="test-secondary-action" type="button" onClick={simulator.reset}>{copy.written.previous}</button>
            <button className="test-primary-action" type="button" disabled={!answeredAll} onClick={() => simulator.goTo("personal")}>{copy.written.next}<span aria-hidden="true">→</span></button>
          </div>
        </section>
      )}

      {state.step === "personal" && (
        <WritingStage
          copy={copy.written}
          step="02"
          title={copy.written.personalTitle}
          prompt={copy.written.personalPrompt}
          help={copy.written.personalHelp}
          value={state.personalStatement}
          limit={limit}
          onChange={(value) => simulator.updateDraft("personalStatement", value)}
          onBack={() => simulator.goTo("knowledge")}
          onNext={() => simulator.goTo("plan")}
        />
      )}

      {state.step === "plan" && (
        <WritingStage
          copy={copy.written}
          step="03"
          title={copy.written.planTitle}
          prompt={copy.written.planPrompt}
          help={copy.written.planHelp}
          value={state.studyPlan}
          limit={limit}
          onChange={(value) => simulator.updateDraft("studyPlan", value)}
          onBack={() => simulator.goTo("personal")}
          onNext={() => simulator.goTo("review")}
        />
      )}

      {state.step === "review" && (
        <section className="written-stage">
          <span className="eyebrow">04 · {copy.written.steps[3]}</span>
          <h2>{copy.written.reviewTitle}</h2>
          <p>{copy.written.reviewIntro}</p>
          <div className="written-rubric">
            {writtenSimulatorRubricIds.map((id, index) => (
              <label className={state.rubric.includes(id) ? "is-checked" : ""} key={id}>
                <input type="checkbox" checked={state.rubric.includes(id)} onChange={() => simulator.toggleRubric(id)} />
                <span aria-hidden="true">{state.rubric.includes(id) ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <strong>{copy.written.rubric[index]}</strong>
              </label>
            ))}
          </div>
          <div className="written-stage__actions">
            <button className="test-secondary-action" type="button" onClick={() => simulator.goTo("plan")}>{copy.written.previous}</button>
            <button className="test-primary-action" type="button" onClick={() => {
              trackLearning({ kind: "practice", itemId: "written-simulator", language: state.language, skill: "application", score: simulator.score.total, passed: simulator.score.total >= 65 });
              simulator.finish();
            }}>{copy.written.finish}<span aria-hidden="true">→</span></button>
          </div>
        </section>
      )}

      {state.step === "result" && (
        <section className="written-result">
          <span className="eyebrow">{copy.written.resultKicker}</span>
          <h2>{copy.written.resultTitle}</h2>
          <div className="written-result__score" style={{ "--score": simulator.score.total } as CSSProperties}><strong>{simulator.score.total}</strong><span>/100<br />{copy.written.total}</span></div>
          <p className="written-result__message">{resultMessage}</p>
          <div className="written-result__breakdown">
            <span><b>{simulator.score.knowledge}/50</b>{copy.written.knowledge}</span>
            <span><b>{simulator.score.writing}/30</b>{copy.written.writing}</span>
            <span><b>{simulator.score.review}/20</b>{copy.written.selfReview}</span>
          </div>
          <p className="written-result__notice">{copy.written.resultNotice}</p>
          <div className="written-result__checks">
            <h3>{locale === "ko" ? "자동으로 확인한 항목" : locale === "en" ? "Automated completion checks" : "Comprobaciones automáticas"}</h3>
            <ul>{draftChecks.map((check) => <li className={check.ok ? "is-complete" : "is-missing"} key={check.label}><span>{check.ok ? "✓" : "!"}</span>{check.label}</li>)}</ul>
            <small>{locale === "ko" ? "LearnV는 글의 품질이나 선발 가능성을 자동 평가하지 않습니다." : locale === "en" ? "LearnV does not automatically judge writing quality or selection chances." : "LearnV no califica automáticamente la calidad del texto ni predice la selección."}</small>
          </div>
          <div className="written-stage__actions">
            <Link className="test-secondary-action" to="/study">{copy.written.backStudy}</Link>
            <button className="test-primary-action" type="button" onClick={simulator.reset}>{copy.written.retry}<span aria-hidden="true">↻</span></button>
          </div>
        </section>
      )}

    </div>
  );
}

type WritingStageProps = {
  copy: ReturnType<typeof useI18n>["copy"]["written"];
  step: string;
  title: string;
  prompt: string;
  help: string;
  value: string;
  limit: number;
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

function WritingStage({ copy, step, title, prompt, help, value, limit, onChange, onBack, onNext }: WritingStageProps) {
  const ready = value.trim().length >= 600;
  return (
    <section className="written-stage written-stage--writing">
      <span className="eyebrow">{step} · {title}</span>
      <h2>{title}</h2>
      <p>{prompt}</p>
      <aside>{help}</aside>
      <textarea value={value} maxLength={limit} onChange={(event) => onChange(event.target.value)} placeholder={copy.placeholder} aria-label={title} />
      <div className="written-counter">
        <span>{copy.targetDraft}</span>
        <strong className={value.length > limit * 0.9 ? "is-near-limit" : ""}>{value.length.toLocaleString()} / {limit.toLocaleString()} {copy.characters}</strong>
      </div>
      <div className="written-stage__actions">
        <button className="test-secondary-action" type="button" onClick={onBack}>{copy.previous}</button>
        <button className="test-primary-action" type="button" disabled={!ready} onClick={onNext}>{copy.next}<span aria-hidden="true">→</span></button>
      </div>
    </section>
  );
}
