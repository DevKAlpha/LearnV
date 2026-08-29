import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import { isStageUnlocked, type TestSkill } from "@/domain/models/language-test";
import { practiceTestTracks as languageTestTracks, TESTS_PER_LANGUAGE, TESTS_PER_SKILL } from "@/infrastructure/data/practice-tests";
import { AppIcon, type AppIconName } from "@/shared/ui/AppIcon";

export function TestPathPage() {
  const { language: languageParam } = useParams();
  const language = languageParam === "ko" ? "ko" : "en";
  const invalidLanguage = languageParam !== "en" && languageParam !== "ko";
  const { copy } = useI18n();
  const { progress, totals } = useLanguageTestProgress();
  const track = languageTestTracks[language];
  const trackProgress = progress[language];
  const attemptCount = Object.values(trackProgress).reduce((total, stage) => total + stage.attempts, 0);
  const [activeSkill, setActiveSkill] = useState<TestSkill>("writing");
  const [showAll, setShowAll] = useState(false);
  const labels = { writing: copy.tests.writing, listening: copy.tests.listening, pronunciation: copy.tests.pronunciation };

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
        <nav className="test-skill-tabs" aria-label={copy.tests.pathTitle}>
          {(["writing", "listening", "pronunciation"] as TestSkill[]).map((skill) => {
            const completed = track.stages.filter((stage) => stage.skill === skill && trackProgress[stage.id]?.passed).length;
            return <button key={skill} type="button" aria-pressed={activeSkill === skill} onClick={() => { setActiveSkill(skill); setShowAll(false); }}><AppIcon name={skill === "pronunciation" ? "speaking" : skill} /><span>{labels[skill]}</span><small>{completed}/{TESTS_PER_SKILL}</small></button>;
          })}
        </nav>
        {([activeSkill] as TestSkill[]).map((skill) => {
          const skillStages = track.stages.filter((stage) => stage.skill === skill);
          const completed = skillStages.filter((stage) => trackProgress[stage.id]?.passed).length;
          const icons: Record<TestSkill, AppIconName> = { writing: "writing", listening: "listening", pronunciation: "speaking" };
          const firstIncompleteIndex = skillStages.findIndex((stage) => !trackProgress[stage.id]?.passed);
          const currentIndex = firstIncompleteIndex < 0 ? skillStages.length - 1 : firstIncompleteIndex;
          const visibleStages = showAll ? skillStages : skillStages.filter((_, index) => index >= Math.max(0, currentIndex - 1) && index <= Math.min(skillStages.length - 1, currentIndex + 1));
          return <section className={`test-skill-section test-skill-section--${skill}`} key={skill}>
            <header className="test-skill-header">
              <span aria-hidden="true"><AppIcon name={icons[skill]} /></span>
              <div><small>{completed}/{TESTS_PER_SKILL} {copy.tests.completed}</small><h2>{labels[skill]}</h2><p>{copy.tests.skillDescriptions[skill]}</p></div>
            </header>
            <div className="test-map">
        {visibleStages.map((stage) => {
          const skillIndex = skillStages.findIndex((candidate) => candidate.id === stage.id);
          const index = track.stages.findIndex((candidate) => candidate.id === stage.id);
          const unlocked = isStageUnlocked(track.stages, index, trackProgress);
          const stageProgress = trackProgress[stage.id];
          const passed = Boolean(stageProgress?.passed);
          const stateLabel = passed ? copy.tests.passed : unlocked ? copy.tests.current : copy.tests.locked;
          const content = (
            <>
              <span className="test-node-ring">
                <span className="test-node-core"><AppIcon name={icons[skill]} /><b>{language === "ko" ? stage.icon : String(skillIndex + 1).padStart(2, "0")}</b></span>
                {passed && <i aria-hidden="true">✓</i>}
                {!unlocked && <i aria-hidden="true"><AppIcon name="lock" /></i>}
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
            <button className="test-path-expand" type="button" onClick={() => setShowAll((current) => !current)}>{showAll ? (language === "ko" ? "현재 단계만 보기" : "Show current steps") : (language === "ko" ? `${TESTS_PER_SKILL}개 단계 모두 보기` : `Show all ${TESTS_PER_SKILL} steps`)}</button>
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
