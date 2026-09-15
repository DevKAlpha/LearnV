import { describe, expect, it } from "vitest";
import {
  chooseInterviewQuestionIds,
  chooseInterviewQuestionId,
  chooseInterviewPersonalityId,
  createAdaptiveInterviewFollowUp,
  createAdaptiveInterviewQuestion,
  createInterviewSessionAdvice,
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

  it("keeps the four learning stages while varying the route between sessions", () => {
    const firstRoute = chooseInterviewQuestionIds("writing", 2);
    const secondRoute = chooseInterviewQuestionIds("writing", 3);

    expect(firstRoute).toHaveLength(4);
    expect(secondRoute).toHaveLength(4);
    expect(secondRoute).not.toEqual(firstRoute);
    expect(chooseInterviewQuestionIds("writing", 2)).toEqual(firstRoute);
  });

  it("selects the next question from the weakness detected in prior feedback", () => {
    expect(chooseInterviewQuestionId("academic", { focus: "connection", seed: 0 })).toBe("why-major");
    expect(chooseInterviewQuestionId("adaptation", { focus: "evidence", seed: 0 })).toBe("conflict");
    expect(chooseInterviewQuestionId("contribution", { focus: "reflection", seed: 1 })).toBe("return-plan");
  });

  it("varies the way it teaches the same weak criterion without losing the question", () => {
    const question = "¿Qué harías después de graduarte?";
    const first = createAdaptiveInterviewQuestion(question, "es", "connection", 0);
    const second = createAdaptiveInterviewQuestion(question, "es", "connection", 1);

    expect(first).toContain(question);
    expect(second).toContain(question);
    expect(second).not.toBe(first);
  });

  it("rotates the GKS interviewer personality for every new session", () => {
    const first = chooseInterviewPersonalityId(0);
    const second = chooseInterviewPersonalityId(1, first);
    const repeatedSeed = chooseInterviewPersonalityId(0, first);

    expect(first).toBe("analytical");
    expect(second).toBe("direct");
    expect(repeatedSeed).not.toBe(first);
  });

  it("summarises several turns into one actionable priority", () => {
    const first = evaluateInterviewAnswer("Mi objetivo principal conecta mi carrera con GKS y Corea porque quiero estudiar allí.", "es");
    const second = evaluateInterviewAnswer("Organicé un proyecto con 8 personas y logré medir el resultado.", "es");
    expect(summarizeInterviewSession([first, second])).toMatchObject({ average: 50, answered: 2 });
  });

  it("reports signal coverage and progress between both halves of a session", () => {
    const first = evaluateInterviewAnswer("Me gusta Corea.", "es");
    const second = evaluateInterviewAnswer(
      "Elegí esta carrera porque lideré un proyecto con 12 estudiantes. Aprendí a medir resultados y conecté ese trabajo con mi plan para GKS en Corea.",
      "es",
    );
    const summary = summarizeInterviewSession([first, second]);

    expect(summary).toMatchObject({ average: 63, trend: "improving", trendDelta: 75, answered: 2 });
    expect(summary.coverage.connection).toEqual({ total: 2, percentage: 100 });
    expect(summary.coverage.evidence).toEqual({ total: 1, percentage: 50 });
  });

  it("turns the final diagnosis into a measurable next-session plan", () => {
    const answers = [
      evaluateInterviewAnswer("Me gusta Corea.", "es"),
      evaluateInterviewAnswer("Quiero aprender más.", "es"),
      evaluateInterviewAnswer("Mi carrera es importante para mí.", "es"),
      evaluateInterviewAnswer("Deseo obtener la beca GKS.", "es"),
    ];
    const summary = summarizeInterviewSession(answers);
    const advice = createInterviewSessionAdvice(summary, "es");

    expect(advice.actionPlan).toHaveLength(3);
    expect(advice.formula).toHaveLength(4);
    expect(advice.nextTarget).toContain("al menos");
    expect(advice.nextTarget).toContain(`de ${summary.answered} respuestas`);
  });
});
