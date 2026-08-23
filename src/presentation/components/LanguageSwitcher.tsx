import type { Locale } from "../../domain/models/i18n";
import { useI18n } from "../../application/i18n/I18nContext";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { m } from "motion/react";
import { BrandMark } from "./BrandMark";
import { AppGuide } from "./AppGuide";

const options: Array<{ value: Locale; label: string; short: string }> = [
  { value: "es", label: "Español", short: "ES" },
  { value: "en", label: "English", short: "EN" },
  { value: "ko", label: "한국어", short: "한" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, copy } = useI18n();

  return (
    <div className="app-toolbar">
      <Link className="mobile-brand" to="/" aria-label="LearnV">
        <span className="mobile-brand__mark" aria-hidden="true"><BrandMark /></span>
        <strong>LearnV</strong>
      </Link>
      <div className="app-toolbar__controls">
        <div className="language-switcher" role="group" aria-label={copy.app.languageLabel}>
          {options.map((option) => (
            <m.button
              key={option.value}
              type="button"
              className={locale === option.value ? "language-option language-option--active" : "language-option"}
              aria-pressed={locale === option.value}
              aria-label={option.label}
              onClick={() => setLocale(option.value)}
              whileTap={{ scale: 0.94 }}
            >
              {locale === option.value && (
                <m.span
                  className="language-option__active"
                  layoutId="active-language"
                  transition={{ type: "spring", stiffness: 520, damping: 38 }}
                />
              )}
              <span>{option.short}</span>
              <small>{option.label}</small>
            </m.button>
          ))}
        </div>
        <ThemeToggle compact />
        <AppGuide />
      </div>
    </div>
  );
}
