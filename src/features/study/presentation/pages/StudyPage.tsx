import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import { learningResources } from "@/infrastructure/data/learning-resources";
import { TESTS_PER_LANGUAGE } from "@/infrastructure/data/practice-tests";
import { PageEmblem } from "@/shared/ui/PageEmblem";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { LearningJourneyPanel } from "@/shared/ui/LearningJourneyPanel";
import { isLearningQa } from "@/application/qa/qa-learning-scope";

const LearningAnalysisPanel = lazy(() => import("@/features/study/presentation/components/LearningAnalysisPanel").then((module) => ({ default: module.LearningAnalysisPanel })));
const AdaptiveRecommendationCenter = lazy(() => import("@/features/study/presentation/components/AdaptiveRecommendationCenter").then((module) => ({ default: module.AdaptiveRecommendationCenter })));

export function StudyPage({ learning }: { learning: LearningJourneyController }) {
  const { copy } = useI18n();
  const { totals } = useLanguageTestProgress();
  const hasLearningEvidence = learning.analysis.totalAttempts > 0;
  const [supportOpen, setSupportOpen] = useState(false);
  const spaces = [
    {
      language: "english",
      code: "en" as const,
      symbol: "A+",
      title: copy.study.englishSpaceTitle,
      text: copy.study.englishSpaceText,
      target: copy.study.englishSpaceTarget,
    },
    {
      language: "korean",
      code: "ko" as const,
      symbol: "한",
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
      <header className="page-header page-header--study page-header--decorated">
        <PageEmblem icon="study" />
        <span className="sticker sticker--blue">{copy.study.sticker}</span>
        <h1>{copy.study.title}</h1>
        <p>{copy.study.intro}</p>
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
        <div className="study-character study-character--library" aria-hidden="true">
          <span>가</span><i /><b>A+</b>
        </div>
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
            const resourceCount = learningResources.filter((resource) => resource.languages.includes(space.code)).length;
            return (
              <article className={`study-language-space study-language-space--${space.code}`} key={space.code}>
                <div className="study-language-space__top">
                  <span aria-hidden="true">{space.symbol}</span>
                  <small>{space.target}</small>
                </div>
                <h3>{space.title}</h3>
                <p>{space.text}</p>
                <div className="study-language-space__stats">
                  <span><b>{totals[space.code]}/{TESTS_PER_LANGUAGE}</b>{copy.study.testsPassed}</span>
                  <span><b>{resourceCount}</b>{copy.study.resourcesAvailable}</span>
                </div>
                <Link to={`/study/${space.language}`}>{copy.study.openSpace}<span aria-hidden="true">→</span></Link>
              </article>
            );
          })}
        </div>
      </section>

      <div className="study-next-step">
        <LearningJourneyPanel learning={learning} compact />
      </div>

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
            <div className="written-entry__symbol" aria-hidden="true"><span>✎</span><i /></div>
            <div>
              <span className="eyebrow">{copy.written.entryKicker}</span>
              <h2 id="written-entry-title">{copy.written.entryTitle}</h2>
              <p>{copy.written.entryText}</p>
              <ul>{copy.written.entryPoints.map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
            <Link to="/study/written-simulator">{copy.written.entryAction}<span aria-hidden="true">→</span></Link>
          </section>

          <section className="interview-entry" aria-labelledby="interview-entry-title">
            <div className="interview-entry__icon" aria-hidden="true"><span>Q</span><i /></div>
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
