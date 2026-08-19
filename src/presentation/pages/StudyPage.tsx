import { useMemo, useState } from "react";
import { useI18n } from "../../application/i18n/I18nContext";
import { TestTrackCards } from "../components/TestTrackCards";
import { localize } from "../../domain/models/i18n";
import {
  learningResources,
  type MaterialLanguage,
  type ResourceType,
} from "../../infrastructure/data/learning-resources";

type TypeFilter = "all" | ResourceType;

export function StudyPage() {
  const { locale, copy } = useI18n();
  const [materialLanguage, setMaterialLanguage] = useState<MaterialLanguage>(() => locale === "ko" ? "ko" : "en");
  const [type, setType] = useState<TypeFilter>("all");

  const resources = useMemo(
    () => learningResources.filter((resource) =>
      resource.languages.includes(materialLanguage) &&
      (type === "all" || resource.type === type)),
    [materialLanguage, type],
  );

  const languageFilters: Array<{ value: MaterialLanguage; label: string; symbol: string }> = [
    { value: "en", label: copy.study.english, symbol: "A+" },
    { value: "ko", label: copy.study.korean, symbol: "한" },
  ];

  const typeFilters: Array<{ value: TypeFilter; label: string; icon: string }> = [
    { value: "all", label: copy.study.allTypes, icon: "✦" },
    { value: "document", label: copy.study.document, icon: "▤" },
    { value: "book", label: copy.study.book, icon: "▥" },
    { value: "test", label: copy.study.test, icon: "✓" },
    { value: "video", label: copy.study.video, icon: "▶" },
    { value: "advice", label: copy.study.advice, icon: "◎" },
  ];

  const typeLabels: Record<ResourceType, string> = {
    document: copy.study.document,
    book: copy.study.book,
    test: copy.study.test,
    video: copy.study.video,
    advice: copy.study.advice,
  };

  return (
    <div className="page page--study-library">
      <header className="page-header page-header--study">
        <span className="sticker sticker--blue">{copy.study.sticker}</span>
        <h1>{copy.study.title}</h1>
        <p>{copy.study.intro}</p>
      </header>

      <section className="study-start-card" aria-labelledby="starter-route-title">
        <div className="study-start-card__copy">
          <span className="eyebrow">{copy.study.startHere}</span>
          <small>{copy.study.weekOne}</small>
          <h2 id="starter-route-title">{copy.study.weekTitle}</h2>
          <p>{copy.study.weekText}</p>
        </div>
        <ol className="starter-steps">
          <li><span>01</span><strong>{copy.study.stepGuide}</strong></li>
          <li><span>02</span><strong>{copy.study.stepKorean}</strong></li>
          <li><span>03</span><strong>{copy.study.stepEnglish}</strong></li>
        </ol>
        <div className="study-character study-character--library" aria-hidden="true">
          <span>가</span><i /><b>A+</b>
        </div>
      </section>

      <TestTrackCards />

      <section className="resource-library" aria-labelledby="resource-library-title">
        <div className="section-heading resource-heading">
          <div>
            <span className="eyebrow">{copy.study.library}</span>
            <h2 id="resource-library-title">{copy.study.resources}</h2>
          </div>
          <span className="resource-count">{resources.length}</span>
        </div>
        <p className="section-intro">{copy.study.libraryIntro}</p>

        <div className="material-language-picker">
          <div>
            <span className="eyebrow">{copy.study.chooseMaterialLanguage}</span>
            <strong>{copy.study.materialLanguageTitle}</strong>
          </div>
          <div className="track-filters" role="group" aria-label={copy.study.chooseMaterialLanguage}>
            {languageFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={materialLanguage === filter.value}
                className={materialLanguage === filter.value ? "filter-chip filter-chip--active" : "filter-chip"}
                onClick={() => setMaterialLanguage(filter.value)}
              ><span aria-hidden="true">{filter.symbol}</span>{filter.label}</button>
            ))}
          </div>
        </div>

        <div className="resource-filters" aria-label={copy.study.resources}>
          <div className="type-filters" role="group" aria-label={copy.study.allTypes}>
            {typeFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={type === filter.value}
                className={type === filter.value ? "type-chip type-chip--active" : "type-chip"}
                onClick={() => setType(filter.value)}
              ><span aria-hidden="true">{filter.icon}</span>{filter.label}</button>
            ))}
          </div>
        </div>

        {resources.length > 0 ? (
          <div className="resource-grid">
            {resources.map((resource) => (
              <article className={`resource-card resource-card--${resource.track}`} key={resource.id}>
                <div className="resource-card__topline">
                  <span className="resource-icon" aria-hidden="true">{resource.icon}</span>
                  <div className="resource-badges">
                    <span>{typeLabels[resource.type]}</span>
                    {resource.official && <span className="official-badge">{copy.study.official}</span>}
                  </div>
                </div>
                <span className="resource-level">{localize(resource.level, locale)}</span>
                <h3>{localize(resource.title, locale)}</h3>
                <p>{localize(resource.description, locale)}</p>
                <div className="resource-meta">
                  <strong>{resource.organization}</strong>
                  <small>{copy.study.verifiedOn} · {resource.verifiedAt}</small>
                </div>
                <a href={resource.url} target="_blank" rel="noreferrer">
                  {copy.study.openResource}<span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        ) : <p className="empty-resources">{copy.study.noResults}</p>}
      </section>

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

      <section className="skill-path">
        <div className="section-heading"><div><span className="eyebrow">{copy.study.method}</span><h2>{copy.study.methodTitle}</h2></div></div>
        <div className="path-line">
          <div><span>01</span><strong>{copy.study.diagnose}</strong><small>{copy.study.diagnoseText}</small></div>
          <div><span>02</span><strong>{copy.study.evidence}</strong><small>{copy.study.evidenceText}</small></div>
          <div><span>03</span><strong>{copy.study.feedback}</strong><small>{copy.study.feedbackText}</small></div>
          <div><span>04</span><strong>{copy.study.review}</strong><small>{copy.study.reviewText}</small></div>
        </div>
        <p className="external-notice">{copy.study.externalNotice}</p>
      </section>
    </div>
  );
}
