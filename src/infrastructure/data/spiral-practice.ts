import type { TestLanguage, TestQuestion, TestStage } from "../../domain/models/language-test";

/** One retrieval question and one transfer goal, never a cumulative homework list. */
export function connectPracticeStages(language: TestLanguage, stages: TestStage[]): TestStage[] {
  return stages.map((stage, index) => {
    const previous = stages[index - 1];
    if (!previous || previous.skill !== stage.skill) return stage;
    const ko = language === "ko";
    const source = previous.questions[previous.skill === "writing" || previous.skill === "pronunciation" ? 1 : 0];
    const previousPoint = previous.skill === "listening" && previous.order <= 20
      ? previous.productionTask.checklist[1]
      : previous.focus;
    const application = transferGoal(language, stage, previous);
    const offset = stage.order % source.options.length;
    const recall: TestQuestion = {
      ...source,
      id: `${stage.id}-recall`,
      skill: ko ? "짧은 복습" : "Brief recall",
      prompt: ko ? `이전 학습을 떠올려 보세요. ${source.prompt}` : `Bring back the previous skill: ${source.prompt}`,
      transfer: application,
      options: [...source.options.slice(offset), ...source.options.slice(0, offset)],
      optionFeedback: [...source.optionFeedback.slice(offset), ...source.optionFeedback.slice(0, offset)],
      correctIndex: (source.correctIndex - offset + source.options.length) % source.options.length,
    };
    return {
      ...stage,
      learningBridge: {
        previousStageId: previous.id,
        previousTitle: previous.title,
        recall: previousPoint,
        application,
        example: source.example,
      },
      // Replace a generic strategy question, rather than lengthening the session.
      questions: [...stage.questions.slice(0, 3), recall],
      productionTask: {
        ...stage.productionTask,
        checklist: [stage.productionTask.checklist[0], stage.productionTask.checklist[1], application],
      },
    };
  });
}

function transferGoal(language: TestLanguage, stage: TestStage, previous: TestStage): string {
  const ko = language === "ko";
  switch (stage.skill) {
    case "reading": return ko
      ? `이전 읽기 관점(${previous.focus})을 이번 글의 근거 한 곳에 적용하세요. 맞지 않으면 차이를 한 문장으로 설명하세요.`
      : `Use the previous reading lens (${previous.focus}) on one clue in this text; if it does not fit, explain the difference in one sentence.`;
    case "grammar": return ko
      ? `이번 문장 중 하나에 이전 문법(${previous.focus})도 사용하세요. 문장이 길어질 필요는 없습니다.`
      : `Reuse the previous grammar (${previous.focus}) in one of your new sentences; it need not be longer.`;
    case "vocabulary": return ko
      ? `이전 어휘(${previous.focus})에서 표현 하나를 골라 이번 대화에 자연스럽게 연결하세요.`
      : `Choose one expression from the previous vocabulary (${previous.focus}) and connect it naturally to this exchange.`;
    case "writing": return ko
      ? `이전 글쓰기(${previous.focus})에서 배운 방법 하나를 이번 글에 적용하세요. 맞지 않는 내용은 억지로 넣지 마세요.`
      : `Apply one technique from the previous writing (${previous.focus}) here; transfer the technique, not an unrelated topic.`;
    case "listening": return ko
      ? `이전 듣기의 중심 내용과 세부 정보 구분을 다시 사용하세요. 이번 안내의 근거 한 곳을 찾아 중심 내용과 연결하세요.`
      : `Reuse the distinction between main idea and detail from the previous listening: connect one clue in this new message to its main point.`;
    case "pronunciation": return ko
      ? `이전 말하기(${previous.focus})에서 연습한 습관 하나를 이번 녹음에 적용하고 한 번만 확인하세요.`
      : `Carry one speaking habit from the previous practice (${previous.focus}) into this recording and check it once.`;
  }
}
