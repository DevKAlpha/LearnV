import { useMemo, useState } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { localize } from "@/domain/models/i18n";
import {
  learningResources,
  type MaterialLanguage,
  type ResourceType,
} from "@/infrastructure/data/learning-resources";
import { AppIcon, type AppIconName } from "@/shared/ui/AppIcon";
import { trackLearning } from "@/application/controllers/learningJourneyEvents";

type TypeFilter = "all" | ResourceType;

type ResourceLibraryProps = {
  language: MaterialLanguage;
};

export function ResourceLibrary({ language }: ResourceLibraryProps) {
  const { locale, copy } = useI18n();
  const [type, setType] = useState<TypeFilter>("all");
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("learnv-resource-progress-v1") ?? "[]"); } catch { return []; }
  });
  const resources = useMemo(
    () => learningResources.filter((resource) =>
      resource.languages.includes(language) &&
      (type === "all" || resource.type === type))
      .sort((first, second) => (first.learningOrder ?? 100) - (second.learningOrder ?? 100)),
    [language, type],
  );

  const typeFilters: Array<{ value: TypeFilter; label: string; icon: AppIconName }> = [
    { value: "all", label: copy.study.allTypes, icon: "sparkle" },
    { value: "document", label: copy.study.document, icon: "document" },
    { value: "book", label: copy.study.book, icon: "book" },
    { value: "test", label: copy.study.test, icon: "test" },
    { value: "video", label: copy.study.video, icon: "video" },
  ];
  const typeLabels: Record<ResourceType, string> = {
    document: copy.study.document,
    book: copy.study.book,
    test: copy.study.test,
    video: copy.study.video,
  };
  const taskFor = (resourceType: ResourceType) => {
    const tasks = {
      es: { document: "Lee la sección indicada y anota 3 requisitos o criterios.", book: "Completa una unidad y registra 5 errores nuevos.", test: "Haz un bloque sin ayuda y revisa cada error con la clave.", video: "Mira un segmento, resume la idea y repite una respuesta en voz alta." },
      en: { document: "Read the relevant section and note 3 requirements or criteria.", book: "Complete one unit and record 5 new errors.", test: "Do one block unaided and review every error with the key.", video: "Watch one segment, summarise it and repeat one answer aloud." },
      ko: { document: "관련 부분을 읽고 요건이나 기준 3개를 기록하세요.", book: "한 단원을 완료하고 새로운 오류 5개를 기록하세요.", test: "도움 없이 한 세트를 풀고 정답으로 모든 오류를 검토하세요.", video: "한 구간을 보고 요약한 뒤 답변 하나를 소리 내어 반복하세요." },
    } as const;
    return tasks[locale][resourceType];
  };
  const accountResources = new Set(["topik-basic-public-test", "sejong-workbook-2", "sejong-advanced-writing", "sejong-roadmap"]);
  const toggleComplete = (id: string) => {
    setCompleted((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      if (!current.includes(id)) trackLearning({ kind: "resource", itemId: id, language, passed: true });
      localStorage.setItem("learnv-resource-progress-v1", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("learnv:progress"));
      return next;
    });
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
            ><span aria-hidden="true"><AppIcon name={filter.icon} /></span>{filter.label}</button>
          ))}
        </div>
      </div>

      {resources.length > 0 ? (
        <div className="resource-grid">
          {resources.map((resource) => (
            <article className={`resource-card resource-card--${resource.track}`} key={resource.id}>
              <div className="resource-card__topline">
                <span className="resource-icon" aria-hidden="true">
                  <AppIcon name={resource.type} />
                  <small>{language === "ko" ? "한" : "A"}</small>
                </span>
                <div className="resource-badges">
                  <span>{typeLabels[resource.type]}</span>
                  {resource.official && <span className="official-badge">{copy.study.official}</span>}
                </div>
              </div>
              <span className="resource-level">{localize(resource.level, locale)}</span>
              <h3>{localize(resource.title, locale)}</h3>
              <p>{localize(resource.description, locale)}</p>
              <div className="resource-task">
                <strong>{locale === "ko" ? "이번 활동" : locale === "en" ? "Your task" : "Tu actividad"}</strong>
                <p>{taskFor(resource.type)}</p>
                <span>◷ {resource.estimatedMinutes ?? (resource.type === "document" ? 20 : resource.type === "video" ? 15 : 30)} min · {resource.access === "account" || accountResources.has(resource.id) ? (locale === "ko" ? "계정 필요" : locale === "en" ? "Account may be required" : "Puede requerir cuenta") : (locale === "ko" ? "공개 링크" : locale === "en" ? "Open link" : "Enlace abierto")}</span>
              </div>
              <div className="resource-meta">
                <strong>{resource.organization}</strong>
                <small>{locale === "ko" ? "자료 카드 검토" : locale === "en" ? "Resource card reviewed" : "Ficha del recurso revisada"} · {resource.verifiedAt}</small>
              </div>
              <div className="resource-actions"><a href={resource.url} target="_blank" rel="noreferrer" onClick={() => trackLearning({ kind: "resource", itemId: resource.id, language })}>{copy.study.openResource}<span aria-hidden="true">↗</span></a><button type="button" aria-pressed={completed.includes(resource.id)} onClick={() => toggleComplete(resource.id)}>{completed.includes(resource.id) ? "✓ " : ""}{locale === "ko" ? "완료" : locale === "en" ? "Complete" : "Completar"}</button></div>
            </article>
          ))}
        </div>
      ) : <p className="empty-resources">{copy.study.noResults}</p>}
    </section>
  );
}
