import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createLearningJourney,
  getLearningRecommendation,
  recordLearningEvent,
  type LearningEvent,
  type LearningJourneyState,
} from "@/domain/models/learning-journey";
import { analyzeLearningResults } from "@/domain/models/learning-analysis";
import type { TestProgressState } from "@/domain/models/language-test";
import { LEARNING_JOURNEY_EVENT } from "./learningJourneyEvents";

const STORAGE_KEY = "learnv-learning-journey-v1";

function skillFromStageId(stageId: string) {
  return (["writing", "listening", "pronunciation"] as const)
    .find((skill) => stageId.includes(`-${skill}-`));
}

function migrateLanguageResults(state: LearningJourneyState) {
  if (state.version >= 2) return state;
  let migrated: LearningJourneyState = { ...state, version: 2 };
  try {
    const stored = localStorage.getItem("learnv-language-tests-v1");
    if (!stored) return migrated;
    const progress = JSON.parse(stored) as TestProgressState;
    const trackedItems = new Set(state.recentActivities
      .filter((event) => event.kind === "practice")
      .map((event) => event.itemId));

    for (const language of ["en", "ko"] as const) {
      for (const [stageId, result] of Object.entries(progress[language] ?? {})) {
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
  } catch {
    return migrated;
  }
  return migrated;
}

function readJourney(): LearningJourneyState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed: LearningJourneyState = stored
      ? { ...createLearningJourney(), ...(JSON.parse(stored) as LearningJourneyState) }
      : { ...createLearningJourney(), version: 1 };
    return migrateLanguageResults(parsed);
  } catch {
    return createLearningJourney();
  }
}

export function useLearningJourney(pathname: string) {
  const [journey, setJourney] = useState<LearningJourneyState>(readJourney);
  const activeStartedAt = useRef(Date.now());

  const record = useCallback((event: LearningEvent) => {
    setJourney((current) => {
      const next = recordLearningEvent(current, event);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
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
    const onLearningEvent = (event: Event) => record((event as CustomEvent<LearningEvent>).detail);
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
  const activeMinutes = Math.round(journey.totalActiveSeconds / 60);
  const practicedSkills = Object.keys(journey.skillStats).length;
  return { journey, recommendation, analysis, activeMinutes, practicedSkills };
}

export type LearningJourneyController = ReturnType<typeof useLearningJourney>;
