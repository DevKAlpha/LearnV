import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createLearningJourney,
  getLearningRecommendation,
  normalizeLearningEvent,
  normalizeLearningJourney,
  recordLearningEvent,
  sortRecentActivities,
  type LearningEvent,
  type LearningJourneyState,
} from "@/domain/models/learning-journey";
import { analyzeLearningResults } from "@/domain/models/learning-analysis";
import { createInterviewAdaptation } from "@/domain/models/interview-adaptation";
import { normalizeTestProgress } from "@/domain/models/language-path";
import { recordLearningError, resolveLearningDiagnosticArea } from "@/infrastructure/data/learning-error-log";
import { LEARNING_JOURNEY_EVENT } from "./learningJourneyEvents";

const STORAGE_KEY = scopedStorageKey("learnv-learning-journey-v1");
const SKILLS = ["reading", "grammar", "vocabulary", "writing", "listening", "pronunciation"] as const;

function currentDiagnosticArea() {
  return resolveLearningDiagnosticArea(window.location.pathname) ?? "study-overview";
}

function skillFromStageId(stageId: string) {
  return SKILLS.find((skill) => stageId.includes(`-${skill}-`));
}

function migrateLanguageResults(state: LearningJourneyState) {
  if (state.version >= 2) return state;
  let migrated: LearningJourneyState = { ...state, version: 2 };
  try {
    const stored = localStorage.getItem(scopedStorageKey("learnv-language-tests-v1"));
    if (!stored) return migrated;
    const progress = normalizeTestProgress(JSON.parse(stored));
    const trackedItems = new Set(state.recentActivities
      .filter((event) => event.kind === "practice")
      .map((event) => event.itemId));

    for (const language of ["en", "ko"] as const) {
      for (const [stageId, result] of Object.entries(progress[language])) {
        if (trackedItems.has(stageId)) continue;
        const skill = skillFromStageId(stageId);
        if (!skill) continue;
        migrated = recordLearningEvent(migrated, {
          kind: "practice",
          itemId: stageId,
          language,
          skill,
          score: result.lastScore,
          passed: result.passed,
          occurredAt: result.lastCompletedAt,
          attemptCount: result.attempts,
        });
      }
    }
  } catch (error) {
    recordLearningError({ area: currentDiagnosticArea(), code: "learning-journey-migration-failed", error });
  }
  // Migrated results carry their original dates; keep the window newest-first.
  return sortRecentActivities(migrated);
}

function readJourney(): LearningJourneyState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? normalizeLearningJourney(JSON.parse(stored)) : { ...createLearningJourney(), version: 1 as const };
    return migrateLanguageResults(parsed);
  } catch (error) {
    recordLearningError({ area: currentDiagnosticArea(), code: "learning-journey-read-failed", error });
    return createLearningJourney();
  }
}

export function useLearningJourney(pathname: string) {
  const [journey, setJourney] = useState<LearningJourneyState>(readJourney);
  const activeStartedAt = useRef(Date.now());
  const lastEventKind = useRef<LearningEvent["kind"] | null>(null);

  // Persist outside the state updater: updaters must stay pure (StrictMode runs them twice).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
    } catch (error) {
      recordLearningError({
        area: currentDiagnosticArea(),
        code: "learning-journey-write-failed",
        error,
        context: { eventKind: lastEventKind.current },
      });
    }
  }, [journey]);

  const record = useCallback((event: LearningEvent) => {
    lastEventKind.current = event.kind;
    setJourney((current) => recordLearningEvent(current, event));
  }, []);

  useEffect(() => record({ kind: "route", route: pathname }), [pathname, record]);

  useEffect(() => {
    record({ kind: "session" });
    const saveActiveTime = () => {
      const seconds = Math.round((Date.now() - activeStartedAt.current) / 1000);
      if (seconds >= 5) record({ kind: "session", activeSeconds: Math.min(seconds, 1800) });
      activeStartedAt.current = Date.now();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") saveActiveTime();
      else activeStartedAt.current = Date.now();
    };
    const onLearningEvent = (event: Event) => {
      const detail = normalizeLearningEvent((event as CustomEvent<unknown>).detail);
      if (detail) record(detail);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", saveActiveTime);
    window.addEventListener(LEARNING_JOURNEY_EVENT, onLearningEvent);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", saveActiveTime);
      window.removeEventListener(LEARNING_JOURNEY_EVENT, onLearningEvent);
    };
  }, [record]);

  const recommendation = useMemo(() => getLearningRecommendation(journey), [journey]);
  const analysis = useMemo(() => analyzeLearningResults(journey), [journey]);
  const interviewAdaptation = useMemo(() => createInterviewAdaptation(journey), [journey]);
  const activeMinutes = Math.round(journey.totalActiveSeconds / 60);
  const practicedSkills = Object.keys(journey.skillStats).length;
  return useMemo(
    () => ({ journey, recommendation, analysis, interviewAdaptation, activeMinutes, practicedSkills }),
    [journey, recommendation, analysis, interviewAdaptation, activeMinutes, practicedSkills],
  );
}

export type LearningJourneyController = ReturnType<typeof useLearningJourney>;
