import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createLearningJourney,
  getLearningRecommendation,
  recordLearningEvent,
  type LearningEvent,
  type LearningJourneyState,
} from "@/domain/models/learning-journey";
import { LEARNING_JOURNEY_EVENT } from "./learningJourneyEvents";

const STORAGE_KEY = "learnv-learning-journey-v1";

function readJourney(): LearningJourneyState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...createLearningJourney(), ...(JSON.parse(stored) as LearningJourneyState) } : createLearningJourney();
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
  const activeMinutes = Math.round(journey.totalActiveSeconds / 60);
  const practicedSkills = Object.keys(journey.skillStats).length;
  return { journey, recommendation, activeMinutes, practicedSkills };
}

export type LearningJourneyController = ReturnType<typeof useLearningJourney>;
