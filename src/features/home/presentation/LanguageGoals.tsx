import { useI18n } from "@/application/i18n/I18nContext";
import { Link } from "react-router-dom";
import { LanguageCulture } from "@/shared/ui/LanguageCulture";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { getLanguagePathSummary as getLanguagePath } from "@/infrastructure/data/language-path-summary";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";

export function LanguageGoals() {
  const { copy, locale } = useI18n();
  const { progress } = useLanguageTestProgress();
  const advancedCopy = advancedPathCopy[locale];

  return (
    <section className="objectives-section">
      <span className="eyebrow">{copy.study.objectivesKicker}</span>
      <details className="objectives-drawer">
        <summary>
          <span><strong>{copy.study.objectivesTitle}</strong><small>{copy.study.objectivesIntro}</small></span>
          <i aria-hidden="true">＋</i>
        </summary>
        <div className="objectives-content">
          <span className="reference-pill">{copy.study.reference2026}</span>
          <div className="language-grid">
            <article className="language-card language-card--korean">
              <LanguageCulture language="ko" />
              {getLanguagePath("ko", progress.ko).advancedUnlocked && <p className="advanced-path-label">{advancedCopy.current}: {advancedCopy.koreanTitle}</p>}
              <div className="language-title"><div><small>{copy.study.korean}</small><strong>{copy.study.koreanGoal}</strong></div></div>
              {copy.study.bands.topik.map((band) => (
                <div className="band-row" key={band.label}><strong>{band.label}</strong><span>{band.note}</span><b>{band.score}</b></div>
              ))}
              <Link className="language-card__action" to="/study/korean">{copy.study.openSpace}<span aria-hidden="true">→</span></Link>
            </article>
            <article className="language-card language-card--english">
              <LanguageCulture language="en" />
              {getLanguagePath("en", progress.en).advancedUnlocked && <p className="advanced-path-label">{advancedCopy.current}: {advancedCopy.title}</p>}
              <div className="language-title"><div><small>{copy.study.english}</small><strong>{copy.study.englishGoal}</strong></div></div>
              {copy.study.bands.english.map((band) => (
                <div className="band-row" key={band.label}><strong>{band.label}</strong><span>{band.note}</span><b>{band.score}</b></div>
              ))}
              <Link className="language-card__action" to="/study/english">{copy.study.openSpace}<span aria-hidden="true">→</span></Link>
            </article>
          </div>
          <p className="data-note">{copy.study.scoreNote}</p>
        </div>
      </details>
    </section>
  );
}
