import { Link } from "react-router-dom";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { useI18n } from "@/application/i18n/I18nContext";
import type { SkillAnalysis } from "@/domain/models/learning-analysis";

function trendSymbol(trend: SkillAnalysis["trend"]) {
  if (trend === "improving") return "↗";
  if (trend === "declining") return "↘";
  if (trend === "steady") return "→";
  return "✦";
}

export function LearningAnalysisPanel({ learning }: { learning: LearningJourneyController }) {
  const { copy } = useI18n();
  const { analysis } = learning;
  const showPriority = Boolean(analysis.priority && (analysis.skills.length > 1 || analysis.priority.averageScore < 70));
  const showStrength = Boolean(analysis.strongest && (!showPriority || analysis.strongest.key !== analysis.priority?.key));

  const labelFor = (result: SkillAnalysis) => `${copy.analysis.languageLabels[result.language]} · ${copy.analysis.skillLabels[result.skill]}`;

  return (
    <section className="learning-analysis" aria-labelledby="learning-analysis-title">
      <div className="learning-analysis__header">
        <div>
          <span className="eyebrow">{copy.analysis.kicker}</span>
          <h2 id="learning-analysis-title">{copy.analysis.title}</h2>
          <p>{copy.analysis.intro}</p>
        </div>
        <span className="learning-analysis__mark" aria-hidden="true">⌁</span>
      </div>

      {analysis.totalAttempts === 0 ? (
        <div className="learning-analysis__empty">
          <span aria-hidden="true">↗</span>
          <div><h3>{copy.analysis.noDataTitle}</h3><p>{copy.analysis.noDataText}</p></div>
          <Link to="/tests/en">{copy.analysis.startDiagnosis}<b aria-hidden="true">→</b></Link>
        </div>
      ) : (
        <>
          <div className="learning-analysis__overview">
            <div className="learning-analysis__score" style={{ "--analysis-score": analysis.averageScore ?? 0 } as React.CSSProperties}>
              <strong>{analysis.averageScore}</strong><span>/100<small>{copy.analysis.average}</small></span>
            </div>
            <div className="learning-analysis__metric"><strong>{analysis.totalAttempts}</strong><span>{copy.analysis.attempts}</span></div>
            <div className="learning-analysis__metric"><strong>{analysis.evaluatedAreas}</strong><span>{copy.analysis.areas}</span></div>
            <div className="learning-analysis__metric"><strong>{copy.analysis.evidenceLabels[analysis.evidenceLevel]}</strong><span>{copy.analysis.evidence}</span></div>
            <div className={`learning-analysis__trend learning-analysis__trend--${analysis.trend}`}>
              <strong>{trendSymbol(analysis.trend)} {copy.analysis.trendLabels[analysis.trend]}</strong>
              {analysis.trend !== "new" && <span>{analysis.delta > 0 ? "+" : ""}{analysis.delta} pts</span>}
            </div>
          </div>

          <div className="learning-analysis__highlights">
            {analysis.priority && showPriority && (
              <article className="analysis-highlight analysis-highlight--priority">
                <span>{copy.analysis.priority}</span><h3>{labelFor(analysis.priority)}</h3>
                <p>{copy.analysis.actions[analysis.priority.skill]}</p>
                <Link to={analysis.priority.route}>{copy.analysis.openPractice}<b aria-hidden="true">→</b></Link>
              </article>
            )}
            {analysis.strongest && showStrength && (
              <article className="analysis-highlight analysis-highlight--strength">
                <span>{copy.analysis.strength}</span><h3>{labelFor(analysis.strongest)}</h3>
                <p>{copy.analysis.masteryLabels[analysis.strongest.mastery]} · {analysis.strongest.averageScore}/100</p>
                <Link to={analysis.strongest.route}>{copy.analysis.openPractice}<b aria-hidden="true">→</b></Link>
              </article>
            )}
          </div>

          <div className="learning-analysis__skills">
            {analysis.skills.map((result) => (
              <article className={`analysis-skill analysis-skill--${result.mastery}`} key={result.key}>
                <div className="analysis-skill__top"><span>{copy.analysis.languageLabels[result.language]}</span><b>{trendSymbol(result.trend)} {copy.analysis.trendLabels[result.trend]}</b></div>
                <h3>{copy.analysis.skillLabels[result.skill]}</h3>
                <div className="analysis-skill__bar" aria-label={`${copy.analysis.average}: ${result.averageScore}/100`}><i style={{ width: `${result.averageScore}%` }} /></div>
                <div className="analysis-skill__numbers">
                  <span><strong>{result.averageScore}</strong>{copy.analysis.average}</span>
                  <span><strong>{result.latestScore}</strong>{copy.analysis.latest}</span>
                  <span><strong>{result.bestScore}</strong>{copy.analysis.best}</span>
                  <span><strong>{result.passRate}%</strong>{copy.analysis.passRate}</span>
                </div>
                <footer><span>{result.attempts} · {copy.analysis.attempts}</span><Link to={result.route}>{copy.analysis.openPractice} →</Link></footer>
              </article>
            ))}
          </div>
        </>
      )}
      <p className="learning-analysis__privacy">⌁ {copy.analysis.privacy}</p>
    </section>
  );
}
