import { Link } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import type { TestLanguage } from "@/domain/models/language-test";
import { getLanguagePathSummary as getLanguagePath } from "@/infrastructure/data/language-path-summary";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";
import { LanguageCulture } from "@/shared/ui/LanguageCulture";

type TestTrackCardsProps = {
  languages?: TestLanguage[];
};

export function TestTrackCards({ languages = ["en", "ko"] }: TestTrackCardsProps) {
  const { copy, locale, setLocale } = useI18n();
  const { totals, progress } = useLanguageTestProgress();
  const advancedCopy = advancedPathCopy[locale];

  const tracks: Array<{
    language: TestLanguage;
    title: string;
    description: string;
    target: string;
  }> = [
    { language: "en", title: copy.tests.englishTitle, description: copy.tests.englishDescription, target: copy.tests.englishTarget },
    { language: "ko", title: copy.tests.koreanTitle, description: copy.tests.koreanDescription, target: copy.tests.koreanTarget },
  ];

  return (
    <section className="test-hub" aria-labelledby="test-hub-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{copy.tests.hubKicker}</span>
          <h2 id="test-hub-title">{copy.tests.hubTitle}</h2>
        </div>
      </div>
      <p className="section-intro">{copy.tests.hubIntro}</p>

      <div className="test-track-grid">
        {tracks.filter((track) => languages.includes(track.language)).map((track) => {
          const path = getLanguagePath(track.language, progress[track.language]);
          const advanced = path.phase === "advanced";
          const total = path.track.stages.length;
          const completed = advanced ? path.completed : totals[track.language];
          return (
          <article className={`test-track-card test-track-card--${track.language}`} key={track.language}>
            <LanguageCulture language={track.language} />
            <span className="test-track-target">{advanced ? advancedCopy.goal : track.target}</span>
            <h3>{advanced ? (track.language === "en" ? advancedCopy.title : advancedCopy.koreanTitle) : track.title}</h3>
            <p>{advanced ? advancedCopy.intro : track.description}</p>
            {advanced && <small className="advanced-path-label">{advancedCopy.baseDone} · {advancedCopy.notice}</small>}
            <div className="test-track-progress" aria-label={`${completed} / ${total} ${copy.tests.progress}`}>
              <span><i style={{ width: `${(completed / total) * 100}%` }} /></span>
              <strong>{completed}/{total}</strong>
            </div>
            <div className="test-track-card__footer">
              <small>{copy.tests.thirtyTests.replace("{total}", String(total)).replace("{perSkill}", String(total / 6))}</small>
              <Link to={`/tests/${track.language}`} onClick={() => setLocale(track.language)}>
                {copy.tests.openPath}<span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}
