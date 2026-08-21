import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useLanguageTestProgress } from "../../application/controllers/useLanguageTestProgress";
import { useI18n } from "../../application/i18n/I18nContext";
import {
  getAttemptQuestions,
  gradeAttempt,
  isStageUnlocked,
  type TestResult,
} from "../../domain/models/language-test";
import { practiceTestTracks as languageTestTracks } from "../../infrastructure/data/practice-tests";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function TestSessionPage() {
  const { language: languageParam, stageId } = useParams();
  const language = languageParam === "ko" ? "ko" : "en";
  const invalidLanguage = languageParam !== "en" && languageParam !== "ko";
  const track = languageTestTracks[language];
  const requestedIndex = track.stages.findIndex((stage) => stage.id === stageId);
  const invalidStage = requestedIndex < 0;
  const stageIndex = invalidStage ? 0 : requestedIndex;
  const stage = track.stages[stageIndex];
  const { copy, setLocale } = useI18n();
  const { progress, recordAttempt } = useLanguageTestProgress();
  const trackProgress = progress[language];
  const stageProgress = trackProgress[stage.id];
  const unlocked = isStageUnlocked(track.stages, stageIndex, trackProgress);
  const [runNumber, setRunNumber] = useState(() => (stageProgress?.attempts ?? 0) + 1);
  const questions = useMemo(() => getAttemptQuestions(stage, runNumber), [stage, runNumber]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(stage.estimatedMinutes * 60);
  const [audioFallback, setAudioFallback] = useState(false);
  const [productionDone, setProductionDone] = useState(false);
  const [writtenResponse, setWrittenResponse] = useState("");
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [microphoneError, setMicrophoneError] = useState(false);
  const [speakingPractised, setSpeakingPractised] = useState(false);
  const finishedRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const timed = runNumber > 1;
  const question = questions[questionIndex];
  const selectedAnswer = answers[question.id];
  const minimumCharacters = stage.productionTask.minimumCharacters ?? 0;
  const canContinueProduction = stage.productionTask.mode === "listening"
    ? true
    : stage.productionTask.mode === "writing"
    ? writtenResponse.trim().length >= minimumCharacters
    : Boolean(recordingUrl || speakingPractised);
  const totalSteps = questions.length + 1;
  const currentStep = productionDone ? questionIndex + 2 : 1;

  useEffect(() => {
    setLocale(language);
  }, [language, setLocale]);

  useEffect(() => {
    setRunNumber((trackProgress[stage.id]?.attempts ?? 0) + 1);
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setSecondsLeft(stage.estimatedMinutes * 60);
    setAudioFallback(false);
    setProductionDone(false);
    setWrittenResponse("");
    setSpeakingPractised(false);
    setMicrophoneError(false);
    setIsRecording(false);
    setRecordingUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    finishedRef.current = false;
    window.speechSynthesis?.cancel();
  }, [stage.id]);

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => () => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
  }, [recordingUrl]);

  const finishTest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const graded = gradeAttempt(language, stage, questions, answers);
    recordAttempt(language, stage.id, graded.score);
    setResult(graded);
    document.getElementById("test-session-top")?.scrollIntoView({ behavior: "smooth" });
  }, [answers, language, questions, recordAttempt, stage]);

  useEffect(() => {
    if (!timed || result) return;
    if (secondsLeft <= 0) {
      finishTest();
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [finishTest, result, secondsLeft, timed]);

  if (invalidLanguage || invalidStage || !unlocked) {
    return <Navigate to={`/tests/${invalidLanguage ? "en" : language}`} replace />;
  }

  const chooseAnswer = (optionIndex: number) => {
    setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
  };

  const continueTest = () => {
    if (selectedAnswer === undefined) return;
    if (questionIndex === questions.length - 1) {
      finishTest();
      return;
    }
    setQuestionIndex((current) => current + 1);
    setAudioFallback(false);
    document.getElementById("test-session-top")?.scrollIntoView({ behavior: "smooth" });
  };

  const playAudio = () => {
    if (!question.audioText || !("speechSynthesis" in window)) {
      setAudioFallback(true);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.audioText);
    utterance.lang = language === "ko" ? "ko-KR" : "en-GB";
    utterance.rate = runNumber > 1 ? 1.03 : 0.94;
    utterance.onerror = () => setAudioFallback(true);
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    setMicrophoneError(false);
    if (!("MediaRecorder" in window) || !navigator.mediaDevices?.getUserMedia) {
      setMicrophoneError(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recordingChunksRef.current = [];
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      setRecordingUrl(null);
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const recording = new Blob(recordingChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setRecordingUrl(URL.createObjectURL(recording));
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setSpeakingPractised(false);
      setIsRecording(true);
    } catch {
      setMicrophoneError(true);
      setIsRecording(false);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const continueFromProduction = () => {
    if (!canContinueProduction) return;
    setProductionDone(true);
    document.getElementById("test-session-top")?.scrollIntoView({ behavior: "smooth" });
  };

  const restartTest = () => {
    setRunNumber((current) => current + 1);
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setSecondsLeft(stage.estimatedMinutes * 60);
    setAudioFallback(false);
    setProductionDone(false);
    setWrittenResponse("");
    setSpeakingPractised(false);
    setMicrophoneError(false);
    setIsRecording(false);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setRecordingUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    finishedRef.current = false;
    document.getElementById("test-session-top")?.scrollIntoView({ behavior: "smooth" });
  };

  if (result) {
    const mastered = [...new Set(result.questions.filter((item) => item.correct).map((item) => item.question.skill))];
    const improvements = [...new Set(result.questions.filter((item) => !item.correct).map((item) => item.question.improvement))];
    const nextStage = track.stages[stageIndex + 1];

    return (
      <div className={`page test-result-page test-result-page--${language}`} id="test-session-top">
        <header className="result-hero">
          <span className="eyebrow">{copy.tests.resultKicker}</span>
          <span className="result-hero__icon" aria-hidden="true">{result.passed ? "✓" : "↻"}</span>
          <h1>{copy.tests.resultTitle}</h1>
          <p>{result.passed ? copy.tests.resultPass : copy.tests.resultRetry}</p>
          <div className="result-score-row">
            <div><strong>{result.score}</strong><small>/ 100 · {copy.tests.score}</small></div>
            <div><strong>{result.estimate}</strong><small>{copy.tests.estimate}</small></div>
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

        <section className="production-review" aria-labelledby="production-review-title">
          <span className="eyebrow">{copy.tests.productiveTask}</span>
          <h2 id="production-review-title">{stage.productionTask.mode === "speaking" ? copy.tests.pronunciation : stage.productionTask.mode === "listening" ? copy.tests.listening : copy.tests.writing}</h2>
          <p>{stage.productionTask.prompt}</p>
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
                  <div><dt>{copy.tests.explanation}</dt><dd>{item.question.explanation}</dd></div>
                  {!item.correct && <div><dt>{copy.tests.improveNext}</dt><dd>{item.question.improvement}</dd></div>}
                </dl>
              </div>
            </details>
          ))}
        </section>

        <p className="test-disclaimer">◎ {copy.tests.nonOfficial}</p>
        <div className="result-actions">
          {result.passed && nextStage && <Link className="test-primary-action" to={`/tests/${language}/${nextStage.id}`}>{copy.tests.nextTest}<span>→</span></Link>}
          <button className="test-secondary-action" type="button" onClick={restartTest}>{copy.tests.repeatTest}<span>↻</span></button>
          <Link className="test-text-action" to={`/tests/${language}`}>{copy.tests.backPath}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`page test-session-page test-session-page--${language}`} id="test-session-top">
      <header className="session-topbar">
        <Link to={`/tests/${language}`} aria-label={copy.tests.sessionExit}>×</Link>
        <div className="session-progress" aria-label={`${currentStep} ${copy.tests.of} ${totalSteps}`}><span style={{ width: `${(currentStep / totalSteps) * 100}%` }} /></div>
        <span className={timed ? "session-timer session-timer--active" : "session-timer"}>
          <small>{timed ? copy.tests.timeLeft : copy.tests.untimed}</small>
          <strong>{timed ? formatTime(secondsLeft) : `#${runNumber}`}</strong>
        </span>
      </header>

      {!productionDone ? (
      <main className="question-stage production-stage">
        <div className="question-meta">
          <span>{copy.tests.productiveTask} · {stage.productionTask.mode === "speaking" ? copy.tests.pronunciation : stage.productionTask.mode === "listening" ? copy.tests.listening : copy.tests.writing}</span>
          <span>{copy.tests.attempt} {runNumber}</span>
        </div>
        <span className={`production-mode-icon production-mode-icon--${stage.productionTask.mode}`} aria-hidden="true">
          {stage.productionTask.mode === "speaking" ? "🎙" : stage.productionTask.mode === "listening" ? "◖" : "✎"}
        </span>
        <h1>{stage.productionTask.prompt}</h1>
        <p className="production-instructions">{stage.productionTask.instructions}</p>

        {stage.productionTask.mode === "writing" ? (
          <div className="writing-response">
            <textarea
              value={writtenResponse}
              placeholder={copy.tests.writingPlaceholder}
              aria-label={copy.tests.productiveTask}
              onChange={(event) => setWrittenResponse(event.target.value)}
            />
            <div><span>{writtenResponse.trim().length} {copy.tests.characters}</span><strong>{copy.tests.minimum} · {minimumCharacters}</strong></div>
          </div>
        ) : stage.productionTask.mode === "listening" ? (
          <div className="listening-ready-card">
            <span aria-hidden="true">◖</span>
            <strong>{copy.tests.listeningReady}</strong>
            <p>{copy.tests.listeningReadyText}</p>
          </div>
        ) : (
          <div className="speaking-recorder">
            <div className={isRecording ? "recording-status recording-status--active" : "recording-status"}>
              <span aria-hidden="true" />
              <strong>{isRecording ? copy.tests.recording : `${stage.productionTask.targetSeconds ?? 60}s`}</strong>
            </div>
            {isRecording ? (
              <button type="button" className="record-button record-button--stop" onClick={stopRecording}>{copy.tests.stopRecording}</button>
            ) : (
              <button type="button" className="record-button" onClick={startRecording}>{recordingUrl ? copy.tests.recordAgain : copy.tests.startRecording}</button>
            )}
            {recordingUrl && <audio controls src={recordingUrl} aria-label={copy.tests.playRecording} />}
            {microphoneError && <p role="alert">{copy.tests.microphoneUnavailable}</p>}
            <label className="practice-without-recording">
              <input type="checkbox" checked={speakingPractised} onChange={(event) => setSpeakingPractised(event.target.checked)} />
              <span>{copy.tests.practiceWithoutRecording}</span>
            </label>
          </div>
        )}

        <aside className="production-checklist">
          <strong>{copy.tests.productionChecklist}</strong>
          <ul>{stage.productionTask.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
        </aside>
        <p className="production-privacy">{copy.tests.productionNotice}</p>
      </main>
      ) : (
      <main className="question-stage">
        <div className="question-meta">
          <span>{copy.tests.question} {questionIndex + 1} {copy.tests.of} {questions.length}</span>
          <span>{copy.tests.attempt} {runNumber} · {question.skill}</span>
        </div>
        {question.passage && <blockquote className="question-passage">{question.passage}</blockquote>}
        {question.audioText && (
          <div className="question-audio">
            <button type="button" onClick={playAudio}><span aria-hidden="true">▶</span>{copy.tests.playAudio}</button>
            {audioFallback && <p><small>{copy.tests.audioUnavailable}</small>{question.audioText}</p>}
          </div>
        )}
        <h1>{question.prompt}</h1>
        <div className="answer-options" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((option, optionIndex) => (
            <label className={selectedAnswer === optionIndex ? "answer-option answer-option--selected" : "answer-option"} key={option}>
              <input type="radio" name={question.id} checked={selectedAnswer === optionIndex} onChange={() => chooseAnswer(optionIndex)} />
              <span>{String.fromCharCode(65 + optionIndex)}</span>
              <strong>{option}</strong>
            </label>
          ))}
        </div>
      </main>
      )}

      <footer className="session-action-bar">
        <p aria-live="polite">{productionDone && selectedAnswer === undefined ? copy.tests.selectAnswer : ""}</p>
        <button type="button" disabled={productionDone ? selectedAnswer === undefined : !canContinueProduction} onClick={productionDone ? continueTest : continueFromProduction}>
          {productionDone ? (questionIndex === questions.length - 1 ? copy.tests.finish : copy.tests.next) : copy.tests.continueRubric}<span aria-hidden="true">→</span>
        </button>
      </footer>
    </div>
  );
}
