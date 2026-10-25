import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import { learningResources } from "@/infrastructure/data/learning-resources";
import { getLanguagePathSummary as getLanguagePath } from "@/infrastructure/data/language-path-summary";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";
import { PageEmblem } from "@/shared/ui/PageEmblem";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { isLearningQa } from "@/application/qa/qa-learning-scope";
import { LanguageCulture } from "@/shared/ui/LanguageCulture";
import { SceneArt } from "@/shared/ui/SceneArt";

const LearningAnalysisPanel = lazy(() => import("@/features/study/presentation/components/LearningAnalysisPanel").then((module) => ({ default: module.LearningAnalysisPanel })));
const AdaptiveRecommendationCenter = lazy(() => import("@/features/study/presentation/components/AdaptiveRecommendationCenter").then((module) => ({ default: module.AdaptiveRecommendationCenter })));

export function StudyPage({ learning }: { learning: LearningJourneyController }) {
  const { copy, locale } = useI18n();
  const { totals, progress } = useLanguageTestProgress();
  const advancedCopy = advancedPathCopy[locale];
  const hasLearningEvidence = learning.analysis.totalAttempts > 0;
  const [supportOpen, setSupportOpen] = useState(false);
  const spaces = [
    {
      language: "english",
      code: "en" as const,
      title: copy.study.englishSpaceTitle,
      text: copy.study.englishSpaceText,
      target: copy.study.englishSpaceTarget,
    },
    {
      language: "korean",
      code: "ko" as const,
      title: copy.study.koreanSpaceTitle,
      text: copy.study.koreanSpaceText,
      target: copy.study.koreanSpaceTarget,
    },
  ];
  const starterSteps = [
    ...(!isLearningQa ? [{ label: copy.study.stepGuide, to: "/gks" }] : []),
    { label: copy.study.stepKorean, to: "/study/korean" },
    { label: copy.study.stepEnglish, to: "/study/english" },
  ];

  return (
    <div className="page page--study-library">
      <header className="page-header page-header--study page-header--decorated story-masthead">
        <div className="story-masthead__copy">
          <PageEmblem icon="study" />
          <span className="sticker sticker--blue">{copy.study.sticker}</span>
          <h1>{copy.study.title}</h1>
          <p>{copy.study.intro}</p>
        </div>
        <div className="story-masthead__art"><SceneArt scene="reader" eager /><span aria-hidden="true">EN / 한</span></div>
      </header>

      <section className="study-start-card" aria-labelledby="starter-route-title">
        <div className="study-start-card__copy">
          <span className="eyebrow">{copy.study.startHere}</span>
          <small>{copy.study.weekOne}</small>
          <h2 id="starter-route-title">{copy.study.weekTitle}</h2>
          <p>{isLearningQa ? copy.study.qaWeekText : copy.study.weekText}</p>
        </div>
        <ol className="starter-steps">
          {starterSteps.map((step, index) => (
            <li key={step.to}>
              <Link to={step.to}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.label}</strong>
                <i aria-hidden="true">→</i>
              </Link>
            </li>
          ))}
        </ol>
        <div className="study-start-illustration"><SceneArt scene="garden" /></div>
      </section>

      <section className="study-language-spaces" aria-labelledby="language-spaces-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{copy.study.spacesKicker}</span>
            <h2 id="language-spaces-title">{copy.study.spacesTitle}</h2>
          </div>
        </div>
        <p className="section-intro">{copy.study.spacesIntro}</p>
        <div className="study-language-spaces__grid">
          {spaces.map((space) => {
            const path = getLanguagePath(space.code, progress[space.code]);
            const advanced = path.phase === "advanced";
            const resourceCount = learningResources.filter((resource) => resource.languages.includes(space.code)).length;
            return (
              <article className={`study-language-space study-language-space--${space.code}`} key={space.code}>
                <div className="study-volume-art" aria-hidden="true"><SceneArt scene={space.code === "en" ? "london" : "seoul"} /><b>{space.code === "en" ? "01" : "02"}</b></div>
                <LanguageCulture language={space.code} />
                <div className="study-language-space__top"><small>{advanced ? advancedCopy.goal : space.target}</small></div>
                <h3>{advanced ? (space.code === "en" ? advancedCopy.title : advancedCopy.koreanTitle) : space.title}</h3>
                <p>{advanced ? advancedCopy.intro : space.text}</p>
                <div className="study-language-space__stats">
                  <span><b>{advanced ? path.completed : totals[space.code]}/{path.track.stages.length}</b>{copy.study.testsPassed}</span>
                  <span><b>{resourceCount}</b>{copy.study.resourcesAvailable}</span>
                </div>
                <Link to={`/study/${space.language}`}>{copy.study.openSpace}<span aria-hidden="true">→</span></Link>
              </article>
            );
          })}
        </div>
      </section>

      <details
        className="study-support-drawer"
        open={supportOpen}
        onToggle={(event) => setSupportOpen(event.currentTarget.open)}
      >
        <summary>
          <span className="study-support-drawer__symbol" aria-hidden="true">⌁</span>
          <span>
            <small>{copy.study.supportKicker}</small>
            <strong>{copy.study.supportTitle}</strong>
            <em>{copy.study.supportIntro}</em>
          </span>
          <b>{hasLearningEvidence ? copy.study.supportReady : copy.study.supportPending}</b>
          <i aria-hidden="true">＋</i>
        </summary>
        {supportOpen && (
          <div className="study-support-drawer__content">
            <Suspense fallback={<p role="status">{copy.common.loadingContent}</p>}>
              <LearningAnalysisPanel learning={learning} />
              <AdaptiveRecommendationCenter learning={learning} />
            </Suspense>
          </div>
        )}
      </details>

      <section className="study-practice-labs" aria-labelledby="study-practice-labs-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{copy.study.labsKicker}</span>
            <h2 id="study-practice-labs-title">{copy.study.labsTitle}</h2>
          </div>
        </div>
        <p className="section-intro">{copy.study.labsIntro}</p>
        <div className="study-practice-labs__grid">
          <section className="written-entry" aria-labelledby="written-entry-title">
            <div className="story-lab-art"><SceneArt scene="desk" /></div>
            <div>
              <span className="eyebrow">{copy.written.entryKicker}</span>
              <h2 id="written-entry-title">{copy.written.entryTitle}</h2>
              <p>{copy.written.entryText}</p>
              <ul>{copy.written.entryPoints.map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
            <Link to="/study/written-simulator">{copy.written.entryAction}<span aria-hidden="true">→</span></Link>
          </section>

          <section className="interview-entry" aria-labelledby="interview-entry-title">
            <div className="story-lab-art"><SceneArt scene="journey" /></div>
            <div>
              <span className="eyebrow">{copy.interview.entryKicker}</span>
              <h2 id="interview-entry-title">{copy.interview.entryTitle}</h2>
              <p>{copy.interview.entryText}</p>
              <ul>{copy.interview.entryPoints.map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
            <Link to="/study/interviews">{copy.interview.entryAction}<span aria-hidden="true">→</span></Link>
          </section>
        </div>
      </section>
    </div>
  );
}
