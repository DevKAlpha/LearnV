import { currentCycle, eligibilityRules, keyFacts, sources, uicPrograms } from "../../infrastructure/data/gks-2026";
import { SourceLink } from "../components/SourceLink";
import { StatusBadge } from "../components/StatusBadge";

export function GksPage() {
  return (
    <div className="page">
      <header className="page-header">
        <span className="sticker sticker--pink">Datos verificados</span>
        <h1>Entiende la beca.<br />Sin rumores.</h1>
        <p>Reglas separadas por convocatoria, país y ruta de aplicación.</p>
      </header>

      <section className="cycle-card">
        <div>
          <span className="eyebrow">Preparando</span>
          <h2>{currentCycle.target}</h2>
          <p>La guía de candidaturas aún no ha sido publicada.</p>
        </div>
        <div className="cycle-status"><span>2027</span><small>pendiente</small></div>
      </section>

      <div className="fact-grid">
        {keyFacts.map((fact) => (
          <article className="fact-card" key={fact.id}>
            <div className="fact-topline">
              <span className="fact-icon" aria-hidden="true">{fact.icon}</span>
              <StatusBadge status={fact.status} />
            </div>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
            <p>{fact.detail}</p>
            <SourceLink sourceId={fact.sourceId} />
          </article>
        ))}
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="eyebrow">Filtro inicial</span><h2>Elegibilidad base</h2></div>
          <span className="doodle-arrow" aria-hidden="true">↘</span>
        </div>
        <ol className="rule-list">
          {eligibilityRules.map((rule, index) => (
            <li key={rule}><span>{index + 1}</span><p>{rule}</p></li>
          ))}
        </ol>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="eyebrow">Referencia 2026</span><h2>Programas UIC</h2></div>
          <span className="count-pill">6 de 10</span>
        </div>
        <p className="section-intro">UIC estuvo abierto a todas las nacionalidades, pero solo para departamentos específicos.</p>
        <div className="program-grid">
          {uicPrograms.map((program) => (
            <article className={`program-card program-card--${program.tone}`} key={program.university}>
              <span className="program-folder" aria-hidden="true">▰</span>
              <small>University Track · UIC</small>
              <strong>{program.university}</strong>
              <p>{program.field}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="source-center">
        <span className="eyebrow">Transparencia</span>
        <h2>Centro de fuentes</h2>
        <p>Cada dato muestra su organización y última fecha de verificación.</p>
        <div className="source-list">
          {sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <span><strong>{source.title}</strong><small>{source.organization} · verificado {source.verifiedAt}</small></span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
