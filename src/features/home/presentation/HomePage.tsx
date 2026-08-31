import { Link } from "react-router-dom";
import { dailyTasks, currentCycle } from "@/infrastructure/data/gks-2026";
import { ProgressOrbit } from "@/shared/ui/ProgressOrbit";
import { useI18n } from "@/application/i18n/I18nContext";
import { LanguageGoals } from "@/features/home/presentation/LanguageGoals";
import { getReminderStage } from "@/domain/models/learning-reminder";

type Props = {
  score: number;
  progress: { completedTasks: string[] };
  toggleTask: (id: string) => void;
};

export function HomePage({ score, progress, toggleTask }: Props) {
  const { locale, copy } = useI18n();
  const completedToday = dailyTasks.filter((task) => progress.completedTasks.includes(task.id)).length;
  const reminderStage = getReminderStage(score, completedToday, dailyTasks.length);
  const reminderText = copy.home.reminderStages[reminderStage];
  const dateLocale = { es: "es-ES", en: "en-GB", ko: "ko-KR" }[locale];
  const today = new Intl.DateTimeFormat(dateLocale, { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const [titleLineOne, titleLineTwo] = copy.home.title.split("\n");
  const taskRoutes: Record<string, string> = {
    "topik-reading-01": "/study/korean",
    "english-writing-01": "/study/english",
    "gks-story-01": "/study/interviews",
  };

  return (
    <div className="page page--home">
      <header className="mobile-header">
        <div>
          <span className="eyebrow">{today}</span>
          <h1 className="home-route-title" aria-label="우리의 Route to Corea 👉 ❤️ 👈">
            <span lang="ko">우리의</span>
            <span lang="en">Route to</span>
            <span lang="es">Corea</span>
            <span className="home-route-title__icons" aria-hidden="true">👉 ❤️ 👈</span>
          </h1>
        </div>
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

      <Link className="alert-card alert-card--link" to="/gks" aria-label={copy.home.cycleDetails}>
        <div className="alert-icon" aria-hidden="true">!</div>
        <div>
          <span className="eyebrow">{copy.home.radar}</span>
          <strong>{currentCycle.target}</strong>
          <p>{copy.home.cycleNote}</p>
        </div>
        <span className="alert-card__arrow" aria-hidden="true">↗</span>
      </Link>

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
              <article className={`task-card task-card--${task.category}${checked ? " task-card--done" : ""}`} key={task.id}>
                <button
                  className="task-card__toggle"
                  type="button"
                  aria-pressed={checked}
                  aria-label={`${checked ? copy.common.unmark : copy.common.mark} ${taskCopy.title}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <span className="task-number">{checked ? "✓" : `0${index + 1}`}</span>
                  <span className="task-content">
                    <strong>{taskCopy.title}</strong>
                    <small>{taskCopy.meta}</small>
                  </span>
                  <span className="task-duration">{task.duration} {copy.common.minutes}</span>
                </button>
                <Link className="task-card__open" to={taskRoutes[task.id] ?? "/study"} aria-label={`${copy.home.start}: ${taskCopy.title}`}>→</Link>
              </article>
            );
          })}
        </div>
      </section>

      <LanguageGoals />

      <section className="quote-card" aria-live="polite">
        <div className="flower-face" aria-hidden="true"><span>☺</span></div>
        <div>
          <span className="eyebrow">{copy.home.reminder}</span>
          <p>{reminderText}</p>
          <Link className="quote-card__action" to="/study">{copy.home.start}<span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
