import { useEffect, useMemo, useState } from "react";
import { dailyTasks, documents } from "../../infrastructure/data/gks-2026";

const STORAGE_KEY = "learnv-progress-v1";
const LEGACY_STORAGE_KEY = "gks-path-progress-v1";

type ProgressState = {
  completedTasks: string[];
  completedDocuments: string[];
};

const initialState: ProgressState = {
  completedTasks: [],
  completedDocuments: [],
};

function readProgress(): ProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ProgressState) : initialState;
  } catch {
    return initialState;
  }
}

export function useGksProgress() {
  const [progress, setProgress] = useState<ProgressState>(readProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const toggleTask = (id: string) => {
    setProgress((current) => ({
      ...current,
      completedTasks: current.completedTasks.includes(id)
        ? current.completedTasks.filter((taskId) => taskId !== id)
        : [...current.completedTasks, id],
    }));
  };

  const toggleDocument = (id: string) => {
    setProgress((current) => ({
      ...current,
      completedDocuments: current.completedDocuments.includes(id)
        ? current.completedDocuments.filter((documentId) => documentId !== id)
        : [...current.completedDocuments, id],
    }));
  };

  const score = useMemo(() => {
    const taskPart = progress.completedTasks.length / dailyTasks.length;
    const documentPart = progress.completedDocuments.length / documents.length;
    return Math.round((taskPart * 0.55 + documentPart * 0.45) * 100);
  }, [progress]);

  return { progress, score, toggleTask, toggleDocument };
}
