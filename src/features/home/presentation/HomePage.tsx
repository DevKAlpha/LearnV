import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { currentCycle } from "@/infrastructure/data/gks-2026";
import { ProgressOrbit } from "@/shared/ui/ProgressOrbit";
import { useI18n } from "@/application/i18n/I18nContext";
import { LanguageGoals } from "@/features/home/presentation/LanguageGoals";
import { getReminderStage } from "@/domain/models/learning-reminder";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { LearningJourneyPanel } from "@/shared/ui/LearningJourneyPanel";
import type { PlanStatus } from "@/features/home/presentation/DailyPlanCard";
import { isLearningQa } from "@/application/qa/qa-learning-scope";
import { SceneArt } from "@/shared/ui/SceneArt";
import { storybookCopy } from "@/infrastructure/i18n/storybook-copy";

// Lazy: the plan carries the review deck, which must stay out of the startup bundle.
const DailyPlanCard = lazy(() => import("@/features/home/presentation/DailyPlanCard").then((module) => ({ default: module.DailyPlanCard })));
// Lazy for the same reason: the cycle card and its copy stay out of the startup bundle.
const GksCycleCard = lazy(() => import("@/shared/ui/GksCycleCard").then((module) => ({ default: module.GksCycleCard })));

type Props = {
  score: number;
  progress: { completedTasks: string[] };
  toggleTask: (id: string) => void;
  learning: LearningJourneyController;
};

export function HomePage({ score, progress, toggleTask, learning }: Props) {
  const { locale, copy } = useI18n();
  const story = storybookCopy[locale];
  const [plan, setPlan] = useState<PlanStatus>({ done: 0, total: 0, route: null });
  const reminderStage = getReminderStage(score, plan.done, plan.total);
  const reminderText = copy.home.reminderStages[reminderStage];
  const dateLocale = { es: "es-ES", en: "en-GB", ko: "ko-KR" }[locale];
  const today = new Intl.DateTimeFormat(dateLocale, { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const [titleLineOne, titleLineTwo] = copy.home.title.split("\n");
  const planDone = plan.total > 0 && plan.done === plan.total;

  return (
    <div className="page page--home">
      <header className="mobile-header">
        <div>
          <span className="eyebrow">{today}</span>
          <h1 className="home-route-title" aria-label="우리의 Route to Corea 👉 ❤️ 👈">
            <span lang="ko">우리의</span>
            <span lang="en">Route to</span>
            <span lang="es">Corea</span>
            <span className="home-route-title__icons" aria-hidden="true">👉 ❤️ 👈</span>
          </h1>
        </div>
      </header>

      <section className="hero-grid" aria-labelledby="readiness-title">
        <div className="hero-copy">
          <span className="sticker sticker--yellow">{copy.home.sticker}</span>
          <h2 id="readiness-title">{titleLineOne}<br />{titleLineTwo}</h2>
          <p>{copy.home.intro}</p>
          <Link to={plan.route ?? "/study"} className="primary-button">{planDone ? copy.home.continueLearning : copy.home.start} <span>→</span></Link>
        </div>
        <div className="story-cover">
          <div className="story-panels" aria-hidden="true">
            <figure className="story-panel story-panel--reader"><SceneArt scene="reader" eager /><figcaption><b>01</b>{story.reader}</figcaption></figure>
            <figure className="story-panel story-panel--seoul"><SceneArt scene="seoul" /><figcaption>{story.seoul}</figcaption></figure>
            <figure className="story-panel story-panel--desk"><SceneArt scene="desk" /><figcaption>{story.desk}</figcaption></figure>
          </div>
          <div className="story-cover__footer">
            <div><span className="story-cover__languages" aria-hidden="true">EN <i>↔</i> 한</span><p className="story-cover__caption">{story.atlas}</p></div>
            <ProgressOrbit score={score} />
          </div>
        </div>
      </section>

      <section className="section-block home-today" aria-labelledby="today-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{copy.home.focus}</span>
            <h2 id="today-title">{copy.home.today}</h2>
          </div>
        </div>
        <Suspense fallback={<p className="section-intro" role="status">{copy.common.loadingContent}</p>}>
          <DailyPlanCard ticked={progress.completedTasks} toggle={toggleTask} streak={learning.journey.currentStreak} shieldUsed={learning.shieldUsedThisWeek} onStatus={setPlan} />
        </Suspense>
      </section>

      {!isLearningQa && <Suspense fallback={null}><GksCycleCard /></Suspense>}

      <section className="story-shelf" aria-labelledby="story-shelf-title">
        <div className="section-heading"><div><span className="eyebrow">{story.shelfKicker}</span><h2 id="story-shelf-title">{story.shelf}</h2></div></div>
        <div className="story-shelf__grid">
          {(["en", "ko"] as const).map((language, index) => <Link className={`story-volume story-volume--${language}`} to={`/study/${language === "en" ? "english" : "korean"}`} key={language}>
            <div className="story-volume__art"><SceneArt scene={language === "en" ? "london" : "seoul"} /><span>{story.volume} {String(index + 1).padStart(2, "0")}</span></div>
            <div className="story-volume__copy"><span lang={language}>{language === "en" ? "English" : "한국어"}</span><strong>{language === "en" ? copy.study.englishSpaceTitle : copy.study.koreanSpaceTitle}</strong><small>{language === "en" ? copy.study.englishSpaceTarget : copy.study.koreanSpaceTarget}</small><b>{copy.study.openSpace}<i aria-hidden="true">↗</i></b></div>
          </Link>)}
        </div>
      </section>

      <LearningJourneyPanel learning={learning} compact />

      {!isLearningQa && <Link className="alert-card alert-card--link" to="/gks" title={copy.home.cycleDetails}>
        <div className="alert-icon" aria-hidden="true">!</div>
        <div>
          <span className="eyebrow">{copy.home.radar}</span>
          <strong>{currentCycle.target}</strong>
          <p>{copy.home.cycleNote}</p>
        </div>
        <span className="alert-card__arrow" aria-hidden="true">↗</span>
      </Link>}

      <LanguageGoals />

      <section className="quote-card" aria-live="polite">
        <div className="flower-face" aria-hidden="true"><span>☺</span></div>
        <div>
          <span className="eyebrow">{copy.home.reminder}</span>
          <p>{reminderText}</p>
          <Link className="quote-card__action" to="/study">{copy.home.start}<span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
