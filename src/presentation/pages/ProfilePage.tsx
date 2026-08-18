import { Link } from "react-router-dom";
import { currentCycle } from "../../infrastructure/data/gks-2026";

export function ProfilePage({ score }: { score: number }) {
  return (
    <div className="page profile-page">
      <header className="profile-hero">
        <div className="profile-avatar">N<span>✦</span></div>
        <span className="eyebrow">Perfil local</span>
        <h1>Tu ruta empieza con datos correctos.</h1>
        <p>Completa la información clave cuando construyamos el diagnóstico personalizado.</p>
      </header>

      <section className="profile-score">
        <span>Preparación actual</span><strong>{score}%</strong><div><i style={{ width: `${score}%` }} /></div>
      </section>

      <section className="profile-fields">
        <div><small>Nacionalidad</small><strong>Por confirmar</strong><span>→</span></div>
        <div><small>Carrera deseada</small><strong>Por confirmar</strong><span>→</span></div>
        <div><small>Nivel de coreano</small><strong>TOPIK por diagnosticar</strong><span>→</span></div>
        <div><small>Nivel de inglés</small><strong>MCER por diagnosticar</strong><span>→</span></div>
      </section>

      <section className="profile-cycle">
        <span className="eyebrow">Ciclo objetivo</span><h2>{currentCycle.target}</h2><p>{currentCycle.targetStatus}</p>
        <Link to="/gks">Ver radar oficial →</Link>
      </section>
    </div>
  );
}
