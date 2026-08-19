import { Link } from "react-router-dom";
import { dailyTasks, currentCycle } from "../../infrastructure/data/gks-2026";
import { ProgressOrbit } from "../components/ProgressOrbit";
import { useI18n } from "../../application/i18n/I18nContext";

type Props = {
  score: number;
  progress: { completedTasks: string[] };
  toggleTask: (id: string) => void;
};

export function HomePage({ score, progress, toggleTask }: Props) {
  const { locale, copy } = useI18n();
  const completedToday = progress.completedTasks.length;
  const dateLocale = { es: "es-ES", en: "en-GB", ko: "ko-KR" }[locale];
  const today = new Intl.DateTimeFormat(dateLocale, { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const [titleLineOne, titleLineTwo] = copy.home.title.split("\n");

  return (
    <div className="page page--home">
      <header className="mobile-header">
        <div>
          <span className="eyebrow">{today}</span>
          <h1>{copy.home.greeting}</h1>
        </div>
        <Link to="/profile" className="avatar-button" aria-label={copy.home.openProfile}>V</Link>
      </header>

      <section className="hero-grid" aria-labelledby="readiness-title">
        <div className="hero-copy">
          <span className="sticker sticker--yellow">{copy.home.sticker}</span>
          <h2 id="readiness-title">{titleLineOne}<br />{titleLineTwo}</h2>
          <p>{copy.home.intro}</p>
          <Link to="/study" className="primary-button">{copy.home.start} <span>→</span></Link>
        </div>
        <ProgressOrbit score={score} />
      </section>

      <section className="alert-card" aria-label={copy.home.cycleAria}>
        <div className="alert-icon" aria-hidden="true">!</div>
        <div>
          <span className="eyebrow">{copy.home.radar}</span>
          <strong>{currentCycle.target}</strong>
          <p>{copy.home.cycleNote}</p>
        </div>
        <Link to="/gks" aria-label={copy.home.cycleDetails}>↗</Link>
      </section>

      <section className="section-block" aria-labelledby="today-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{copy.home.focus}</span>
            <h2 id="today-title">{copy.home.today}</h2>
          </div>
          <span className="count-pill">{completedToday}/{dailyTasks.length}</span>
        </div>
        <div className="task-list">
          {dailyTasks.map((task, index) => {
            const checked = progress.completedTasks.includes(task.id);
            const taskCopy = copy.tasks.items[task.id as keyof typeof copy.tasks.items];
            return (
              <label className={`task-card task-card--${task.category}${checked ? " task-card--done" : ""}`} key={task.id}>
                <input type="checkbox" checked={checked} onChange={() => toggleTask(task.id)} />
                <span className="task-number">0{index + 1}</span>
                <span className="task-content">
                  <strong>{taskCopy.title}</strong>
                  <small>{taskCopy.meta}</small>
                </span>
                <span className="task-duration">{task.duration} {copy.common.minutes}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="quote-card">
        <div className="flower-face" aria-hidden="true"><span>☺</span></div>
        <div>
          <span className="eyebrow">{copy.home.reminder}</span>
          <p>{copy.home.reminderText}</p>
        </div>
      </section>
    </div>
  );
}
