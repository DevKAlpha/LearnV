import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import { type TestSkill } from "@/domain/models/language-test";
import { getLanguagePath, isLanguageStageUnlocked } from "@/infrastructure/data/language-paths";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";
import { AppIcon, type AppIconName } from "@/shared/ui/AppIcon";
import { LanguageCulture } from "@/shared/ui/LanguageCulture";

export function TestPathPage() {
  const { language: languageParam } = useParams();
  const language = languageParam === "ko" ? "ko" : "en";
  const invalidLanguage = languageParam !== "en" && languageParam !== "ko";
  const { copy, locale } = useI18n();
  const { progress } = useLanguageTestProgress();
  const [searchParams] = useSearchParams();
  const trackProgress = progress[language];
  const path = getLanguagePath(language, trackProgress, searchParams.get("phase") === "foundation" ? "foundation" : undefined);
  const track = path.track;
  const advancedCopy = advancedPathCopy[locale];
  const attemptCount = track.stages.reduce((total, stage) => total + (trackProgress[stage.id]?.attempts ?? 0), 0);
  const [activeSkill, setActiveSkill] = useState<TestSkill>("reading");
  const [showAll, setShowAll] = useState(false);
  useEffect(() => { setActiveSkill("reading"); setShowAll(false); }, [language, path.phase]);
  const labels: Record<TestSkill, string> = {
    reading: copy.tests.reading,
    grammar: copy.tests.grammar,
    vocabulary: copy.tests.vocabulary,
    writing: copy.tests.writing,
    listening: copy.tests.listening,
    pronunciation: copy.tests.pronunciation,
  };
  const skillOrder: TestSkill[] = ["reading", "grammar", "vocabulary", "writing", "listening", "pronunciation"];
  const icons: Record<TestSkill, AppIconName> = {
    reading: "book",
    grammar: "test",
    vocabulary: "sparkle",
    writing: "writing",
    listening: "listening",
    pronunciation: "speaking",
  };

  useEffect(() => {
    if (!invalidLanguage) return;
    recordLearningError({
      area: "study-overview",
      severity: "warning",
      code: "invalid-test-path-language",
      context: { languageParam: languageParam ?? null },
    });
  }, [invalidLanguage, languageParam]);

  if (invalidLanguage) return <Navigate to="/study" replace />;

  return (
    <div className={`page test-path-page test-path-page--${language}`}>
      <header className="test-path-header">
        <Link className="test-back-link" to={`/study/${language === "en" ? "english" : "korean"}`}><span aria-hidden="true">←</span>{copy.tests.backLibrary}</Link>
        <LanguageCulture language={language} variant="badge" />
        <span className="eyebrow">{copy.tests.pathKicker}</span>
        <div className="test-path-heading">
          <div>
            <span className="test-path-language">{track.shortLabel}</span>
            <h1>{track.label}</h1>
            <p>{path.phase === "advanced" ? advancedCopy.intro : copy.tests.pathIntro}</p>
          </div>
          <div className="test-path-score" aria-label={`${path.completed} ${copy.tests.completed}`}>
            <strong>{path.completed}/{track.stages.length}</strong>
            <small>{copy.tests.completed}</small>
          </div>
        </div>
        <aside className="advanced-path-notice" aria-label={advancedCopy.current}>
          {path.phase === "advanced" ? <><strong>{language === "en" ? advancedCopy.title : advancedCopy.koreanTitle}</strong><p>{path.complete ? advancedCopy.finished : advancedCopy.criteria}</p><details><summary>{advancedCopy.scope}</summary><small>{advancedCopy.notice}</small></details></>
            : <p>{path.advancedUnlocked ? advancedCopy.archive : advancedCopy.upcoming}</p>}
          {path.advancedUnlocked && <Link className="test-back-link" to={`/tests/${language}${path.phase === "advanced" ? "?phase=foundation" : ""}`}>{path.phase === "advanced" ? advancedCopy.foundation : advancedCopy.advanced}<span aria-hidden="true">→</span></Link>}
        </aside>
        <div className="test-stat-row">
          <span><b>◆</b>{track.target}</span>
          <span><b>↻</b>{attemptCount} {copy.tests.attempts}</span>
        </div>
      </header>

      <main className="test-skill-sections" aria-label={copy.tests.pathTitle}>
        <nav className="test-skill-tabs" aria-label={copy.tests.pathTitle}>
          {skillOrder.map((skill) => {
            const completed = track.stages.filter((stage) => stage.skill === skill && trackProgress[stage.id]?.passed).length;
            const skillTotal = track.stages.filter((stage) => stage.skill === skill).length;
            return <button key={skill} type="button" aria-pressed={activeSkill === skill} onClick={() => { setActiveSkill(skill); setShowAll(false); }}><AppIcon name={icons[skill]} /><span>{labels[skill]}</span><small>{completed}/{skillTotal}</small></button>;
          })}
        </nav>
        {([activeSkill] as TestSkill[]).map((skill) => {
          const skillStages = track.stages.filter((stage) => stage.skill === skill);
          const completed = skillStages.filter((stage) => trackProgress[stage.id]?.passed).length;
          const firstIncompleteIndex = skillStages.findIndex((stage) => !trackProgress[stage.id]?.passed);
          const currentIndex = firstIncompleteIndex < 0 ? skillStages.length - 1 : firstIncompleteIndex;
          const visibleStages = showAll ? skillStages : skillStages.filter((_, index) => index >= Math.max(0, currentIndex - 1) && index <= Math.min(skillStages.length - 1, currentIndex + 1));
          return <section className={`test-skill-section test-skill-section--${skill}`} key={skill}>
            <header className="test-skill-header">
              <span aria-hidden="true"><AppIcon name={icons[skill]} /></span>
              <div><small>{completed}/{skillStages.length} {copy.tests.completed}</small><h2>{labels[skill]}</h2><p>{path.phase === "advanced" ? advancedCopy.goal : copy.tests.skillDescriptions[skill]}</p></div>
            </header>
            <div className="test-map">
        {visibleStages.map((stage) => {
          const skillIndex = skillStages.findIndex((candidate) => candidate.id === stage.id);
          const unlocked = isLanguageStageUnlocked(language, stage.id, trackProgress);
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
                {skillIndex === currentIndex && stage.learningBridge && <em>{copy.tests.spiralPrevious}: {stage.learningBridge.recall}</em>}
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
            {skillStages.length > 3 && <button className="test-path-expand" type="button" onClick={() => setShowAll((current) => !current)}>{showAll ? (language === "ko" ? "현재 단계만 보기" : "Show current steps") : (language === "ko" ? `${skillStages.length}개 단계 모두 보기` : `Show all ${skillStages.length} steps`)}</button>}
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
