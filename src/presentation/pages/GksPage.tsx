import { currentCycle, keyFacts, sources, targetPrograms } from "../../infrastructure/data/gks-2026";
import { SourceLink } from "../components/SourceLink";
import { StatusBadge } from "../components/StatusBadge";
import { useI18n } from "../../application/i18n/I18nContext";

export function GksPage() {
  const { copy } = useI18n();
  const [titleLineOne, titleLineTwo] = copy.gks.title.split("\n");

  return (
    <div className="page">
      <header className="page-header">
        <span className="sticker sticker--pink">{copy.gks.sticker}</span>
        <h1>{titleLineOne}<br />{titleLineTwo}</h1>
        <p>{copy.gks.intro}</p>
      </header>

      <section className="cycle-card">
        <div>
          <span className="eyebrow">{copy.gks.preparing}</span>
          <h2>{currentCycle.target}</h2>
          <p>{copy.gks.unpublished}</p>
        </div>
        <div className="cycle-status"><span>2027</span><small>{copy.gks.pending}</small></div>
      </section>

      <div className="fact-grid">
        {keyFacts.map((fact) => {
          const factCopy = copy.gks.facts[fact.id as keyof typeof copy.gks.facts];
          return <article className="fact-card" key={fact.id}>
            <div className="fact-topline">
              <span className="fact-icon" aria-hidden="true">{fact.icon}</span>
              <StatusBadge status={fact.status} />
            </div>
            <span>{factCopy.label}</span>
            <strong>{fact.value}</strong>
            <p>{factCopy.detail}</p>
            <SourceLink sourceId={fact.sourceId} />
          </article>;
        })}
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="eyebrow">{copy.gks.filter}</span><h2>{copy.gks.eligibility}</h2></div>
          <span className="doodle-arrow" aria-hidden="true">↘</span>
        </div>
        <ol className="rule-list">
          {copy.gks.eligibilityRules.map((rule, index) => (
            <li key={rule}><span>{index + 1}</span><p>{rule}</p></li>
          ))}
        </ol>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="eyebrow">{copy.gks.reference}</span><h2>{copy.gks.programs}</h2></div>
          <span className="count-pill">{copy.gks.count}</span>
        </div>
        <p className="section-intro">{copy.gks.programsIntro}</p>
        <div className="program-grid">
          {targetPrograms.map((program) => {
            const programCopy = copy.gks.programTargets[program.id];

            return (
              <article className={`program-card program-card--${program.tone}`} key={program.id}>
                <span className="program-folder" aria-hidden="true">▰</span>
                <small>{copy.gks.programStatus}</small>
                <strong>{programCopy.title}</strong>
                <p>{programCopy.detail}</p>
                <span className="program-category">{copy.gks.programCategories[program.category]}</span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="source-center">
        <span className="eyebrow">{copy.gks.transparency}</span>
        <h2>{copy.gks.sources}</h2>
        <p>{copy.gks.sourcesIntro}</p>
        <div className="source-list">
          {sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <span><strong>{source.title}</strong><small>{source.organization} · {copy.common.verified} {source.verifiedAt}</small></span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
