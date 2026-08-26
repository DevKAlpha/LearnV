import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { currentCycle } from "@/infrastructure/data/gks-2026";
import { useI18n } from "@/application/i18n/I18nContext";
import { BrandMark } from "@/shared/ui/BrandMark";

export function ProfilePage({ score }: { score: number }) {
  const { copy } = useI18n();
  const { progress, totals } = useLanguageTestProgress();
  const [creditTaps, setCreditTaps] = useState(0);
  const easterEggVisible = creditTaps >= 5;

  const averageBestScore = (language: "en" | "ko") => {
    const attempts = Object.values(progress[language]);
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
      <header className="profile-hero">
        <div className="profile-avatar"><BrandMark /></div>
        <span className="eyebrow">{copy.profile.local}</span>
        <h1>{copy.profile.title}</h1>
        <p>{copy.profile.intro}</p>
      </header>

      <Link className="profile-score" to="/study" aria-label={copy.home.start}>
        <span>{copy.profile.readiness}</span><strong>{score}%</strong><div><i style={{ width: `${score}%` }} /></div>
      </Link>

      <section className="profile-fields">
        <div className="profile-field"><small>{copy.profile.nationality}</small><strong>{copy.profile.nationalityValue}</strong></div>
        <div className="profile-field"><small>{copy.profile.major}</small><strong>{copy.profile.majorValue}</strong></div>
        <div className="profile-field"><small>{copy.profile.korean}</small><strong>{koreanLevel}{koreanScore !== null && <em> · {totals.ko}/5 {copy.profile.testsCompleted}</em>}</strong></div>
        <div className="profile-field"><small>{copy.profile.english}</small><strong>{englishLevel}{englishScore !== null && <em> · {totals.en}/5 {copy.profile.testsCompleted}</em>}</strong></div>
      </section>

      <section className="profile-cycle">
        <span className="eyebrow">{copy.profile.targetCycle}</span><h2>{currentCycle.target}</h2><p>{copy.home.cycleNote}</p>
        <Link to="/gks">{copy.profile.radar} →</Link>
      </section>

      <footer className={easterEggVisible ? "profile-credit is-revealed" : "profile-credit"} onClick={() => setCreditTaps((value) => Math.min(5, value + 1))}>
        <span aria-hidden="true">© 2026 · </span>{copy.profile.developedBy}{" "}
        {easterEggVisible
          ? <strong aria-live="polite">ninininini</strong>
          : <a href="https://github.com/DevKAlpha/LearnV/commits?author=DevKAlpha" target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>DevKAlpha</a>}
      </footer>
    </div>
  );
}
