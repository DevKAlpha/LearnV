import type { Locale } from "@/domain/models/i18n";
import type { InterviewStage } from "@/domain/models/interview-chatbot";

/** GKS-U only. Source review, not an application deadline or a live eligibility check. */
export const interview2027 = {
  reviewedAt: "2026-10-23",
  noticeUrl: "https://www.studyinkorea.go.kr/ko/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4522",
  guideUrl: "https://www.pcu.ac.kr/download/viewer/20261023/1792726976602/index.html",
  embassyUrl: "https://overseas.mofa.go.kr/es-es/brd/m_8065/list.do",
} as const;

type PreparationCopy = {
  title: string; badge: string; reviewed: string; source: string; guide: string; embassy: string;
  scope: string; practice: string; timer: string; context: string;
  changeWarning: string; keepLanguage: string; restartLanguage: string;
  cards: Record<InterviewStage, { title: string; text: string }>;
};
export const interview2027Copy: Record<Locale, PreparationCopy> = {
  es: {
    title: "Tu expediente, tu propia voz", badge: "GKS-U 2027 · preparación", reviewed: "Fuentes revisadas", source: "Guía, formularios y universidades 2027", guide: "Guía 2027 · sección V, evaluación", embassy: "Embajada de Corea en España · avisos",
    scope: "La convocatoria GKS-U 2027 incluye guía, formularios y listado de universidades. Comprueba tu vía y la comunicación de tu embajada o universidad: aquí no se confirman plazos, cupos ni elegibilidad personal.",
    practice: "Simulación LearnV, no entrevista oficial. Las cuatro preguntas, los 90 segundos y la puntuación estructural son herramientas de práctica, no criterios ni tiempos oficiales de GKS.",
    timer: "Tiempo de práctica · orientativo", context: "Conecta con tu expediente",
    changeWarning: "Cambiar el idioma inicia otra entrevista y descarta esta conversación y tu borrador.", keepLanguage: "Seguir aquí", restartLanguage: "Cambiar y reiniciar",
    cards: {
      motivation: { title: "Personal Statement", text: "Elige una experiencia real de tu escrito. Explica qué hiciste y por qué confirma tu motivación; no memorices un discurso ajeno." },
      academic: { title: "Study Plan + universidad", text: "Contrasta carrera y universidad con University Information 2027. Une un curso concreto, un hito de idioma y una forma de medir tu avance." },
      adaptation: { title: "Idioma y adaptación", text: "Distingue tu nivel actual, los certificados que realmente tienes y tus metas. Explica cómo pedirías ayuda ante una dificultad." },
      contribution: { title: "Evidencia y contribución", text: "Relaciona una acción y su resultado con una contribución futura realista. Usa datos coherentes con tus documentos, sin inventar logros." },
    },
  },
  en: {
    title: "Your application, your own voice", badge: "GKS-U 2027 · preparation", reviewed: "Sources reviewed", source: "2027 guidelines, forms and universities", guide: "2027 guide · section V, evaluation", embassy: "Korean Embassy in Spain · notices",
    scope: "The GKS-U 2027 notice includes guidelines, forms and university information. Check your track and embassy or university instructions: this is not a confirmation of deadlines, quotas or personal eligibility.",
    practice: "LearnV simulation, not an official interview. Four questions, 90 seconds and structural scores are practice tools, not official GKS criteria or timing.",
    timer: "Practice time · guidance only", context: "Connect to your application",
    changeWarning: "Changing language starts another interview and discards this conversation and your draft.", keepLanguage: "Stay here", restartLanguage: "Change and restart",
    cards: {
      motivation: { title: "Personal Statement", text: "Choose a real experience from your statement. Explain your action and how it confirms your motivation; do not memorise someone else's speech." },
      academic: { title: "Study Plan + university", text: "Check your major and university against University Information 2027. Connect one course, a language milestone and a way to measure progress." },
      adaptation: { title: "Language and adaptation", text: "Separate your current level, certificates you actually hold and future targets. Explain how you would seek help when facing a difficulty." },
      contribution: { title: "Evidence and contribution", text: "Link an action and its outcome to a realistic future contribution. Keep details consistent with your documents; do not invent achievements." },
    },
  },
  ko: {
    title: "지원서에서 나의 목소리로", badge: "GKS-U 2027 · 준비", reviewed: "출처 확인일", source: "2027 모집 요강·서식·대학 정보", guide: "2027 요강 · V장 평가", embassy: "주스페인 대한민국대사관 · 공지",
    scope: "GKS-U 2027 공지에는 요강, 서식과 대학 정보가 있습니다. 전형과 대사관·대학 안내를 확인하세요. 여기서는 마감일, 인원이나 개인의 지원 자격을 확정하지 않습니다.",
    practice: "공식 면접이 아닌 LearnV 모의 연습입니다. 질문 네 개, 90초와 구조 점수는 연습 도구이며 GKS 공식 기준이나 면접 시간이 아닙니다.",
    timer: "연습 시간 · 참고용", context: "지원서와 연결하기",
    changeWarning: "언어를 바꾸면 새 면접이 시작되며 현재 대화와 초안이 사라집니다.", keepLanguage: "계속하기", restartLanguage: "언어 변경 후 다시 시작",
    cards: {
      motivation: { title: "자기소개서", text: "자기소개서의 실제 경험을 고르세요. 한 행동과 지원 동기를 연결하고 다른 사람의 답변을 외우지 마세요." },
      academic: { title: "학업계획서 + 대학", text: "2027 대학 정보에서 전공과 대학을 확인하세요. 과목 하나, 언어 학습 목표와 진도 확인 방법을 연결하세요." },
      adaptation: { title: "언어와 적응", text: "현재 수준, 실제 보유 성적과 앞으로의 목표를 구별하세요. 어려움이 생기면 어떻게 도움을 요청할지 설명하세요." },
      contribution: { title: "근거와 기여", text: "행동과 결과를 현실적인 향후 기여로 연결하세요. 서류와 일치하는 사실을 쓰고 실적을 만들지 마세요." },
    },
  },
};
