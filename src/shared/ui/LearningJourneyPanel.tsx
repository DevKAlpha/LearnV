import { Link } from "react-router-dom";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { useI18n } from "@/application/i18n/I18nContext";

type Props = {
  learning: LearningJourneyController;
  compact?: boolean;
};

export function LearningJourneyPanel({ learning, compact = false }: Props) {
  const { copy } = useI18n();
  const { journey, recommendation, activeMinutes, practicedSkills } = learning;
  const streakUnit = journey.currentStreak === 1 ? copy.journey.day : copy.journey.days;
  const recommendationText = copy.journey.recommendations[recommendation.id];

  return (
    <section className={`learning-journey${compact ? " learning-journey--compact" : ""}`} aria-labelledby={`learning-journey-title${compact ? "-compact" : ""}`}>
      <div className="learning-journey__heading">
        <div>
          <span className="eyebrow">{copy.journey.kicker}</span>
          <h2 id={`learning-journey-title${compact ? "-compact" : ""}`}>{copy.journey.title}</h2>
          {!compact && <p>{copy.journey.intro}</p>}
        </div>
        <span className="learning-journey__flame" aria-hidden="true">{journey.currentStreak > 0 ? "🔥" : "✦"}</span>
      </div>

      <div className="learning-journey__stats">
        <div className="learning-journey__stat learning-journey__stat--streak"><strong>{journey.currentStreak}</strong><span>{streakUnit}<small>{copy.journey.currentStreak}</small></span></div>
        <div className="learning-journey__stat"><strong>{journey.longestStreak}</strong><span>{copy.journey.days}<small>{copy.journey.longestStreak}</small></span></div>
        <div className="learning-journey__stat"><strong>{journey.sessionCount}</strong><span><small>{copy.journey.sessions}</small></span></div>
        <div className="learning-journey__stat"><strong>{activeMinutes}</strong><span><small>{copy.journey.activeMinutes}</small></span></div>
        {!compact && <div className="learning-journey__stat"><strong>{practicedSkills}</strong><span><small>{copy.journey.practicedSkills}</small></span></div>}
      </div>

      <div className="learning-recommendation">
        <div><span>{copy.journey.recommendation}</span><p>{recommendationText}</p></div>
        <Link to={recommendation.route}>{copy.journey.openRecommendation}<span aria-hidden="true">→</span></Link>
      </div>
      {!compact && <p className="learning-journey__privacy">⌁ {copy.journey.privacy}</p>}
    </section>
  );
}
