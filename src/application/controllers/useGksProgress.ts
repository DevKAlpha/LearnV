import { useEffect, useMemo, useState } from "react";
import { dailyTasks, documents } from "../../infrastructure/data/gks-2026";
import { trackLearning } from "./learningJourneyEvents";

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
    setProgress((current) => {
      const completing = !current.completedTasks.includes(id);
      if (completing) {
        const task = dailyTasks.find((item) => item.id === id);
        trackLearning({
          kind: "task",
          itemId: id,
          language: task?.category === "topik" ? "ko" : task?.category === "english" ? "en" : "general",
          skill: task?.category === "application" ? "application" : task?.category === "english" ? "writing" : "reading",
          passed: true,
        });
      }
      return {
        ...current,
        completedTasks: completing
          ? [...current.completedTasks, id]
          : current.completedTasks.filter((taskId) => taskId !== id),
      };
    });
  };

  const toggleDocument = (id: string) => {
    setProgress((current) => {
      const completing = !current.completedDocuments.includes(id);
      if (completing) trackLearning({ kind: "document", itemId: id, language: "general", skill: "documents", passed: true });
      return {
        ...current,
        completedDocuments: completing
          ? [...current.completedDocuments, id]
          : current.completedDocuments.filter((documentId) => documentId !== id),
      };
    });
  };

  const score = useMemo(() => {
    const taskPart = progress.completedTasks.length / dailyTasks.length;
    const documentPart = progress.completedDocuments.length / documents.length;
    return Math.round((taskPart * 0.55 + documentPart * 0.45) * 100);
  }, [progress]);

  return { progress, score, toggleTask, toggleDocument };
}
