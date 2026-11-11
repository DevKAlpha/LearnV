import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import type { StageProgress, TestLanguage, TestResult, TestStage } from "@/domain/models/language-test";
import { getNextLanguageStage, getLanguagePath } from "@/infrastructure/data/language-paths";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";
import { learningVoiceCopy } from "@/infrastructure/i18n/learning-voice-copy";
import { AppIcon } from "@/shared/ui/AppIcon";
import { LanguageCulture } from "@/shared/ui/LanguageCulture";
import { SpiralLearningNote } from "./SpiralLearningNote";
import { getLanguagePathHref } from "./learning-path-layout";

type Props = {
  language: TestLanguage;
  stage: TestStage;
  result: TestResult;
  trackProgress: Record<string, StageProgress>;
  isAdvancedStage: boolean;
  /** Evidence from the attempt, shown back to the learner. */
  scriptPlayed: boolean;
  writtenResponse: string;
  recordingUrl: string | null;
  onRestart: () => void;
};

/** Result of one practice attempt: score, coaching, the learner's own evidence and answer review. */
export function TestResultView({ language, stage, result, trackProgress, isAdvancedStage, scriptPlayed, writtenResponse, recordingUrl, onRestart }: Props) {
  const { copy, locale } = useI18n();
  const path = getLanguagePath(language, trackProgress);
  const advancedCopy = advancedPathCopy[locale];
  const restartTest = onRestart;
  const mastered = [...new Set(result.questions.filter((item) => item.correct).map((item) => item.question.skill))];
  const improvements = [...new Set(result.questions.filter((item) => !item.correct).map((item) => item.question.improvement))];
  const sessionLesson = result.questions.find((item) => !item.correct)?.question ?? result.questions[0]?.question;
  const nextStage = getNextLanguageStage(language, stage.id, trackProgress);
  const promoted = result.passed && !isAdvancedStage && path.advancedUnlocked;


  return (
    <div className={`page test-result-page test-result-page--${language}`} id="test-session-top" data-help-practice="result" data-help-phase={isAdvancedStage ? "advanced" : "foundation"}>
      <header className="result-hero">
        <LanguageCulture language={language} variant="badge" />
        <span className="eyebrow">{copy.tests.resultKicker}</span>
        <span className="result-hero__icon" aria-hidden="true"><AppIcon name={result.passed ? "test" : "refresh"} /></span>
        <h1>{copy.tests.resultTitle}</h1>
        <p>{result.passed ? copy.tests.resultPass : copy.tests.resultRetry}</p>
        {promoted && <aside className="advanced-path-notice" role="status"><strong>{language === "en" ? advancedCopy.title : advancedCopy.koreanTitle}</strong><p>{advancedCopy.intro}</p><small>{advancedCopy.notice}</small></aside>}
        {isAdvancedStage && path.complete && <p role="status">{advancedCopy.finished}</p>}
        <div className="result-score-row">
          <div><strong>{result.score}</strong><small>/ 100 · {copy.tests.score}</small></div>
          <div><strong>{result.productionVerified ? "✓" : "!"}</strong><small>{result.productionVerified ? (language === "ko" ? "수행 증거 확인" : "Evidence verified") : (language === "ko" ? "수행 증거 부족" : "Evidence incomplete")}</small></div>
        </div>
        <span className="result-correct-count">{result.correctCount}/{result.questions.length} {copy.tests.correctAnswers}</span>
      </header>

      <section className="result-coaching-grid">
        <article className="coaching-card coaching-card--success">
          <span aria-hidden="true">★</span><h2>{copy.tests.whatWentWell}</h2>
          {mastered.length > 0 ? <ul>{mastered.map((skill) => <li key={skill}>{skill}</li>)}</ul> : <p>{copy.tests.noCorrect}</p>}
        </article>
        <article className="coaching-card coaching-card--improve">
          <span aria-hidden="true">↗</span><h2>{copy.tests.improveNext}</h2>
          {improvements.length > 0 ? <ul>{improvements.map((tip) => <li key={tip}>{tip}</li>)}</ul> : <p>{copy.tests.perfect}</p>}
        </article>
      </section>

      {sessionLesson && (
        <section className="session-takeaway" aria-labelledby="session-takeaway-title">
          <span className="eyebrow">{copy.tests.sessionTakeaway}</span>
          <h2 id="session-takeaway-title">{stage.title}</h2>
          <p>{copy.tests.sessionTakeawayText}</p>
          <div>
            <article><small>{copy.tests.microLesson}</small><strong>{sessionLesson.lesson}</strong></article>
            <article><small>{copy.tests.modelExample}</small><strong>{sessionLesson.example}</strong></article>
            <article><small>{copy.tests.transferChallenge}</small><strong>{sessionLesson.transfer}</strong></article>
          </div>
        </section>
      )}

      <section className="production-review" aria-labelledby="production-review-title">
        <span className="eyebrow">{copy.tests.productiveTask}</span>
        <h2 id="production-review-title">{stage.productionTask.mode === "speaking" ? copy.tests.pronunciation : stage.productionTask.mode === "listening" ? copy.tests.listening : copy.tests.writing}</h2>
        <p>{stage.productionTask.prompt}</p>
        {!result.productionVerified && stage.productionTask.mode === "listening" && stage.productionTask.listeningScript && !scriptPlayed && <p role="status">{copy.tests.transcriptOnlyNotice}</p>}
        {!result.productionVerified && stage.productionTask.mode === "speaking" && <p role="status">{learningVoiceCopy[locale].recordingEvidenceNotice}</p>}
        {stage.productionTask.mode === "writing" && writtenResponse && (
          <blockquote><small>{copy.tests.yourDraft}</small>{writtenResponse}</blockquote>
        )}
        {stage.productionTask.mode === "speaking" && recordingUrl && (
          // The learner's own recording: no caption track exists for it.
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <div className="production-recording"><small>{copy.tests.recordingReady}</small><audio controls src={recordingUrl} aria-label={copy.tests.playRecording} /></div>
        )}
        <h3>{copy.tests.productionChecklist}</h3>
        <ul>{stage.productionTask.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
        <small className="production-privacy">{copy.tests.productionNotice}</small>
      </section>

      <section className="answer-review" aria-labelledby="answer-review-title">
        <div className="section-heading"><div><span className="eyebrow">{copy.ui.feedback}</span><h2 id="answer-review-title">{stage.title}</h2></div></div>
        {result.questions.map((item, index) => (
          <details className={`answer-review-item answer-review-item--${item.correct ? "correct" : "wrong"}`} key={item.question.id}>
            <summary><span>{item.correct ? "✓" : "×"}</span><strong>{index + 1}. {item.question.skill}</strong><i>＋</i></summary>
            <div>
              <p className="answer-review-prompt">{item.question.prompt}</p>
              <dl>
                <div><dt>{copy.tests.selectedAnswer}</dt><dd>{item.selectedIndex === null ? copy.tests.unanswered : item.question.options[item.selectedIndex]}</dd></div>
                <div><dt>{copy.tests.correctAnswer}</dt><dd>{item.question.options[item.question.correctIndex]}</dd></div>
                {item.selectedIndex !== null && <div><dt>{copy.tests.selectedFeedback}</dt><dd>{item.question.optionFeedback[item.selectedIndex]}</dd></div>}
                <div><dt>{copy.tests.explanation}</dt><dd>{item.question.explanation}</dd></div>
                <div><dt>{copy.tests.modelExample}</dt><dd>{item.question.example}</dd></div>
                <div><dt>{copy.tests.transferChallenge}</dt><dd>{item.question.transfer}</dd></div>
                {!item.correct && <div><dt>{copy.tests.improveNext}</dt><dd>{item.question.improvement}</dd></div>}
              </dl>
            </div>
          </details>
        ))}
      </section>

      {result.passed && nextStage && <SpiralLearningNote stage={nextStage} next />}
      <p className="test-disclaimer">◎ {copy.tests.nonOfficial}</p>
      <div className="result-actions">
        {result.passed && nextStage && <Link className="test-primary-action" to={`/tests/${language}/${nextStage.id}`}>{copy.tests.nextTest}<span>→</span></Link>}
        <button className="test-secondary-action" type="button" onClick={restartTest}>{copy.tests.repeatTest}<span>↻</span></button>
        <Link className="test-text-action" to={getLanguagePathHref(language, stage.skill, !isAdvancedStage && !promoted ? "foundation" : "advanced")}>{copy.tests.backPath}</Link>
      </div>
    </div>
  );
}
