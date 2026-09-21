import { describe, expect, it } from "vitest";
import { evaluateInterviewAnswer } from "@/domain/models/interview-chatbot";
import {
  INTERVIEW_SCORE_LOG_LIMIT,
  INTERVIEW_SCORE_LOG_STORAGE_KEY,
  readInterviewScoreLog,
  recordInterviewScoreLog,
} from "./interview-score-log";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
  };
}

function logInput(index: number) {
  const evaluation = evaluateInterviewAnswer(
    "Organicé un proyecto con 12 estudiantes y aprendí a conectar el resultado con GKS.",
    "es",
  );
  return {
    sessionId: "session-test",
    questionId: "why-korea",
    questionNumber: index + 1,
    stage: "motivation" as const,
    turn: "primary" as const,
    locale: "es" as const,
    personalityId: "analytical" as const,
    wordCount: evaluation.wordCount,
    score: evaluation.score,
    explanation: evaluation.scoreLog,
    recordedAt: new Date(2026, 8, 18, 10, 0, index).toISOString(),
  };
}

describe("interview score log", () => {
  it("stores an auditable per-question trace without candidate answers or feedback", () => {
    const storage = createMemoryStorage();
    const entry = recordInterviewScoreLog(logInput(0), storage);
    const raw = storage.getItem(INTERVIEW_SCORE_LOG_STORAGE_KEY) ?? "";

    expect(entry).not.toBeNull();
    expect(readInterviewScoreLog(storage)[0]).toMatchObject({
      questionId: "why-korea",
      stage: "motivation",
      turn: "primary",
      score: 100,
    });
    expect(raw).not.toContain("Organicé un proyecto");
    expect(raw).not.toContain("feedback");
  });

  it("keeps only the latest bounded set of diagnostic entries", () => {
    const storage = createMemoryStorage();
    for (let index = 0; index < INTERVIEW_SCORE_LOG_LIMIT + 5; index += 1) {
      recordInterviewScoreLog(logInput(index), storage);
    }

    const entries = readInterviewScoreLog(storage);
    expect(entries).toHaveLength(INTERVIEW_SCORE_LOG_LIMIT);
    expect(entries[0].questionNumber).toBe(INTERVIEW_SCORE_LOG_LIMIT + 5);
    expect(entries.at(-1)?.questionNumber).toBe(6);
  });

  it("keeps the main answer and follow-up as separate traces for the same question", () => {
    const storage = createMemoryStorage();
    const primary = logInput(0);
    recordInterviewScoreLog(primary, storage);
    recordInterviewScoreLog({ ...primary, turn: "follow-up" }, storage);

    const entries = readInterviewScoreLog(storage);
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.turn)).toEqual(["follow-up", "primary"]);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(2);
  });

  it("recovers safely from corrupted stored data", () => {
    const storage = createMemoryStorage();
    storage.setItem(INTERVIEW_SCORE_LOG_STORAGE_KEY, "not-json");
    expect(readInterviewScoreLog(storage)).toEqual([]);
  });
});
