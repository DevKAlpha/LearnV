import type { LocalizedText } from "../../domain/models/i18n";

export type WrittenQuestion = {
  id: string;
  prompt: LocalizedText;
  options: LocalizedText[];
  correct: number;
  explanation: LocalizedText;
};

export const writtenSimulatorQuestions: WrittenQuestion[] = [
  {
    id: "official-format",
    prompt: {
      es: "¿Qué describe mejor la parte escrita común de GKS-U 2026?",
      en: "What best describes the common written component of 2026 GKS-U?",
      ko: "2026 GKS-U의 공통 서면 준비를 가장 정확히 설명한 것은 무엇입니까?",
    },
    options: [
      { es: "Un examen nacional idéntico para todos", en: "One national exam for every applicant", ko: "모든 지원자가 보는 동일한 국가시험" },
      { es: "Personal Statement y Study Plan dentro de la candidatura", en: "A Personal Statement and Study Plan within the application", ko: "지원서의 자기소개서와 학업계획서" },
      { es: "Solo una prueba de gramática coreana", en: "Only a Korean grammar test", ko: "한국어 문법시험만 실시" },
    ],
    correct: 1,
    explanation: {
      es: "La guía define textos de candidatura; no establece una prueba escrita nacional única.",
      en: "The guide defines application essays; it does not establish one national written test.",
      ko: "요강은 지원서의 서술 항목을 정하며, 단일 국가 필기시험을 규정하지 않습니다.",
    },
  },
  {
    id: "writing-language",
    prompt: {
      es: "¿En qué idioma se completan el Personal Statement y el Study Plan?",
      en: "Which language is used for the Personal Statement and Study Plan?",
      ko: "자기소개서와 학업계획서는 어떤 언어로 작성합니까?",
    },
    options: [
      { es: "Solo español", en: "Spanish only", ko: "스페인어만" },
      { es: "Inglés o coreano", en: "English or Korean", ko: "영어 또는 한국어" },
      { es: "Cualquier idioma sin traducción", en: "Any language without translation", ko: "번역 없이 모든 언어" },
    ],
    correct: 1,
    explanation: {
      es: "El formulario oficial admite inglés o coreano para estos textos.",
      en: "The official form accepts English or Korean for these essays.",
      ko: "공식 지원서는 해당 글을 영어 또는 한국어로 작성하도록 안내합니다.",
    },
  },
  {
    id: "character-limit",
    prompt: {
      es: "¿Qué límite de referencia indica la guía, incluyendo espacios?",
      en: "What reference limit does the guide state, including spaces?",
      ko: "공백을 포함한 기준 글자 수 제한은 무엇입니까?",
    },
    options: [
      { es: "3.000 en coreano / 5.000 en inglés", en: "3,000 in Korean / 5,000 in English", ko: "한국어 3,000자 / 영어 5,000자" },
      { es: "5.000 palabras en ambos", en: "5,000 words in both", ko: "두 언어 모두 5,000단어" },
      { es: "No existe límite", en: "There is no limit", ko: "제한 없음" },
    ],
    correct: 0,
    explanation: {
      es: "Son caracteres, no palabras, y los espacios cuentan.",
      en: "These are character limits, not word limits, and spaces count.",
      ko: "단어 수가 아니라 글자 수이며 공백도 포함됩니다.",
    },
  },
  {
    id: "evidence",
    prompt: {
      es: "¿Cómo se fortalece una experiencia mencionada en el Personal Statement?",
      en: "How should an experience in the Personal Statement be strengthened?",
      ko: "자기소개서에 쓴 경험은 어떻게 강화할 수 있습니까?",
    },
    options: [
      { es: "Con frases generales y emocionales", en: "With general emotional claims", ko: "일반적이고 감정적인 표현으로" },
      { es: "Con una acción, resultado y evidencia verificable cuando exista", en: "With an action, result and verifiable evidence when available", ko: "행동, 결과, 가능한 경우 확인 가능한 증빙으로" },
      { es: "Repitiendo el mismo logro varias veces", en: "By repeating the same achievement", ko: "같은 성과를 반복해서" },
    ],
    correct: 1,
    explanation: {
      es: "La guía recomienda documentos complementarios que respalden lo afirmado.",
      en: "The guide recommends supplementary documents that support stated claims.",
      ko: "요강은 작성한 내용을 뒷받침하는 추가 자료 제출을 권장합니다.",
    },
  },
  {
    id: "study-plan",
    prompt: {
      es: "¿Qué hace que un Study Plan sea coherente?",
      en: "What makes a Study Plan coherent?",
      ko: "일관된 학업계획서의 조건은 무엇입니까?",
    },
    options: [
      { es: "Nombrar una universidad sin explicar objetivos", en: "Naming a university without explaining goals", ko: "목표 설명 없이 대학 이름만 제시" },
      { es: "Conectar plan lingüístico, meta académica, acciones y proyección", en: "Connecting language plan, academic goal, actions and future direction", ko: "언어 계획, 학업 목표, 실행 방법과 향후 진로를 연결" },
      { es: "Prometer resultados imposibles de comprobar", en: "Promising unverifiable outcomes", ko: "확인할 수 없는 결과를 약속" },
    ],
    correct: 1,
    explanation: {
      es: "El plan debe explicar cómo la preparación lingüística permite ejecutar objetivos académicos concretos.",
      en: "The plan should show how language preparation enables concrete academic goals.",
      ko: "언어 준비가 구체적인 학업 목표 실행으로 어떻게 이어지는지 보여야 합니다.",
    },
  },
];

export const writtenSimulatorCorrectAnswers = Object.fromEntries(
  writtenSimulatorQuestions.map((question) => [question.id, question.correct]),
);

export const writtenSimulatorRubricIds = [
  "direct",
  "evidence",
  "major",
  "language",
  "specific",
  "consistent",
] as const;
