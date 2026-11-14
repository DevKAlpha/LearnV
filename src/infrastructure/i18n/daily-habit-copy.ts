import type { Locale } from "@/domain/models/i18n";
import type { LearningSkill } from "@/domain/models/learning-journey";

type Skill = LearningSkill;

type DailyHabitCopy = {
  plan: {
    kicker: string;
    title: string;
    intro: string;
    loading: string;
    review: (target: number) => string;
    reviewMeta: string;
    stage: (language: string, order: number, skill: string) => string;
    stageMeta: string;
    stageDone: string;
    gksMeta: string;
    mark: string;
    unmark: string;
    doneLabel: string;
    pendingLabel: string;
    minutes: string;
    next: string;
    complete: string;
    completeText: string;
    board: (count: number) => string;
    openBoard: string;
    honest: string;
  };
  languages: { en: string; ko: string };
  skills: Record<Skill, string>;
  streak: {
    shieldReady: string;
    shieldUsed: string;
    shieldHelp: string;
  };
  week: {
    kicker: string;
    title: string;
    range: (from: string, to: string) => string;
    minutes: string;
    days: string;
    practices: string;
    reviewed: string;
    versus: (value: number) => string;
    weakest: (skill: string, score: number) => string;
    noWeakest: string;
    next: string;
    nextStage: (language: string, order: number, skill: string) => string;
    nextNone: string;
    evidence: string;
  };
  reminders: {
    title: string;
    intro: string;
    honest: string;
    time: string;
    enable: string;
    disable: string;
    test: string;
    enabled: (time: string) => string;
    disabled: string;
    unsupported: string;
    denied: string;
    calendarTitle: string;
    calendarIntro: string;
    includeGks: string;
    includeBoard: string;
    includeStudy: (time: string) => string;
    download: string;
    downloaded: string;
    calendarName: string;
    studyTitle: string;
    studyDescription: string;
    gksDescription: (estimated: boolean) => string;
    gksButton: string;
  };
  board: {
    today: string;
    todayEmpty: string;
    all: string;
    suggestionsTitle: string;
    suggestionsIntro: string;
    accept: string;
    dismiss: string;
    reviewTask: (count: number) => string;
    cycleTask: (title: string) => string;
    documentTask: (label: string) => string;
    reasons: { review: string; cycle: string; document: string };
    due: (date: string) => string;
    noDate: string;
    full: string;
  };
};

export const dailyHabitCopy: Record<Locale, DailyHabitCopy> = {
  es: {
    plan: {
      kicker: "Tu enfoque",
      title: "Plan de hoy",
      intro: "Se genera cada día con tus repasos, tu siguiente etapa y el paso de la beca que toca ahora. Se completa solo cuando practicas.",
      loading: "Preparando el plan de hoy…",
      review: (target) => `Repasa ${target} ${target === 1 ? "tarjeta" : "tarjetas"}`,
      reviewMeta: "Repetición espaciada · se marca sola al repasar",
      stage: (language, order, skill) => `${language} · etapa ${order} de ${skill}`,
      stageMeta: "Una etapa nueva · se marca sola al terminar un intento",
      stageDone: "Etapa practicada hoy",
      gksMeta: "Paso de la beca para esta fase · márcalo tú al terminar",
      mark: "Marcar como hecho",
      unmark: "Desmarcar",
      doneLabel: "Hecho",
      pendingLabel: "Pendiente",
      minutes: "min",
      next: "Siguiente paso",
      complete: "Plan de hoy completado",
      completeText: "Has practicado de verdad hoy. Mañana el plan se renueva.",
      board: (count) => `${count} ${count === 1 ? "tarea del tablero vence" : "tareas del tablero vencen"} hoy o antes`,
      openBoard: "Abrir el tablero",
      honest: "La racha solo cuenta días con práctica real: tests, repasos, quizzes y simuladores. Marcar casillas no suma.",
    },
    languages: { en: "Inglés", ko: "Coreano" },
    skills: { reading: "lectura", grammar: "gramática", vocabulary: "vocabulario", writing: "escritura", listening: "comprensión auditiva", pronunciation: "pronunciación", application: "solicitud", documents: "documentos", interview: "entrevista" },
    streak: {
      shieldReady: "Protector semanal disponible",
      shieldUsed: "Protector semanal usado esta semana",
      shieldHelp: "Un día sin practicar por semana (lunes a domingo) no rompe la racha, pero tampoco suma.",
    },
    week: {
      kicker: "Resumen semanal",
      title: "Tu semana",
      range: (from, to) => `Del ${from} al ${to}`,
      minutes: "Minutos activos",
      days: "Días con práctica",
      practices: "Prácticas terminadas",
      reviewed: "Tarjetas repasadas",
      versus: (value) => `semana anterior: ${value}`,
      weakest: (skill, score) => `Lo que más cuesta: ${skill} (media ${score} %)`,
      noWeakest: "Aún no hay prácticas puntuadas esta semana.",
      next: "Siguiente objetivo",
      nextStage: (language, order, skill) => `${language}: etapa ${order} de ${skill}`,
      nextNone: "Has completado las rutas disponibles: repasa y prepara la entrevista.",
      evidence: "Solo con datos de este dispositivo: tiempo activo, prácticas y repasos.",
    },
    reminders: {
      title: "Recordatorios y calendario",
      intro: "Elige a qué hora quieres estudiar. LearnV te avisa una vez al día si aún no has practicado.",
      honest: "Los avisos del navegador solo llegan con LearnV abierta o instalada y activa en el móvil. Para un aviso seguro, añade la sesión diaria a tu calendario.",
      time: "Hora de estudio",
      enable: "Activar avisos",
      disable: "Desactivar avisos",
      test: "Probar aviso",
      enabled: (time) => `Avisos activados a las ${time}.`,
      disabled: "Avisos desactivados.",
      unsupported: "Este navegador no admite avisos. Usa el calendario.",
      denied: "El navegador tiene los avisos bloqueados para LearnV. Puedes permitirlos en los ajustes del sitio.",
      calendarTitle: "Añadir a tu calendario (.ics)",
      calendarIntro: "Descarga un archivo para el calendario del móvil o del ordenador. Si lo importas de nuevo, se actualiza sin duplicar.",
      includeGks: "Fechas del ciclo GKS",
      includeBoard: "Tareas del tablero con fecha",
      includeStudy: (time) => `Sesión de estudio diaria a las ${time}`,
      download: "Descargar calendario",
      downloaded: "Calendario descargado. Ábrelo para importarlo.",
      calendarName: "LearnV · Ruta GKS",
      studyTitle: "LearnV · plan de hoy",
      studyDescription: "Repaso, una etapa nueva y el paso de la beca que toca.",
      gksDescription: (estimated) => estimated ? "Fecha estimada a partir de ciclos anteriores: confírmala en la guía oficial." : "Fecha confirmada en la guía oficial.",
      gksButton: "Añadir estas fechas al calendario",
    },
    board: {
      today: "Hoy",
      todayEmpty: "Nada vence hoy. Elige una tarea pendiente o acepta una sugerencia.",
      all: "Todo el tablero",
      suggestionsTitle: "Sugerencias para tu tablero",
      suggestionsIntro: "Salen de tus repasos, del ciclo GKS y de los documentos pendientes. Acepta con un toque.",
      accept: "Añadir",
      dismiss: "Ahora no",
      reviewTask: (count) => `Repasar ${count} ${count === 1 ? "tarjeta" : "tarjetas"} de hoy`,
      cycleTask: (title) => `GKS · ${title}`,
      documentTask: (label) => `Empezar: ${label}`,
      reasons: { review: "Repaso de hoy", cycle: "Fase del ciclo", document: "Documento que empieza pronto" },
      due: (date) => `Para el ${date}`,
      noDate: "Sin fecha",
      full: "El tablero está lleno",
    },
  },
  en: {
    plan: {
      kicker: "Your focus",
      title: "Today's plan",
      intro: "Built each day from your reviews, your next stage and the scholarship step that matters now. It completes only when you practise.",
      loading: "Preparing today's plan…",
      review: (target) => `Review ${target} ${target === 1 ? "card" : "cards"}`,
      reviewMeta: "Spaced review · ticks itself as you review",
      stage: (language, order, skill) => `${language} · ${skill} stage ${order}`,
      stageMeta: "One new stage · ticks itself when you finish an attempt",
      stageDone: "Stage practised today",
      gksMeta: "Scholarship step for this phase · tick it yourself when done",
      mark: "Mark as done",
      unmark: "Unmark",
      doneLabel: "Done",
      pendingLabel: "To do",
      minutes: "min",
      next: "Next step",
      complete: "Today's plan is complete",
      completeText: "You really practised today. The plan renews tomorrow.",
      board: (count) => `${count} board ${count === 1 ? "task is" : "tasks are"} due today or earlier`,
      openBoard: "Open the board",
      honest: "The streak only counts days with real practice: tests, reviews, quizzes and simulators. Ticking boxes does not count.",
    },
    languages: { en: "English", ko: "Korean" },
    skills: { reading: "reading", grammar: "grammar", vocabulary: "vocabulary", writing: "writing", listening: "listening", pronunciation: "pronunciation", application: "application", documents: "documents", interview: "interview" },
    streak: {
      shieldReady: "Weekly shield available",
      shieldUsed: "Weekly shield used this week",
      shieldHelp: "One day without practice per week (Monday to Sunday) does not break the streak, but it does not add to it either.",
    },
    week: {
      kicker: "Weekly summary",
      title: "Your week",
      range: (from, to) => `${from} to ${to}`,
      minutes: "Active minutes",
      days: "Days with practice",
      practices: "Practice sessions finished",
      reviewed: "Cards reviewed",
      versus: (value) => `previous week: ${value}`,
      weakest: (skill, score) => `Hardest this week: ${skill} (average ${score}%)`,
      noWeakest: "No scored practice this week yet.",
      next: "Next goal",
      nextStage: (language, order, skill) => `${language}: ${skill} stage ${order}`,
      nextNone: "You have completed the available paths: review and prepare the interview.",
      evidence: "Only data from this device: active time, practice and reviews.",
    },
    reminders: {
      title: "Reminders and calendar",
      intro: "Choose when you want to study. LearnV reminds you once a day if you have not practised yet.",
      honest: "Browser notifications only arrive while LearnV is open, or installed and active on the phone. For a reliable reminder, add the daily session to your calendar.",
      time: "Study time",
      enable: "Turn on reminders",
      disable: "Turn off reminders",
      test: "Test reminder",
      enabled: (time) => `Reminders on at ${time}.`,
      disabled: "Reminders off.",
      unsupported: "This browser does not support notifications. Use the calendar.",
      denied: "The browser blocks notifications for LearnV. You can allow them in the site settings.",
      calendarTitle: "Add to your calendar (.ics)",
      calendarIntro: "Download a file for your phone or computer calendar. Importing it again updates events without duplicates.",
      includeGks: "GKS cycle dates",
      includeBoard: "Board tasks with a date",
      includeStudy: (time) => `Daily study session at ${time}`,
      download: "Download calendar",
      downloaded: "Calendar downloaded. Open it to import it.",
      calendarName: "LearnV · GKS route",
      studyTitle: "LearnV · today's plan",
      studyDescription: "Review, one new stage and the scholarship step that fits now.",
      gksDescription: (estimated) => estimated ? "Estimated from previous cycles: confirm it in the official guideline." : "Confirmed in the official guideline.",
      gksButton: "Add these dates to your calendar",
    },
    board: {
      today: "Today",
      todayEmpty: "Nothing is due today. Pick a pending task or accept a suggestion.",
      all: "Whole board",
      suggestionsTitle: "Suggestions for your board",
      suggestionsIntro: "They come from your reviews, the GKS cycle and pending documents. Accept with one tap.",
      accept: "Add",
      dismiss: "Not now",
      reviewTask: (count) => `Review today's ${count} ${count === 1 ? "card" : "cards"}`,
      cycleTask: (title) => `GKS · ${title}`,
      documentTask: (label) => `Start: ${label}`,
      reasons: { review: "Today's review", cycle: "Cycle phase", document: "Document to start soon" },
      due: (date) => `By ${date}`,
      noDate: "No date",
      full: "The board is full",
    },
  },
  ko: {
    plan: {
      kicker: "오늘의 초점",
      title: "오늘의 계획",
      intro: "복습, 다음 단계, 지금 필요한 장학금 준비를 바탕으로 매일 새로 만들어집니다. 실제로 연습해야 완료됩니다.",
      loading: "오늘의 계획을 준비하는 중…",
      review: (target) => `카드 ${target}장 복습`,
      reviewMeta: "간격 반복 · 복습하면 자동으로 완료",
      stage: (language, order, skill) => `${language} · ${skill} ${order}단계`,
      stageMeta: "새 단계 하나 · 시도를 마치면 자동으로 완료",
      stageDone: "오늘 연습한 단계",
      gksMeta: "이 시기의 장학금 준비 · 마치면 직접 표시",
      mark: "완료로 표시",
      unmark: "표시 해제",
      doneLabel: "완료",
      pendingLabel: "미완료",
      minutes: "분",
      next: "다음 단계",
      complete: "오늘의 계획 완료",
      completeText: "오늘 실제로 연습했습니다. 내일 계획이 새로 만들어집니다.",
      board: (count) => `오늘까지 마감인 보드 과제 ${count}개`,
      openBoard: "보드 열기",
      honest: "연속 학습은 실제 연습(시험, 복습, 퀴즈, 시뮬레이터)을 한 날만 셉니다. 체크 표시만으로는 늘지 않습니다.",
    },
    languages: { en: "영어", ko: "한국어" },
    skills: { reading: "읽기", grammar: "문법", vocabulary: "어휘", writing: "쓰기", listening: "듣기", pronunciation: "발음", application: "지원서", documents: "서류", interview: "면접" },
    streak: {
      shieldReady: "주간 보호권 사용 가능",
      shieldUsed: "이번 주 보호권 사용함",
      shieldHelp: "일주일(월~일)에 하루는 연습하지 않아도 연속 기록이 끊기지 않지만, 기록에 더해지지도 않습니다.",
    },
    week: {
      kicker: "주간 요약",
      title: "나의 한 주",
      range: (from, to) => `${from} ~ ${to}`,
      minutes: "활동 시간(분)",
      days: "연습한 날",
      practices: "마친 연습",
      reviewed: "복습한 카드",
      versus: (value) => `지난주: ${value}`,
      weakest: (skill, score) => `가장 어려운 부분: ${skill} (평균 ${score}%)`,
      noWeakest: "이번 주에는 아직 점수가 있는 연습이 없습니다.",
      next: "다음 목표",
      nextStage: (language, order, skill) => `${language}: ${skill} ${order}단계`,
      nextNone: "열린 경로를 모두 마쳤습니다. 복습하고 면접을 준비하세요.",
      evidence: "이 기기의 데이터만 사용합니다: 활동 시간, 연습, 복습.",
    },
    reminders: {
      title: "알림과 캘린더",
      intro: "공부할 시간을 고르세요. 아직 연습하지 않았다면 하루에 한 번 알려 드립니다.",
      honest: "브라우저 알림은 LearnV가 열려 있거나 휴대폰에 설치되어 실행 중일 때만 옵니다. 확실한 알림이 필요하면 매일 학습 일정을 캘린더에 추가하세요.",
      time: "학습 시간",
      enable: "알림 켜기",
      disable: "알림 끄기",
      test: "알림 테스트",
      enabled: (time) => `${time}에 알림이 켜져 있습니다.`,
      disabled: "알림이 꺼져 있습니다.",
      unsupported: "이 브라우저는 알림을 지원하지 않습니다. 캘린더를 사용하세요.",
      denied: "브라우저가 LearnV 알림을 차단했습니다. 사이트 설정에서 허용할 수 있습니다.",
      calendarTitle: "캘린더에 추가 (.ics)",
      calendarIntro: "휴대폰이나 컴퓨터 캘린더용 파일을 내려받으세요. 다시 가져오면 중복 없이 업데이트됩니다.",
      includeGks: "GKS 일정",
      includeBoard: "날짜가 있는 보드 과제",
      includeStudy: (time) => `매일 ${time} 학습`,
      download: "캘린더 내려받기",
      downloaded: "캘린더를 내려받았습니다. 파일을 열어 가져오세요.",
      calendarName: "LearnV · GKS 준비",
      studyTitle: "LearnV · 오늘의 계획",
      studyDescription: "복습, 새 단계 하나, 지금 필요한 장학금 준비.",
      gksDescription: (estimated) => estimated ? "이전 일정을 바탕으로 한 예상 날짜입니다. 공식 요강에서 확인하세요." : "공식 요강에서 확인된 날짜입니다.",
      gksButton: "이 일정을 캘린더에 추가",
    },
    board: {
      today: "오늘",
      todayEmpty: "오늘 마감인 과제가 없습니다. 남은 과제를 고르거나 제안을 추가하세요.",
      all: "전체 보드",
      suggestionsTitle: "보드 제안",
      suggestionsIntro: "복습, GKS 일정, 남은 서류에서 나온 제안입니다. 한 번에 추가하세요.",
      accept: "추가",
      dismiss: "나중에",
      reviewTask: (count) => `오늘 카드 ${count}장 복습`,
      cycleTask: (title) => `GKS · ${title}`,
      documentTask: (label) => `시작: ${label}`,
      reasons: { review: "오늘의 복습", cycle: "일정 단계", document: "곧 시작할 서류" },
      due: (date) => `${date}까지`,
      noDate: "날짜 없음",
      full: "보드가 가득 찼습니다",
    },
  },
};
