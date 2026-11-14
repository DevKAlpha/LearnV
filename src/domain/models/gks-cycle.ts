/**
 * GKS-U yearly cycle. A cycle is named by its entry year (GKS-U 2027 = arrival in Korea in
 * early 2027): the call is published around September of the previous year.
 *
 * Phase windows are *estimates* drawn from previous cycles. Each university and embassy
 * sets its own deadlines, so every estimated date is labelled as such in the interface;
 * dates confirmed in an official guideline replace the estimate for that phase.
 */
export const CYCLE_PHASES = ["preparation", "call", "application", "first-round", "second-round", "results", "pre-departure"] as const;
export type CyclePhaseId = typeof CYCLE_PHASES[number];
export type ApplicationStatus = "preparing" | "applied";

export type CycleWindow = { start: string; end: string };
export type CycleMilestone = CycleWindow & { phase: CyclePhaseId; estimated: boolean };
export type ConfirmedWindows = Partial<Record<CyclePhaseId, CycleWindow>>;

const pad = (value: number) => String(value).padStart(2, "0");
const day = (year: number, month: number, date: number) => `${year}-${pad(month)}-${pad(date)}`;

/** Month/day windows relative to the entry year, from the 2025–2027 cycles. */
function estimatedWindows(entryYear: number): Record<CyclePhaseId, CycleWindow> {
  const before = entryYear - 1;
  return {
    preparation: { start: day(before - 1, 11, 1), end: day(before, 8, 31) },
    call: { start: day(before, 9, 1), end: day(before, 9, 20) },
    application: { start: day(before, 9, 10), end: day(before, 10, 15) },
    "first-round": { start: day(before, 10, 16), end: day(before, 11, 30) },
    "second-round": { start: day(before, 12, 1), end: day(before, 12, 31) },
    results: { start: day(entryYear, 1, 1), end: day(entryYear, 1, 31) },
    "pre-departure": { start: day(entryYear, 2, 1), end: day(entryYear, 2, 28) },
  };
}

export function buildCycleTimeline(entryYear: number, confirmed: ConfirmedWindows = {}): CycleMilestone[] {
  const estimates = estimatedWindows(entryYear);
  return CYCLE_PHASES.map((phase) => confirmed[phase]
    ? { phase, ...confirmed[phase]!, estimated: false }
    : { phase, ...estimates[phase], estimated: true });
}

/**
 * The cycle an applicant is working towards. Someone still preparing aims at the first
 * cycle whose application window has not closed; someone who applied follows the cycle
 * they applied to until its pre-departure phase ends.
 */
export function targetEntryYear(today: string, status: ApplicationStatus): number {
  const year = Number(today.slice(0, 4));
  if (status === "applied") {
    // Applications close in October of the year before entry; results arrive in January.
    return today >= day(year, 9, 1) ? year + 1 : year;
  }
  return today > estimatedWindows(year + 1).application.end ? year + 2 : year + 1;
}

/** The phase that contains today; between windows, the last phase that has started. */
export function currentPhase(timeline: readonly CycleMilestone[], today: string): CyclePhaseId {
  const inside = [...timeline].reverse().find((milestone) => milestone.start <= today && today <= milestone.end);
  if (inside) return inside.phase;
  const started = [...timeline].reverse().find((milestone) => milestone.start <= today);
  return started?.phase ?? "preparation";
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

export const NEXT_ACTIONS = [
  "language-exam", "documents", "drafts", "read-guide", "submit",
  "interview", "keep-practising", "check-results", "pre-departure",
] as const;
export type NextActionId = typeof NEXT_ACTIONS[number];

/** The milestone date each action works towards; never earlier than today. Null: no date. */
export function actionDueDate(action: NextActionId, timeline: readonly CycleMilestone[], today: string): string | null {
  const at = (phase: CyclePhaseId, edge: "start" | "end") => timeline.find((milestone) => milestone.phase === phase)?.[edge] ?? null;
  const dates: Record<NextActionId, string | null> = {
    "language-exam": at("call", "start"),
    documents: at("call", "start"),
    drafts: at("call", "start"),
    "read-guide": at("call", "end"),
    submit: at("application", "end"),
    interview: at("first-round", "start"),
    "keep-practising": null,
    "check-results": at("results", "start"),
    "pre-departure": at("pre-departure", "start"),
  };
  const date = dates[action];
  return date === null ? null : date < today ? today : date;
}

/**
 * What to do now. During preparation the advice depends on the time left before the
 * call: language certificates take longest, then official documents, then the drafts.
 */
export function nextAction(phase: CyclePhaseId, daysToCall: number): NextActionId {
  switch (phase) {
    case "preparation": return daysToCall > 180 ? "language-exam" : daysToCall > 75 ? "documents" : "drafts";
    case "call": return "read-guide";
    case "application": return "submit";
    case "first-round": return "interview";
    case "second-round": return "keep-practising";
    case "results": return "check-results";
    case "pre-departure": return "pre-departure";
  }
}

/** Days before the submission deadline to start each document (apostille and translation take weeks). */
export const DOCUMENT_LEAD_DAYS: Record<string, number> = {
  passport: 90,
  family: 60,
  graduation: 45,
  transcript: 45,
  recommendation: 42,
  "personal-statement": 35,
  "study-plan": 35,
  application: 21,
  "pledge-health": 14,
  awards: 30,
  language: 240,
};

/** Suggested start date for a document, never earlier than today. */
export function documentStartDate(documentId: string, submissionDeadline: string, today: string): string {
  const lead = DOCUMENT_LEAD_DAYS[documentId] ?? 30;
  const date = new Date(`${submissionDeadline}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - lead);
  const suggested = date.toISOString().slice(0, 10);
  return suggested < today ? today : suggested;
}
