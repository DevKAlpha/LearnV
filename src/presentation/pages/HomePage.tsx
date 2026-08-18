import { Link } from "react-router-dom";
import { dailyTasks, currentCycle } from "../../infrastructure/data/gks-2026";
import { ProgressOrbit } from "../components/ProgressOrbit";

type Props = {
  score: number;
  progress: { completedTasks: string[] };
  toggleTask: (id: string) => void;
};

export function HomePage({ score, progress, toggleTask }: Props) {
  const completedToday = progress.completedTasks.length;

  return (
    <div className="page page--home">
      <header className="mobile-header">
        <div>
          <span className="eyebrow">Lunes · 17 de agosto</span>
          <h1>안녕, futura scholar!</h1>
        </div>
        <Link to="/profile" className="avatar-button" aria-label="Abrir perfil">N</Link>
      </header>

      <section className="hero-grid" aria-labelledby="readiness-title">
        <div className="hero-copy">
          <span className="sticker sticker--yellow">GKS-U · España</span>
          <h2 id="readiness-title">Un paso claro.<br />Cada día.</h2>
          <p>Tu preparación combina expediente, idiomas y una historia personal respaldada por evidencia.</p>
          <Link to="/study" className="primary-button">Comenzar sesión <span>→</span></Link>
        </div>
        <ProgressOrbit score={score} />
      </section>

      <section className="alert-card" aria-label="Estado de convocatoria">
        <div className="alert-icon" aria-hidden="true">!</div>
        <div>
          <span className="eyebrow">Radar oficial</span>
          <strong>{currentCycle.target}</strong>
          <p>{currentCycle.targetStatus}. Estamos usando 2026 solo como referencia.</p>
        </div>
        <Link to="/gks" aria-label="Ver detalles de la convocatoria">↗</Link>
      </section>

      <section className="section-block" aria-labelledby="today-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Tu foco</span>
            <h2 id="today-title">Plan de hoy</h2>
          </div>
          <span className="count-pill">{completedToday}/{dailyTasks.length}</span>
        </div>
        <div className="task-list">
          {dailyTasks.map((task, index) => {
            const checked = progress.completedTasks.includes(task.id);
            return (
              <label className={`task-card task-card--${task.category}${checked ? " task-card--done" : ""}`} key={task.id}>
                <input type="checkbox" checked={checked} onChange={() => toggleTask(task.id)} />
                <span className="task-number">0{index + 1}</span>
                <span className="task-content">
                  <strong>{task.title}</strong>
                  <small>{task.meta}</small>
                </span>
                <span className="task-duration">{task.duration} min</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="quote-card">
        <div className="flower-face" aria-hidden="true"><span>☺</span></div>
        <div>
          <span className="eyebrow">Pequeño recordatorio</span>
          <p>Tu candidatura no se escribe en un día. Se construye con pruebas de lo que ya estás haciendo.</p>
        </div>
      </section>
    </div>
  );
}
