import { useI18n } from "@/application/i18n/I18nContext";
import { useTheme } from "@/application/theme/ThemeContext";
import { AppIcon } from "@/shared/ui/AppIcon";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const { copy } = useI18n();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={compact ? "theme-toggle theme-toggle--compact" : "theme-toggle"}
      aria-label={isDark ? copy.app.switchToLight : copy.app.switchToDark}
      aria-pressed={isDark}
      onClick={toggleTheme}
    >
      <span key={theme} aria-hidden="true" className="theme-toggle__symbol">
        <AppIcon name={isDark ? "sun" : "moon"} />
      </span>
      {!compact && <small>{isDark ? copy.app.lightTheme : copy.app.darkTheme}</small>}
    </button>
  );
}
