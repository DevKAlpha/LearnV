import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useLanguageTestProgress } from "../../application/controllers/useLanguageTestProgress";
import { useI18n } from "../../application/i18n/I18nContext";
import { isStageUnlocked, type TestLanguage } from "../../domain/models/language-test";
import { languageTestTracks } from "../../infrastructure/data/language-tests";

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
        <Link className="test-back-link" to="/study"><span aria-hidden="true">←</span>{copy.tests.backLibrary}</Link>
        <span className="eyebrow">{copy.tests.pathKicker}</span>
        <div className="test-path-heading">
          <div>
            <span className="test-path-language">{track.shortLabel}</span>
            <h1>{track.label}</h1>
            <p>{copy.tests.pathIntro}</p>
          </div>
          <div className="test-path-score" aria-label={`${totals[language]} ${copy.tests.completed}`}>
            <strong>{totals[language]}/5</strong>
            <small>{copy.tests.completed}</small>
          </div>
        </div>
        <div className="test-stat-row">
          <span><b>◆</b>{track.target}</span>
          <span><b>↻</b>{attemptCount} {copy.tests.attempts}</span>
        </div>
      </header>

      <main className="test-map" aria-label={copy.tests.pathTitle}>
        {track.stages.map((stage, index) => {
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
                <small>{String(index + 1).padStart(2, "0")} · {stateLabel}</small>
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
      </main>

      <aside className="test-source-note">
        <span>◎</span>
        <div><small>{copy.tests.officialBasis}</small><a href={track.sourceUrl} target="_blank" rel="noreferrer">{track.sourceLabel} ↗</a></div>
      </aside>
    </div>
  );
}
