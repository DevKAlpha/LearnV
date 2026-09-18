import type { Locale } from "@/domain/models/i18n";
type InterviewLearningLinkCopy = {
  kicker: string;
  title: string;
  introduction: string;
  review: string;
  practise: string;
  chatbotMaterialTitle: string;
  chatbotMaterialText: string;
  chatbotMaterialAction: string;
};

export const interviewLearningLinkCopy: Record<Locale, InterviewLearningLinkCopy> = {
  es: {
    kicker: "Chatbot + material de entrevista",
    title: "Convierte el informe en la siguiente práctica.",
    introduction: "LearnV enlaza tu resultado con una explicación y una pregunta concreta. Revisa el criterio, ensáyalo en el banco y vuelve al entrevistador para comprobar la mejora.",
    review: "Revisar siguiente material",
    practise: "Practicar con el chatbot",
    chatbotMaterialTitle: "Refuerza tu prioridad antes de repetir la entrevista",
    chatbotMaterialText: "Abriremos el material con la categoría y la pregunta más útiles para tu resultado actual.",
    chatbotMaterialAction: "Ir al material recomendado",
  },
  en: {
    kicker: "Chatbot + interview material",
    title: "Turn the report into your next practice.",
    introduction: "LearnV links your result to one explanation and one concrete question. Review the criterion, rehearse it in the question bank and return to the interviewer to check your progress.",
    review: "Review next material",
    practise: "Practise with the chatbot",
    chatbotMaterialTitle: "Strengthen your priority before repeating the interview",
    chatbotMaterialText: "We will open the material at the category and question most useful for your current result.",
    chatbotMaterialAction: "Open recommended material",
  },
  ko: {
    kicker: "챗봇 + 면접 학습 자료",
    title: "결과를 다음 연습으로 연결하세요.",
    introduction: "LearnV가 결과를 설명과 구체적인 질문에 연결합니다. 기준을 복습하고 질문 은행에서 연습한 뒤 면접관에게 돌아와 향상 정도를 확인하세요.",
    review: "선택한 자료 복습",
    practise: "챗봇으로 이 영역 연습",
    chatbotMaterialTitle: "면접을 다시 하기 전에 우선 과제를 보완하세요",
    chatbotMaterialText: "현재 결과에 가장 유용한 범주와 질문으로 학습 자료를 엽니다.",
    chatbotMaterialAction: "추천 자료 열기",
  },
};
