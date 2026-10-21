import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { currentCycle } from "@/infrastructure/data/gks-2026";
import { useI18n } from "@/application/i18n/I18nContext";
import { BrandMark } from "@/shared/ui/BrandMark";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { LearningJourneyPanel } from "@/shared/ui/LearningJourneyPanel";
import { getLanguagePathSummary as getLanguagePath } from "@/infrastructure/data/language-path-summary";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";
import { SceneArt } from "@/shared/ui/SceneArt";

export function ProfilePage({ score, learning }: { score: number; learning: LearningJourneyController }) {
  const { copy, locale } = useI18n();
  const { progress, totals } = useLanguageTestProgress();
  const englishPath = getLanguagePath("en", progress.en);
  const koreanPath = getLanguagePath("ko", progress.ko);
  const advancedCopy = advancedPathCopy[locale];
  const [creditTaps, setCreditTaps] = useState(0);
  const easterEggVisible = creditTaps >= 5;

  const averageBestScore = (language: "en" | "ko") => {
    const attempts = getLanguagePath(language, progress[language]).track.stages.flatMap((stage) => progress[language][stage.id] ? [progress[language][stage.id]] : []);
    if (attempts.length === 0) return null;
    return Math.round(attempts.reduce((total, stage) => total + stage.bestScore, 0) / attempts.length);
  };

  const englishScore = averageBestScore("en");
  const koreanScore = averageBestScore("ko");
  const englishLevel = englishScore === null
    ? copy.profile.cefrPending
    : englishScore < 50
      ? copy.profile.levels.english.foundation
      : englishScore < 70
        ? copy.profile.levels.english.developing
        : englishScore < 90
          ? copy.profile.levels.english.strong
          : copy.profile.levels.english.advanced;
  const koreanLevel = koreanScore === null
    ? copy.profile.topikPending
    : koreanScore < 50
      ? copy.profile.levels.korean.foundation
      : koreanScore < 70
        ? copy.profile.levels.korean.level3
        : koreanScore < 90
          ? copy.profile.levels.korean.level4
          : copy.profile.levels.korean.level5;

  return (
    <div className="page profile-page">
      <header className="profile-hero story-masthead">
        <div className="story-masthead__copy">
          <div className="profile-avatar"><BrandMark /></div>
          <span className="eyebrow">{copy.profile.local}</span>
          <h1>{copy.profile.title}</h1>
          <p>{copy.profile.intro}</p>
        </div>
        <div className="story-masthead__art"><SceneArt scene="garden" eager /><span aria-hidden="true">✦ / 05</span></div>
      </header>

      <Link className="profile-score" to="/study" aria-label={copy.home.start}>
        <span>{copy.profile.readiness}</span><strong>{score}%</strong><div><i style={{ width: `${score}%` }} /></div>
      </Link>

      <section className="profile-fields">
        <div className="profile-field"><small>{copy.profile.nationality}</small><strong>{copy.profile.nationalityValue}</strong></div>
        <div className="profile-field"><small>{copy.profile.major}</small><strong>{copy.profile.majorValue}</strong></div>
        <div className="profile-field"><small>{copy.profile.korean}</small><strong>{koreanPath.advancedUnlocked ? advancedCopy.koreanTitle : koreanLevel}{(koreanScore !== null || koreanPath.advancedUnlocked) && <em> · {koreanPath.advancedUnlocked ? koreanPath.completed : totals.ko}/{koreanPath.track.stages.length} {copy.profile.testsCompleted}</em>}</strong></div>
        <div className="profile-field"><small>{copy.profile.english}</small><strong>{englishPath.advancedUnlocked ? advancedCopy.title : englishLevel}{(englishScore !== null || englishPath.advancedUnlocked) && <em> · {englishPath.advancedUnlocked ? englishPath.completed : totals.en}/{englishPath.track.stages.length} {copy.profile.testsCompleted}</em>}</strong></div>
      </section>
      {(englishPath.advancedUnlocked || koreanPath.advancedUnlocked) && <p className="advanced-path-notice">{advancedCopy.notice}</p>}

      <LearningJourneyPanel learning={learning} />

      <section className="profile-cycle">
        <span className="eyebrow">{copy.profile.targetCycle}</span><h2>{currentCycle.target}</h2><p>{copy.home.cycleNote}</p>
        <Link to="/gks">{copy.profile.radar} →</Link>
      </section>

      <footer className={easterEggVisible ? "profile-credit is-revealed" : "profile-credit"} onClick={() => setCreditTaps((value) => Math.min(5, value + 1))}>
        <span aria-hidden="true">© 2026 · </span>{copy.profile.developedBy}{" "}
        {easterEggVisible
          ? <strong aria-live="polite">ninininini 😘 💜</strong>
          : "DevKAlpha"}
      </footer>
    </div>
  );
}
