import { useMemo, useState } from "react";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { trackLearning } from "@/application/controllers/learningJourneyEvents";
import { useI18n } from "@/application/i18n/I18nContext";
import { localize } from "@/domain/models/i18n";
import {
  buildRecommendationPlan,
  type RecommendationFormat,
  type RecommendationMode,
} from "@/domain/models/adaptive-recommendations";
import { adaptiveLearningResources } from "@/infrastructure/data/adaptive-learning-resources";
import { AppIcon, type AppIconName } from "@/shared/ui/AppIcon";

const formatIcons: Record<RecommendationFormat, AppIconName> = {
  series: "video",
  music: "listening",
  document: "document",
  course: "book",
  practice: "test",
};

export function AdaptiveRecommendationCenter({ learning }: { learning: LearningJourneyController }) {
  const { locale, copy } = useI18n();
  const [mode, setMode] = useState<RecommendationMode>("adaptive");
  const [rotation, setRotation] = useState(0);
  const plan = useMemo(() => buildRecommendationPlan({
    resources: adaptiveLearningResources,
    analysis: learning.analysis,
    journey: learning.journey,
    mode,
    rotation,
  }), [learning.analysis, learning.journey, mode, rotation]);
  const focus = plan.focus;
  const modes: Array<{ id: RecommendationMode; label: string }> = [
    { id: "adaptive", label: copy.adaptiveResources.adaptive },
    { id: "en", label: copy.adaptiveResources.english },
    { id: "ko", label: copy.adaptiveResources.korean },
    { id: "general", label: copy.adaptiveResources.gks },
  ];

  const chooseMode = (nextMode: RecommendationMode) => {
    setMode(nextMode);
    setRotation(0);
  };

  return (
    <section className="adaptive-resources" aria-labelledby="adaptive-resources-title">
      <header className="adaptive-resources__header">
        <div>
          <span className="eyebrow">{copy.adaptiveResources.kicker}</span>
          <h2 id="adaptive-resources-title">{copy.adaptiveResources.title}</h2>
          <p>{copy.adaptiveResources.intro}</p>
        </div>
        <span className="adaptive-resources__symbol" aria-hidden="true"><AppIcon name="sparkle" /></span>
      </header>

      <div className="adaptive-resources__controls">
        <div className="adaptive-resources__modes" role="group" aria-label={copy.adaptiveResources.kicker}>
          {modes.map((option) => (
            <button key={option.id} type="button" aria-pressed={mode === option.id} onClick={() => chooseMode(option.id)}>
              {option.label}
            </button>
          ))}
        </div>
        <button className="adaptive-resources__refresh" type="button" onClick={() => setRotation((value) => value + 1)}>
          <AppIcon name="refresh" />{copy.adaptiveResources.refresh}
        </button>
      </div>

      <div className={`adaptive-resources__reason${plan.personalized ? " is-personalized" : ""}`} aria-live="polite">
        <span>{plan.personalized ? copy.adaptiveResources.personalized : copy.adaptiveResources.starter}</span>
        {focus ? (
          <p>{copy.adaptiveResources.focusPrefix} <strong>{copy.analysis.languageLabels[focus.language]} · {copy.analysis.skillLabels[focus.skill]}</strong> · {focus.averageScore}/100 {copy.adaptiveResources.scoreContext} · {copy.analysis.trendLabels[focus.trend]}.</p>
        ) : <p>{copy.adaptiveResources.starterText}</p>}
      </div>

      <div className="adaptive-resources__grid">
        {plan.items.map((resource, index) => (
          <article className={`adaptive-material adaptive-material--${resource.format}`} key={resource.id}>
            <div className="adaptive-material__top">
              <span className="adaptive-material__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="adaptive-material__format"><AppIcon name={formatIcons[resource.format]} />{copy.adaptiveResources.formatLabels[resource.format]}</span>
            </div>
            <h3>{localize(resource.title, locale)}</h3>
            <p>{localize(resource.description, locale)}</p>
            <div className="adaptive-material__activity">
              <strong>{copy.adaptiveResources.activity}</strong>
              <p>{localize(resource.activity, locale)}</p>
            </div>
            <div className="adaptive-material__meta">
              <span>◷ {resource.estimatedMinutes} min</span>
              <span>{copy.adaptiveResources.verified} · {resource.verifiedAt}</span>
            </div>
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackLearning({
                kind: "resource",
                itemId: resource.id,
                language: resource.languages[0],
                skill: resource.skills[0],
              })}
            >
              <span><small>{copy.adaptiveResources.external}</small>{resource.organization}</span>
              <b>{copy.adaptiveResources.open} ↗</b>
            </a>
          </article>
        ))}
      </div>
      <p className="adaptive-resources__privacy">⌁ {copy.adaptiveResources.privacy}</p>
    </section>
  );
}
