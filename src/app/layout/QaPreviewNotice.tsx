import { useI18n } from "@/application/i18n/I18nContext";

const labels = {
  es: "Pruebas de aprendizaje · tu progreso de QA está separado de producción",
  en: "Learning preview · QA progress is separate from production",
  ko: "학습 테스트 · QA 진도는 운영 환경과 별도로 저장됩니다",
};

export function QaPreviewNotice() {
  const { locale } = useI18n();
  return <aside className="qa-preview-notice" aria-label="QA"><strong>QA</strong><span>{labels[locale]}</span><code>{import.meta.env.VITE_BUILD_SHA.slice(0, 7)}</code></aside>;
}
