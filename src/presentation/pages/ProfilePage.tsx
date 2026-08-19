import { Link } from "react-router-dom";
import { currentCycle } from "../../infrastructure/data/gks-2026";
import { useI18n } from "../../application/i18n/I18nContext";

export function ProfilePage({ score }: { score: number }) {
  const { copy } = useI18n();

  return (
    <div className="page profile-page">
      <header className="profile-hero">
        <div className="profile-avatar">V<span>✦</span></div>
        <span className="eyebrow">{copy.profile.local}</span>
        <h1>{copy.profile.title}</h1>
        <p>{copy.profile.intro}</p>
      </header>

      <section className="profile-score">
        <span>{copy.profile.readiness}</span><strong>{score}%</strong><div><i style={{ width: `${score}%` }} /></div>
      </section>

      <section className="profile-fields">
        <div><small>{copy.profile.nationality}</small><strong>{copy.profile.pending}</strong><span>→</span></div>
        <div><small>{copy.profile.major}</small><strong>{copy.profile.pending}</strong><span>→</span></div>
        <div><small>{copy.profile.korean}</small><strong>{copy.profile.topikPending}</strong><span>→</span></div>
        <div><small>{copy.profile.english}</small><strong>{copy.profile.cefrPending}</strong><span>→</span></div>
      </section>

      <section className="profile-cycle">
        <span className="eyebrow">{copy.profile.targetCycle}</span><h2>{currentCycle.target}</h2><p>{copy.home.cycleNote}</p>
        <Link to="/gks">{copy.profile.radar} →</Link>
      </section>
    </div>
  );
}
