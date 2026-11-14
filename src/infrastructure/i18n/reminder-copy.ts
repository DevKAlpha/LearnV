import type { Locale } from "@/domain/models/i18n";

/** The notification text only: small, because the scheduler runs from startup. */
export const reminderNotificationCopy: Record<Locale, { title: string; body: string }> = {
  es: { title: "LearnV · tu plan de hoy", body: "Aún no has practicado hoy. Diez minutos de repaso bastan para seguir." },
  en: { title: "LearnV · today's plan", body: "You have not practised today yet. Ten minutes of review keep you going." },
  ko: { title: "LearnV · 오늘의 계획", body: "오늘은 아직 연습하지 않았습니다. 10분 복습으로 이어 가세요." },
};
