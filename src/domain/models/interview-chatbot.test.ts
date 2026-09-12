import { describe, expect, it } from "vitest";
import {
  chooseInterviewQuestionIds,
  createAdaptiveInterviewFollowUp,
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
    expect(result.feedback.evidence).toContain("«12»");
    expect(result.feedback.connection).toContain("GKS");
  });

  it("turns the candidate's own wording into precise improvement suggestions", () => {
    const answer = "Me gusta Corea y quiero estudiar allí.";
    const result = evaluateInterviewAnswer(answer, "es");

    expect(result.feedback.evidence).toContain("«Me gusta Corea y quiero estudiar allí»");
    expect(result.feedback.evidence).toContain("qué hiciste");
    expect(result.feedback.reflection).toContain("qué aprendiste");
  });

  it.each([
    ["I like Korea and want to study there.", "en", "I like Korea and want to study there"],
    ["한국에서 공부하고 싶습니다.", "ko", "한국에서 공부하고 싶습니다"],
  ] as const)("keeps contextual feedback in the selected interview language", (answer, locale, excerpt) => {
    const result = evaluateInterviewAnswer(answer, locale);
    expect(result.feedback.evidence).toContain(excerpt);
  });

  it("adapts a follow-up to the first missing signal in the submitted answer", () => {
    const answer = "Quiero estudiar en Corea con la beca GKS.";
    const evaluation = evaluateInterviewAnswer(answer, "es");
    const followUp = createAdaptiveInterviewFollowUp(
      answer,
      "es",
      evaluation,
      "¿Qué experiencia concreta confirmó esa decisión?",
    );

    expect(followUp).toContain("Quiero estudiar en Corea");
    expect(followUp).toContain("respuesta central más clara");
    expect(followUp).toContain("¿Qué experiencia concreta confirmó esa decisión?");
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
