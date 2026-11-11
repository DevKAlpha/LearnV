import type { Locale } from "@/domain/models/i18n";
import { useI18n } from "@/application/i18n/I18nContext";
import { useImmersion } from "@/application/i18n/immersion";

const languageNames: Record<Locale, Record<"en" | "ko", string>> = {
  es: { en: "inglés", ko: "coreano" },
  en: { en: "English", ko: "Korean" },
  ko: { en: "영어", ko: "한국어" },
};

/** Lets the learner choose between full immersion and instructions in their own language. */
export function ImmersionToggle({ practice }: { practice: "en" | "ko" }) {
  const { baseLocale } = useI18n();
  const { preferences, toggle } = useImmersion();
  const full = preferences[practice] === "full";
  const name = languageNames[baseLocale][practice];
  const label = baseLocale === "ko"
    ? `화면 전체를 ${name}로 표시`
    : baseLocale === "en"
      ? `Show the whole interface in ${name}`
      : `Toda la interfaz en ${name}`;
  return (
    <button
      type="button"
      className="theme-toggle immersion-toggle"
      aria-pressed={full}
      title={label}
      onClick={() => toggle(practice)}
    >
      <span aria-hidden="true" className="immersion-toggle__badge">{practice === "ko" ? "한" : "EN"}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
