import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useLanguageTestProgress } from "../../application/controllers/useLanguageTestProgress";
import { useI18n } from "../../application/i18n/I18nContext";
import { isStageUnlocked, type TestLanguage, type TestSkill } from "../../domain/models/language-test";
import { practiceTestTracks as languageTestTracks, TESTS_PER_LANGUAGE } from "../../infrastructure/data/practice-tests";

export function TestPathPage() {
  const { language: languageParam } = useParams();
  const language = languageParam === "ko" ? "ko" : "en";
  const invalidLanguage = languageParam !== "en" && languageParam !== "ko";
  const { copy, setLocale } = useI18n();
  const { progress, totals } = useLanguageTestProgress();
  const track = languageTestTracks[language];
  const trackProgress = progress[language];
  const attemptCount = Object.values(trackProgress).reduce((total, stage) => total + stage.attempts, 0);

  useEffect(() => {
    setLocale(language as TestLanguage);
  }, [language, setLocale]);

  if (invalidLanguage) return <Navigate to="/study" replace />;

  return (
    <div className={`page test-path-page test-path-page--${language}`}>
      <header className="test-path-header">
        <Link className="test-back-link" to={`/study/${language === "en" ? "english" : "korean"}`}><span aria-hidden="true">←</span>{copy.tests.backLibrary}</Link>
        <span className="eyebrow">{copy.tests.pathKicker}</span>
        <div className="test-path-heading">
          <div>
            <span className="test-path-language">{track.shortLabel}</span>
            <h1>{track.label}</h1>
            <p>{copy.tests.pathIntro}</p>
          </div>
          <div className="test-path-score" aria-label={`${totals[language]} ${copy.tests.completed}`}>
            <strong>{totals[language]}/{TESTS_PER_LANGUAGE}</strong>
            <small>{copy.tests.completed}</small>
          </div>
        </div>
        <div className="test-stat-row">
          <span><b>◆</b>{track.target}</span>
          <span><b>↻</b>{attemptCount} {copy.tests.attempts}</span>
        </div>
      </header>

      <main className="test-skill-sections" aria-label={copy.tests.pathTitle}>
        {(["writing", "listening", "pronunciation"] as TestSkill[]).map((skill) => {
          const skillStages = track.stages.filter((stage) => stage.skill === skill);
          const completed = skillStages.filter((stage) => trackProgress[stage.id]?.passed).length;
          const labels = { writing: copy.tests.writing, listening: copy.tests.listening, pronunciation: copy.tests.pronunciation };
          const icons = { writing: "✎", listening: "◖", pronunciation: "🎙" };
          return <section className={`test-skill-section test-skill-section--${skill}`} key={skill}>
            <header className="test-skill-header">
              <span aria-hidden="true">{icons[skill]}</span>
              <div><small>{completed}/10 {copy.tests.completed}</small><h2>{labels[skill]}</h2><p>{copy.tests.skillDescriptions[skill]}</p></div>
            </header>
            <div className="test-map">
        {skillStages.map((stage, skillIndex) => {
          const index = track.stages.findIndex((candidate) => candidate.id === stage.id);
          const unlocked = isStageUnlocked(track.stages, index, trackProgress);
          const stageProgress = trackProgress[stage.id];
          const passed = Boolean(stageProgress?.passed);
          const stateLabel = passed ? copy.tests.passed : unlocked ? copy.tests.current : copy.tests.locked;
          const content = (
            <>
              <span className="test-node-ring">
                <span className="test-node-core"><b>{stage.icon}</b></span>
                {passed && <i aria-hidden="true">✓</i>}
                {!unlocked && <i aria-hidden="true">⌕</i>}
              </span>
              <span className="test-node-copy">
                <small>{String(skillIndex + 1).padStart(2, "0")} · {stateLabel}</small>
                <span className={`test-mode-pill test-mode-pill--${stage.productionTask.mode}`}>
                  {labels[skill]}
                </span>
                <strong>{stage.title}</strong>
                <span>{stage.focus}</span>
                {unlocked ? (
                  <em>{stageProgress ? copy.tests.retakeAttempt : copy.tests.firstAttempt}</em>
                ) : <em>{copy.tests.unlockHint}</em>}
                {stageProgress && <b>{copy.tests.best} · {stageProgress.bestScore}%</b>}
              </span>
            </>
          );

          return unlocked ? (
            <Link className={`test-map-node test-map-node--${passed ? "passed" : "open"}`} to={`/tests/${language}/${stage.id}`} key={stage.id}>
              {content}
            </Link>
          ) : (
            <div className="test-map-node test-map-node--locked" aria-disabled="true" key={stage.id}>{content}</div>
          );
        })}
            </div>
          </section>;
        })}
      </main>

      <aside className="test-source-note">
        <span>◎</span>
        <div><small>{copy.tests.officialBasis}</small><a href={track.sourceUrl} target="_blank" rel="noreferrer">{track.sourceLabel} ↗</a></div>
      </aside>
    </div>
  );
}
