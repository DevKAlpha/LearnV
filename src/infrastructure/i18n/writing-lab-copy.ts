export const writingLabCopy = {
  es: {
    kicker: "Formatos reales de examen", title: "Laboratorio de escritura",
    intro: "Practica los formatos de escritura de TOPIK II (51–54) e IELTS Academic (Task 1 y 2). Mientras escribes verás comprobaciones objetivas; guarda versiones para ver qué mejora en cada revisión.",
    choose: "Elige una tarea", minutes: "min", length: (min: number, max: number, unit: string) => `${min}–${max} ${unit}`,
    words: "palabras", characters: "caracteres", outline: "Cómo organizar la respuesta", model: "Ver una respuesta posible",
    draft: "Tu respuesta", save: "Guardar versión", saved: (count: number) => count === 1 ? "1 versión guardada" : `${count} versiones guardadas`,
    feedbackHint: "Escribe al menos unas frases para ver la revisión.", privacy: "Tu texto se guarda solo en este dispositivo.",
    chartTable: "Datos del gráfico", disclaimer: "Temas y datos creados para practicar; no son exámenes oficiales.",
  },
  en: {
    kicker: "Real exam formats", title: "Writing lab",
    intro: "Practise the writing formats of TOPIK II (51–54) and IELTS Academic (Tasks 1 and 2). You get objective checks while you write; save versions to see what improves with each revision.",
    choose: "Choose a task", minutes: "min", length: (min: number, max: number, unit: string) => `${min}–${max} ${unit}`,
    words: "words", characters: "characters", outline: "How to organise the answer", model: "See a possible answer",
    draft: "Your answer", save: "Save version", saved: (count: number) => count === 1 ? "1 version saved" : `${count} versions saved`,
    feedbackHint: "Write a few sentences to see the review.", privacy: "Your text is saved on this device only.",
    chartTable: "Chart data", disclaimer: "Topics and data written for practice; these are not official papers.",
  },
  ko: {
    kicker: "실제 시험 형식", title: "쓰기 연습실",
    intro: "TOPIK II 쓰기(51~54번)와 IELTS Academic(Task 1, 2) 형식을 연습하세요. 쓰는 동안 객관적인 점검을 받고, 버전을 저장해 고쳐 쓸 때마다 무엇이 좋아졌는지 확인하세요.",
    choose: "과제 선택", minutes: "분", length: (min: number, max: number, unit: string) => `${min}~${max}${unit}`,
    words: "단어", characters: "자", outline: "답안 구성 방법", model: "예시 답안 보기",
    draft: "내 답안", save: "버전 저장", saved: (count: number) => `저장된 버전 ${count}개`,
    feedbackHint: "몇 문장을 쓰면 점검 결과가 나타납니다.", privacy: "글은 이 기기에만 저장됩니다.",
    chartTable: "그래프 자료", disclaimer: "연습용으로 만든 주제와 자료이며 공식 기출 문제가 아닙니다.",
  },
} as const;
