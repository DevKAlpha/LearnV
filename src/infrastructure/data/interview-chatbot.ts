import type { Locale } from "@/domain/models/i18n";
import type { InterviewSignal } from "@/domain/models/interview-chatbot";

type ChatbotCopy = {
  name: string;
  role: string;
  close: string;
  welcome: string;
  introduction: string;
  sessionPlan: string;
  adaptive: string;
  privacy: string;
  start: string;
  restart: string;
  language: string;
  progress: string;
  target: string;
  placeholder: string;
  send: string;
  continue: string;
  primaryFeedback: string;
  followUpIntro: string;
  nextQuestionIntro: string;
  reportKicker: string;
  reportTitle: string;
  average: string;
  strongest: string;
  priority: string;
  completed: string;
  coverage: string;
  evolution: string;
  actionPlan: string;
  answerFormula: string;
  nextTarget: string;
  notice: string;
  signals: Record<InterviewSignal, string>;
  improvements: Record<InterviewSignal, string>;
};

export const interviewChatbotCopy: Record<Locale, ChatbotCopy> = {
  es: {
    name: "Hanbyeol", role: "Entrevistadora de práctica GKS", close: "Cerrar entrevista",
    welcome: "Practiquemos como en una entrevista real.",
    introduction: "Responderás cuatro preguntas y una repregunta por cada una. Analizaré la estructura de tu respuesta para ayudarte a ser más directa, concreta y coherente.",
    sessionPlan: "4 preguntas · repreguntas adaptativas · resultado final",
    adaptive: "La sesión usa tu progreso de LearnV para priorizar el área que necesita más práctica.",
    privacy: "Tus respuestas no se guardan ni se envían. Solo se registra la puntuación estructural al terminar.",
    start: "Comenzar entrevista", restart: "Practicar otra vez", language: "Idioma de la entrevista",
    progress: "Pregunta", target: "Meta de respuesta · 90 s", placeholder: "Escribe como hablarías ante el panel…",
    send: "Enviar respuesta", continue: "Continuar", primaryFeedback: "Lectura rápida de tu respuesta",
    followUpIntro: "Gracias. Ahora necesito mayor precisión:", nextQuestionIntro: "Pasemos a la siguiente pregunta:",
    reportKicker: "Informe de práctica", reportTitle: "Qué mantener y qué cambiar en tu próxima entrevista.",
    average: "Resultado estructural", strongest: "Fortaleza actual", priority: "Próximo foco", completed: "respuestas analizadas",
    coverage: "Cobertura de la sesión", evolution: "Evolución durante la entrevista", actionPlan: "Plan para la próxima práctica",
    answerFormula: "Fórmula reutilizable", nextTarget: "Objetivo medible",
    notice: "Este prototipo evalúa señales estructurales, no la veracidad, pronunciación ni calidad humana de la candidatura. No predice una selección GKS.",
    signals: { direct: "Respuesta directa", evidence: "Evidencia concreta", connection: "Conexión con GKS", reflection: "Reflexión personal" },
    improvements: {
      direct: "Abre con una respuesta clara antes de explicar el contexto.",
      evidence: "Incluye una acción, un resultado o un dato verificable.",
      connection: "Explica cómo el ejemplo se relaciona con Corea, GKS o tu plan académico.",
      reflection: "Cierra con lo que aprendiste, cambió o harías a continuación.",
    },
  },
  en: {
    name: "Hanbyeol", role: "GKS practice interviewer", close: "Close interview",
    welcome: "Let us practise as if this were a real interview.",
    introduction: "You will answer four questions and one follow-up for each. I will analyse the structure of your response to help you become more direct, specific and coherent.",
    sessionPlan: "4 questions · adaptive follow-ups · final report",
    adaptive: "The session uses your LearnV progress to prioritise the area that needs more practice.",
    privacy: "Your answers are neither saved nor sent. Only the structural score is recorded when you finish.",
    start: "Start interview", restart: "Practise again", language: "Interview language",
    progress: "Question", target: "Response target · 90 s", placeholder: "Write as you would speak to the panel…",
    send: "Send answer", continue: "Continue", primaryFeedback: "Quick reading of your response",
    followUpIntro: "Thank you. I now need more precision:", nextQuestionIntro: "Let us move to the next question:",
    reportKicker: "Practice report", reportTitle: "What to keep and what to change in your next interview.",
    average: "Structural result", strongest: "Current strength", priority: "Next focus", completed: "answers analysed",
    coverage: "Session coverage", evolution: "Progress during the interview", actionPlan: "Plan for your next practice",
    answerFormula: "Reusable answer formula", nextTarget: "Measurable target",
    notice: "This prototype evaluates structural signals, not truthfulness, pronunciation or the human quality of an application. It does not predict GKS selection.",
    signals: { direct: "Direct answer", evidence: "Concrete evidence", connection: "GKS connection", reflection: "Personal reflection" },
    improvements: {
      direct: "Open with a clear answer before explaining the context.",
      evidence: "Add an action, result or verifiable detail.",
      connection: "Explain how the example relates to Korea, GKS or your academic plan.",
      reflection: "Close with what you learned, changed or would do next.",
    },
  },
  ko: {
    name: "한별", role: "GKS 모의 면접관", close: "면접 닫기",
    welcome: "실제 면접처럼 연습해 보겠습니다.",
    introduction: "네 가지 질문과 각 질문의 추가 질문에 답합니다. 더 직접적이고 구체적이며 일관된 답변을 만들도록 답변 구조를 분석합니다.",
    sessionPlan: "질문 4개 · 맞춤 추가 질문 · 최종 결과",
    adaptive: "LearnV 학습 기록을 활용해 가장 연습이 필요한 영역을 우선합니다.",
    privacy: "답변은 저장되거나 전송되지 않습니다. 완료 시 구조 점수만 기록됩니다.",
    start: "면접 시작", restart: "다시 연습", language: "면접 언어",
    progress: "질문", target: "답변 목표 · 90초", placeholder: "면접 위원에게 말하듯 작성하세요…",
    send: "답변 보내기", continue: "계속", primaryFeedback: "답변 구조 빠른 분석",
    followUpIntro: "감사합니다. 이제 더 구체적으로 답해 주세요:", nextQuestionIntro: "다음 질문으로 넘어가겠습니다:",
    reportKicker: "연습 결과", reportTitle: "다음 면접에서 유지할 점과 바꿀 점입니다.",
    average: "구조 결과", strongest: "현재 강점", priority: "다음 집중 영역", completed: "분석한 답변",
    coverage: "세션 기준 충족도", evolution: "면접 중 변화", actionPlan: "다음 연습 계획",
    answerFormula: "재사용 가능한 답변 구조", nextTarget: "측정 가능한 목표",
    notice: "이 프로토타입은 구조적 신호만 확인하며 진실성, 발음이나 지원자의 실제 자질을 평가하지 않습니다. GKS 선발을 예측하지 않습니다.",
    signals: { direct: "직접적인 답변", evidence: "구체적인 근거", connection: "GKS 연결", reflection: "개인적 성찰" },
    improvements: {
      direct: "배경 설명 전에 핵심 답을 먼저 말하세요.",
      evidence: "행동, 결과 또는 확인 가능한 세부 정보를 포함하세요.",
      connection: "예시가 한국, GKS 또는 학업 계획과 어떻게 연결되는지 설명하세요.",
      reflection: "배운 점, 변화 또는 다음 행동으로 답변을 마무리하세요.",
    },
  },
};
