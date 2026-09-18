import type { InterviewSignal } from "./interview-chatbot";

export type InterviewStudyCategory = "motivation" | "academic" | "adaptation" | "contribution";

export type InterviewStudyRoute = {
  signal: InterviewSignal;
  category: InterviewStudyCategory;
  questionId: string;
  sectionId: "interview-method-title" | "simulator-title" | "tips-title";
};

const INTERVIEW_STUDY_ROUTES: Record<InterviewSignal, InterviewStudyRoute> = {
  direct: {
    signal: "direct",
    category: "motivation",
    questionId: "introduce-yourself",
    sectionId: "interview-method-title",
  },
  evidence: {
    signal: "evidence",
    category: "adaptation",
    questionId: "pressure",
    sectionId: "simulator-title",
  },
  connection: {
    signal: "connection",
    category: "academic",
    questionId: "why-major",
    sectionId: "simulator-title",
  },
  reflection: {
    signal: "reflection",
    category: "academic",
    questionId: "academic-weakness",
    sectionId: "tips-title",
  },
};

export function isInterviewSignal(value: unknown): value is InterviewSignal {
  return value === "direct" || value === "evidence" || value === "connection" || value === "reflection";
}

export function getInterviewStudyRoute(signal: InterviewSignal): InterviewStudyRoute {
  return INTERVIEW_STUDY_ROUTES[signal];
}

export function createInterviewStudyPath() {
  return "/study/interviews#interview-learning-bridge";
}
