import { useI18n } from "@/application/i18n/I18nContext";
import { useTheme } from "@/application/theme/ThemeContext";
import { m } from "motion/react";
import { AppIcon } from "@/shared/ui/AppIcon";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const { copy } = useI18n();
  const isDark = theme === "dark";

  return (
    <m.button
      type="button"
      className={compact ? "theme-toggle theme-toggle--compact" : "theme-toggle"}
      aria-label={isDark ? copy.app.switchToLight : copy.app.switchToDark}
      aria-pressed={isDark}
      onClick={toggleTheme}
      whileTap={{ scale: 0.9, rotate: isDark ? -8 : 8 }}
    >
      <m.span
        key={theme}
        aria-hidden="true"
        initial={{ opacity: 0, rotate: -35, scale: 0.72 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
      >
        <AppIcon name={isDark ? "sun" : "moon"} />
      </m.span>
      {!compact && <small>{isDark ? copy.app.lightTheme : copy.app.darkTheme}</small>}
    </m.button>
  );
}
