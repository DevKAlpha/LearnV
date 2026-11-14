import "@/styles/tailwind-study.css";
import { useI18n } from "@/application/i18n/I18nContext";
import { useGksCycle } from "@/application/controllers/useApplicantProfile";
import { useTaskBoard } from "@/application/controllers/useTaskBoard";
import { documentStartDate } from "@/domain/models/gks-cycle";
import { MAX_BOARD_TASKS } from "@/domain/models/task-board";
import { documents } from "@/infrastructure/data/gks-2026";
import { gksProfileCopy } from "@/infrastructure/i18n/gks-profile-copy";

type Props = { completed: readonly string[]; labels: Record<string, string> };

const dateLocales = { es: "es-ES", en: "en-GB", ko: "ko-KR" } as const;

/**
 * When to start each pending document for the cycle the applicant targets, longest lead
 * time first, with a one-tap task on the board (area "gks", due on the start date).
 */
export function DocumentSchedule({ completed, labels }: Props) {
  const { locale } = useI18n();
  const copy = gksProfileCopy[locale].documents;
  const cycle = useGksCycle();
  const board = useTaskBoard();
  const format = (date: string) => new Intl.DateTimeFormat(dateLocales[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
  const pending = documents
    .filter((document) => !completed.includes(document.id))
    .map((document) => ({ document, start: documentStartDate(document.id, cycle.submissionDeadline, cycle.today) }))
    .sort((a, b) => a.start.localeCompare(b.start));
  const full = board.board.tasks.length >= MAX_BOARD_TASKS;

  // The schedule matters until submission; after it, the cycle card points to the next step.
  if (!pending.length || !["preparation", "call", "application"].includes(cycle.phase)) return null;

  const add = (documentId: string, start: string) => {
    const now = Date.now();
    board.commit({
      type: "add",
      task: { id: `gks-doc-${documentId}-${cycle.entryYear}`, title: copy.boardTask(labels[documentId] ?? documentId), area: "gks", status: "todo", dueDate: start, createdAt: now, updatedAt: now },
    });
  };

  return (
    <section className="my-4 grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-left text-fg" aria-labelledby="document-schedule-title">
      <div className="grid gap-1">
        <h2 id="document-schedule-title" className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">{copy.deadlineTitle(cycle.entryYear)}</h2>
        <p className="m-0 text-[0.95rem] leading-relaxed">{copy.deadlineText(format(cycle.submissionDeadline))}</p>
      </div>
      <ul className="m-0 grid list-none gap-2 p-0">
        {pending.map(({ document, start }) => {
          const onBoard = board.board.tasks.some((task) => task.id === `gks-doc-${document.id}-${cycle.entryYear}`);
          return (
            <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-current/25 px-3 py-2">
              <span className="grid">
                <strong>{labels[document.id] ?? document.id}</strong>
                <small>{copy.startBy(format(start))}</small>
              </span>
              <button
                type="button"
                className={`min-h-11 cursor-pointer rounded-full border-2 px-4 font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed ${onBoard ? "border-edge bg-paper text-fg opacity-80" : "border-ink bg-accent text-ink"}`}
                disabled={onBoard || full}
                onClick={() => add(document.id, start)}
              >
                {onBoard ? `✓ ${copy.added}` : full ? copy.boardFull : copy.addToBoard}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
