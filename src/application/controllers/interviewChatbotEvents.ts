import { isInterviewSignal } from "@/domain/models/interview-learning-link";
import type { InterviewSignal } from "@/domain/models/interview-chatbot";
import { emitLearnvEvent } from "@/infrastructure/events/learnv-events";

export function openInterviewChatbot(focus?: InterviewSignal | null) {
  emitLearnvEvent("learnv:open-interview-chatbot", { focus: isInterviewSignal(focus) ? focus : null });
}
