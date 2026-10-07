export const documentStages = [
  { id: "drafts", documentIds: ["application", "personal-statement", "study-plan"] },
  { id: "academic", documentIds: ["graduation", "transcript"] },
  { id: "official", documentIds: ["family"] },
  { id: "optional", documentIds: ["language"] },
] as const;

export type DocumentStageId = typeof documentStages[number]["id"];

export function getDocumentPlan(completedIds: readonly string[]) {
  const completed = new Set(completedIds);
  const stages = documentStages.map((stage) => ({
    ...stage,
    completed: stage.documentIds.filter((id) => completed.has(id)).length,
    total: stage.documentIds.length,
  }));
  return {
    stages,
    completed: stages.reduce((total, stage) => total + stage.completed, 0),
    total: stages.reduce((total, stage) => total + stage.total, 0),
    currentStage: stages.find((stage) => stage.completed < stage.total)?.id ?? null,
  };
}
