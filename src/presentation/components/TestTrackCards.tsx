import { Link } from "react-router-dom";
import { useLanguageTestProgress } from "../../application/controllers/useLanguageTestProgress";
import { useI18n } from "../../application/i18n/I18nContext";
import type { TestLanguage } from "../../domain/models/language-test";
import { TESTS_PER_LANGUAGE } from "../../infrastructure/data/practice-tests";

type TestTrackCardsProps = {
  languages?: TestLanguage[];
};

export function TestTrackCards({ languages = ["en", "ko"] }: TestTrackCardsProps) {
  const { copy, setLocale } = useI18n();
  const { totals } = useLanguageTestProgress();

  const tracks: Array<{
    language: TestLanguage;
    symbol: string;
    title: string;
    description: string;
    target: string;
  }> = [
    { language: "en", symbol: "A+", title: copy.tests.englishTitle, description: copy.tests.englishDescription, target: copy.tests.englishTarget },
    { language: "ko", symbol: "가", title: copy.tests.koreanTitle, description: copy.tests.koreanDescription, target: copy.tests.koreanTarget },
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
        {tracks.filter((track) => languages.includes(track.language)).map((track) => (
          <article className={`test-track-card test-track-card--${track.language}`} key={track.language}>
            <div className="test-track-card__top">
              <span className="test-track-symbol" aria-hidden="true">{track.symbol}</span>
              <span className="auto-language-pill">↻ {copy.tests.autoLanguage}</span>
            </div>
            <span className="test-track-target">{track.target}</span>
            <h3>{track.title}</h3>
            <p>{track.description}</p>
            <div className="test-track-progress" aria-label={`${totals[track.language]} / ${TESTS_PER_LANGUAGE} ${copy.tests.progress}`}>
              <span><i style={{ width: `${(totals[track.language] / TESTS_PER_LANGUAGE) * 100}%` }} /></span>
              <strong>{totals[track.language]}/{TESTS_PER_LANGUAGE}</strong>
            </div>
            <div className="test-track-card__footer">
              <small>{copy.tests.thirtyTests}</small>
              <Link to={`/tests/${track.language}`} onClick={() => setLocale(track.language)}>
                {copy.tests.openPath}<span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
