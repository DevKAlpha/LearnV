import { useI18n } from "../../application/i18n/I18nContext";

export function LanguageGoals() {
  const { copy } = useI18n();

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
              <div className="language-title"><span>한</span><div><small>{copy.study.korean}</small><strong>{copy.study.koreanGoal}</strong></div></div>
              {copy.study.bands.topik.map((band) => (
                <div className="band-row" key={band.label}><strong>{band.label}</strong><span>{band.note}</span><b>{band.score}</b></div>
              ))}
            </article>
            <article className="language-card language-card--english">
              <div className="language-title"><span>A+</span><div><small>{copy.study.english}</small><strong>{copy.study.englishGoal}</strong></div></div>
              {copy.study.bands.english.map((band) => (
                <div className="band-row" key={band.label}><strong>{band.label}</strong><span>{band.note}</span><b>{band.score}</b></div>
              ))}
            </article>
          </div>
          <p className="data-note">{copy.study.scoreNote}</p>
        </div>
      </details>
    </section>
  );
}
