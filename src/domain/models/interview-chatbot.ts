import type { Locale } from "./i18n";
import type { LearningSkill } from "./learning-journey";

export type InterviewSignal = "direct" | "evidence" | "connection" | "reflection";

export type InterviewAnswerEvaluation = {
  score: number;
  wordCount: number;
  signals: Record<InterviewSignal, boolean>;
  feedback: Record<InterviewSignal, string>;
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

export function summarizeInterviewSession(evaluations: InterviewAnswerEvaluation[]) {
  const signals: InterviewSignal[] = ["direct", "evidence", "connection", "reflection"];
  const average = evaluations.length
    ? Math.round(evaluations.reduce((total, item) => total + item.score, 0) / evaluations.length)
    : 0;
  const totals = signals.map((signal) => ({
    signal,
    total: evaluations.filter((item) => item.signals[signal]).length,
  }));
  const strongest = [...totals].sort((a, b) => b.total - a.total)[0]?.signal ?? "direct";
  const priority = [...totals].sort((a, b) => a.total - b.total)[0]?.signal ?? "evidence";
  return { average, strongest, priority, answered: evaluations.length };
}
