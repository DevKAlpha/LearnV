import "@/styles/tailwind-study.css";
import { useI18n } from "@/application/i18n/I18nContext";
import { useApplicantProfile, useGksCycle } from "@/application/controllers/useApplicantProfile";
import { useCalendarExport } from "@/application/controllers/useCalendarExport";
import { localDateKey } from "@/domain/models/learning-journey";
import { dailyHabitCopy } from "@/infrastructure/i18n/daily-habit-copy";
import { downloadText } from "@/shared/ui/download-text";
import { gksProfileCopy } from "@/infrastructure/i18n/gks-profile-copy";
import { GksCycleCard } from "@/shared/ui/GksCycleCard";

const dateLocales = { es: "es-ES", en: "en-GB", ko: "ko-KR" } as const;

/** The whole cycle, with the current phase marked and estimated dates labelled. */
export function GksCycleTimeline() {
  const { locale } = useI18n();
  const copy = gksProfileCopy[locale].cycle;
  const cycle = useGksCycle();
  const { update } = useApplicantProfile();
  const buildCalendar = useCalendarExport(locale);
  const addToCalendar = () => downloadText(buildCalendar({ gks: true, board: false, study: false }), `learnv-gks-${cycle.entryYear}-${localDateKey(new Date())}.ics`, "text/calendar");
  const format = (date: string) => new Intl.DateTimeFormat(dateLocales[locale], { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

  return (
    <section className="grid gap-3" aria-labelledby="gks-cycle-timeline-title">
      <GksCycleCard />
      <fieldset className="m-0 flex flex-wrap items-center gap-2 border-0 p-0">
        <legend className="mb-1 font-extrabold">{copy.statusLabel}</legend>
        {(["preparing", "applied"] as const).map((status) => (
          <label key={status} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 px-4 font-bold has-focus-visible:outline-3 has-focus-visible:outline-offset-2 ${cycle.status === status ? "border-ink bg-accent text-ink" : "border-edge bg-paper text-fg"}`}>
            <input className="sr-only" type="radio" name="gks-application-status" checked={cycle.status === status} onChange={() => update({ applicationStatus: status })} />
            {status === "preparing" ? copy.preparing : copy.applied}
          </label>
        ))}
      </fieldset>
      <div className="grid gap-2 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,3.5vw,24px)] text-fg">
        <h3 id="gks-cycle-timeline-title" className="m-0 text-lg">{copy.timelineTitle} · {copy.cycle(cycle.entryYear)}</h3>
        <ol className="m-0 grid list-none gap-2 p-0">
          {cycle.timeline.map((milestone) => {
            const current = milestone.phase === cycle.phase;
            const past = milestone.end < cycle.today && !current;
            return (
              <li key={milestone.phase} aria-current={current ? "step" : undefined} className={`grid gap-0.5 rounded-2xl border-2 px-3 py-2 ${current ? "border-ink bg-accent text-ink" : past ? "border-current/20 opacity-70" : "border-current/30"}`}>
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <strong>{copy.phases[milestone.phase].title}{current ? ` · ${copy.here}` : ""}</strong>
                  <small>{format(milestone.start)} – {format(milestone.end)} · {milestone.estimated ? copy.estimated : copy.confirmed}</small>
                </span>
                <span className="text-[0.95rem]">{copy.phases[milestone.phase].text}</span>
              </li>
            );
          })}
        </ol>
        <small>{copy.estimateNote}</small>
        <button type="button" className="min-h-11 w-fit cursor-pointer rounded-full border-2 border-edge bg-paper px-4 font-extrabold text-fg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current" onClick={addToCalendar}>{dailyHabitCopy[locale].reminders.gksButton} (.ics)</button>
      </div>
    </section>
  );
}
