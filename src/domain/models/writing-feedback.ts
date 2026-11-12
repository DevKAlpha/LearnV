/**
 * Objective, explainable feedback on a written draft. It never claims to grade the text: it
 * checks things a rubric rewards and a machine can verify (length, structure, cohesion,
 * vocabulary range, register, format requirements, target grammar), so the learner gets a
 * concrete next revision instead of a score that only grows with length.
 */
export type WritingLanguage = "en" | "ko";
export type WritingFormat = "free" | "topik-51" | "topik-52" | "topik-53" | "topik-54" | "ielts-task1" | "ielts-task2";
export type CheckStatus = "ok" | "warn" | "missing";
export type WritingCheckId =
  | "length" | "paragraphs" | "connectors" | "variety" | "repetition" | "sentences"
  | "register" | "grammar" | "data" | "overview" | "position" | "conclusion";

export type WritingCheck = {
  id: WritingCheckId;
  status: CheckStatus;
  /** Number shown next to the check (count, ratio as %, average…). */
  value?: number;
  /** Words or patterns the check found (connectors, repeated words, informal forms…). */
  items?: string[];
};

export type WritingAnalysis = {
  language: WritingLanguage;
  units: number;
  unit: "words" | "characters";
  checks: WritingCheck[];
  passed: number;
};

export type WritingTarget = {
  language: WritingLanguage;
  format?: WritingFormat;
  minimum?: number;
  maximum?: number;
  /** Grammar the task asks for, matched as plain substrings (e.g. "반면", "although"). */
  targetGrammar?: readonly string[];
};

const EN_CONNECTORS = [
  "however", "therefore", "moreover", "furthermore", "in addition", "for example", "for instance",
  "as a result", "consequently", "although", "whereas", "while", "on the other hand", "in contrast",
  "firstly", "secondly", "finally", "in conclusion", "overall", "because", "since", "thus",
  "nevertheless", "despite", "similarly", "meanwhile", "instead",
];
const KO_CONNECTORS = [
  "그리고", "그러나", "하지만", "그래서", "따라서", "그러므로", "또한", "게다가", "예를 들어", "예를 들면",
  "반면에", "반면", "결국", "결론적으로", "첫째", "둘째", "셋째", "마지막으로", "왜냐하면", "그런데",
  "뿐만 아니라", "기 때문에", "이처럼", "한편", "즉",
];
const EN_STOPWORDS = new Set(("the a an and or but of to in on at for with from by is are was were be been being it its this that these those "
  + "i you he she we they my your our their me him her us them as not no so do does did have has had will would can could "
  + "should may might there here than then also very more most some any all each which who what when where how why").split(" "));
const EN_CONTRACTION = /\b(?:\w+n't|i'm|it's|that's|there's|they're|we're|you're|i've|we've|they've|i'll|we'll|it'll|i'd|we'd|let's|gonna|wanna)\b/giu;
const KO_POLITE_ENDING = /(?:요|습니다|ㅂ니다|니다)[.!?。]?$/u;
const DIGIT = /\d/u;
const EN_OVERVIEW = /\b(?:overall|in general|it is clear that|the main trend|in summary|generally speaking)\b/iu;
const EN_POSITION = /\b(?:i (?:strongly |do not |don't )?(?:believe|think|agree|disagree)|in my (?:opinion|view)|this essay (?:will )?(?:argue|argues|discuss)|i would argue)\b/iu;
const EN_CONCLUSION = /\b(?:in conclusion|to conclude|to sum up|overall|in summary)\b/iu;
const KO_CONCLUSION = /(?:결론적으로|따라서|이처럼|요컨대|결국|그러므로)/u;

const ESSAY_FORMATS = new Set<WritingFormat>(["topik-54", "ielts-task2"]);
/** Gap-fill formats: the learner writes two short sentences, so cohesion checks do not apply. */
const GAP_FORMATS = new Set<WritingFormat>(["topik-51", "topik-52"]);
const PLAIN_STYLE_FORMATS = new Set<WritingFormat>(["topik-52", "topik-53", "topik-54"]);

function words(text: string) {
  return text.trim() ? text.trim().split(/\s+/u) : [];
}

function sentences(text: string) {
  return text.split(/(?<=[.!?。])\s+|\n+/u).map((part) => part.trim()).filter(Boolean);
}

function paragraphs(text: string) {
  return text.split(/\n\s*\n/u).map((part) => part.trim()).filter(Boolean);
}

function normalizeWord(word: string) {
  return word.toLocaleLowerCase("en").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function foundConnectors(text: string, language: WritingLanguage) {
  const lower = text.toLocaleLowerCase("en");
  const list = language === "en" ? EN_CONNECTORS : KO_CONNECTORS;
  return list.filter((connector) => language === "en"
    ? new RegExp(`(?:^|[^\\p{L}])${connector.replace(/ /gu, "\\s+")}(?:[^\\p{L}]|$)`, "u").test(lower)
    : lower.includes(connector));
}

function contentTokens(text: string, language: WritingLanguage) {
  const tokens = words(text).map(normalizeWord).filter(Boolean);
  return language === "en"
    ? tokens.filter((token) => token.length >= 3 && !EN_STOPWORDS.has(token))
    : tokens.filter((token) => token.length >= 2);
}

function lengthStatus(units: number, minimum?: number, maximum?: number): CheckStatus {
  if (minimum !== undefined && units < minimum) return "missing";
  if (maximum !== undefined && units > maximum) return "warn";
  return "ok";
}

export function analyzeWriting(text: string, target: WritingTarget): WritingAnalysis {
  const { language, format = "free", minimum, maximum } = target;
  const draft = text.trim();
  const unit = language === "en" ? "words" : "characters";
  const units = language === "en" ? words(draft).length : draft.length;
  const checks: WritingCheck[] = [];
  const add = (check: WritingCheck) => checks.push(check);
  const long = language === "en" ? units >= 150 : units >= 400;

  add({ id: "length", status: lengthStatus(units, minimum, maximum), value: units });

  if (long || ESSAY_FORMATS.has(format)) {
    const count = paragraphs(draft).length;
    add({ id: "paragraphs", status: count >= 3 ? "ok" : count === 2 ? "warn" : "missing", value: count });
  }

  if (!GAP_FORMATS.has(format)) {
    const connectors = foundConnectors(draft, language);
    const wanted = long ? 3 : 2;
    add({ id: "connectors", status: connectors.length >= wanted ? "ok" : connectors.length > 0 ? "warn" : "missing", value: connectors.length, items: connectors });
  }

  const tokens = contentTokens(draft, language);
  if (tokens.length >= 20) {
    const ratio = new Set(tokens).size / tokens.length;
    const okFrom = tokens.length >= 80 ? 0.5 : 0.6;
    add({ id: "variety", status: ratio >= okFrom ? "ok" : ratio >= okFrom - 0.15 ? "warn" : "missing", value: Math.round(ratio * 100) });

    const counts = new Map<string, number>();
    for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
    const limit = Math.max(3, Math.ceil(tokens.length * 0.04));
    const repeated = [...counts.entries()].filter(([, count]) => count > limit).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([token]) => token);
    add({ id: "repetition", status: repeated.length ? "warn" : "ok", items: repeated });
  }

  if (language === "en") {
    const parts = sentences(draft);
    if (parts.length >= 3) {
      const average = Math.round(words(draft).length / parts.length);
      add({ id: "sentences", status: average > 35 || average < 7 ? "warn" : "ok", value: average });
    }
    const informal = [...new Set((draft.match(EN_CONTRACTION) ?? []).map((match) => match.toLowerCase()))];
    if (format !== "free" || long) add({ id: "register", status: informal.length ? "warn" : "ok", items: informal });
  } else if (PLAIN_STYLE_FORMATS.has(format)) {
    // TOPIK 52–54 expect the written -(ㄴ/는)다 style; polite endings lose register points.
    const polite = sentences(draft).filter((sentence) => KO_POLITE_ENDING.test(sentence)).map((sentence) => sentence.split(/\s+/u).at(-1)!.replace(/[.!?。]+$/u, ""));
    add({ id: "register", status: polite.length ? "warn" : "ok", items: polite.slice(0, 3) });
  }

  if (target.targetGrammar?.length) {
    const lower = draft.toLocaleLowerCase("en");
    const used = target.targetGrammar.filter((pattern) => lower.includes(pattern.toLocaleLowerCase("en").replace(/^-/u, "")));
    add({ id: "grammar", status: used.length === target.targetGrammar.length ? "ok" : used.length ? "warn" : "missing", value: used.length, items: used });
  }

  if (format === "topik-53" || format === "ielts-task1") {
    const numbers = (draft.match(/\d+(?:[.,]\d+)?\s*%?/gu) ?? []).length;
    add({ id: "data", status: numbers >= 3 ? "ok" : DIGIT.test(draft) ? "warn" : "missing", value: numbers });
  }
  if (format === "ielts-task1") add({ id: "overview", status: EN_OVERVIEW.test(draft) ? "ok" : "missing" });
  if (format === "ielts-task2") add({ id: "position", status: EN_POSITION.test(draft) ? "ok" : "missing" });
  if (ESSAY_FORMATS.has(format)) {
    const blocks = paragraphs(draft);
    const ending = blocks.length > 1 ? blocks[blocks.length - 1] : draft.slice(Math.floor(draft.length * 0.75));
    add({ id: "conclusion", status: (language === "en" ? EN_CONCLUSION : KO_CONCLUSION).test(ending) ? "ok" : "missing" });
  }

  return { language, units, unit, checks, passed: checks.filter((check) => check.status === "ok").length };
}

const RANK: Record<CheckStatus, number> = { missing: 0, warn: 1, ok: 2 };

/** Checks that got better between two drafts, for the revision loop. */
export function improvedChecks(previous: WritingAnalysis, current: WritingAnalysis): WritingCheckId[] {
  const before = new Map(previous.checks.map((check) => [check.id, check.status]));
  return current.checks
    .filter((check) => before.has(check.id) && RANK[check.status] > RANK[before.get(check.id)!])
    .map((check) => check.id);
}
