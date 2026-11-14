import "@/styles/tailwind-study.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { stageLabelParts, useDailyPlan } from "@/application/controllers/useDailyHabit";
import { useLocalToday } from "@/application/controllers/useLocalToday";
import { useTaskBoard } from "@/application/controllers/useTaskBoard";
import type { DailyPlanItem } from "@/domain/models/daily-plan";
import { todayBoardTasks } from "@/domain/models/task-board";
import { emitLearnvEvent } from "@/infrastructure/events/learnv-events";
import { dailyHabitCopy } from "@/infrastructure/i18n/daily-habit-copy";
import { gksProfileCopy } from "@/infrastructure/i18n/gks-profile-copy";
import { ACTION_ROUTES } from "@/shared/ui/gks-action-routes";

export type PlanStatus = { done: number; total: number; route: string | null };

type Props = {
  ticked: readonly string[];
  toggle: (id: string) => void;
  streak: number;
  shieldUsed: boolean;
  onStatus: (status: PlanStatus) => void;
};

const CATEGORY: Record<DailyPlanItem["kind"], string> = { review: "topik", stage: "english", gks: "application" };

/**
 * Today's generated plan on Home. Review and stage items complete themselves from saved
 * practice; only the GKS step has a tick. Loaded lazily: it carries the review deck.
 */
export function DailyPlanCard({ ticked, toggle, streak, shieldUsed, onStatus }: Props) {
  const { locale, copy: app } = useI18n();
  const copy = dailyHabitCopy[locale];
  const actions = gksProfileCopy[locale].cycle.actions;
  const plan = useDailyPlan(ticked);
  const today = useLocalToday();
  const board = useTaskBoard();
  const dueOnBoard = todayBoardTasks(board.board.tasks, today).filter((task) => task.dueDate !== null).length;

  const route = (item: DailyPlanItem) => item.kind === "review" ? "/study/review"
    : item.kind === "stage" ? `/tests/${item.language}/${item.stageId}`
    : ACTION_ROUTES[item.action];
  const primary = plan.items.find((item) => !item.done) ?? null;
  const primaryRoute = primary ? route(primary) : null;

  useEffect(() => {
    onStatus({ done: plan.done, total: plan.total, route: primaryRoute && !primaryRoute.startsWith("https://") ? primaryRoute : null });
  }, [plan.done, plan.total, primaryRoute, onStatus]);

  const title = (item: DailyPlanItem) => {
    if (item.kind === "review") return copy.plan.review(item.target);
    if (item.kind === "gks") return actions[item.action].title;
    const parts = stageLabelParts(item.language, item.stageId);
    return parts ? copy.plan.stage(copy.languages[item.language], parts.order, copy.skills[parts.skill]) : copy.languages[item.language];
  };
  const meta = (item: DailyPlanItem) => item.kind === "review" ? copy.plan.reviewMeta
    : item.kind === "stage" ? (item.done ? copy.plan.stageDone : copy.plan.stageMeta)
    : copy.plan.gksMeta;

  const renderItem = (item: DailyPlanItem, index: number) => {
    const target = route(item);
    const external = target.startsWith("https://");
    const priority = item === primary;
    const label = title(item);
    const body = <>
      <span className="task-content">
        {priority && <small className="task-content__priority">{copy.plan.next}</small>}
        <strong>{label}</strong>
        <small>{meta(item)}</small>
      </span>
      <span className="task-duration">{item.minutes} {copy.plan.minutes}</span>
    </>;
    return (
      <article key={item.id} className={`task-card task-card--${CATEGORY[item.kind]}${item.done ? " task-card--done" : ""}${priority ? " task-card--priority" : ""}`} data-plan-item={item.kind}>
        {item.kind === "gks" ? (
          <button className="task-card__toggle" type="button" aria-pressed={item.done} aria-label={`0${index + 1} · ${item.done ? copy.plan.unmark : copy.plan.mark}: ${label}`} title={`${item.done ? copy.plan.unmark : copy.plan.mark}: ${label}`} onClick={() => toggle(item.id)}>
            <span className="task-number">{item.done ? "✓" : `0${index + 1}`}</span>
          </button>
        ) : (
          <span className="task-card__toggle">
            <span className="task-number" aria-hidden="true">{item.done ? "✓" : `0${index + 1}`}</span>
            <span className="sr-only">{item.done ? copy.plan.doneLabel : copy.plan.pendingLabel}</span>
          </span>
        )}
        {external
          ? <a className="task-card__body" href={target} target="_blank" rel="noreferrer">{body}</a>
          : <Link className="task-card__body" to={target}>{body}</Link>}
        {external
          ? <a className="task-card__open" href={target} target="_blank" rel="noreferrer" aria-label={`${app.home.start}: ${label}`}>↗</a>
          : <Link className="task-card__open" to={target} aria-label={`${app.home.start}: ${label}`}>→</Link>}
      </article>
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="section-intro m-0">{copy.plan.intro}</p>
        <span className="count-pill" aria-label={`${plan.done}/${plan.total}`}>{plan.done}/{plan.total}</span>
      </div>
      {plan.total > 0 && plan.done === plan.total && (
        <div className="home-plan-complete">
          <span aria-hidden="true">✓</span>
          <div><strong>{copy.plan.complete}</strong><p>{copy.plan.completeText}</p></div>
          <Link to="/study">{app.home.continueLearning}<b aria-hidden="true">→</b></Link>
        </div>
      )}
      <div className="task-list">{plan.items.map(renderItem)}</div>
      {dueOnBoard > 0 && (
        <p className="m-0 flex flex-wrap items-center gap-2 text-[0.95rem]">
          <span>{copy.plan.board(dueOnBoard)}</span>
          <button type="button" className="min-h-11 cursor-pointer rounded-full border-2 border-edge bg-paper px-4 font-extrabold text-fg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current" onClick={() => emitLearnvEvent("learnv:open-task-board", { view: "today" })}>{copy.plan.openBoard}</button>
        </p>
      )}
      <p className="m-0 text-sm leading-relaxed">
        <strong>{streak > 0 ? "🔥 " : ""}{app.journey.currentStreak}: {streak} {streak === 1 ? app.journey.day : app.journey.days}</strong>
        {" · "}<span title={copy.streak.shieldHelp}>{shieldUsed ? copy.streak.shieldUsed : copy.streak.shieldReady}</span>
        <br /><small>{copy.plan.honest} {copy.streak.shieldHelp}</small>
      </p>
    </>
  );
}
