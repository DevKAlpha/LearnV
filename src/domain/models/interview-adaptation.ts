import { getInterviewStudyRoute, isInterviewSignal, type InterviewStudyCategory } from "./interview-learning-link";
import type { InterviewSignal } from "./interview-chatbot";
import type {
  LearningEvent,
  LearningJourneyState,
  LearningLanguage,
  LearningSkill,
} from "./learning-journey";

export type InterviewPracticeLevel = "starting" | "developing" | "solid" | "strong";

export type InterviewAdaptation = {
  focus: InterviewSignal;
  language: LearningLanguage;
  level: InterviewPracticeLevel;
  category: InterviewStudyCategory;
  questionId: string;
  sectionId: "interview-method-title" | "simulator-title" | "tips-title";
};

const LANGUAGE_SKILLS: LearningSkill[] = ["reading", "grammar", "vocabulary", "writing", "listening", "pronunciation"];

const SKILL_FOCUS: Partial<Record<LearningSkill, InterviewSignal>> = {
  reading: "reflection",
  listening: "reflection",
  grammar: "direct",
  vocabulary: "direct",
  pronunciation: "direct",
  writing: "evidence",
};

const QUESTION_CATEGORY: Record<string, InterviewStudyCategory> = {
  "introduce-yourself": "motivation",
  "why-korea": "motivation",
  "why-major": "academic",
  "academic-weakness": "academic",
  "study-plan": "academic",
  "language-plan": "academic",
  "culture-shock": "adaptation",
  pressure: "adaptation",
  conflict: "adaptation",
  "spain-korea": "contribution",
  "return-plan": "contribution",
  "not-selected": "contribution",
};

const QUESTION_LADDERS: Record<InterviewSignal, Record<InterviewPracticeLevel, string[]>> = {
  direct: {
    starting: ["introduce-yourself"],
    developing: ["study-plan", "language-plan"],
    solid: ["conflict", "not-selected"],
    strong: ["not-selected", "spain-korea"],
  },
  evidence: {
    starting: ["pressure", "academic-weakness"],
    developing: ["conflict", "study-plan"],
    solid: ["spain-korea", "language-plan"],
    strong: ["spain-korea", "return-plan"],
  },
  connection: {
    starting: ["why-korea", "why-major"],
    developing: ["why-major", "study-plan"],
    solid: ["spain-korea", "return-plan"],
    strong: ["return-plan", "not-selected"],
  },
  reflection: {
    starting: ["academic-weakness", "pressure"],
    developing: ["pressure", "culture-shock"],
    solid: ["culture-shock", "return-plan"],
    strong: ["not-selected", "return-plan"],
  },
};

function average(events: LearningEvent[]) {
  const scores = events.map((event) => event.score).filter((score): score is number => typeof score === "number");
  return scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : null;
}

function levelFor(score: number | null): InterviewPracticeLevel {
  if (score === null || score < 55) return "starting";
  if (score < 70) return "developing";
  if (score < 85) return "solid";
  return "strong";
}

function weakestLanguagePractice(events: LearningEvent[]) {
  const candidates = (["en", "ko"] as const).map((language) => {
    const languageEvents = events.filter((event) => event.language === language && event.skill && LANGUAGE_SKILLS.includes(event.skill));
    return { language, events: languageEvents, average: average(languageEvents) };
  }).filter((candidate) => candidate.average !== null);

  return candidates.sort((left, right) =>
    (left.average ?? 100) - (right.average ?? 100) || left.events.length - right.events.length)[0] ?? null;
}

function weakestSkill(events: LearningEvent[]) {
  return LANGUAGE_SKILLS.map((skill) => {
    const skillEvents = events.filter((event) => event.skill === skill);
    return { skill, average: average(skillEvents), attempts: skillEvents.length };
  }).filter((item) => item.average !== null)
    .sort((left, right) => (left.average ?? 100) - (right.average ?? 100) || right.attempts - left.attempts)[0]?.skill ?? null;
}

function latestChatbotFocus(events: LearningEvent[]) {
  return events.find((event) =>
    event.kind === "practice"
    && event.itemId === "gks-interview-chatbot"
    && isInterviewSignal(event.interviewFocus))?.interviewFocus ?? null;
}

/**
 * Builds the next interview route from anonymous learning traces only. It never
 * stores or inspects the candidate's answer text.
 */
export function createInterviewAdaptation(
  state: LearningJourneyState,
  requestedFocus?: InterviewSignal | null,
): InterviewAdaptation {
  const practices = state.recentActivities.filter((event) => event.kind === "practice");
  const languagePractice = weakestLanguagePractice(practices);
  const language = languagePractice?.language ?? "general";
  const level = levelFor(languagePractice?.average ?? null);
  const languageSkill = languagePractice ? weakestSkill(languagePractice.events) : null;
  const focus = requestedFocus
    ?? latestChatbotFocus(practices)
    ?? (languageSkill ? SKILL_FOCUS[languageSkill] : null)
    ?? "evidence";
  const candidates = QUESTION_LADDERS[focus][level];
  const completedInterviewPractices = practices.filter((event) => event.skill === "interview").length;
  const questionId = candidates[completedInterviewPractices % candidates.length];
  const fallback = getInterviewStudyRoute(focus);

  return {
    focus,
    language,
    level,
    questionId,
    category: QUESTION_CATEGORY[questionId] ?? fallback.category,
    sectionId: fallback.sectionId,
  };
}
