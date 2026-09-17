import type { Locale } from "@/domain/models/i18n";
import type { InterviewSignal } from "@/domain/models/interview-chatbot";

type InterviewLearningLinkCopy = {
  kicker: string;
  title: string;
  introduction: string;
  fromChat: string;
  focusLabel: string;
  focusNames: Record<InterviewSignal, string>;
  materialNames: Record<InterviewSignal, string>;
  guidance: Record<InterviewSignal, string>;
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
    fromChat: "Ruta creada desde tu último informe del chatbot.",
    focusLabel: "Foco recomendado",
    focusNames: { direct: "Respuesta directa", evidence: "Evidencia concreta", connection: "Conexión con GKS", reflection: "Reflexión personal" },
    materialNames: {
      direct: "Método de respuesta: idea principal antes del contexto",
      evidence: "Banco de adaptación: situación, acción y resultado",
      connection: "Banco académico: candidatura, carrera y propósito GKS",
      reflection: "Revisión guiada: aprendizaje y siguiente decisión",
    },
    guidance: {
      direct: "Prepara una primera frase de máximo 15 palabras que responda exactamente a la pregunta.",
      evidence: "Selecciona una experiencia real y separa lo que ocurrió, lo que hiciste y el resultado observable.",
      connection: "Explica qué demuestra tu experiencia para el programa, Corea y tu plan académico; no basta con nombrarlos.",
      reflection: "Cierra la experiencia con lo que aprendiste, lo que cambió y la decisión que tomarías ahora.",
    },
    review: "Revisar material seleccionado",
    practise: "Practicar este foco con el chatbot",
    chatbotMaterialTitle: "Refuerza tu prioridad antes de repetir la entrevista",
    chatbotMaterialText: "Abriremos el material con la categoría y la pregunta más útiles para tu resultado actual.",
    chatbotMaterialAction: "Ir al material recomendado",
  },
  en: {
    kicker: "Chatbot + interview material",
    title: "Turn the report into your next practice.",
    introduction: "LearnV links your result to one explanation and one concrete question. Review the criterion, rehearse it in the question bank and return to the interviewer to check your progress.",
    fromChat: "Route created from your latest chatbot report.",
    focusLabel: "Recommended focus",
    focusNames: { direct: "Direct answer", evidence: "Concrete evidence", connection: "GKS connection", reflection: "Personal reflection" },
    materialNames: {
      direct: "Answer method: central point before context",
      evidence: "Adaptation bank: situation, action and result",
      connection: "Academic bank: application, major and GKS purpose",
      reflection: "Guided review: learning and next decision",
    },
    guidance: {
      direct: "Prepare a first sentence of no more than 15 words that answers the question exactly.",
      evidence: "Choose a real experience and separate what happened, what you did and the observable result.",
      connection: "Explain what your experience proves for the programme, Korea and your study plan; naming them is not enough.",
      reflection: "Close the experience with what you learned, what changed and the decision you would make now.",
    },
    review: "Review selected material",
    practise: "Practise this focus with the chatbot",
    chatbotMaterialTitle: "Strengthen your priority before repeating the interview",
    chatbotMaterialText: "We will open the material at the category and question most useful for your current result.",
    chatbotMaterialAction: "Open recommended material",
  },
  ko: {
    kicker: "챗봇 + 면접 학습 자료",
    title: "결과를 다음 연습으로 연결하세요.",
    introduction: "LearnV가 결과를 설명과 구체적인 질문에 연결합니다. 기준을 복습하고 질문 은행에서 연습한 뒤 면접관에게 돌아와 향상 정도를 확인하세요.",
    fromChat: "최근 챗봇 결과에서 만든 학습 경로입니다.",
    focusLabel: "추천 집중 영역",
    focusNames: { direct: "직접적인 답변", evidence: "구체적인 근거", connection: "GKS 연결", reflection: "개인적 성찰" },
    materialNames: {
      direct: "답변 방법: 배경보다 핵심 답변 먼저 말하기",
      evidence: "적응 질문: 상황, 행동과 결과",
      connection: "학업 질문: 지원서, 전공과 GKS 목적",
      reflection: "안내 복습: 배운 점과 다음 결정",
    },
    guidance: {
      direct: "질문에 정확히 답하는 15단어 이내의 첫 문장을 준비하세요.",
      evidence: "실제 경험을 선택하고 상황, 직접 한 행동과 확인 가능한 결과를 구분하세요.",
      connection: "경험이 과정, 한국과 학업 계획에 무엇을 보여 주는지 설명하세요. 이름만 언급해서는 충분하지 않습니다.",
      reflection: "배운 점, 달라진 점과 지금 내릴 결정을 말하며 경험을 마무리하세요.",
    },
    review: "선택한 자료 복습",
    practise: "챗봇으로 이 영역 연습",
    chatbotMaterialTitle: "면접을 다시 하기 전에 우선 과제를 보완하세요",
    chatbotMaterialText: "현재 결과에 가장 유용한 범주와 질문으로 학습 자료를 엽니다.",
    chatbotMaterialAction: "추천 자료 열기",
  },
};
