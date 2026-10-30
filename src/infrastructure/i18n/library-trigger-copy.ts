// Kept separate so the catalogue's filters and descriptions stay in its deferred chunk.
export const libraryTriggerLabels = {
  es: { open: "Abrir biblioteca", close: "Cerrar biblioteca", kicker: "La biblioteca de LearnV", loading: "Preparando tu biblioteca…", error: "No se pudo abrir la biblioteca. Tu sesión sigue disponible.", retry: "Reintentar" },
  en: { open: "Open library", close: "Close library", kicker: "The LearnV library", loading: "Preparing your library…", error: "The library could not open. Your session is still available.", retry: "Try again" },
  ko: { open: "도서관 열기", close: "도서관 닫기", kicker: "LearnV 도서관", loading: "도서관을 준비하고 있습니다…", error: "도서관을 열지 못했습니다. 학습 세션은 유지됩니다.", retry: "다시 시도" },
} as const;
