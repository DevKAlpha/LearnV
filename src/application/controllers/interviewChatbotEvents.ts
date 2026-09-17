import { isInterviewSignal } from "@/domain/models/interview-learning-link";
import type { InterviewSignal } from "@/domain/models/interview-chatbot";

export const OPEN_INTERVIEW_CHATBOT_EVENT = "learnv:open-interview-chatbot";

export type OpenInterviewChatbotDetail = {
  focus?: InterviewSignal | null;
};

export function openInterviewChatbot(focus?: InterviewSignal | null) {
  window.dispatchEvent(new CustomEvent<OpenInterviewChatbotDetail>(OPEN_INTERVIEW_CHATBOT_EVENT, {
    detail: { focus: isInterviewSignal(focus) ? focus : null },
  }));
}
