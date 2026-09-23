import { useState } from "react";
import { useGksCertificationCatalog } from "@/application/controllers/useGksCertificationCatalog";
import { useI18n } from "@/application/i18n/I18nContext";
import type { CertificationCost, CertificationLanguage, CertificationModality } from "@/domain/models/gks";
import { gksCertificationCatalogCopy } from "@/infrastructure/i18n/gks-certification-catalog";

const dateLocales = { es: "es-ES", en: "en-GB", ko: "ko-KR" } as const;

export function CertificationOpportunityCatalog() {
  const { locale } = useI18n();
  const catalog = useGksCertificationCatalog();
  const copy = gksCertificationCatalogCopy[locale];
  const [language, setLanguage] = useState<CertificationLanguage | "all">("all");
  const [cost, setCost] = useState<CertificationCost | "all">("all");
  const [modality, setModality] = useState<CertificationModality | "all">("all");
  const visibleOptions = catalog.opportunities.filter((opportunity) => (
    (language === "all" || opportunity.language === language)
    && (cost === "all" || opportunity.cost === cost)
    && (modality === "all" || opportunity.modalities.includes(modality))
  ));
  const updatedAt = new Intl.DateTimeFormat(dateLocales[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(catalog.updatedAt));

  return (
    <div className="gks-certificate-catalog" aria-labelledby="gks-certificate-catalog-title" aria-busy={catalog.isLoading}>
      <div className="gks-certificate-catalog__heading">
        <div>
          <span className="eyebrow">{copy.kicker}</span>
          <h3 id="gks-certificate-catalog-title">{copy.title}</h3>
          <p>{copy.intro}</p>
        </div>
        <span className="gks-certificate-catalog__updated">
          {catalog.isLoading ? copy.loading : `${copy.updated} · ${updatedAt}`}
        </span>
      </div>

      <div className="gks-certificate-filters" aria-label={copy.title}>
        <label>
          <span>{copy.filters.language}</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value as CertificationLanguage | "all")}>
            <option value="all">{copy.filters.all}</option>
            <option value="korean">{copy.filters.korean}</option>
            <option value="english">{copy.filters.english}</option>
          </select>
        </label>
        <label>
          <span>{copy.filters.cost}</span>
          <select value={cost} onChange={(event) => setCost(event.target.value as CertificationCost | "all")}>
            <option value="all">{copy.filters.all}</option>
            <option value="free">{copy.filters.free}</option>
            <option value="paid">{copy.filters.paid}</option>
            <option value="conditional">{copy.filters.conditional}</option>
          </select>
        </label>
        <label>
          <span>{copy.filters.modality}</span>
          <select value={modality} onChange={(event) => setModality(event.target.value as CertificationModality | "all")}>
            <option value="all">{copy.filters.all}</option>
            <option value="online">{copy.filters.online}</option>
            <option value="in-person">{copy.filters.inPerson}</option>
          </select>
        </label>
        <strong className="gks-certificate-filters__count" aria-live="polite">
          {visibleOptions.length} {copy.count}
        </strong>
      </div>

      {visibleOptions.length > 0 ? (
        <div className="gks-certificate-options">
          {visibleOptions.map((opportunity) => {
            const content = {
              summary: opportunity.content.summary[locale],
              price: opportunity.content.price[locale],
              schedule: opportunity.content.schedule[locale],
              caution: opportunity.content.caution[locale],
            };

            return (
              <article className={`gks-certificate-option gks-certificate-option--${opportunity.gksUse}`} key={opportunity.id}>
                <header>
                  <div>
                    <small>{opportunity.issuer}</small>
                    <h4>{opportunity.name}</h4>
                  </div>
                  <span>{copy.availability[opportunity.availability]}</span>
                </header>

                <div className="gks-certificate-option__tags">
                  <b>{copy.filters[opportunity.language]}</b>
                  <b>{copy.filters[opportunity.cost]}</b>
                  {opportunity.modalities.map((optionModality) => (
                    <b key={optionModality}>{optionModality === "online" ? copy.filters.online : copy.filters.inPerson}</b>
                  ))}
                  <strong>{copy.use[opportunity.gksUse]}</strong>
                </div>

                <p>{content.summary}</p>
                <dl>
                  <div><dt>{copy.price}</dt><dd>{content.price}</dd></div>
                  <div><dt>{copy.schedule}</dt><dd>{content.schedule}</dd></div>
                </dl>
                <div className="gks-certificate-option__caution"><b>{copy.caution}</b>{content.caution}</div>
                <footer>
                  <small>{copy.verified} · {new Intl.DateTimeFormat(dateLocales[locale]).format(new Date(`${opportunity.verifiedAt}T12:00:00`))}</small>
                  <a href={opportunity.url} target="_blank" rel="noreferrer">{copy.open}<span aria-hidden="true">↗</span></a>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="gks-certificate-options__empty" role="status">{copy.empty}</p>
      )}

      <p className="gks-certificate-catalog__disclaimer">{copy.disclaimer}</p>
    </div>
  );
}
