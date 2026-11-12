export const reviewCopy = {
  es: {
    todayKicker: "Repaso de hoy", pending: (due: number, fresh: number) => `${due} pendientes · ${fresh} nuevas`, upToDate: "Estás al día. Mañana habrá más tarjetas.", cta: "Repasar ahora", toolsIntro: "Repaso espaciado, alfabeto coreano y formatos reales de escritura.",
    kicker: "Repaso espaciado", title: "Repaso diario",
    intro: "Unos minutos al día con lo que estás a punto de olvidar. Cada tarjeta vuelve justo antes de que se borre de tu memoria; tus errores de las prácticas entran solos.",
    all: "Todo", en: "Inglés", ko: "Coreano", filter: "Idioma del repaso",
    due: "pendientes", fresh: "nuevas hoy", reviewedToday: "repasadas hoy", learned: "afianzadas", mistakes: "errores guardados",
    start: "Empezar repaso", empty: "No tienes nada pendiente. Vuelve mañana o haz una etapa de práctica: tus fallos se añadirán aquí.",
    exercise: { recall: "Recuerda", cloze: "Completa", order: "Ordena", dictation: "Dictado", choice: "Tu error" },
    progress: "Tarjeta", of: "de", show: "Mostrar respuesta", check: "Comprobar", next: "Continuar",
    answerLabel: "Tu respuesta", hint: "Pista", why: "Por qué", correct: "¡Correcto!", incorrect: "Todavía no", theAnswer: "Respuesta",
    rateTitle: "¿Cómo de fácil te ha resultado?", again: "Otra vez", hard: "Difícil", good: "Bien", easy: "Fácil",
    orderHint: "Toca los bloques en el orden correcto.", reset: "Reiniciar", dictationHint: "Escucha y escribe exactamente lo que oyes.",
    transcriptUsed: "Has visto el texto: esta tarjeta volverá pronto.", mistakeOrigin: "Fallaste esta pregunta en una práctica.", remove: "Quitar del mazo",
    doneTitle: "Repaso terminado", doneText: (reviewed: number, correct: number) => `${reviewed} tarjetas · ${correct} a la primera.`, again2: "Repasar otra vez", back: "Volver a Estudiar",
    minutes: "min", hours: "h", days: "d",
    tools: "Más herramientas", hangul: "Hangul desde cero", writingLab: "Laboratorio de escritura", levelTest: "Test de nivel",
  },
  en: {
    todayKicker: "Today's review", pending: (due: number, fresh: number) => `${due} due · ${fresh} new`, upToDate: "You are up to date. More cards tomorrow.", cta: "Review now", toolsIntro: "Spaced review, the Korean alphabet and real writing formats.",
    kicker: "Spaced repetition", title: "Daily review",
    intro: "A few minutes a day with what you are about to forget. Each card returns just before it fades; mistakes from practice tests are added automatically.",
    all: "All", en: "English", ko: "Korean", filter: "Review language",
    due: "due", fresh: "new today", reviewedToday: "reviewed today", learned: "well learned", mistakes: "saved mistakes",
    start: "Start review", empty: "Nothing is due. Come back tomorrow or take a practice stage: your mistakes will be added here.",
    exercise: { recall: "Recall", cloze: "Fill the gap", order: "Build the sentence", dictation: "Dictation", choice: "Your mistake" },
    progress: "Card", of: "of", show: "Show answer", check: "Check", next: "Continue",
    answerLabel: "Your answer", hint: "Hint", why: "Why", correct: "Correct!", incorrect: "Not yet", theAnswer: "Answer",
    rateTitle: "How easy was it?", again: "Again", hard: "Hard", good: "Good", easy: "Easy",
    orderHint: "Tap the blocks in the right order.", reset: "Reset", dictationHint: "Listen and type exactly what you hear.",
    transcriptUsed: "You saw the text: this card will come back soon.", mistakeOrigin: "You missed this question in a practice test.", remove: "Remove from deck",
    doneTitle: "Review complete", doneText: (reviewed: number, correct: number) => `${reviewed} cards · ${correct} right first time.`, again2: "Review again", back: "Back to Study",
    minutes: "min", hours: "h", days: "d",
    tools: "More tools", hangul: "Hangul from zero", writingLab: "Writing lab", levelTest: "Level test",
  },
  ko: {
    todayKicker: "오늘의 복습", pending: (due: number, fresh: number) => `복습 ${due}장 · 새 카드 ${fresh}장`, upToDate: "오늘 복습을 마쳤습니다. 내일 새 카드가 준비됩니다.", cta: "지금 복습", toolsIntro: "간격 반복, 한글 기초, 실제 시험 쓰기 형식.",
    kicker: "간격 반복", title: "오늘의 복습",
    intro: "잊어버리기 직전의 내용을 하루 몇 분씩 복습하세요. 카드는 기억이 흐려지기 직전에 다시 나타나고, 연습에서 틀린 문제는 자동으로 추가됩니다.",
    all: "전체", en: "영어", ko: "한국어", filter: "복습 언어",
    due: "복습 예정", fresh: "오늘의 새 카드", reviewedToday: "오늘 복습", learned: "정착", mistakes: "저장된 오답",
    start: "복습 시작", empty: "복습할 카드가 없습니다. 내일 다시 오거나 연습 단계를 풀어 보세요. 틀린 문제가 여기에 추가됩니다.",
    exercise: { recall: "떠올리기", cloze: "빈칸 채우기", order: "문장 만들기", dictation: "받아쓰기", choice: "오답 복습" },
    progress: "카드", of: "/", show: "정답 보기", check: "확인", next: "계속",
    answerLabel: "내 답", hint: "힌트", why: "설명", correct: "정답입니다!", incorrect: "다시 해 봐요", theAnswer: "정답",
    rateTitle: "얼마나 쉬웠나요?", again: "다시", hard: "어려움", good: "보통", easy: "쉬움",
    orderHint: "블록을 올바른 순서로 누르세요.", reset: "초기화", dictationHint: "듣고 들은 그대로 쓰세요.",
    transcriptUsed: "텍스트를 보았으므로 이 카드는 곧 다시 나옵니다.", mistakeOrigin: "연습에서 틀린 문제입니다.", remove: "덱에서 삭제",
    doneTitle: "복습 완료", doneText: (reviewed: number, correct: number) => `카드 ${reviewed}장 · 한 번에 맞힘 ${correct}장`, again2: "다시 복습", back: "학습으로 돌아가기",
    minutes: "분", hours: "시간", days: "일",
    tools: "다른 도구", hangul: "기초 한글", writingLab: "쓰기 연습실", levelTest: "레벨 테스트",
  },
} as const;

export function formatInterval(minutes: number, copy: { minutes: string; hours: string; days: string }) {
  if (minutes < 60) return `${Math.max(1, minutes)} ${copy.minutes}`;
  if (minutes < 1_440) return `${Math.round(minutes / 60)} ${copy.hours}`;
  return `${Math.round(minutes / 1_440)} ${copy.days}`;
}
