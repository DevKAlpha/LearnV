import { dailyTasks, languageBands } from "../../infrastructure/data/gks-2026";

type Props = {
  progress: { completedTasks: string[] };
  toggleTask: (id: string) => void;
};

export function StudyPage({ progress, toggleTask }: Props) {
  return (
    <div className="page">
      <header className="page-header page-header--study">
        <span className="sticker sticker--blue">Language lab</span>
        <h1>Inglés + 한국어.<br />Con intención.</h1>
        <p>Aprende lo que la candidatura y la vida académica van a pedirte.</p>
      </header>

      <section className="study-feature">
        <div className="study-feature__copy">
          <span className="eyebrow">Sesión recomendada</span>
          <h2>TOPIK II · comprensión profunda</h2>
          <p>Identifica la tesis, descarta distractores y registra por qué fallaste.</p>
          <button type="button" onClick={() => toggleTask(dailyTasks[0].id)}>
            {progress.completedTasks.includes(dailyTasks[0].id) ? "Sesión completada ✓" : "Empezar · 20 min"}
          </button>
        </div>
        <div className="study-character" aria-hidden="true">
          <span>가</span><i /><b>✓</b>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="eyebrow">Referencia GKS-U 2026</span><h2>Objetivos de idioma</h2></div></div>
        <div className="language-grid">
          <article className="language-card language-card--korean">
            <div className="language-title"><span>한</span><div><small>Coreano</small><strong>TOPIK II</strong></div></div>
            {languageBands.topik.map((band) => (
              <div className="band-row" key={band.label}><strong>{band.label}</strong><span>{band.note}</span><b>{band.score}</b></div>
            ))}
          </article>
          <article className="language-card language-card--english">
            <div className="language-title"><span>A+</span><div><small>Inglés académico</small><strong>B2 → C1</strong></div></div>
            {languageBands.english.map((band) => (
              <div className="band-row" key={band.label}><strong>{band.label}</strong><span>{band.note}</span><b>{band.score}</b></div>
            ))}
          </article>
        </div>
        <p className="data-note">Las equivalencias y puntuaciones TOEFL deben actualizarse cuando NIIED publique la guía 2027.</p>
      </section>

      <section className="skill-path">
        <div className="section-heading"><div><span className="eyebrow">Tu método</span><h2>Practica, recuerda, corrige</h2></div></div>
        <div className="path-line">
          <div><span>01</span><strong>Diagnóstico</strong><small>Qué sabes ahora</small></div>
          <div><span>02</span><strong>Recuperación</strong><small>Responder sin mirar</small></div>
          <div><span>03</span><strong>Feedback</strong><small>Entender el error</small></div>
          <div><span>04</span><strong>Revisión</strong><small>Volver en el momento justo</small></div>
        </div>
      </section>
    </div>
  );
}
