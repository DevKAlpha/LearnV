import type { DocumentItem, GksCertification, GksFact, Source, StudyTask } from "../../domain/models/gks";

export const currentCycle = {
  reference: "GKS-U 2027",
  target: "GKS-U 2027",
  targetStatus: "Convocatoria publicada",
  status: "published" as const,
  verifiedAt: "2026-09-21",
};

export const sources: Source[] = [
  {
    id: "study-in-korea-2027",
    title: "2027 GKS-U Application Guidelines",
    organization: "Study in Korea · NIIED",
    url: "https://www.studyinkorea.go.kr/ko/notice/scholarshipsRead.do?bbsId=BBSMSTR_000000000461&nttId=4522",
    publishedAt: "2026-09-09",
    verifiedAt: "2026-09-21",
  },
  {
    id: "study-in-korea-notices",
    title: "GKS Scholarship Notices",
    organization: "Study in Korea · NIIED",
    url: "https://www.studyinkorea.go.kr/ko/notice/scholarshipsList.do?boardSort=3",
    verifiedAt: "2026-08-21",
  },
  {
    id: "study-in-korea-2026",
    title: "2026 GKS-U Application Guidelines",
    organization: "Study in Korea · NIIED",
    url: "https://www.studyinkorea.go.kr/ko/notice/scholarshipsRead.do?bbsId=BBSMSTR_000000000461&boardSort=3&nttId=4385",
    publishedAt: "2025-09-05",
    verifiedAt: "2026-08-21",
  },
  {
    id: "niied-2027",
    title: "Encuesta de universidades participantes GKS-U 2027",
    organization: "NIIED",
    url: "https://www.niied.go.kr/web/main/nid/niied_board/5745",
    publishedAt: "2026-06-22",
    verifiedAt: "2026-08-21",
  },
  {
    id: "niied-overview",
    title: "GKS Degree Program",
    organization: "NIIED",
    url: "https://www.niied.go.kr/web/niied/contents/niiedEng/eng_gksDegree",
    verifiedAt: "2026-08-21",
  },
  {
    id: "topik-official",
    title: "Language Proficiency Requirements & TOPIK",
    organization: "Study in Korea · NIIED",
    url: "https://www.studyinkorea.go.kr/ko/plan/examAndKoreanStudy.do",
    verifiedAt: "2026-08-21",
  },
  {
    id: "toefl-official",
    title: "TOEFL iBT Score Breakdown",
    organization: "ETS",
    url: "https://www.ets.org/toefl/test-takers/ibt/scores/understand-scores.html",
    verifiedAt: "2026-09-21",
  },
  {
    id: "ielts-official",
    title: "IELTS scoring in detail",
    organization: "IELTS",
    url: "https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail",
    verifiedAt: "2026-09-21",
  },
  {
    id: "apostille-spain",
    title: "Legalización única o Apostilla de La Haya",
    organization: "Ministerio de Justicia de España",
    url: "https://www.mjusticia.gob.es/es/ciudadania/tramites/legalizacion-unica-apostilla",
    verifiedAt: "2026-08-21",
  },
  {
    id: "spain-embassy-notices",
    title: "Avisos oficiales de la Embajada en España",
    organization: "Embajada de la República de Corea en España",
    url: "https://overseas.mofa.go.kr/es-es/brd/m_8065/list.do",
    verifiedAt: "2026-08-23",
  },
];

export const gksCertifications: GksCertification[] = [
  {
    id: "topik",
    icon: "한",
    priority: "highest",
    sourceId: "study-in-korea-2027",
    scoreBands: [
      { score: "TOPIK 5–6", weight: "100% + 5%" },
      { score: "TOPIK 4", weight: "90% + 4%" },
      { score: "TOPIK 3", weight: "80% + 3%" },
      { score: "TOPIK 2", weight: "70%" },
      { score: "TOPIK 1", weight: "60%" },
    ],
  },
  {
    id: "toefl",
    icon: "T",
    priority: "high",
    sourceId: "toefl-official",
    scoreBands: [
      { score: "114+ / 6.0", weight: "90%" },
      { score: "95+ / 5.0+", weight: "80%" },
      { score: "72+ / 4.0+", weight: "70%" },
      { score: "44+ / 3.0+", weight: "60%" },
    ],
  },
  {
    id: "ielts",
    icon: "I",
    priority: "high",
    sourceId: "ielts-official",
    scoreBands: [
      { score: "IELTS 8.0+", weight: "90%" },
      { score: "IELTS 7.0+", weight: "80%" },
      { score: "IELTS 6.0+", weight: "70%" },
      { score: "IELTS 5.0+", weight: "60%" },
    ],
  },
  {
    id: "supporting",
    icon: "★",
    priority: "supporting",
    sourceId: "study-in-korea-2027",
    scoreBands: [],
  },
];

export const keyFacts: GksFact[] = [
  {
    id: "spain-track",
    label: "Ruta desde España",
    value: "UIC",
    detail:
      "España no figuró entre los 71 países de vía Embajada en 2026. Para ciudadanía española, UIC fue la vía abierta a todas las nacionalidades.",
    icon: "↗",
    status: "historical",
    sourceId: "study-in-korea-2026",
  },
  {
    id: "grade",
    label: "Rendimiento mínimo",
    value: "80%",
    detail: "También se admitía estar dentro del 20% superior de la promoción.",
    icon: "◎",
    status: "historical",
    sourceId: "niied-overview",
  },
  {
    id: "age",
    label: "Edad de referencia",
    value: "< 25",
    detail: "La edad se calcula para cada convocatoria; no debe asumirse sin revisar la guía vigente.",
    icon: "◷",
    status: "historical",
    sourceId: "niied-overview",
  },
  {
    id: "topik",
    label: "Meta competitiva",
    value: "TOPIK 4 / 5",
    detail: "La preparación parte de TOPIK I y avanza primero hacia nivel 3. En 2026, TOPIK 3+ aportó puntuación adicional.",
    icon: "한",
    status: "historical",
    sourceId: "study-in-korea-2026",
  },
];

export const eligibilityRules = [
  "La estudiante y sus padres no deben tener ciudadanía coreana.",
  "Debe haber terminado bachillerato o graduarse dentro del plazo de la convocatoria.",
  "Debe cumplir la edad máxima y el rendimiento académico del ciclo vigente.",
];

export const targetPrograms = [
  { id: "international-business", category: "business", tone: "blue" },
  { id: "global-business", category: "business", tone: "yellow" },
  { id: "medical-it", category: "health", tone: "pink" },
  { id: "health-sciences", category: "health", tone: "green" },
] as const;

export const dailyTasks: StudyTask[] = [
  {
    id: "topik-reading-01",
    title: "Puente TOPIK I → II · lectura",
    meta: "Vocabulario, conectores y 5 preguntas graduadas",
    category: "topik",
    duration: 20,
  },
  {
    id: "english-writing-01",
    title: "English · argumento académico",
    meta: "B2 → C1 · cohesión y evidencia",
    category: "english",
    duration: 25,
  },
  {
    id: "gks-story-01",
    title: "Banco de evidencias personal",
    meta: "Logros que respaldan tu Personal Statement",
    category: "application",
    duration: 15,
  },
];

export const documents: DocumentItem[] = [
  {
    id: "application",
    label: "Formulario de solicitud",
    detail: "Debe completarse en inglés o coreano y firmarse según la convocatoria.",
    required: true,
  },
  {
    id: "personal-statement",
    label: "Personal Statement",
    detail: "Historia, motivación, preparación y vínculo verificable con el objetivo académico.",
    required: true,
  },
  {
    id: "study-plan",
    label: "Study Plan",
    detail: "Plan de idioma, objetivos académicos y plan posterior a la graduación.",
    required: true,
  },
  {
    id: "family",
    label: "Ciudadanía y relación familiar",
    detail: "Documentos de la estudiante y de sus padres.",
    required: true,
    needsApostille: true,
    needsTranslation: true,
  },
  {
    id: "graduation",
    label: "Certificado de graduación",
    detail: "O certificado oficial de graduación prevista cuando la guía lo permita.",
    required: true,
    needsApostille: true,
    needsTranslation: true,
  },
  {
    id: "transcript",
    label: "Expediente académico",
    detail: "No convertir informalmente la escala española de 0–10.",
    required: true,
    needsApostille: true,
    needsTranslation: true,
  },
  {
    id: "language",
    label: "TOPIK / IELTS / TOEFL",
    detail: "Opcional en la guía general 2027, pero puntúa y una universidad o carrera puede exigir un mínimo.",
    required: false,
  },
];

export const languageBands = {
  topik: [
    { label: "TOPIK I", score: "Nivel 1–2", note: "Punto de partida: escucha y lectura básica" },
    { label: "Puente TOPIK II", score: "Nivel 3", note: "Primera meta: escritura y textos intermedios" },
    { label: "Meta posterior", score: "Nivel 4 / 5", note: "Objetivo competitivo tras consolidar el puente" },
  ],
  english: [
    { label: "Punto de partida", score: "B1 / B2", note: "Consolidar precisión, fluidez y vocabulario" },
    { label: "Meta intermedia", score: "B2", note: "Producción académica independiente" },
    { label: "Meta principal", score: "C1", note: "Comunicación académica avanzada" },
  ],
};
