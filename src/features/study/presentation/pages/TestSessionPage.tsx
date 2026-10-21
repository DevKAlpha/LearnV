import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import {
  getAttemptQuestions,
  gradeAttempt,
  listeningReadiness,
  meetsWritingRequirements,
  type TestResult,
} from "@/domain/models/language-test";
import { practiceTestTracks as languageTestTracks } from "@/infrastructure/data/practice-tests";
import { getLanguageStage, getNextLanguageStage, getLanguagePath, isLanguageStageUnlocked } from "@/infrastructure/data/language-paths";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";
import { AppIcon } from "@/shared/ui/AppIcon";
import { LiteYouTube } from "@/shared/ui/LiteYouTube";
import { SpiralLearningNote } from "../components/SpiralLearningNote";
import { ScriptListeningPractice } from "../components/ScriptListeningPractice";
import { LearningAudioPlayer } from "../components/LearningAudioPlayer";
import { learningVoiceCopy } from "@/infrastructure/i18n/learning-voice-copy";
import { LanguageCulture } from "@/shared/ui/LanguageCulture";
import { getMotionScrollBehavior } from "@/shared/ui/motion-preferences";
import { createLearningRecording } from "@/infrastructure/audio/learning-recording";
import { getLanguagePathHref } from "../components/learning-path-layout";
import { RestartToolNote } from "../components/RestartToolNote";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function TestSessionPage() {
  const { language: languageParam, stageId } = useParams();
  const language = languageParam === "ko" ? "ko" : "en";
  const invalidLanguage = languageParam !== "en" && languageParam !== "ko";
  const requestedStage = getLanguageStage(language, stageId ?? "");
  const invalidStage = !requestedStage;
  const stage = requestedStage ?? languageTestTracks[language].stages[0];
  const { copy, locale } = useI18n();
  const { progress, recordAttempt } = useLanguageTestProgress();
  const trackProgress = progress[language];
  const stageProgress = trackProgress[stage.id];
  const unlocked = isLanguageStageUnlocked(language, stage.id, trackProgress);
  const path = getLanguagePath(language, trackProgress);
  const advancedCopy = advancedPathCopy[locale];
  const isAdvancedStage = stage.id.startsWith(`${language}-c1-`);
  const [runNumber, setRunNumber] = useState(() => (stageProgress?.attempts ?? 0) + 1);
  const questions = useMemo(() => getAttemptQuestions(stage, runNumber), [stage, runNumber]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(stage.estimatedMinutes * 60);
  const [productionDone, setProductionDone] = useState(false);
  const [writtenResponse, setWrittenResponse] = useState("");
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPending, setRecordingPending] = useState(false);
  const [microphoneError, setMicrophoneError] = useState(false);
  const [speakingPractised, setSpeakingPractised] = useState(false);
  const [mediaReviewed, setMediaReviewed] = useState(false);
  const [scriptPlayed, setScriptPlayed] = useState(false);
  const [scriptTranscript, setScriptTranscript] = useState(false);
  const [recordingReviewed, setRecordingReviewed] = useState(false);
  const [checklistChecks, setChecklistChecks] = useState<boolean[]>(() => stage.productionTask.checklist.map(() => false));
  const [showExitDialog, setShowExitDialog] = useState(false);
  const finishedRef = useRef(false);
  const recordingRef = useRef<ReturnType<typeof createLearningRecording> | null>(null);
  const timed = runNumber > 1;
  const question = questions[questionIndex];
  const selectedAnswer = answers[question.id];
  const selectedIsCorrect = selectedAnswer !== undefined && selectedAnswer === question.correctIndex;
  const selectedFeedback = selectedAnswer === undefined ? null : question.optionFeedback[selectedAnswer];
  const minimumCharacters = stage.productionTask.minimumCharacters ?? 0;
  const wordCount = writtenResponse.trim() ? writtenResponse.trim().split(/\s+/u).length : 0;
  const meetsWritingLength = meetsWritingRequirements(language, stage.productionTask, writtenResponse);
  const checklistComplete = checklistChecks.every(Boolean);
  const listening = listeningReadiness(stage.productionTask, mediaReviewed, checklistComplete, scriptPlayed, scriptTranscript);
  const productionVerified = stage.productionTask.mode === "listening"
    ? listening.verified
    : stage.productionTask.mode === "writing"
      ? meetsWritingLength && checklistComplete
    : Boolean(!isRecording && !recordingPending && recordingUrl && recordingReviewed && checklistComplete);
  const canContinueProduction = stage.productionTask.mode === "listening"
    ? listening.canContinue
    : stage.productionTask.mode === "writing"
    ? meetsWritingLength && checklistComplete
    : Boolean(!isRecording && !recordingPending && ((recordingUrl && recordingReviewed && checklistComplete) || (speakingPractised && checklistComplete)));
  const totalSteps = questions.length + 1;
  const currentStep = productionDone ? questionIndex + 2 : 1;

  useEffect(() => {
    setRunNumber((trackProgress[stage.id]?.attempts ?? 0) + 1);
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setSecondsLeft(stage.estimatedMinutes * 60);
    setProductionDone(false);
    setWrittenResponse("");
    setSpeakingPractised(false);
    setMediaReviewed(false);
    setScriptPlayed(false);
    setScriptTranscript(false);
    setRecordingReviewed(false);
    setChecklistChecks(stage.productionTask.checklist.map(() => false));
    setShowExitDialog(false);
    setMicrophoneError(false);
    setIsRecording(false);
    setRecordingPending(false);
    setRecordingUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    recordingRef.current?.dispose();
    finishedRef.current = false;
  }, [stage.id]);

  useEffect(() => {
    const recorder = createLearningRecording({
      getStream: () => navigator.mediaDevices.getUserMedia({ audio: true }),
      makeRecorder: (stream) => new MediaRecorder(stream),
      onPending: () => { setRecordingPending(true); setRecordingReviewed(false); },
      onStarted: () => {
        setRecordingPending(false); setIsRecording(true); setSpeakingPractised(false);
        setRecordingUrl((current) => { if (current) URL.revokeObjectURL(current); return null; });
      },
      onRecorded: (recording) => {
        setRecordingUrl(URL.createObjectURL(recording)); setRecordingReviewed(false); setIsRecording(false);
      },
      onFailure: (code, error) => {
        setMicrophoneError(true); setRecordingPending(false); setIsRecording(false);
        recordLearningError({ area: language === "ko" ? "korean-learning" : "english-learning", severity: "warning", code, error, context: { stageId: stage.id } });
      },
    });
    recordingRef.current = recorder;
    const suspend = () => { recorder.dispose(); setRecordingPending(false); setIsRecording(false); };
    const visibility = () => { if (document.visibilityState === "hidden") suspend(); };
    window.addEventListener("pagehide", suspend);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pagehide", suspend); document.removeEventListener("visibilitychange", visibility);
      recorder.dispose(); if (recordingRef.current === recorder) recordingRef.current = null;
    };
  }, [stage.id, language]);

  useEffect(() => () => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
  }, [recordingUrl]);

  const finishTest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const graded = gradeAttempt(language, stage, questions, answers, productionVerified);
    recordAttempt(language, stage.id, graded.score, graded.passed);
    setResult(graded);
    document.getElementById("test-session-top")?.scrollIntoView({ behavior: getMotionScrollBehavior() });
  }, [answers, language, productionVerified, questions, recordAttempt, stage]);

  useEffect(() => {
    if (!timed || !productionDone || result) return;
    if (secondsLeft <= 0) {
      finishTest();
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [finishTest, productionDone, result, secondsLeft, timed]);

  useEffect(() => {
    if (!invalidLanguage && !invalidStage && unlocked) return;
    recordLearningError({
      area: language === "ko" ? "korean-learning" : "english-learning",
      severity: "warning",
      code: invalidLanguage ? "invalid-test-language-route" : invalidStage ? "test-stage-not-found" : "locked-test-route-requested",
      context: { languageParam: languageParam ?? null, stageId: stageId ?? null },
    });
  }, [invalidLanguage, invalidStage, language, languageParam, stageId, unlocked]);

  if (invalidLanguage || invalidStage || !unlocked) {
    return <Navigate to={`/tests/${invalidLanguage ? "en" : language}`} replace />;
  }

  const chooseAnswer = (optionIndex: number) => {
    if (selectedAnswer !== undefined) return;
    setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
  };

  const continueTest = () => {
    if (selectedAnswer === undefined) return;
    if (questionIndex === questions.length - 1) {
      finishTest();
      return;
    }
    setQuestionIndex((current) => current + 1);
    document.getElementById("test-session-top")?.scrollIntoView({ behavior: getMotionScrollBehavior() });
  };

  const startRecording = async () => {
    setMicrophoneError(false);
    if (!("MediaRecorder" in window) || !navigator.mediaDevices?.getUserMedia) {
      setMicrophoneError(true);
      recordLearningError({
        area: language === "ko" ? "korean-learning" : "english-learning",
        severity: "warning",
        code: "media-recorder-unavailable",
        context: { stageId: stage.id },
      });
      return;
    }

    await recordingRef.current?.start();
  };

  const stopRecording = () => {
    recordingRef.current?.stop();
  };

  const continueFromProduction = () => {
    if (!canContinueProduction) return;
    setProductionDone(true);
    document.getElementById("test-session-top")?.scrollIntoView({ behavior: getMotionScrollBehavior() });
  };

  const restartTest = () => {
    setRunNumber((current) => current + 1);
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setSecondsLeft(stage.estimatedMinutes * 60);
    setProductionDone(false);
    setWrittenResponse("");
    setSpeakingPractised(false);
    setMediaReviewed(false);
    setScriptPlayed(false);
    setScriptTranscript(false);
    setRecordingReviewed(false);
    setChecklistChecks(stage.productionTask.checklist.map(() => false));
    setMicrophoneError(false);
    setIsRecording(false);
    setRecordingPending(false);
    recordingRef.current?.dispose();
    setRecordingUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    finishedRef.current = false;
    document.getElementById("test-session-top")?.scrollIntoView({ behavior: getMotionScrollBehavior() });
  };

  if (result) {
    const mastered = [...new Set(result.questions.filter((item) => item.correct).map((item) => item.question.skill))];
    const improvements = [...new Set(result.questions.filter((item) => !item.correct).map((item) => item.question.improvement))];
    const sessionLesson = result.questions.find((item) => !item.correct)?.question ?? result.questions[0]?.question;
    const nextStage = getNextLanguageStage(language, stage.id, trackProgress);
    const promoted = result.passed && !isAdvancedStage && path.advancedUnlocked;

    return (
      <div className={`page test-result-page test-result-page--${language}`} id="test-session-top">
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
            <div className="production-recording"><small>{copy.tests.recordingReady}</small><audio controls src={recordingUrl} /></div>
          )}
          <h3>{copy.tests.productionChecklist}</h3>
          <ul>{stage.productionTask.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
          <small className="production-privacy">{copy.tests.productionNotice}</small>
        </section>

        <section className="answer-review" aria-labelledby="answer-review-title">
          <div className="section-heading"><div><span className="eyebrow">Feedback</span><h2 id="answer-review-title">{stage.title}</h2></div></div>
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

  return (
    <div className={`page test-session-page test-session-page--${language}`} id="test-session-top">
      <LanguageCulture language={language} variant="badge" />
      {isAdvancedStage && !productionDone && <aside className="advanced-path-notice"><strong>{language === "en" ? advancedCopy.title : advancedCopy.koreanTitle}</strong><p>{advancedCopy.criteria}</p><details><summary>{advancedCopy.scope}</summary><small>{advancedCopy.notice}</small></details></aside>}
      <header className="session-topbar">
        <button className="session-exit-button" type="button" aria-label={copy.tests.sessionExit} onClick={() => setShowExitDialog(true)}>×</button>
        <div className="session-progress" aria-label={`${currentStep} ${copy.tests.of} ${totalSteps}`}><span style={{ width: `${(currentStep / totalSteps) * 100}%` }} /></div>
        <span className={timed ? "session-timer session-timer--active" : "session-timer"}>
          <small>{timed ? copy.tests.timeLeft : copy.tests.untimed}</small>
          <strong>{timed ? formatTime(secondsLeft) : `#${runNumber}`}</strong>
        </span>
      </header>

      {!productionDone ? (
      <section className="question-stage production-stage" aria-labelledby="production-stage-title">
        <div className="question-meta">
          <span>{copy.tests.productiveTask} · {stage.productionTask.mode === "speaking" ? copy.tests.pronunciation : stage.productionTask.mode === "listening" ? copy.tests.listening : copy.tests.writing}</span>
          <span>{copy.tests.attempt} {runNumber}</span>
        </div>
        <span className={`production-mode-icon production-mode-icon--${stage.productionTask.mode}`} aria-hidden="true">
          <AppIcon name={stage.productionTask.mode === "speaking" ? "speaking" : stage.productionTask.mode === "listening" ? "listening" : "writing"} />
        </span>
        <h1 id="production-stage-title">{stage.productionTask.prompt}</h1>
        {stage.productionTask.context && <blockquote className="question-passage production-context">{stage.productionTask.context}</blockquote>}
        <p className="production-instructions">{stage.productionTask.instructions}</p>
        {!timed && <RestartToolNote key={stage.id} language={language} stageId={stage.id} />}
        <SpiralLearningNote stage={stage} />
        {timed && stage.productionTask.retakeInstruction && <p className="production-retake-instruction"><strong>{language === "ko" ? "재시도 조건" : "Retake constraint"}:</strong> {stage.productionTask.retakeInstruction}</p>}

        {stage.productionTask.mode === "writing" ? (
          <div className="writing-response">
            <textarea
              value={writtenResponse}
              placeholder={copy.tests.writingPlaceholder}
              aria-label={copy.tests.productiveTask}
              onChange={(event) => setWrittenResponse(event.target.value)}
            />
            <div>
              <span>{language === "en" ? `${wordCount} words` : `${writtenResponse.trim().length} ${copy.tests.characters}`}</span>
              <strong>{language === "en" && stage.productionTask.minimumWords ? `${stage.productionTask.minimumWords}–${stage.productionTask.maximumWords} words` : stage.productionTask.maximumCharacters ? `${minimumCharacters}–${stage.productionTask.maximumCharacters} ${copy.tests.characters}` : `${copy.tests.minimum} · ${minimumCharacters}`}</strong>
            </div>
          </div>
        ) : stage.productionTask.mode === "listening" ? (
          stage.media ? (
            <article className="listening-media-card">
              <div className="listening-media-card__frame">
                <LiteYouTube videoId={stage.media.videoId} title={stage.media.title} startSeconds={stage.media.startSeconds} endSeconds={stage.media.endSeconds} />
              </div>
              <div className="listening-media-card__body">
                <div className="listening-media-card__badges">
                  <span>{stage.media.kind === "story" ? copy.tests.videoStory : copy.tests.videoSong}</span>
                  <span>{stage.media.variety}</span>
                </div>
                <strong>{stage.media.title}</strong>
                <p>{stage.media.creator}</p>
                <a href={stage.media.sourceUrl} target="_blank" rel="noreferrer">{copy.tests.openYoutube} ↗</a>
                <small>{language === "ko" ? `권장 구간 · ${stage.media.excerptMinutes ?? 3}분` : `Recommended excerpt · ${stage.media.excerptMinutes ?? 3} min`}</small>
                <small>{learningVoiceCopy[locale].external}</small>
              </div>
            </article>
          ) : stage.productionTask.listeningScript ? (
            <ScriptListeningPractice key={`${stage.id}-${runNumber}`} script={stage.productionTask.listeningScript} language={language} stageId={stage.id} onCompleted={() => setScriptPlayed(true)} onTranscript={() => setScriptTranscript(true)} />
          ) : (
            <div className="listening-ready-card">
              <span aria-hidden="true"><AppIcon name="listening" /></span>
              <strong>{copy.tests.listeningReady}</strong>
              <p>{copy.tests.listeningReadyText}</p>
            </div>
          )
        ) : (
          <div className="speaking-recorder">
            <LearningAudioPlayer text={stage.questions[0]?.passage ?? stage.productionTask.prompt} language={language} stageId={stage.id} label={learningVoiceCopy[locale].model} disabled={isRecording || recordingPending} />
            <div className={isRecording ? "recording-status recording-status--active" : "recording-status"}>
              <span aria-hidden="true" />
              <strong>{isRecording ? copy.tests.recording : `${stage.productionTask.targetSeconds ?? 60}s`}</strong>
            </div>
            {isRecording ? (
              <button type="button" className="record-button record-button--stop" onClick={stopRecording}>{copy.tests.stopRecording}</button>
            ) : (
              <button type="button" className="record-button" disabled={recordingPending} onClick={startRecording}>{recordingPending ? learningVoiceCopy[locale].recordingPending : recordingUrl ? copy.tests.recordAgain : copy.tests.startRecording}</button>
            )}
            {recordingUrl && <audio controls src={recordingUrl} aria-label={copy.tests.playRecording} />}
            {recordingUrl && <label className="practice-without-recording"><input type="checkbox" checked={recordingReviewed} onChange={(event) => setRecordingReviewed(event.target.checked)} /><span>{language === "ko" ? "녹음을 다시 듣고 한 가지 개선점을 찾았습니다." : "I listened back and identified one improvement."}</span></label>}
            {microphoneError && <p role="alert">{copy.tests.microphoneUnavailable}</p>}
            <label className="practice-without-recording">
              <input type="checkbox" checked={speakingPractised} onChange={(event) => setSpeakingPractised(event.target.checked)} />
              <span>{copy.tests.practiceWithoutRecording}</span>
            </label>
          </div>
        )}

        <aside className="production-checklist">
          <strong>{copy.tests.productionChecklist}</strong>
          <div>{stage.productionTask.checklist.map((item, index) => <label key={item}><input type="checkbox" checked={checklistChecks[index]} onChange={(event) => setChecklistChecks((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))} /><span>{index === 2 && stage.learningBridge ? copy.tests.spiralCheck : item}</span></label>)}</div>
        </aside>
        {stage.productionTask.mode === "listening" && <label className="production-evidence-check"><input type="checkbox" checked={mediaReviewed} onChange={(event) => setMediaReviewed(event.target.checked)} /><span>{scriptTranscript && !scriptPlayed ? copy.tests.transcriptPractice : language === "ko" ? "권장 구간을 듣고 답의 근거를 메모했습니다." : "I listened to the recommended excerpt and noted evidence for my answer."}</span></label>}
        <p className="production-privacy">{copy.tests.productionNotice}</p>
      </section>
      ) : (
      <section className="question-stage" aria-labelledby="review-stage-title">
        <div className="question-meta">
          <span>{copy.tests.question} {questionIndex + 1} {copy.tests.of} {questions.length}</span>
          <span>{copy.tests.attempt} {runNumber} · {question.skill}</span>
        </div>
        {question.passage && <blockquote className="question-passage">{question.passage}</blockquote>}
        {question.audioText && (
          <LearningAudioPlayer key={question.id} text={question.audioText} language={language} stageId={stage.id} questionId={question.id} />
        )}
        <h1 id="review-stage-title">{question.prompt}</h1>
        <div className="answer-options" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((option, optionIndex) => (
            <label className={`${selectedAnswer === optionIndex ? "answer-option answer-option--selected" : "answer-option"}${selectedAnswer !== undefined ? " answer-option--locked" : ""}`} key={option}>
              <input type="radio" name={question.id} checked={selectedAnswer === optionIndex} disabled={selectedAnswer !== undefined} onChange={() => chooseAnswer(optionIndex)} />
              <span>{String.fromCharCode(65 + optionIndex)}</span>
              <strong>{option}</strong>
            </label>
          ))}
        </div>
        {selectedFeedback && (
          <aside className={`question-feedback question-feedback--${selectedIsCorrect ? "correct" : "review"}`} aria-live="polite">
            <header><span aria-hidden="true">{selectedIsCorrect ? "✓" : "↗"}</span><strong>{selectedIsCorrect ? copy.tests.correctChoice : copy.tests.reviewChoice}</strong></header>
            <p>{selectedFeedback}</p>
            <dl>
              <div><dt>{copy.tests.microLesson}</dt><dd>{question.lesson}</dd></div>
              <div><dt>{copy.tests.modelExample}</dt><dd>{question.example}</dd></div>
              <div><dt>{copy.tests.transferChallenge}</dt><dd>{question.transfer}</dd></div>
            </dl>
          </aside>
        )}
      </section>
      )}

      <footer className="session-action-bar">
        <p aria-live="polite">{productionDone && selectedAnswer === undefined ? copy.tests.selectAnswer : ""}</p>
        <button type="button" disabled={productionDone ? selectedAnswer === undefined : !canContinueProduction} onClick={productionDone ? continueTest : continueFromProduction}>
          {productionDone ? (questionIndex === questions.length - 1 ? copy.tests.finish : copy.tests.next) : copy.tests.continueRubric}<span aria-hidden="true">→</span>
        </button>
      </footer>
      {showExitDialog && (
        <div className="test-exit-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowExitDialog(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="test-exit-title">
            <h2 id="test-exit-title">{language === "ko" ? "연습을 종료할까요?" : "Leave this practice?"}</h2>
            <p>{language === "ko" ? "현재 답변과 녹음은 저장되지 않습니다." : "Your current answers and recording are not saved."}</p>
            <div><button type="button" onClick={() => setShowExitDialog(false)}>{language === "ko" ? "계속 연습" : "Keep practising"}</button><Link to={getLanguagePathHref(language, stage.skill, isAdvancedStage ? "advanced" : "foundation")}>{language === "ko" ? "종료" : "Leave"}</Link></div>
          </section>
        </div>
      )}
    </div>
  );
}
