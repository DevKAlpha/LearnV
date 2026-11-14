import "@/styles/tailwind-study.css";
import { useI18n } from "@/application/i18n/I18nContext";
import { stageLabelParts, useDailyPlan, useWeeklySummary } from "@/application/controllers/useDailyHabit";
import type { LearningJourneyState } from "@/domain/models/learning-journey";
import { dailyHabitCopy } from "@/infrastructure/i18n/daily-habit-copy";

const NO_TICKS: readonly string[] = [];

/**
 * The last seven days against the previous seven, from evidence recorded on this device,
 * with the weakest skill of the week and the next stage to aim for. Loaded lazily.
 */
export function WeeklySummaryCard({ journey }: { journey: LearningJourneyState }) {
  const { locale } = useI18n();
  const copy = dailyHabitCopy[locale];
  const week = useWeeklySummary(journey);
  const { nextStage } = useDailyPlan(NO_TICKS);
  const format = (date: string) => new Intl.DateTimeFormat({ es: "es-ES", en: "en-GB", ko: "ko-KR" }[locale], { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
  const stats = [
    { label: copy.week.minutes, value: week.minutes, previous: week.previous.minutes },
    { label: copy.week.days, value: week.practiceDays, previous: week.previous.practiceDays },
    { label: copy.week.practices, value: week.practices, previous: week.previous.practices },
    { label: copy.week.reviewed, value: week.reviewed, previous: week.previous.reviewed },
  ];
  const goals = (["en", "ko"] as const).flatMap((language) => {
    const stageId = nextStage[language];
    const parts = stageId ? stageLabelParts(language, stageId) : null;
    return parts ? [copy.week.nextStage(copy.languages[language], parts.order, copy.skills[parts.skill])] : [];
  });
  return (
    <section className="my-4 grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-left text-fg" aria-labelledby="weekly-summary-title">
      <div className="grid gap-1">
        <span className="eyebrow">{copy.week.kicker}</span>
        <h2 id="weekly-summary-title" className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">{copy.week.title}</h2>
        <p className="m-0 text-sm">{copy.week.range(format(week.from), format(week.to))}</p>
      </div>
      <dl className="m-0 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="grid gap-0.5 rounded-2xl border-2 border-current/25 p-3">
            <dt className="text-sm">{stat.label}</dt>
            <dd className="m-0 text-2xl font-extrabold">{stat.value}</dd>
            <dd className="m-0 text-xs">{copy.week.versus(stat.previous)}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0">{week.weakest ? copy.week.weakest(copy.skills[week.weakest.skill], week.weakest.score) : copy.week.noWeakest}</p>
      <div className="grid gap-1">
        <strong>{copy.week.next}</strong>
        {goals.length ? <ul className="m-0 grid gap-1 pl-5">{goals.map((goal) => <li key={goal}>{goal}</li>)}</ul> : <p className="m-0">{copy.week.nextNone}</p>}
      </div>
      <small>{copy.week.evidence}</small>
    </section>
  );
}
