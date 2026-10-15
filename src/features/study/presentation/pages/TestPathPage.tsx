import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import { type TestSkill } from "@/domain/models/language-test";
import { getLanguagePath, isLanguageStageUnlocked } from "@/infrastructure/data/language-paths";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";
import { AppIcon, type AppIconName } from "@/shared/ui/AppIcon";
import { LanguageCulture } from "@/shared/ui/LanguageCulture";
import { scrollToLearningTop } from "@/shared/ui/motion-preferences";

const pathPositions = [28, 70, 48, 76, 32, 53] as const;
const mobilePathPositions = [34, 65, 49, 65, 34, 50] as const;
const pathShapes = ["round", "arch", "soft-square", "petal"] as const;

function PathCultureAccent({ language, variant }: { language: "en" | "ko"; variant: number }) {
  const artwork = language === "ko" ? [
    <><path d="M10 57h94M21 55V35l36-22 36 22v20M16 36h82M37 55V40h40v15M47 55V43h20v12" /><path d="M57 13v-7M29 55l-5 9M84 55l6 9" /></>,
    <><path d="M20 62c12-17 27-22 40-10 14-20 31-16 42 8M14 65h92M72 19v31M65 24l7-9 7 9M74 16h17" /><circle cx="29" cy="28" r="8" /></>,
    <><rect x="22" y="18" width="75" height="50" rx="6" /><path d="M35 32h19m-9-9v25m19-16h20m-20 10h20M33 57h52" /></>,
  ] : [
    <><path d="M18 64h88M30 62V26h45v36M75 42h19v20M35 33h9m8 0h9m-26 9h9m8 0h9m-26 9h9m8 0h9M87 42V25M81 26h12" /><circle cx="86" cy="15" r="6" /></>,
    <><path d="M14 54c17-8 30-8 45 0 15-8 28-8 45 0v10c-16-7-29-7-45 0-16-7-29-7-45 0V54ZM59 53V22M19 30c11-7 23-7 35 0m10 0c11-7 23-7 35 0M19 30v20m35-20v20m10-20v20m35-20v20" /></>,
    <><path d="M18 54h70a13 13 0 0 1-13 12H32a14 14 0 0 1-14-12ZM88 56c18-2 20-18 2-19M37 32c-8-8 5-10 0-18m18 18c-8-8 5-10 0-18m18 18c-8-8 5-10 0-18" /></>,
  ];
  return <svg className="test-path-culture-accent" viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{artwork[variant % artwork.length]}</svg>;
}

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
  const phaseKey = `${language}:${path.phase}`;
  const previousPhase = useRef(phaseKey);
  useEffect(() => {
    setActiveSkill("reading"); setShowAll(false);
    if (previousPhase.current !== phaseKey) scrollToLearningTop();
    previousPhase.current = phaseKey;
  }, [phaseKey]);
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
    <div className={`page test-path-page test-path-page--${language} test-path-page--${path.phase}`}>
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

      <section className="test-skill-sections" aria-label={copy.tests.pathTitle}>
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
            <ol className="test-map">
        {visibleStages.map((stage, visibleIndex) => {
          const skillIndex = skillStages.findIndex((candidate) => candidate.id === stage.id);
          const unlocked = isLanguageStageUnlocked(language, stage.id, trackProgress);
          const stageProgress = trackProgress[stage.id];
          const passed = Boolean(stageProgress?.passed);
          const stateLabel = passed ? copy.tests.passed : unlocked ? copy.tests.current : copy.tests.locked;
          const position = pathPositions[skillIndex % pathPositions.length];
          const nextPosition = pathPositions[(skillIndex + 1) % pathPositions.length];
          const mobilePosition = mobilePathPositions[skillIndex % mobilePathPositions.length];
          const nextMobilePosition = mobilePathPositions[(skillIndex + 1) % mobilePathPositions.length];
          const itemStyle = { "--path-x": position, "--path-mobile-x": mobilePosition } as CSSProperties;
          const content = (
            <>
              <span className="test-node-ring">
                <span className="test-node-core"><AppIcon name={icons[skill]} /><b>{language === "ko" ? stage.icon : String(skillIndex + 1).padStart(2, "0")}</b></span>
                {passed && <i aria-hidden="true">✓</i>}
                {!unlocked && <i aria-hidden="true"><AppIcon name="lock" /></i>}
              </span>
              <span className="test-node-copy">
                <small>{path.phase === "advanced" && <span className="test-path-c1-label">C1</span>}{String(skillIndex + 1).padStart(2, "0")} · {stateLabel}</small>
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

          return <li className={`test-path-step test-path-step--${pathShapes[skillIndex % pathShapes.length]}`} style={itemStyle} key={stage.id}>
            {visibleIndex < visibleStages.length - 1 && <svg className="test-path-connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d={`M ${position} 0 C ${position} 48, ${nextPosition} 52, ${nextPosition} 100`} /></svg>}
            {visibleIndex < visibleStages.length - 1 && <svg className="test-path-connector test-path-connector--mobile" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d={`M ${mobilePosition} 0 C ${mobilePosition} 48, ${nextMobilePosition} 52, ${nextMobilePosition} 100`} /></svg>}
            {(showAll ? visibleIndex < 16 && visibleIndex % 5 === 0 : visibleIndex === 0) && <span className="test-path-decoration"><PathCultureAccent language={language} variant={skillIndex} /></span>}
            {unlocked ? <Link className={`test-map-node test-map-node--${passed ? "passed" : "open"}`} aria-current={skillIndex === currentIndex && !passed ? "step" : undefined} to={`/tests/${language}/${stage.id}`}>{content}</Link>
              : <div className="test-map-node test-map-node--locked" aria-disabled="true">{content}</div>}
          </li>;
        })}
            </ol>
            {skillStages.length > 3 && <button className="test-path-expand" type="button" onClick={() => setShowAll((current) => !current)}>{showAll ? (language === "ko" ? "현재 단계만 보기" : "Show current steps") : (language === "ko" ? `${skillStages.length}개 단계 모두 보기` : `Show all ${skillStages.length} steps`)}</button>}
          </section>;
        })}
      </section>

      <aside className="test-source-note">
        <span>◎</span>
        <div><small>{copy.tests.officialBasis}</small><a href={track.sourceUrl} target="_blank" rel="noreferrer">{track.sourceLabel} ↗</a></div>
      </aside>
    </div>
  );
}
