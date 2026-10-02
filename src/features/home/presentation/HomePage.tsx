import { Link } from "react-router-dom";
import { dailyTasks } from "@/infrastructure/data/gks-2026";
import { ProgressOrbit } from "@/shared/ui/ProgressOrbit";
import { useI18n } from "@/application/i18n/I18nContext";
import { LanguageGoals } from "@/features/home/presentation/LanguageGoals";
import { getReminderStage } from "@/domain/models/learning-reminder";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { LearningJourneyPanel } from "@/shared/ui/LearningJourneyPanel";
import { buildHomeTaskPlan, type HomeTaskPlanEntry } from "@/domain/models/home-plan";
import type { StudyTask } from "@/domain/models/gks";

type Props = {
  score: number;
  progress: { completedTasks: string[] };
  toggleTask: (id: string) => void;
  learning: LearningJourneyController;
};

export function HomePage({ score, progress, toggleTask, learning }: Props) {
  const { locale, copy } = useI18n();
  const taskPlan = buildHomeTaskPlan(dailyTasks, progress.completedTasks);
  const completedToday = taskPlan.completedCount;
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
  const primaryRoute = taskPlan.primary ? taskRoutes[taskPlan.primary.task.id] ?? "/study" : "/study";

  const renderTask = ({ task, originalIndex, completed }: HomeTaskPlanEntry<StudyTask>, priority = false) => {
    const taskCopy = copy.tasks.items[task.id as keyof typeof copy.tasks.items];

    return (
      <article className={`task-card task-card--${task.category}${completed ? " task-card--done" : ""}${priority ? " task-card--priority" : ""}`} key={task.id}>
        <button
          className="task-card__toggle"
          type="button"
          aria-pressed={completed}
          aria-label={`${completed ? copy.common.unmark : copy.common.mark} ${taskCopy.title}`}
          onClick={() => toggleTask(task.id)}
        >
          <span className="task-number">{completed ? "✓" : `0${originalIndex + 1}`}</span>
          <span className="task-content">
            {priority && <small className="task-content__priority">{copy.home.nextStep}</small>}
            <strong>{taskCopy.title}</strong>
            <small>{taskCopy.meta}</small>
          </span>
          <span className="task-duration">{task.duration} {copy.common.minutes}</span>
        </button>
        <Link className="task-card__open" to={taskRoutes[task.id] ?? "/study"} aria-label={`${copy.home.start}: ${taskCopy.title}`}>→</Link>
      </article>
    );
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
          <Link to={primaryRoute} className="primary-button">{taskPlan.primary ? copy.home.start : copy.home.continueLearning} <span>→</span></Link>
        </div>
        <ProgressOrbit score={score} />
      </section>

      <section className="section-block home-today" aria-labelledby="today-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{copy.home.focus}</span>
            <h2 id="today-title">{copy.home.today}</h2>
          </div>
          <span className="count-pill">{completedToday}/{dailyTasks.length}</span>
        </div>
        {taskPlan.primary ? renderTask(taskPlan.primary, true) : (
          <div className="home-plan-complete">
            <span aria-hidden="true">✓</span>
            <div><strong>{copy.home.planCompleteTitle}</strong><p>{copy.home.reminderStages.planComplete}</p></div>
            <Link to="/study">{copy.home.continueLearning}<b aria-hidden="true">→</b></Link>
          </div>
        )}
        <details className="home-plan-drawer">
          <summary><span>{copy.home.otherTasks}</span><b>{taskPlan.remaining.length}</b><i aria-hidden="true">＋</i></summary>
          <div className="task-list">{taskPlan.remaining.map((entry) => renderTask(entry))}</div>
        </details>
      </section>

      <LearningJourneyPanel learning={learning} compact />

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
