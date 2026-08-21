import type { LocalizedText } from "../../domain/models/i18n";

export type InterviewQuestion = {
  id: string;
  category: "motivation" | "academic" | "adaptation" | "contribution";
  question: LocalizedText;
  purpose: LocalizedText;
  followUp: LocalizedText;
};

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "introduce-yourself", category: "motivation",
    question: { es: "Preséntate y explica qué hilo conecta tu experiencia con tu carrera elegida.", en: "Introduce yourself and explain the thread connecting your experience to your intended major.", ko: "자기소개를 하고 자신의 경험과 지원 전공을 연결하는 핵심을 설명하세요." },
    purpose: { es: "Síntesis, coherencia y una identidad académica concreta.", en: "Synthesis, coherence and a concrete academic identity.", ko: "종합 능력, 일관성과 구체적인 학업 정체성을 확인합니다." },
    followUp: { es: "¿Qué experiencia concreta cambió o confirmó esa decisión?", en: "Which concrete experience changed or confirmed that decision?", ko: "그 결정을 바꾸거나 확신하게 한 구체적인 경험은 무엇입니까?" },
  },
  {
    id: "why-korea", category: "motivation",
    question: { es: "¿Por qué Corea es necesaria para tu objetivo académico y no solo atractiva personalmente?", en: "Why is Korea necessary for your academic goal, rather than only personally attractive?", ko: "한국이 개인적으로 매력적인 것을 넘어 학업 목표에 필요한 이유는 무엇입니까?" },
    purpose: { es: "Motivación académica específica, sin depender de cultura popular.", en: "Specific academic motivation that does not depend on popular culture.", ko: "대중문화에만 의존하지 않는 구체적인 학업 동기를 확인합니다." },
    followUp: { es: "Nombra un curso, entorno o problema de estudio que respalde tu elección.", en: "Name one course, setting or study problem that supports your choice.", ko: "선택을 뒷받침하는 과목, 환경 또는 연구 문제를 하나 말하세요." },
  },
  {
    id: "why-major", category: "academic",
    question: { es: "¿Por qué Negocios Internacionales o el campo de Medicina/Salud que finalmente valides?", en: "Why International Business or the Medicine/Health field you ultimately validate?", ko: "최종 확인한 국제경영 또는 의학·보건 분야를 선택한 이유는 무엇입니까?" },
    purpose: { es: "Encaje entre preparación previa, capacidades y plan futuro.", en: "Fit between prior preparation, abilities and future plan.", ko: "기존 준비, 역량과 미래 계획의 적합성을 확인합니다." },
    followUp: { es: "¿Qué evidencia demuestra que conoces las exigencias de ese campo?", en: "What evidence shows that you understand the demands of that field?", ko: "그 분야의 요구를 이해한다는 것을 어떤 근거로 보여 줄 수 있습니까?" },
  },
  {
    id: "academic-weakness", category: "academic",
    question: { es: "¿Qué debilidad académica real debes corregir antes de comenzar y cómo la estás midiendo?", en: "Which real academic weakness must you address before starting, and how are you measuring it?", ko: "입학 전에 보완해야 할 실제 학업 약점은 무엇이며 어떻게 측정하고 있습니까?" },
    purpose: { es: "Autoconocimiento, responsabilidad y plan verificable.", en: "Self-awareness, responsibility and a verifiable plan.", ko: "자기 인식, 책임감과 확인 가능한 계획을 봅니다." },
    followUp: { es: "¿Qué resultado concreto esperas alcanzar en tres meses?", en: "What concrete result do you expect to reach in three months?", ko: "3개월 안에 어떤 구체적인 결과를 달성하려고 합니까?" },
  },
  {
    id: "study-plan", category: "academic",
    question: { es: "Resume tu plan de idioma y tu primer año académico en tres hitos.", en: "Summarise your language plan and first academic year in three milestones.", ko: "언어 학습 계획과 첫 학년 계획을 세 가지 이정표로 요약하세요." },
    purpose: { es: "Secuencia, realismo y conocimiento del programa.", en: "Sequence, realism and knowledge of the programme.", ko: "계획의 순서, 현실성과 과정 이해도를 확인합니다." },
    followUp: { es: "¿Qué harías si no alcanzas el primer hito a tiempo?", en: "What would you do if you did not reach the first milestone on time?", ko: "첫 번째 목표를 제때 달성하지 못하면 어떻게 하겠습니까?" },
  },
  {
    id: "language-plan", category: "academic",
    question: { es: "Partiendo de TOPIK I y de inglés B1/B2, ¿cómo avanzarás hacia TOPIK II y C1?", en: "Starting from TOPIK I and B1/B2 English, how will you progress toward TOPIK II and C1?", ko: "TOPIK I과 영어 B1/B2에서 시작해 TOPIK II와 C1을 어떻게 준비하겠습니까?" },
    purpose: { es: "Plan medible y consciente del punto de partida real.", en: "A measurable plan grounded in the real starting point.", ko: "실제 시작 수준을 반영한 측정 가능한 계획인지 확인합니다." },
    followUp: { es: "¿Qué harás semanalmente para comprobar comprensión y producción?", en: "What will you do weekly to check comprehension and production?", ko: "이해와 표현을 확인하기 위해 매주 무엇을 하겠습니까?" },
  },
  {
    id: "culture-shock", category: "adaptation",
    question: { es: "Describe un posible choque cultural o académico y cómo responderías sin aislarte.", en: "Describe a possible cultural or academic adjustment challenge and how you would respond without isolating yourself.", ko: "문화적 또는 학업적 적응 문제와 고립되지 않고 대응할 방법을 설명하세요." },
    purpose: { es: "Adaptabilidad, búsqueda de ayuda y expectativas realistas.", en: "Adaptability, help-seeking and realistic expectations.", ko: "적응력, 도움 요청 능력과 현실적인 기대를 확인합니다." },
    followUp: { es: "¿A quién pedirías ayuda primero y por qué?", en: "Who would you ask for help first, and why?", ko: "가장 먼저 누구에게 도움을 요청하며 그 이유는 무엇입니까?" },
  },
  {
    id: "pressure", category: "adaptation",
    question: { es: "Cuéntanos una situación de presión, tu acción y lo que cambiarías hoy.", en: "Tell us about a high-pressure situation, your action and what you would change today.", ko: "압박이 큰 상황에서 한 행동과 지금 바꾸고 싶은 점을 말하세요." },
    purpose: { es: "Evidencia conductual y reflexión, no perfección.", en: "Behavioural evidence and reflection, not perfection.", ko: "완벽함이 아니라 행동 근거와 성찰을 확인합니다." },
    followUp: { es: "¿Qué señal te indicaría que necesitas modificar tu estrategia?", en: "What signal would tell you that your strategy needs to change?", ko: "전략을 바꿔야 한다는 신호는 무엇입니까?" },
  },
  {
    id: "conflict", category: "adaptation",
    question: { es: "Explica un desacuerdo de equipo sin culpar a otra persona.", en: "Explain a team disagreement without blaming another person.", ko: "다른 사람을 탓하지 않고 팀 내 의견 차이를 설명하세요." },
    purpose: { es: "Comunicación, responsabilidad compartida y resolución.", en: "Communication, shared responsibility and resolution.", ko: "의사소통, 공동 책임과 해결 능력을 확인합니다." },
    followUp: { es: "¿Qué dato o criterio ayudó a tomar una decisión?", en: "Which fact or criterion helped the team decide?", ko: "어떤 정보나 기준이 결정에 도움이 되었습니까?" },
  },
  {
    id: "spain-korea", category: "contribution",
    question: { es: "¿Cómo aplicarías tus estudios a una necesidad concreta entre España y Corea?", en: "How would you apply your studies to a concrete need between Spain and Korea?", ko: "학업 내용을 스페인과 한국 사이의 구체적인 필요에 어떻게 적용하겠습니까?" },
    purpose: { es: "Contribución bilateral específica y proporcional a una estudiante de pregrado.", en: "A specific bilateral contribution proportionate to an undergraduate applicant.", ko: "학부 지원자 수준에 맞는 구체적인 양국 기여를 확인합니다." },
    followUp: { es: "¿Cuál sería un primer proyecto pequeño y medible?", en: "What would be one small, measurable first project?", ko: "작고 측정 가능한 첫 프로젝트는 무엇입니까?" },
  },
  {
    id: "return-plan", category: "contribution",
    question: { es: "¿Qué harás después de graduarte y cómo se conecta con el propósito de GKS?", en: "What will you do after graduation, and how does it connect to the purpose of GKS?", ko: "졸업 후 무엇을 할 것이며 그것이 GKS의 목적과 어떻게 연결됩니까?" },
    purpose: { es: "Continuidad entre formación, carrera y cooperación internacional.", en: "Continuity between education, career and international cooperation.", ko: "학업, 진로와 국제 협력의 연속성을 확인합니다." },
    followUp: { es: "¿Cómo evitarás que ese objetivo quede en una promesa general?", en: "How will you prevent that goal from remaining a general promise?", ko: "그 목표가 일반적인 약속에 머물지 않게 하려면 어떻게 하겠습니까?" },
  },
  {
    id: "not-selected", category: "contribution",
    question: { es: "Si no eres seleccionada este ciclo, ¿qué parte del plan continuará de todos modos?", en: "If you are not selected this cycle, which part of your plan will continue anyway?", ko: "이번에 선발되지 않아도 어떤 계획을 계속할 것입니까?" },
    purpose: { es: "Motivación sostenible, madurez y alternativas responsables.", en: "Sustainable motivation, maturity and responsible alternatives.", ko: "지속 가능한 동기, 성숙함과 책임 있는 대안을 확인합니다." },
    followUp: { es: "¿Qué evidencia nueva presentarías en una próxima candidatura?", en: "What new evidence would you bring to a future application?", ko: "다음 지원에서 어떤 새로운 근거를 제시하겠습니까?" },
  },
];

export const interviewTips: LocalizedText[] = [
  { es: "Responde primero y explica después: una idea central debe oírse en los primeros 15 segundos.", en: "Answer first and explain second: the central point should be audible within 15 seconds.", ko: "먼저 답하고 설명하세요. 핵심은 첫 15초 안에 들려야 합니다." },
  { es: "Usa evidencia breve: contexto, acción, resultado y vínculo con el objetivo.", en: "Use brief evidence: context, action, result and relevance to the goal.", ko: "맥락, 행동, 결과와 목표 연결을 짧은 근거로 제시하세요." },
  { es: "Conoce cada afirmación de tu Personal Statement y Study Plan; el panel puede pedir precisión.", en: "Know every claim in your Personal Statement and Study Plan; the panel may ask for precision.", ko: "자기소개서와 학업계획서의 모든 주장을 알고 있어야 합니다. 구체적인 질문이 나올 수 있습니다." },
  { es: "No inventes. Si no conoces un dato, delimita lo que sabes y explica cómo lo verificarías.", en: "Do not invent. If you do not know a fact, state what you know and how you would verify it.", ko: "모르는 내용을 만들지 말고 아는 범위와 확인 방법을 설명하세요." },
  { es: "Practica respuestas de 45, 75 y 120 segundos para ajustar profundidad sin perder estructura.", en: "Practise 45-, 75- and 120-second answers to adjust depth without losing structure.", ko: "구조를 유지하며 깊이를 조절하도록 45초, 75초, 120초 답변을 연습하세요." },
  { es: "Prepara el entorno: cámara a la altura de los ojos, audio probado, conexión y copia de la candidatura.", en: "Prepare the setting: eye-level camera, tested audio, connection and a copy of the application.", ko: "눈높이 카메라, 음향, 연결 상태와 지원서 사본을 미리 준비하세요." },
  { es: "Una entrevista puede ser online, presencial y en inglés o coreano según la institución; espera la comunicación oficial.", en: "An interview may be online, in person, and in English or Korean depending on the institution; wait for official instructions.", ko: "기관에 따라 온라인 또는 대면, 영어 또는 한국어로 진행될 수 있으므로 공식 안내를 기다리세요." },
  { es: "La experiencia de otra becaria orienta, pero nunca sustituye la guía ni las instrucciones de la Embajada o universidad.", en: "Another scholar's experience can guide you, but never replaces the guidelines or Embassy/university instructions.", ko: "다른 장학생의 경험은 참고 자료이며 공식 요강이나 대사관·대학 안내를 대신하지 않습니다." },
];

