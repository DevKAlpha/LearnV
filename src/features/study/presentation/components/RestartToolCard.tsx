import type { Locale } from "@/domain/models/i18n";
import type { RestartLesson } from "@/infrastructure/data/learning-restart-lessons";
import { learningRestartCopy } from "@/infrastructure/i18n/learning-restart-copy";
import "@/styles/restart-tools.css";

/** One source of truth for the tool taught in the introduction and used in the path. */
export function RestartToolCard({ lesson, locale, language }: { lesson: RestartLesson; locale: Locale; language: "en" | "ko" }) {
  const copy = learningRestartCopy[locale];
  return <aside className="restart-tool" lang={locale} aria-label={copy.tool}>
    <strong>{copy.tool}</strong>
    <p>{lesson.help[locale].tool}</p>
    <blockquote lang={language}>{lesson.frame}</blockquote>
  </aside>;
}
