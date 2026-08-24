import { useCallback, useEffect, useMemo, useState } from "react";
import {
  WRITTEN_FOCUS_MINUTES,
  emptyWrittenSimulator,
  isWrittenSimulatorStarted,
  scoreWrittenSimulator,
  type WrittenLanguage,
  type WrittenSimulatorState,
  type WrittenSimulatorStep,
} from "../../domain/models/written-simulator";
import {
  writtenSimulatorCorrectAnswers,
  writtenSimulatorRubricIds,
} from "../../infrastructure/data/written-simulator";
import {
  announceWrittenSimulatorState,
  WRITTEN_SIMULATOR_STORAGE_KEY,
} from "./writtenSimulatorStatus";

function readState(): WrittenSimulatorState {
  try {
    const stored = localStorage.getItem(WRITTEN_SIMULATOR_STORAGE_KEY);
    return stored ? { ...emptyWrittenSimulator, ...JSON.parse(stored) } : emptyWrittenSimulator;
  } catch {
    return emptyWrittenSimulator;
  }
}

export function useWrittenSimulator() {
  const [state, setState] = useState<WrittenSimulatorState>(readState);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem(WRITTEN_SIMULATOR_STORAGE_KEY, JSON.stringify(state));
    announceWrittenSimulatorState(isWrittenSimulatorStarted(state));
  }, [state]);

  useEffect(() => {
    if (!state.startedAt || state.completedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [state.completedAt, state.startedAt]);

  const setLanguage = useCallback((language: WrittenLanguage) => {
    setState((current) => ({ ...current, language }));
  }, []);

  const begin = useCallback(() => {
    setState((current) => ({
      ...current,
      step: "knowledge",
      startedAt: current.startedAt ?? new Date().toISOString(),
      completedAt: null,
    }));
  }, []);

  const goTo = useCallback((step: WrittenSimulatorStep) => {
    setState((current) => ({ ...current, step }));
  }, []);

  const answer = useCallback((questionId: string, option: number) => {
    setState((current) => ({
      ...current,
      answers: { ...current.answers, [questionId]: option },
    }));
  }, []);

  const updateDraft = useCallback((field: "personalStatement" | "studyPlan", value: string) => {
    setState((current) => ({ ...current, [field]: value }));
  }, []);

  const toggleRubric = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      rubric: current.rubric.includes(id)
        ? current.rubric.filter((item) => item !== id)
        : [...current.rubric, id],
    }));
  }, []);

  const score = useMemo(
    () => scoreWrittenSimulator(state, writtenSimulatorCorrectAnswers, writtenSimulatorRubricIds.length),
    [state],
  );

  const finish = useCallback(() => {
    setState((current) => {
      const nextScore = scoreWrittenSimulator(current, writtenSimulatorCorrectAnswers, writtenSimulatorRubricIds.length);
      return {
        ...current,
        step: "result",
        completedAt: new Date().toISOString(),
        attempts: current.attempts + 1,
        lastScore: nextScore.total,
      };
    });
    window.dispatchEvent(new CustomEvent("learnv:progress"));
  }, []);

  const reset = useCallback(() => {
    setState((current) => ({ ...emptyWrittenSimulator, language: current.language }));
    setNow(Date.now());
  }, []);

  const elapsedSeconds = state.startedAt
    ? Math.max(0, Math.floor((now - new Date(state.startedAt).getTime()) / 1000))
    : 0;
  const secondsLeft = Math.max(0, WRITTEN_FOCUS_MINUTES * 60 - elapsedSeconds);

  return {
    state,
    score,
    secondsLeft,
    setLanguage,
    begin,
    goTo,
    answer,
    updateDraft,
    toggleRubric,
    finish,
    reset,
  };
}
