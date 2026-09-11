import { describe, expect, it } from "vitest";
import {
  chooseInterviewQuestionIds,
  evaluateInterviewAnswer,
  summarizeInterviewSession,
} from "./interview-chatbot";

describe("interview chatbot", () => {
  it("keeps short generic answers as an honest starting point", () => {
    expect(evaluateInterviewAnswer("Me gusta Corea.", "es")).toMatchObject({ score: 25, wordCount: 3 });
  });

  it("recognises a structured answer without pretending to grade its meaning", () => {
    const result = evaluateInterviewAnswer(
      "Elegí esta carrera porque lideré un proyecto con 12 estudiantes. Aprendí a medir resultados y ese trabajo conecta mi plan de estudios con GKS y Corea.",
      "es",
    );
    expect(result.score).toBe(100);
    expect(Object.values(result.signals).every(Boolean)).toBe(true);
  });

  it("adapts the second question to prior learning evidence", () => {
    expect(chooseInterviewQuestionIds("writing")[1]).toBe("study-plan");
    expect(chooseInterviewQuestionIds("grammar")[1]).toBe("academic-weakness");
    expect(chooseInterviewQuestionIds("interview")[1]).toBe("pressure");
  });

  it("summarises several turns into one actionable priority", () => {
    const first = evaluateInterviewAnswer("Mi objetivo principal conecta mi carrera con GKS y Corea porque quiero estudiar allí.", "es");
    const second = evaluateInterviewAnswer("Organicé un proyecto con 8 personas y logré medir el resultado.", "es");
    expect(summarizeInterviewSession([first, second])).toMatchObject({ average: 50, answered: 2 });
  });
});
