import { useCallback, useMemo } from "react";
import { suggestBoardTasks, type BoardCandidate } from "@/domain/models/board-plan";
import { buildDailyPlan, planProgress } from "@/domain/models/daily-plan";
import { actionDueDate, documentStartDate } from "@/domain/models/gks-cycle";
import type { LearningJourneyState } from "@/domain/models/learning-journey";
import type { StageProgress, TestLanguage } from "@/domain/models/language-test";
import { buildSession } from "@/domain/models/review-deck";
import type { BoardTask } from "@/domain/models/task-board";
import { weeklySummary } from "@/domain/models/weekly-summary";
import { isLearningQa } from "@/application/qa/qa-learning-scope";
import { boardSuggestionStore } from "@/infrastructure/data/board-suggestion-store";
import { documents } from "@/infrastructure/data/gks-2026";
import { getLanguagePathSummary, getLanguageStageMetadata, isLanguageStageMetadataUnlocked } from "@/infrastructure/data/language-path-summary";
import { placementStore } from "@/infrastructure/data/placement-store";
import { reviewDeck } from "@/infrastructure/data/review-deck-cards";
import { useGksCycle } from "./useApplicantProfile";
import { gksProgressStore } from "./useGksProgress";
import { useLanguageTestProgress } from "./useLanguageTestProgress";
import { useLocalStore } from "./useLocalStore";
import { useLocalToday } from "./useLocalToday";
import { reviewStore, useReviewDeck } from "./useReviewDeck";

/** The first stage of the current path that is open and not passed yet. */
function nextStageId(language: TestLanguage, progress: Record<string, StageProgress>) {
  const { track } = getLanguagePathSummary(language, progress);
  return track.stages.find((stage) => progress[stage.id]?.passed !== true && isLanguageStageMetadataUnlocked(language, stage.id, progress))?.id;
}

export function stageLabelParts(language: TestLanguage, stageId: string) {
  const stage = getLanguageStageMetadata(language, stageId);
  return stage ? { order: stage.order, skill: stage.skill } : null;
}

/** Today's generated plan (see `buildDailyPlan`). `ticked` holds today's manual GKS tick. */
export function useDailyPlan(ticked: readonly string[]) {
  const today = useLocalToday();
  const { summary } = useReviewDeck(reviewDeck);
  const { progress, totals } = useLanguageTestProgress();
  // Read so that a new level-test result re-renders the plan with the stages it unlocked.
  const placed = useLocalStore(placementStore);
  const cycle = useGksCycle();
  return useMemo(() => {
    const nextStage = { en: nextStageId("en", progress.en), ko: nextStageId("ko", progress.ko) };
    const items = buildDailyPlan({
      today,
      review: { pending: summary.due + summary.fresh, reviewedToday: summary.reviewedToday },
      progress,
      nextStage,
      passed: totals,
      action: isLearningQa ? null : cycle.action,
      ticked,
    });
    return { items, nextStage, ...planProgress(items) };
    // `placed` changes which stages are open; it is read inside the unlock check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, summary, progress, totals, cycle.action, ticked, placed]);
}

/** One-tap suggestions for the board, and a way to set one aside. */
export function useBoardSuggestions(existing: readonly BoardTask[]) {
  const today = useLocalToday();
  const cycle = useGksCycle();
  const review = useLocalStore(reviewStore);
  const stored = useLocalStore(gksProgressStore);
  const dismissed = useLocalStore(boardSuggestionStore);
  const candidates = useMemo<BoardCandidate[]>(() => {
    const session = buildSession(reviewDeck, review, new Date(`${today}T12:00:00`));
    const korean = session.filter((card) => card.language === "ko").length;
    // Documents matter until submission, as in the document schedule.
    const scheduling = !isLearningQa && ["preparation", "call", "application"].includes(cycle.phase);
    return suggestBoardTasks({
      today,
      entryYear: cycle.entryYear,
      documents: scheduling
        ? documents.filter((document) => !stored.completedDocuments.includes(document.id))
          .map((document) => ({ id: document.id, start: documentStartDate(document.id, cycle.submissionDeadline, today) }))
        : [],
      review: { pending: session.length, language: korean * 2 >= session.length ? "ko" : "en" },
      action: isLearningQa ? null : cycle.action,
      actionDue: actionDueDate(cycle.action, cycle.timeline, today),
      existing,
      dismissed,
    });
  }, [today, cycle, review, stored.completedDocuments, dismissed, existing]);
  const dismiss = useCallback((id: string) => boardSuggestionStore.set((list) => [...list, id].slice(-200)), []);
  return { candidates, dismiss };
}

/** The last seven days against the previous seven (see `weeklySummary`). */
export function useWeeklySummary(journey: LearningJourneyState) {
  const today = useLocalToday();
  const review = useLocalStore(reviewStore);
  return useMemo(() => weeklySummary(journey, review.days, today), [journey, review.days, today]);
}
