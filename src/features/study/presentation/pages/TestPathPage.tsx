import { useEffect, useRef } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import { type TestSkill } from "@/domain/models/language-test";
import { getLanguagePath } from "@/infrastructure/data/language-paths";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";
import { AppIcon, type AppIconName } from "@/shared/ui/AppIcon";
import { LanguageCulture } from "@/shared/ui/LanguageCulture";
import { scrollToLearningTop } from "@/shared/ui/motion-preferences";
import { LearningPathMap } from "../components/LearningPathMap";
import { getLanguagePathHref, getPathSkill, pathSkillOrder } from "../components/learning-path-layout";

export function TestPathPage() {
  const { language: languageParam } = useParams();
  const language = languageParam === "ko" ? "ko" : "en";
  const invalidLanguage = languageParam !== "en" && languageParam !== "ko";
  const { copy, locale } = useI18n();
  const { progress } = useLanguageTestProgress();
  const [searchParams, setSearchParams] = useSearchParams();
  const trackProgress = progress[language];
  const path = getLanguagePath(language, trackProgress, searchParams.get("phase") === "foundation" ? "foundation" : undefined);
  const track = path.track;
  const advancedCopy = advancedPathCopy[locale];
  const attemptCount = track.stages.reduce((total, stage) => total + (trackProgress[stage.id]?.attempts ?? 0), 0);
  const activeSkill = getPathSkill(searchParams.get("skill"));
  const phaseKey = `${language}:${path.phase}`;
  const previousPhase = useRef(phaseKey);
  useEffect(() => {
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
    <div className={`page test-path-page test-path-page--${language} test-path-page--${path.phase}`} data-help-phase={path.phase}>
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
          {path.advancedUnlocked && <Link className="test-back-link" to={getLanguagePathHref(language, activeSkill, path.phase === "advanced" ? "foundation" : "advanced")}>{path.phase === "advanced" ? advancedCopy.foundation : advancedCopy.advanced}<span aria-hidden="true">→</span></Link>}
        </aside>
        <div className="test-stat-row">
          <span><b>◆</b>{track.target}</span>
          <span><b>↻</b>{attemptCount} {copy.tests.attempts}</span>
        </div>
      </header>

      <section className="test-skill-sections" aria-label={copy.tests.pathTitle}>
        <nav className="test-skill-tabs" aria-label={copy.tests.pathTitle}>
          {pathSkillOrder.map((skill) => {
            const completed = track.stages.filter((stage) => stage.skill === skill && trackProgress[stage.id]?.passed).length;
            const skillTotal = track.stages.filter((stage) => stage.skill === skill).length;
            return <button key={skill} type="button" aria-pressed={activeSkill === skill} aria-controls={activeSkill === skill ? `learning-path-${language}-${path.phase}-${skill}` : undefined} onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (skill === "reading") next.delete("skill"); else next.set("skill", skill);
              setSearchParams(next, { replace: true });
            }}><AppIcon name={icons[skill]} /><span>{labels[skill]}</span><small>{completed}/{skillTotal}</small></button>;
          })}
        </nav>
        <LearningPathMap key={`${phaseKey}:${activeSkill}`} language={language} phase={path.phase} skill={activeSkill} stages={track.stages.filter((stage) => stage.skill === activeSkill)} progress={trackProgress} icon={icons[activeSkill]} label={labels[activeSkill]} description={path.phase === "advanced" ? advancedCopy.goal : copy.tests.skillDescriptions[activeSkill]} />
      </section>

      <aside className="test-source-note">
        <span>◎</span>
        <div><small>{copy.tests.officialBasis}</small><a href={track.sourceUrl} target="_blank" rel="noreferrer">{track.sourceLabel} ↗</a></div>
      </aside>
    </div>
  );
}
