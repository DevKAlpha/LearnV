import type { Locale } from "./i18n";
import type { LearningSkill } from "./learning-journey";

export type InterviewSignal = "direct" | "evidence" | "connection" | "reflection";

export type InterviewAnswerEvaluation = {
  score: number;
  wordCount: number;
  signals: Record<InterviewSignal, boolean>;
  feedback: Record<InterviewSignal, string>;
};

export type InterviewSessionSummary = {
  average: number;
  strongest: InterviewSignal;
  priority: InterviewSignal;
  secondaryPriority: InterviewSignal;
  answered: number;
  coverage: Record<InterviewSignal, { total: number; percentage: number }>;
  trend: "improving" | "stable" | "declining";
  trendDelta: number;
};

export type InterviewSessionAdvice = {
  assessment: string;
  strength: string;
  priority: string;
  trend: string;
  actionPlan: string[];
  formula: string[];
  nextTarget: string;
};

const ACTION_PATTERN = /\b(logr(?:e|é|amos|aron)|organic(?:e|é|amos)|cre(?:e|é|amos)|lider(?:e|é|amos)|investigu(?:e|é|amos)|mejor(?:e|é|amos)|alcanz(?:o|ó|amos)|learned|built|led|researched|improved|achieved|measured|organized|created)\b/i;
const CONNECTION_PATTERN = /\b(gks|beca|scholarship|corea|korea|universidad|carrera|estudios?|major|degree|university|study plan)\b/i;
const REFLECTION_PATTERN = /\b(porque|por eso|aprend(?:i|í)|cambi(?:e|é|ó)|me permiti(?:o|ó)|a partir de|because|therefore|learned|changed|allowed me|as a result)\b/i;
const KOREAN_ACTION_PATTERN = /(배웠|만들|이끌|조사|개선|달성|측정|준비)/;
const KOREAN_CONNECTION_PATTERN = /(한국|전공|학업|대학|계획|장학금)/;
const KOREAN_REFLECTION_PATTERN = /(왜냐하면|그래서|배웠|변화|결과|통해)/;

function countWords(answer: string, locale: Locale) {
  const compact = answer.trim().replace(/\s+/g, " ");
  if (!compact) return 0;
  if (locale === "ko") return Math.max(compact.split(" ").length, Math.round(compact.replace(/\s/g, "").length / 3));
  return compact.split(" ").length;
}

function compactExcerpt(answer: string, maxLength = 58) {
  const firstIdea = answer.trim().replace(/\s+/g, " ").split(/[.!?。！？]/)[0]?.trim() ?? "";
  if (firstIdea.length <= maxLength) return firstIdea;
  return `${firstIdea.slice(0, maxLength - 1).trimEnd()}…`;
}

function matchedText(answer: string, patterns: RegExp[]) {
  return patterns.map((pattern) => answer.match(pattern)?.[0]).find(Boolean) ?? "";
}

function quote(value: string, locale: Locale) {
  return locale === "en" ? `“${value}”` : locale === "ko" ? `‘${value}’` : `«${value}»`;
}

function createContextualFeedback(
  answer: string,
  locale: Locale,
  wordCount: number,
  signals: Record<InterviewSignal, boolean>,
): Record<InterviewSignal, string> {
  const excerpt = compactExcerpt(answer);
  const quotedExcerpt = quote(excerpt, locale);
  const action = matchedText(answer, [ACTION_PATTERN, KOREAN_ACTION_PATTERN]);
  const number = answer.match(/\b\d+(?:[.,]\d+)?%?\b/)?.[0] ?? "";
  const connection = matchedText(answer, [
    /\bgks\b/i,
    /\b(?:beca|scholarship|장학금)\b/i,
    /\b(?:corea|korea|한국)\b/i,
    /\b(?:universidad|university|대학)\b/i,
    /\b(?:carrera|major|degree|전공|학업)\b/i,
    CONNECTION_PATTERN,
    KOREAN_CONNECTION_PATTERN,
  ]);
  const reflection = matchedText(answer, [REFLECTION_PATTERN, KOREAN_REFLECTION_PATTERN]);

  if (locale === "en") {
    return {
      direct: signals.direct
        ? `Your ${wordCount}-word answer develops a complete idea; keep its main claim visible from the first sentence.`
        : `Your answer has ${wordCount} words and begins with ${quotedExcerpt}. State your main answer first, then develop it in two short sentences.`,
      evidence: signals.evidence
        ? number
          ? `The detail ${quote(number, locale)} makes your example measurable. Clarify what changed because of that result.`
          : `The action ${quote(action || excerpt, locale)} gives the panel something concrete. Add the result it produced.`
        : `Turn ${quotedExcerpt} into evidence: name what you did, in what situation, and one observable result.`,
      connection: signals.connection
        ? `The reference to ${quote(connection || excerpt, locale)} links the answer to your application. Explain why that link matters to your study plan.`
        : `After ${quotedExcerpt}, add one sentence explaining how that experience prepares you for GKS, Korea, or your intended major.`,
      reflection: signals.reflection
        ? `${quote(reflection || excerpt, locale)} introduces reflection. Complete it with what you would repeat or change now.`
        : `Close the idea in ${quotedExcerpt} with what you learned and how it changed your next decision.`,
    };
  }

  if (locale === "ko") {
    return {
      direct: signals.direct
        ? `${wordCount}단어로 하나의 완전한 생각을 전개했습니다. 첫 문장부터 핵심 답변이 보이게 유지하세요.`
        : `답변은 ${wordCount}단어이며 ${quotedExcerpt}(으)로 시작합니다. 먼저 핵심 답을 말하고 두 문장으로 구체화하세요.`,
      evidence: signals.evidence
        ? number
          ? `${quote(number, locale)}이라는 정보가 답변을 측정 가능하게 합니다. 그 결과 무엇이 달라졌는지 설명하세요.`
          : `${quote(action || excerpt, locale)}이라는 행동이 구체적입니다. 그 행동으로 얻은 결과를 추가하세요.`
        : `${quotedExcerpt}을(를) 근거로 바꾸세요. 상황, 직접 한 행동과 확인 가능한 결과를 하나씩 말하세요.`,
      connection: signals.connection
        ? `${quote(connection || excerpt, locale)} 언급이 지원 동기와 연결됩니다. 이 연결이 학업 계획에 왜 중요한지 설명하세요.`
        : `${quotedExcerpt} 다음에 이 경험이 GKS, 한국 또는 지원 전공을 어떻게 준비하게 했는지 한 문장으로 연결하세요.`,
      reflection: signals.reflection
        ? `${quote(reflection || excerpt, locale)}에서 성찰이 드러납니다. 지금 다시 한다면 유지하거나 바꿀 점을 덧붙이세요.`
        : `${quotedExcerpt}에서 배운 점과 그 배움이 다음 선택을 어떻게 바꿨는지로 답변을 마무리하세요.`,
    };
  }

  return {
    direct: signals.direct
      ? `Tu respuesta desarrolla una idea completa en ${wordCount} palabras; conserva la respuesta principal visible desde la primera frase.`
      : `Tu respuesta tiene ${wordCount} palabras y comienza con ${quotedExcerpt}. Expón primero tu respuesta central y desarróllala en dos frases breves.`,
    evidence: signals.evidence
      ? number
        ? `El dato ${quote(number, locale)} vuelve medible tu ejemplo. Aclara qué cambió gracias a ese resultado.`
        : `La acción ${quote(action || excerpt, locale)} aporta concreción. Añade el resultado que produjo.`
      : `Convierte ${quotedExcerpt} en evidencia: indica qué hiciste, en qué situación y un resultado observable.`,
    connection: signals.connection
      ? `La referencia a ${quote(connection || excerpt, locale)} conecta la respuesta con tu candidatura. Explica por qué ese vínculo importa para tu plan de estudios.`
      : `Después de ${quotedExcerpt}, añade una frase que explique cómo esa experiencia te prepara para GKS, Corea o tu carrera elegida.`,
    reflection: signals.reflection
      ? `${quote(reflection || excerpt, locale)} introduce una reflexión. Complétala con lo que repetirías o cambiarías hoy.`
      : `Cierra la idea de ${quotedExcerpt} explicando qué aprendiste y cómo cambió tu siguiente decisión.`,
  };
}

/** A transparent structural rubric; it does not claim to understand or judge the candidate. */
export function evaluateInterviewAnswer(answer: string, locale: Locale): InterviewAnswerEvaluation {
  const normalized = answer.trim();
  const wordCount = countWords(normalized, locale);
  const signals = {
    direct: wordCount >= 12,
    evidence: /\d/.test(normalized) || ACTION_PATTERN.test(normalized) || KOREAN_ACTION_PATTERN.test(normalized),
    connection: CONNECTION_PATTERN.test(normalized) || KOREAN_CONNECTION_PATTERN.test(normalized),
    reflection: REFLECTION_PATTERN.test(normalized) || KOREAN_REFLECTION_PATTERN.test(normalized),
  };
  const score = (Object.values(signals).filter(Boolean).length * 25);
  const feedback = createContextualFeedback(normalized, locale, wordCount, signals);
  return { score, wordCount, signals, feedback };
}

export function createAdaptiveInterviewFollowUp(
  answer: string,
  locale: Locale,
  evaluation: InterviewAnswerEvaluation,
  defaultQuestion: string,
) {
  const excerpt = quote(compactExcerpt(answer, 42), locale);
  const missingSignal = (["direct", "evidence", "connection", "reflection"] as InterviewSignal[])
    .find((signal) => !evaluation.signals[signal]);

  if (locale === "en") {
    const bridge = missingSignal === "direct"
      ? `Your idea ${excerpt} needs a clearer main claim.`
      : missingSignal === "evidence"
        ? `You mentioned ${excerpt}, but the panel still needs one observable action or result.`
        : missingSignal === "connection"
          ? `${excerpt} is not yet connected to your GKS application or study plan.`
          : missingSignal === "reflection"
            ? `Your example ${excerpt} still needs the lesson that changed your next decision.`
            : `Your answer combines a claim, evidence, connection and reflection.`;
    return `${bridge} ${defaultQuestion}`;
  }

  if (locale === "ko") {
    const bridge = missingSignal === "direct"
      ? `${excerpt}이라는 생각에 더 분명한 핵심 답변이 필요합니다.`
      : missingSignal === "evidence"
        ? `${excerpt}을(를) 언급했지만, 면접관에게는 확인 가능한 행동이나 결과가 하나 더 필요합니다.`
        : missingSignal === "connection"
          ? `${excerpt}이(가) 아직 GKS 지원이나 학업 계획과 연결되지 않았습니다.`
          : missingSignal === "reflection"
            ? `${excerpt}이라는 예시에 다음 선택을 바꾼 배움이 아직 필요합니다.`
            : `답변에 핵심 주장, 근거, 연결과 성찰이 모두 포함되었습니다.`;
    return `${bridge} ${defaultQuestion}`;
  }

  const bridge = missingSignal === "direct"
    ? `La idea ${excerpt} necesita una respuesta central más clara.`
    : missingSignal === "evidence"
      ? `Mencionaste ${excerpt}, pero al panel todavía le falta una acción o un resultado observable.`
      : missingSignal === "connection"
        ? `${excerpt} aún no está conectado con tu candidatura GKS o tu plan académico.`
        : missingSignal === "reflection"
          ? `El ejemplo ${excerpt} todavía necesita el aprendizaje que cambió tu siguiente decisión.`
          : `Tu respuesta combina idea principal, evidencia, conexión y reflexión.`;
  return `${bridge} ${defaultQuestion}`;
}

export function chooseInterviewQuestionIds(priority?: LearningSkill | null) {
  const adaptive = priority === "application" || priority === "writing"
    ? "study-plan"
    : priority === "interview" || priority === "pronunciation"
      ? "pressure"
      : priority === "grammar" || priority === "vocabulary" || priority === "listening" || priority === "reading"
        ? "academic-weakness"
        : "why-korea";

  return ["introduce-yourself", adaptive, "culture-shock", "spain-korea"];
}

export function summarizeInterviewSession(evaluations: InterviewAnswerEvaluation[]): InterviewSessionSummary {
  const signals: InterviewSignal[] = ["direct", "evidence", "connection", "reflection"];
  const answered = evaluations.length;
  const average = evaluations.length
    ? Math.round(evaluations.reduce((total, item) => total + item.score, 0) / evaluations.length)
    : 0;
  const totals = signals.map((signal) => ({
    signal,
    total: evaluations.filter((item) => item.signals[signal]).length,
  }));
  const strongest = [...totals].sort((a, b) => b.total - a.total)[0]?.signal ?? "direct";
  const orderedPriorities = [...totals].sort((a, b) => a.total - b.total);
  const priority = orderedPriorities[0]?.signal ?? "evidence";
  const secondaryPriority = orderedPriorities.find((item) => item.signal !== priority)?.signal ?? "reflection";
  const coverage = Object.fromEntries(totals.map(({ signal, total }) => [
    signal,
    { total, percentage: answered ? Math.round((total / answered) * 100) : 0 },
  ])) as InterviewSessionSummary["coverage"];
  const splitAt = Math.max(1, Math.floor(answered / 2));
  const averageOf = (items: InterviewAnswerEvaluation[]) => items.length
    ? items.reduce((total, item) => total + item.score, 0) / items.length
    : 0;
  const trendDelta = answered > 1
    ? Math.round(averageOf(evaluations.slice(splitAt)) - averageOf(evaluations.slice(0, splitAt)))
    : 0;
  const trend = trendDelta >= 10 ? "improving" : trendDelta <= -10 ? "declining" : "stable";
  return { average, strongest, priority, secondaryPriority, answered, coverage, trend, trendDelta };
}

const SESSION_SIGNAL_NAMES: Record<Locale, Record<InterviewSignal, string>> = {
  es: { direct: "respuesta directa", evidence: "evidencia concreta", connection: "conexión con GKS", reflection: "reflexión personal" },
  en: { direct: "direct answer", evidence: "concrete evidence", connection: "GKS connection", reflection: "personal reflection" },
  ko: { direct: "직접적인 답변", evidence: "구체적인 근거", connection: "GKS 연결", reflection: "개인적 성찰" },
};

const SESSION_ACTIONS: Record<Locale, Record<InterviewSignal, string>> = {
  es: {
    direct: "Ensaya una primera frase de máximo 15 palabras que responda exactamente a la pregunta, sin iniciar con contexto.",
    evidence: "Prepara un banco de cinco experiencias y resume cada una como situación, acción propia y resultado observable.",
    connection: "Después de cada ejemplo, añade una frase que explique qué demuestra para tu carrera, Corea o el propósito de GKS.",
    reflection: "Cierra cada experiencia con una decisión: qué aprendiste, qué cambiaste y qué harías de nuevo.",
  },
  en: {
    direct: "Practise a first sentence of no more than 15 words that answers the question exactly, before adding context.",
    evidence: "Build a bank of five experiences and reduce each one to situation, personal action and observable result.",
    connection: "After every example, add one sentence explaining what it proves for your major, Korea or the purpose of GKS.",
    reflection: "Close every experience with a decision: what you learned, what you changed and what you would do again.",
  },
  ko: {
    direct: "배경 설명 전에 질문에 정확히 답하는 15단어 이내의 첫 문장을 연습하세요.",
    evidence: "다섯 가지 경험을 준비하고 각각을 상황, 직접 한 행동과 확인 가능한 결과로 요약하세요.",
    connection: "각 예시 뒤에 그 경험이 전공, 한국 또는 GKS의 목적에 무엇을 보여 주는지 한 문장으로 연결하세요.",
    reflection: "각 경험을 배운 점, 바꾼 점과 다시 할 행동이라는 하나의 결정으로 마무리하세요.",
  },
};

export function createInterviewSessionAdvice(summary: InterviewSessionSummary, locale: Locale): InterviewSessionAdvice {
  const names = SESSION_SIGNAL_NAMES[locale];
  const actions = SESSION_ACTIONS[locale];
  const strongestCoverage = summary.coverage[summary.strongest];
  const priorityCoverage = summary.coverage[summary.priority];
  const targetTotal = summary.answered
    ? Math.min(summary.answered, Math.max(priorityCoverage.total + 2, Math.ceil(summary.answered * 0.75)))
    : 0;

  if (locale === "en") {
    const assessment = summary.average >= 85
      ? "Your structure is consistent. The next gain will come from precision and natural delivery, not from adding more content."
      : summary.average >= 60
        ? "Your answers have a useful base, but the panel would not yet hear the same level of clarity in every response."
        : "Your ideas are present, but they still depend on general statements. Build the structure before trying to sound more elaborate.";
    const trend = summary.trend === "improving"
      ? `The second half improved by ${summary.trendDelta} points: you applied feedback while the interview progressed.`
      : summary.trend === "declining"
        ? `The second half fell by ${Math.abs(summary.trendDelta)} points. Shorten your answers and protect the structure when fatigue appears.`
        : `Your two halves stayed within ${Math.abs(summary.trendDelta)} points. The structure is stable; now raise the weakest criterion deliberately.`;
    return {
      assessment,
      strength: `${names[summary.strongest]} appeared in ${strongestCoverage.total} of ${summary.answered} answers. Keep it while improving the other criteria.`,
      priority: `${names[summary.priority]} appeared in only ${priorityCoverage.total} of ${summary.answered} answers and should lead your next practice.`,
      trend,
      actionPlan: [actions[summary.priority], actions[summary.secondaryPriority], "Record one 75-second answer, listen once for structure and repeat it without memorising wording."],
      formula: ["Answer the question in one sentence", "Give situation, personal action and result", "Connect the evidence to GKS or your study plan", "Close with learning and the next decision"],
      nextTarget: `In your next session, include ${names[summary.priority]} in at least ${targetTotal} of ${summary.answered} answers.`,
    };
  }

  if (locale === "ko") {
    const assessment = summary.average >= 85
      ? "답변 구조가 일관적입니다. 이제 내용을 더 늘리기보다 정확성과 자연스러운 전달을 높이세요."
      : summary.average >= 60
        ? "답변에 유용한 기반이 있지만 모든 답변에서 같은 수준의 명확성이 아직 들리지 않습니다."
        : "핵심 생각은 있지만 일반적인 주장에 의존하고 있습니다. 더 복잡하게 말하기 전에 구조를 먼저 만드세요.";
    const trend = summary.trend === "improving"
      ? `후반부가 ${summary.trendDelta}점 향상되었습니다. 면접이 진행되는 동안 피드백을 적용했습니다.`
      : summary.trend === "declining"
        ? `후반부가 ${Math.abs(summary.trendDelta)}점 낮아졌습니다. 피로할 때 답변을 줄이고 구조를 유지하세요.`
        : `전반부와 후반부 차이가 ${Math.abs(summary.trendDelta)}점 이내입니다. 구조는 안정적이므로 가장 약한 기준을 의도적으로 높이세요.`;
    return {
      assessment,
      strength: `${names[summary.strongest]}이(가) ${summary.answered}개 답변 중 ${strongestCoverage.total}개에 나타났습니다. 다른 기준을 보완할 때도 이 강점을 유지하세요.`,
      priority: `${names[summary.priority]}이(가) ${summary.answered}개 답변 중 ${priorityCoverage.total}개에만 나타나 다음 연습의 최우선 과제입니다.`,
      trend,
      actionPlan: [actions[summary.priority], actions[summary.secondaryPriority], "75초 답변 하나를 녹음하고 구조만 한 번 확인한 뒤 문장을 외우지 않고 다시 말하세요."],
      formula: ["한 문장으로 질문에 답하기", "상황, 직접 한 행동과 결과 제시하기", "근거를 GKS 또는 학업 계획과 연결하기", "배운 점과 다음 결정으로 마무리하기"],
      nextTarget: `다음 연습에서는 ${summary.answered}개 답변 중 최소 ${targetTotal}개에 ${names[summary.priority]}을(를) 포함하세요.`,
    };
  }

  const assessment = summary.average >= 85
    ? "Tu estructura es consistente. La siguiente mejora vendrá de la precisión y la naturalidad, no de añadir más contenido."
    : summary.average >= 60
      ? "Tus respuestas tienen una base útil, pero el panel todavía no escucharía el mismo nivel de claridad en todas."
      : "Tus ideas están presentes, pero aún dependen de afirmaciones generales. Construye primero la estructura antes de intentar sonar más elaborada.";
  const trend = summary.trend === "improving"
    ? `La segunda mitad mejoró ${summary.trendDelta} puntos: aplicaste la retroalimentación mientras avanzaba la entrevista.`
    : summary.trend === "declining"
      ? `La segunda mitad bajó ${Math.abs(summary.trendDelta)} puntos. Acorta tus respuestas y protege la estructura cuando aparezca el cansancio.`
      : `Las dos mitades se mantuvieron a ${Math.abs(summary.trendDelta)} puntos de distancia. La estructura es estable; ahora eleva deliberadamente el criterio más débil.`;
  return {
    assessment,
    strength: `${names[summary.strongest]} apareció en ${strongestCoverage.total} de ${summary.answered} respuestas. Consérvala mientras mejoras los demás criterios.`,
    priority: `${names[summary.priority]} apareció solo en ${priorityCoverage.total} de ${summary.answered} respuestas y debe liderar tu próxima práctica.`,
    trend,
    actionPlan: [actions[summary.priority], actions[summary.secondaryPriority], "Graba una respuesta de 75 segundos, escúchala una vez buscando la estructura y repítela sin memorizar las palabras."],
    formula: ["Responder la pregunta en una frase", "Dar situación, acción propia y resultado", "Conectar la evidencia con GKS o el plan académico", "Cerrar con aprendizaje y siguiente decisión"],
    nextTarget: `En tu próxima sesión, incluye ${names[summary.priority]} en al menos ${targetTotal} de ${summary.answered} respuestas.`,
  };
}
