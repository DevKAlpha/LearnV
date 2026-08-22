import { useMemo, useState } from "react";
import { useI18n } from "../../application/i18n/I18nContext";
import { localize } from "../../domain/models/i18n";
import {
  learningResources,
  type MaterialLanguage,
  type ResourceType,
} from "../../infrastructure/data/learning-resources";

type TypeFilter = "all" | ResourceType;

type ResourceLibraryProps = {
  language: MaterialLanguage;
};

export function ResourceLibrary({ language }: ResourceLibraryProps) {
  const { locale, copy } = useI18n();
  const [type, setType] = useState<TypeFilter>("all");
  const resources = useMemo(
    () => learningResources.filter((resource) =>
      resource.languages.includes(language) &&
      (type === "all" || resource.type === type))
      .sort((first, second) => (first.learningOrder ?? 100) - (second.learningOrder ?? 100)),
    [language, type],
  );

  const typeFilters: Array<{ value: TypeFilter; label: string; icon: string }> = [
    { value: "all", label: copy.study.allTypes, icon: "✦" },
    { value: "document", label: copy.study.document, icon: "▤" },
    { value: "book", label: copy.study.book, icon: "▥" },
    { value: "test", label: copy.study.test, icon: "✓" },
    { value: "video", label: copy.study.video, icon: "▶" },
  ];
  const typeLabels: Record<ResourceType, string> = {
    document: copy.study.document,
    book: copy.study.book,
    test: copy.study.test,
    video: copy.study.video,
  };

  return (
    <section className="resource-library language-resource-library" id="language-materials" aria-labelledby="resource-library-title">
      <div className="section-heading resource-heading">
        <div>
          <span className="eyebrow">{copy.study.library}</span>
          <h2 id="resource-library-title">{language === "en" ? copy.study.englishLibraryTitle : copy.study.koreanLibraryTitle}</h2>
        </div>
        <span className="resource-count">{resources.length}</span>
      </div>
      <p className="section-intro">{copy.study.libraryIntro}</p>

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
  );
}
