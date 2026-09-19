import type { Locale } from "./i18n";
import type { LearningSkill } from "./learning-journey";

export type InterviewSignal = "direct" | "evidence" | "connection" | "reflection";
export type InterviewStage = "motivation" | "academic" | "adaptation" | "contribution";
export const INTERVIEW_PERSONALITY_IDS = ["analytical", "direct", "supportive", "strategic"] as const;
export type InterviewPersonalityId = typeof INTERVIEW_PERSONALITY_IDS[number];

export const INTERVIEW_STAGES: InterviewStage[] = ["motivation", "academic", "adaptation", "contribution"];

export const INTERVIEW_RUBRIC_VERSION = "structural-v1";

export type InterviewScoreReasonCode =
  | "word-count-met"
  | "word-count-below-threshold"
  | "numeric-detail-detected"
  | "action-or-outcome-detected"
  | "evidence-not-detected"
  | "application-connection-detected"
  | "application-connection-not-detected"
  | "reflection-language-detected"
  | "reflection-language-not-detected";

export type InterviewScoreCriterionLog = {
  signal: InterviewSignal;
  awardedPoints: 0 | 25;
  maxPoints: 25;
  reasonCode: InterviewScoreReasonCode;
  reason: string;
};

export type InterviewScoreExplanation = {
  rubricVersion: typeof INTERVIEW_RUBRIC_VERSION;
  score: number;
  maxScore: 100;
  criteria: InterviewScoreCriterionLog[];
};

export type InterviewAnswerEvaluation = {
  score: number;
  wordCount: number;
  signals: Record<InterviewSignal, boolean>;
  feedback: Record<InterviewSignal, string>;
  scoreLog: InterviewScoreExplanation;
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

const KOREAN_ACTION_PATTERN = /(배웠|만들|이끌|조사|개선|달성|측정|준비)/;
const KOREAN_CONNECTION_PATTERN = /(한국|전공|학업|대학|계획|장학금)/;
const KOREAN_REFLECTION_PATTERN = /(왜냐하면|그래서|배웠|변화|결과|통해)/;

type InterviewLexicalProfile = {
  action: string[];
  outcome: string[];
  connection: string[];
  reflection: string[];
};

type InterviewLexicalMatches = {
  action: string;
  outcome: string;
  connection: string;
  reflection: string;
};

/**
 * Families are deliberately stored as stems, not fixed phrases. This accepts
 * conjugations and natural interruptions such as “me di, con el tiempo, cuenta”.
 * The Spanish set includes formal interview language and common peninsular
 * ways of describing initiative heard in Cantabria/Santander, without rewarding
 * highly local vocabulary that would be inappropriate before a scholarship panel.
 */
const INTERVIEW_LEXICON: Record<"es" | "en", InterviewLexicalProfile> = {
  es: {
    action: [
      "alcanz", "analiz", "apoy", "colabor", "compagin", "consegu", "coordin", "cread", "crear",
      "desarroll", "disen", "encarg", "gestion", "implement", "impuls", "investig", "lider", "llev",
      "logr", "mejor", "organiz", "particip", "planific", "plante", "prepar", "present", "propus",
      "puse", "resolv", "saqu", "trabaj", "tire", "voluntari",
    ],
    outcome: [
      "alcanz", "aprobad", "aument", "complet", "consegu", "entreg", "finaliz", "impact", "logr",
      "mejor", "reduj", "reduccion", "result", "resuelt", "salio", "superad",
    ],
    connection: [
      "academ", "beca", "carrera", "corea", "estudi", "facultad", "formacion", "gks", "grado",
      "master", "posgrado", "programa", "universidad",
    ],
    reflection: [
      "aprend", "cambi", "comprend", "confirm", "conclu", "cuadr", "cuenta", "decid", "descubr",
      "encaj", "ensen", "entend", "permit", "porque", "razon", "reflexion", "replante", "sirv",
    ],
  },
  en: {
    action: [
      "achiev", "analys", "analyz", "built", "collaborat", "coordinat", "creat", "develop", "implement",
      "improv", "led", "manag", "measur", "organis", "organiz", "planned", "prepared", "presented",
      "researched", "resolved", "supported", "worked",
    ],
    outcome: ["achiev", "completed", "delivered", "impact", "improv", "increas", "reduc", "result", "solved"],
    connection: ["academic", "degree", "gks", "korea", "major", "programme", "program", "scholarship", "stud", "university"],
    reflection: ["allowed", "because", "changed", "decid", "discover", "learn", "realiz", "reflect", "therefore", "underst"],
  },
};

function normalizeLexicalToken(value: string) {
  return value.normalize("NFD").replace(/\p{M}+/gu, "").toLocaleLowerCase();
}

function lexicalTokens(answer: string) {
  return (answer.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).map((original) => ({
    original,
    normalized: normalizeLexicalToken(original),
  }));
}

function findLexicalMatch(
  tokens: ReturnType<typeof lexicalTokens>,
  stems: string[],
  preferredStems: string[] = [],
) {
  const preferred = preferredStems
    .map((stem) => tokens.find(({ normalized }) => normalized.startsWith(stem)))
    .find(Boolean);
  return preferred ?? tokens.find(({ normalized }) => stems.some((stem) => normalized.startsWith(stem))) ?? null;
}

function analyzeInterviewLexicon(answer: string, locale: Locale): InterviewLexicalMatches {
  if (locale === "ko") {
    return {
      action: matchedText(answer, [KOREAN_ACTION_PATTERN]),
      outcome: "",
      connection: matchedText(answer, [KOREAN_CONNECTION_PATTERN]),
      reflection: matchedText(answer, [KOREAN_REFLECTION_PATTERN]),
    };
  }

  const tokens = lexicalTokens(answer);
  const profile = INTERVIEW_LEXICON[locale];
  const action = findLexicalMatch(tokens, profile.action)?.original ?? "";
  const outcome = findLexicalMatch(tokens, profile.outcome)?.original ?? "";
  const preferredConnection = locale === "es"
    ? ["gks", "beca", "corea"]
    : ["gks", "scholarship", "korea"];
  const connection = findLexicalMatch(tokens, profile.connection, preferredConnection)?.original ?? "";
  const reflectionMatch = findLexicalMatch(tokens, profile.reflection);
  const contextualReflection = reflectionMatch
    && ["cuadr", "cuenta", "encaj", "sirv"].some((stem) => reflectionMatch.normalized.startsWith(stem));
  const hasPersonalContext = tokens.some(({ normalized }) => ["me", "mi", "yo"].includes(normalized));
  const reflection = contextualReflection && !hasPersonalContext ? "" : reflectionMatch?.original ?? "";

  return { action, outcome, connection, reflection };
}

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
  lexical: InterviewLexicalMatches,
): Record<InterviewSignal, string> {
  const excerpt = compactExcerpt(answer);
  const quotedExcerpt = quote(excerpt, locale);
  const action = lexical.action || lexical.outcome;
  const number = answer.match(/\b\d+(?:[.,]\d+)?%?\b/)?.[0] ?? "";
  const connection = lexical.connection;
  const reflection = lexical.reflection;

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

function createScoreExplanation(
  wordCount: number,
  signals: Record<InterviewSignal, boolean>,
  lexical: InterviewLexicalMatches,
  hasNumericDetail: boolean,
): InterviewScoreExplanation {
  const criteria: InterviewScoreCriterionLog[] = [
    {
      signal: "direct",
      awardedPoints: signals.direct ? 25 : 0,
      maxPoints: 25,
      reasonCode: signals.direct ? "word-count-met" : "word-count-below-threshold",
      reason: signals.direct
        ? `Awarded because the answer contains ${wordCount} words, meeting the 12-word structural threshold.`
        : `Not awarded because the answer contains ${wordCount} words, below the 12-word structural threshold.`,
    },
    {
      signal: "evidence",
      awardedPoints: signals.evidence ? 25 : 0,
      maxPoints: 25,
      reasonCode: hasNumericDetail
        ? "numeric-detail-detected"
        : lexical.action || lexical.outcome
          ? "action-or-outcome-detected"
          : "evidence-not-detected",
      reason: hasNumericDetail
        ? "Awarded because the structural analyser detected a numeric detail."
        : lexical.action || lexical.outcome
          ? "Awarded because the structural analyser detected action or outcome language."
          : "Not awarded because no numeric detail, action or outcome language was detected.",
    },
    {
      signal: "connection",
      awardedPoints: signals.connection ? 25 : 0,
      maxPoints: 25,
      reasonCode: signals.connection
        ? "application-connection-detected"
        : "application-connection-not-detected",
      reason: signals.connection
        ? "Awarded because the structural analyser detected a connection to the application, GKS, Korea or the study plan."
        : "Not awarded because no connection to the application, GKS, Korea or the study plan was detected.",
    },
    {
      signal: "reflection",
      awardedPoints: signals.reflection ? 25 : 0,
      maxPoints: 25,
      reasonCode: signals.reflection
        ? "reflection-language-detected"
        : "reflection-language-not-detected",
      reason: signals.reflection
        ? "Awarded because the structural analyser detected learning, change or reflective language."
        : "Not awarded because no learning, change or reflective language was detected.",
    },
  ];
  const score = criteria.reduce((total, criterion) => total + criterion.awardedPoints, 0);
  return { rubricVersion: INTERVIEW_RUBRIC_VERSION, score, maxScore: 100, criteria };
}

/** A transparent structural rubric; it does not claim to understand or judge the candidate. */
export function evaluateInterviewAnswer(answer: string, locale: Locale): InterviewAnswerEvaluation {
  const normalized = answer.trim();
  const wordCount = countWords(normalized, locale);
  const lexical = analyzeInterviewLexicon(normalized, locale);
  const hasNumericDetail = /\d/.test(normalized);
  const signals = {
    direct: wordCount >= 12,
    evidence: hasNumericDetail || Boolean(lexical.action || lexical.outcome),
    connection: Boolean(lexical.connection),
    reflection: Boolean(lexical.reflection),
  };
  const scoreLog = createScoreExplanation(wordCount, signals, lexical, hasNumericDetail);
  const score = scoreLog.score;
  const feedback = createContextualFeedback(normalized, locale, wordCount, signals, lexical);
  return { score, wordCount, signals, feedback, scoreLog };
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

const INTERVIEW_QUESTION_POOLS: Record<InterviewStage, string[]> = {
  motivation: ["introduce-yourself", "why-korea"],
  academic: ["why-major", "academic-weakness", "study-plan", "language-plan"],
  adaptation: ["culture-shock", "pressure", "conflict"],
  contribution: ["spain-korea", "return-plan", "not-selected"],
};

const QUESTION_SIGNAL_AFFINITY: Record<string, InterviewSignal[]> = {
  "introduce-yourself": ["direct", "evidence", "reflection"],
  "why-korea": ["direct", "connection"],
  "why-major": ["connection", "reflection"],
  "academic-weakness": ["evidence", "reflection"],
  "study-plan": ["direct", "evidence"],
  "language-plan": ["direct", "evidence"],
  "culture-shock": ["connection", "reflection"],
  pressure: ["evidence", "reflection"],
  conflict: ["direct", "evidence"],
  "spain-korea": ["connection", "evidence"],
  "return-plan": ["connection", "reflection"],
  "not-selected": ["direct", "reflection"],
};

const LEARNING_PRIORITY_QUESTION: Partial<Record<LearningSkill, string>> = {
  application: "why-major",
  writing: "study-plan",
  interview: "pressure",
  pronunciation: "pressure",
  grammar: "academic-weakness",
  vocabulary: "language-plan",
  listening: "culture-shock",
  reading: "return-plan",
};

function positiveModulo(value: number, divisor: number) {
  return ((Math.trunc(value) % divisor) + divisor) % divisor;
}

export function chooseInterviewPersonalityId(
  seed: number,
  previous?: InterviewPersonalityId | null,
): InterviewPersonalityId {
  const selected = INTERVIEW_PERSONALITY_IDS[positiveModulo(seed, INTERVIEW_PERSONALITY_IDS.length)];
  if (selected !== previous) return selected;
  return INTERVIEW_PERSONALITY_IDS[positiveModulo(seed + 1, INTERVIEW_PERSONALITY_IDS.length)];
}

export function interviewSignalFromLearningSkill(priority?: LearningSkill | null): InterviewSignal | null {
  if (priority === "application") return "connection";
  if (priority === "reading" || priority === "listening") return "reflection";
  if (priority) return priority === "interview" ? "evidence" : "direct";
  return null;
}

/**
 * Keeps the pedagogical stage stable while rotating among its strongest candidates.
 * A weak signal detected in previous answers has more weight than the historic skill,
 * and the seed prevents two sessions from always following the same route.
 */
export function chooseInterviewQuestionId(
  stage: InterviewStage,
  options: {
    priority?: LearningSkill | null;
    focus?: InterviewSignal | null;
    usedIds?: string[];
    seed?: number;
  } = {},
) {
  const { priority, focus = null, usedIds = [], seed = 0 } = options;
  const unused = INTERVIEW_QUESTION_POOLS[stage].filter((id) => !usedIds.includes(id));
  const candidates = unused.length ? unused : INTERVIEW_QUESTION_POOLS[stage];
  const preferredQuestion = priority ? LEARNING_PRIORITY_QUESTION[priority] : undefined;
  const ranked = [...candidates].sort((left, right) => {
    const score = (id: string) => (focus && QUESTION_SIGNAL_AFFINITY[id]?.includes(focus) ? 4 : 0)
      + (id === preferredQuestion ? 2 : 0);
    return score(right) - score(left) || left.localeCompare(right);
  });
  const adaptivePoolSize = focus || preferredQuestion ? Math.min(2, ranked.length) : ranked.length;
  return ranked[positiveModulo(seed, adaptivePoolSize)];
}

export function chooseInterviewQuestionIds(priority?: LearningSkill | null, seed = 0) {
  const initialFocus = interviewSignalFromLearningSkill(priority);
  return INTERVIEW_STAGES.map((stage, index) => chooseInterviewQuestionId(stage, {
    priority,
    focus: index === 0 ? initialFocus : null,
    seed: seed + index,
  }));
}

const QUESTION_FRAMES: Record<Locale, Record<InterviewSignal | "neutral", string[]>> = {
  es: {
    neutral: [
      "Empecemos con una respuesta auténtica:",
      "Piensa en lo que realmente sostendrías ante el panel:",
      "No busques una frase perfecta; responde con precisión:",
    ],
    direct: [
      "Ve primero a tu idea central y luego explíquela:",
      "Esta vez abre con una respuesta inequívoca:",
      "Practiquemos claridad desde la primera frase:",
    ],
    evidence: [
      "Quiero comprobarlo mediante una experiencia concreta:",
      "Evita generalidades y apóyate en algo que hayas hecho:",
      "Construye la respuesta alrededor de una acción y su resultado:",
    ],
    connection: [
      "Conecta esta respuesta con el propósito de tu candidatura:",
      "Haz visible por qué esto importa para GKS y tu plan académico:",
      "Responde mostrando el vínculo con la oportunidad que solicitas:",
    ],
    reflection: [
      "Quiero conocer la decisión que nació de tu experiencia:",
      "Incluye qué aprendiste y qué cambió después:",
      "Responde desde una experiencia y cierra con su aprendizaje:",
    ],
  },
  en: {
    neutral: [
      "Let us begin with an authentic answer:",
      "Think about what you would genuinely stand behind before the panel:",
      "Do not look for a perfect line; answer precisely:",
    ],
    direct: [
      "Lead with your central point, then explain it:",
      "This time, open with an unambiguous answer:",
      "Let us practise clarity from the first sentence:",
    ],
    evidence: [
      "Show this through one concrete experience:",
      "Avoid generalities and rely on something you actually did:",
      "Build the answer around one action and its result:",
    ],
    connection: [
      "Connect this answer to the purpose of your application:",
      "Make clear why this matters for GKS and your study plan:",
      "Answer by showing the link to the opportunity you are seeking:",
    ],
    reflection: [
      "Show the decision that came from your experience:",
      "Include what you learned and what changed afterwards:",
      "Answer through an experience and close with its lesson:",
    ],
  },
  ko: {
    neutral: [
      "진솔한 답변으로 시작해 보세요:",
      "면접관 앞에서 실제로 주장할 내용을 생각해 보세요:",
      "완벽한 문장보다 정확한 답변에 집중하세요:",
    ],
    direct: [
      "핵심 답변을 먼저 말한 뒤 설명하세요:",
      "이번에는 모호하지 않은 답변으로 시작하세요:",
      "첫 문장부터 명확하게 말하는 연습을 해 보세요:",
    ],
    evidence: [
      "한 가지 구체적인 경험으로 보여 주세요:",
      "일반적인 표현을 피하고 직접 한 행동을 근거로 답하세요:",
      "하나의 행동과 그 결과를 중심으로 답변을 구성하세요:",
    ],
    connection: [
      "이 답변을 지원 목적과 연결하세요:",
      "이 내용이 GKS와 학업 계획에 왜 중요한지 보여 주세요:",
      "지원하는 기회와의 연결이 드러나게 답하세요:",
    ],
    reflection: [
      "경험을 통해 내린 결정을 들려주세요:",
      "배운 점과 이후 달라진 점을 포함하세요:",
      "경험으로 답하고 그 경험의 교훈으로 마무리하세요:",
    ],
  },
};

export function createAdaptiveInterviewQuestion(
  question: string,
  locale: Locale,
  focus: InterviewSignal | null,
  variation = 0,
) {
  const frames = QUESTION_FRAMES[locale][focus ?? "neutral"];
  return `${frames[positiveModulo(variation, frames.length)]} ${question}`;
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
