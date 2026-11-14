import type { CyclePhaseId, NextActionId } from "@/domain/models/gks-cycle";
import type { DeclaredEnglish, DeclaredKorean, Track } from "@/domain/models/applicant-profile";
import type { LevelBand } from "@/domain/models/measured-level";

type ActionCopy = { title: string; text: string; cta: string };
type CycleCopy = {
  kicker: string;
  cycle: (year: number) => string;
  here: string;
  estimated: string;
  confirmed: string;
  daysToCall: (days: number) => string;
  phases: Record<CyclePhaseId, { title: string; text: string }>;
  actions: Record<NextActionId, ActionCopy>;
  statusLabel: string;
  preparing: string;
  applied: string;
  estimateNote: string;
  timelineTitle: string;
};

type ProfileCopy = {
  editorTitle: string;
  editorIntro: string;
  major: string;
  majorPlaceholder: string;
  majorEmpty: string;
  track: string;
  tracks: Record<Track, string>;
  trackNote: string;
  birthDate: string;
  birthHelp: string;
  ageOk: (age: number, cutoff: string, year: number) => string;
  ageOver: (age: number, cutoff: string, year: number) => string;
  ageLast: (year: number) => string;
  ageSource: string;
  declaredKorean: string;
  declaredEnglish: string;
  koreanLevels: Record<DeclaredKorean, string>;
  englishLevels: Record<DeclaredEnglish, string>;
  levelsTitle: string;
  declared: string;
  measured: string;
  measuredNote: string;
  koreanBands: Record<LevelBand, string>;
  englishBands: Record<LevelBand, string>;
  reach: (reach: number, passed: number) => string;
  privacy: string;
};

type DocumentsCopy = {
  deadlineTitle: (year: number) => string;
  deadlineText: (date: string) => string;
  startBy: (date: string) => string;
  addToBoard: string;
  added: string;
  boardFull: string;
  boardTask: (label: string) => string;
};

type RadarCopy = {
  sourcesTitle: string;
  ok: string;
  failed: string;
  changed: string;
  official: string;
  historical: string;
  practice: string;
  kinds: string;
};

export type GksProfileCopy = { cycle: CycleCopy; profile: ProfileCopy; documents: DocumentsCopy; radar: RadarCopy };

const es: GksProfileCopy = {
  cycle: {
    kicker: "Tu ciclo GKS",
    cycle: (year) => `GKS-U ${year}`,
    here: "Estás aquí",
    estimated: "fecha estimada",
    confirmed: "confirmada en la guía",
    daysToCall: (days) => days > 0 ? `Faltan unos ${days} días para la convocatoria.` : "La convocatoria ya está publicada.",
    phases: {
      preparation: { title: "Preparación", text: "Idiomas, documentos y borradores antes de la convocatoria." },
      call: { title: "Convocatoria", text: "NIIED publica la guía, los formularios y las universidades." },
      application: { title: "Solicitud", text: "Entrega del expediente a la universidad o a la embajada." },
      "first-round": { title: "Primera ronda", text: "Revisión de documentos y entrevistas." },
      "second-round": { title: "Segunda ronda", text: "NIIED revisa a los candidatos propuestos." },
      results: { title: "Resultados", text: "Publicación de los becarios seleccionados." },
      "pre-departure": { title: "Antes de viajar", text: "Visado, revisión médica y llegada a Corea." },
    },
    actions: {
      "language-exam": { title: "Prioridad: tu certificado de idioma", text: "Los certificados tardan más que nada: elige fecha de TOPIK o IELTS y prepara la prueba con tiempo.", cta: "Ir a estudiar" },
      documents: { title: "Prioridad: documentos oficiales", text: "Apostillas y traducciones juradas tardan semanas. Empieza por los que dependen de otros.", cta: "Ver documentos" },
      drafts: { title: "Prioridad: tus borradores", text: "Personal Statement y Study Plan: escribe, revisa y vuelve a escribir antes de que abra la convocatoria.", cta: "Abrir el simulador escrito" },
      "read-guide": { title: "Lee la guía nueva", text: "Comprueba vía, plazos, universidades y requisitos de tu carrera en la guía oficial.", cta: "Abrir la fuente oficial" },
      submit: { title: "Completa y entrega el expediente", text: "Revisa cada documento con la lista y respeta el plazo de tu universidad.", cta: "Ver documentos" },
      interview: { title: "Prepara la entrevista", text: "Practica respuestas con ejemplos concretos y tu plan de estudios.", cta: "Practicar entrevista" },
      "keep-practising": { title: "Mantén el ritmo", text: "Mientras esperas, sigue con el coreano: te servirá en cualquier resultado.", cta: "Repaso diario" },
      "check-results": { title: "Consulta los resultados", text: "Revisa los avisos oficiales y tu correo.", cta: "Ver la beca" },
      "pre-departure": { title: "Prepara el viaje", text: "Visado, revisión médica y guía de vida de becario.", cta: "Ver la beca" },
    },
    statusLabel: "¿En qué punto estás?",
    preparing: "Me preparo para la próxima convocatoria",
    applied: "Ya presenté la solicitud",
    estimateNote: "Las fechas estimadas se basan en ciclos anteriores. Cada universidad y embajada fija las suyas: confírmalas en la guía oficial.",
    timelineTitle: "Línea temporal del ciclo",
  },
  profile: {
    editorTitle: "Tu perfil de candidatura",
    editorIntro: "Con estos datos LearnV adapta la línea temporal, los avisos y los niveles. Se guardan solo en este dispositivo.",
    major: "Carrera que quieres estudiar",
    majorPlaceholder: "Ej.: Ingeniería de materiales",
    majorEmpty: "Sin definir",
    track: "Vía de solicitud",
    tracks: { undecided: "Aún no lo sé", university: "Vía universidad", embassy: "Vía embajada" },
    trackNote: "En 2026, España no estaba entre los países de la vía embajada: para candidaturas desde España, la vía universidad era la opción abierta. Compruébalo en cada guía.",
    birthDate: "Fecha de nacimiento",
    birthHelp: "Solo para comprobar el límite de edad. No sale de este dispositivo.",
    ageOk: (age, cutoff, year) => `Cumples el límite de edad para GKS-U ${year}: tendrás ${age} años el ${cutoff}.`,
    ageOver: (age, cutoff, year) => `Superas el límite de edad para GKS-U ${year}: tendrás ${age} años el ${cutoff}.`,
    ageLast: (year) => `Último ciclo dentro del límite: GKS-U ${year}.`,
    ageSource: "Límite de la guía 2027: menos de 25 años el 1 de marzo del año de ingreso. Revísalo en cada guía nueva.",
    declaredKorean: "Tu nivel de coreano (certificado o estimado)",
    declaredEnglish: "Tu nivel de inglés (certificado o estimado)",
    koreanLevels: { none: "Sin certificado", topik1: "TOPIK 1", topik2: "TOPIK 2", topik3: "TOPIK 3", topik4: "TOPIK 4", topik5: "TOPIK 5", topik6: "TOPIK 6" },
    englishLevels: { none: "Sin certificado", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" },
    levelsTitle: "Nivel declarado y nivel medido",
    declared: "Declarado",
    measured: "Medido en LearnV",
    measuredNote: "El nivel medido sale de la etapa más avanzada que has superado o desbloqueado en cada habilidad. Es orientativo, no un nivel oficial.",
    koreanBands: { none: "Sin datos todavía", band1: "TOPIK I (1–2)", band2: "Puente a TOPIK 3", band3: "TOPIK 3–4 en práctica", band4: "Hacia TOPIK 4–5" },
    englishBands: { none: "Sin datos todavía", band1: "B1", band2: "B2", band3: "B2+ hacia C1", band4: "Práctica C1" },
    reach: (reach, passed) => `Etapa media alcanzada: ${reach} de 22 · ${passed} etapas superadas`,
    privacy: "Todo se guarda en este dispositivo y viaja solo en tu copia de seguridad.",
  },
  documents: {
    deadlineTitle: (year) => `Calendario para GKS-U ${year}`,
    deadlineText: (date) => `Entrega estimada: ${date}. Cada universidad fija su plazo; ajústalo cuando salga la guía.`,
    startBy: (date) => `Empieza antes del ${date}`,
    addToBoard: "Añadir al tablero",
    added: "En el tablero",
    boardFull: "El tablero está lleno",
    boardTask: (label) => `GKS · ${label}`,
  },
  radar: {
    sourcesTitle: "Estado de cada fuente",
    ok: "Responde",
    failed: "Sin respuesta",
    changed: "Ha cambiado",
    official: "Oficial",
    historical: "Histórico",
    practice: "Práctica",
    kinds: "Oficial = guía o aviso vigente · Histórico = ciclo anterior, como referencia · Práctica = material de LearnV, no oficial.",
  },
};

const en: GksProfileCopy = {
  cycle: {
    kicker: "Your GKS cycle",
    cycle: (year) => `GKS-U ${year}`,
    here: "You are here",
    estimated: "estimated date",
    confirmed: "confirmed in the guidelines",
    daysToCall: (days) => days > 0 ? `About ${days} days until the call.` : "The call has been published.",
    phases: {
      preparation: { title: "Preparation", text: "Languages, documents and drafts before the call." },
      call: { title: "Call", text: "NIIED publishes the guidelines, forms and universities." },
      application: { title: "Application", text: "Submit the file to the university or the embassy." },
      "first-round": { title: "First round", text: "Document review and interviews." },
      "second-round": { title: "Second round", text: "NIIED reviews the nominated candidates." },
      results: { title: "Results", text: "Selected scholars are announced." },
      "pre-departure": { title: "Before departure", text: "Visa, medical check and arrival in Korea." },
    },
    actions: {
      "language-exam": { title: "Priority: your language certificate", text: "Certificates take longest: pick a TOPIK or IELTS date and prepare in good time.", cta: "Go to study" },
      documents: { title: "Priority: official documents", text: "Apostilles and sworn translations take weeks. Start with those that depend on others.", cta: "See documents" },
      drafts: { title: "Priority: your drafts", text: "Personal Statement and Study Plan: write, review and rewrite before the call opens.", cta: "Open the writing simulator" },
      "read-guide": { title: "Read the new guidelines", text: "Check track, deadlines, universities and your major's requirements in the official guidelines.", cta: "Open the official source" },
      submit: { title: "Complete and submit your file", text: "Check every document against the list and meet your university's deadline.", cta: "See documents" },
      interview: { title: "Prepare the interview", text: "Practise answers with concrete examples and your study plan.", cta: "Practise the interview" },
      "keep-practising": { title: "Keep your rhythm", text: "While you wait, keep up your Korean: it helps whatever the result.", cta: "Daily review" },
      "check-results": { title: "Check the results", text: "Read the official notices and your email.", cta: "See the scholarship" },
      "pre-departure": { title: "Prepare the move", text: "Visa, medical check and the scholar life guide.", cta: "See the scholarship" },
    },
    statusLabel: "Where are you?",
    preparing: "Preparing for the next call",
    applied: "I have already applied",
    estimateNote: "Estimated dates come from previous cycles. Each university and embassy sets its own: confirm them in the official guidelines.",
    timelineTitle: "Cycle timeline",
  },
  profile: {
    editorTitle: "Your application profile",
    editorIntro: "LearnV uses these details to adapt the timeline, alerts and levels. They are saved on this device only.",
    major: "Major you want to study",
    majorPlaceholder: "e.g. Materials engineering",
    majorEmpty: "Not set",
    track: "Application track",
    tracks: { undecided: "Not sure yet", university: "University track", embassy: "Embassy track" },
    trackNote: "In 2026 Spain was not among the embassy-track countries: for applicants from Spain the university track was the open option. Check it in each guideline.",
    birthDate: "Date of birth",
    birthHelp: "Only used to check the age limit. It never leaves this device.",
    ageOk: (age, cutoff, year) => `You meet the age limit for GKS-U ${year}: you will be ${age} on ${cutoff}.`,
    ageOver: (age, cutoff, year) => `You exceed the age limit for GKS-U ${year}: you will be ${age} on ${cutoff}.`,
    ageLast: (year) => `Last cycle within the limit: GKS-U ${year}.`,
    ageSource: "2027 guideline limit: under 25 on 1 March of the entry year. Recheck it in every new guideline.",
    declaredKorean: "Your Korean level (certified or estimated)",
    declaredEnglish: "Your English level (certified or estimated)",
    koreanLevels: { none: "No certificate", topik1: "TOPIK 1", topik2: "TOPIK 2", topik3: "TOPIK 3", topik4: "TOPIK 4", topik5: "TOPIK 5", topik6: "TOPIK 6" },
    englishLevels: { none: "No certificate", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" },
    levelsTitle: "Declared and measured level",
    declared: "Declared",
    measured: "Measured in LearnV",
    measuredNote: "The measured level comes from the furthest stage you passed or unlocked in each skill. It is indicative, not an official level.",
    koreanBands: { none: "No data yet", band1: "TOPIK I (1–2)", band2: "Bridge to TOPIK 3", band3: "TOPIK 3–4 in practice", band4: "Towards TOPIK 4–5" },
    englishBands: { none: "No data yet", band1: "B1", band2: "B2", band3: "B2+ towards C1", band4: "C1 practice" },
    reach: (reach, passed) => `Average stage reached: ${reach} of 22 · ${passed} stages passed`,
    privacy: "Everything stays on this device and travels only in your backup.",
  },
  documents: {
    deadlineTitle: (year) => `Schedule for GKS-U ${year}`,
    deadlineText: (date) => `Estimated submission: ${date}. Each university sets its deadline; adjust it when the guidelines come out.`,
    startBy: (date) => `Start before ${date}`,
    addToBoard: "Add to board",
    added: "On the board",
    boardFull: "The board is full",
    boardTask: (label) => `GKS · ${label}`,
  },
  radar: {
    sourcesTitle: "Status of each source",
    ok: "Responding",
    failed: "No response",
    changed: "Changed",
    official: "Official",
    historical: "Historical",
    practice: "Practice",
    kinds: "Official = current guideline or notice · Historical = previous cycle, for reference · Practice = LearnV material, not official.",
  },
};

const ko: GksProfileCopy = {
  cycle: {
    kicker: "나의 GKS 일정",
    cycle: (year) => `GKS-U ${year}`,
    here: "현재 단계",
    estimated: "예상 날짜",
    confirmed: "요강에서 확인됨",
    daysToCall: (days) => days > 0 ? `모집 공고까지 약 ${days}일 남았습니다.` : "모집 공고가 발표되었습니다.",
    phases: {
      preparation: { title: "준비", text: "공고 전 어학, 서류, 초안 준비" },
      call: { title: "공고", text: "국립국제교육원이 요강, 서식, 대학 목록을 발표합니다." },
      application: { title: "지원", text: "대학 또는 대사관에 서류를 제출합니다." },
      "first-round": { title: "1차 심사", text: "서류 심사와 면접" },
      "second-round": { title: "2차 심사", text: "국립국제교육원이 추천 후보를 심사합니다." },
      results: { title: "결과 발표", text: "최종 장학생을 발표합니다." },
      "pre-departure": { title: "출국 준비", text: "비자, 건강 검진, 한국 도착" },
    },
    actions: {
      "language-exam": { title: "우선순위: 어학 성적", text: "성적표가 가장 오래 걸립니다. TOPIK이나 IELTS 시험일을 정하고 미리 준비하세요.", cta: "학습으로 이동" },
      documents: { title: "우선순위: 공식 서류", text: "아포스티유와 공증 번역은 몇 주가 걸립니다. 다른 서류에 필요한 것부터 시작하세요.", cta: "서류 보기" },
      drafts: { title: "우선순위: 초안", text: "자기소개서와 학업계획서를 공고 전에 쓰고, 검토하고, 다시 쓰세요.", cta: "작문 시뮬레이터 열기" },
      "read-guide": { title: "새 요강 읽기", text: "공식 요강에서 지원 경로, 마감일, 대학, 학과 요건을 확인하세요.", cta: "공식 자료 열기" },
      submit: { title: "서류를 완성해 제출하기", text: "목록으로 서류를 하나씩 확인하고 대학 마감일을 지키세요.", cta: "서류 보기" },
      interview: { title: "면접 준비", text: "구체적인 예시와 학업 계획으로 답변을 연습하세요.", cta: "면접 연습" },
      "keep-practising": { title: "꾸준히 이어 가기", text: "기다리는 동안 한국어를 계속 공부하세요. 결과와 상관없이 도움이 됩니다.", cta: "오늘의 복습" },
      "check-results": { title: "결과 확인", text: "공식 공지와 이메일을 확인하세요.", cta: "장학금 보기" },
      "pre-departure": { title: "출국 준비", text: "비자, 건강 검진, 장학생 생활 안내를 확인하세요.", cta: "장학금 보기" },
    },
    statusLabel: "현재 상황",
    preparing: "다음 공고를 준비 중",
    applied: "이미 지원함",
    estimateNote: "예상 날짜는 이전 일정을 바탕으로 합니다. 대학과 대사관마다 날짜가 다르니 공식 요강에서 확인하세요.",
    timelineTitle: "일정",
  },
  profile: {
    editorTitle: "지원자 프로필",
    editorIntro: "LearnV는 이 정보로 일정, 알림, 수준을 맞춥니다. 이 기기에만 저장됩니다.",
    major: "희망 전공",
    majorPlaceholder: "예: 재료공학",
    majorEmpty: "미정",
    track: "지원 경로",
    tracks: { undecided: "아직 모름", university: "대학 추천", embassy: "대사관 추천" },
    trackNote: "2026년에 스페인은 대사관 추천 국가가 아니었으므로 스페인 지원자에게는 대학 추천이 열린 경로였습니다. 매년 요강에서 확인하세요.",
    birthDate: "생년월일",
    birthHelp: "나이 제한 확인에만 사용하며 이 기기 밖으로 나가지 않습니다.",
    ageOk: (age, cutoff, year) => `GKS-U ${year} 나이 제한을 충족합니다. ${cutoff} 기준 ${age}세입니다.`,
    ageOver: (age, cutoff, year) => `GKS-U ${year} 나이 제한을 넘습니다. ${cutoff} 기준 ${age}세입니다.`,
    ageLast: (year) => `제한 안의 마지막 일정: GKS-U ${year}`,
    ageSource: "2027 요강 기준: 입학 연도 3월 1일 현재 25세 미만. 새 요강마다 다시 확인하세요.",
    declaredKorean: "한국어 수준(성적 또는 예상)",
    declaredEnglish: "영어 수준(성적 또는 예상)",
    koreanLevels: { none: "성적 없음", topik1: "TOPIK 1", topik2: "TOPIK 2", topik3: "TOPIK 3", topik4: "TOPIK 4", topik5: "TOPIK 5", topik6: "TOPIK 6" },
    englishLevels: { none: "성적 없음", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" },
    levelsTitle: "신고 수준과 측정 수준",
    declared: "신고",
    measured: "LearnV 측정",
    measuredNote: "측정 수준은 영역별로 통과하거나 연 가장 높은 단계를 바탕으로 합니다. 참고용이며 공인 수준이 아닙니다.",
    koreanBands: { none: "아직 자료 없음", band1: "TOPIK I (1–2)", band2: "TOPIK 3으로 가는 단계", band3: "TOPIK 3–4 연습", band4: "TOPIK 4–5를 향해" },
    englishBands: { none: "아직 자료 없음", band1: "B1", band2: "B2", band3: "B2+, C1을 향해", band4: "C1 연습" },
    reach: (reach, passed) => `평균 도달 단계: 22단계 중 ${reach} · 통과 ${passed}단계`,
    privacy: "모든 정보는 이 기기에만 저장되며 백업 파일에만 포함됩니다.",
  },
  documents: {
    deadlineTitle: (year) => `GKS-U ${year} 일정`,
    deadlineText: (date) => `예상 제출일: ${date}. 대학마다 마감일이 다르니 요강이 나오면 조정하세요.`,
    startBy: (date) => `${date} 전에 시작`,
    addToBoard: "보드에 추가",
    added: "보드에 있음",
    boardFull: "보드가 가득 찼습니다",
    boardTask: (label) => `GKS · ${label}`,
  },
  radar: {
    sourcesTitle: "출처별 상태",
    ok: "응답함",
    failed: "응답 없음",
    changed: "변경됨",
    official: "공식",
    historical: "이전 자료",
    practice: "연습",
    kinds: "공식 = 현재 요강이나 공지 · 이전 자료 = 지난 일정 참고 · 연습 = LearnV 자료, 비공식",
  },
};

export const gksProfileCopy = { es, en, ko } as const;
