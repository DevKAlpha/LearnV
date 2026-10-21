import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import type { TestLanguage } from "@/domain/models/language-test";
import { getRestartLessonForStage } from "@/infrastructure/data/learning-restart-lessons";
import { learningRestartCopy } from "@/infrastructure/i18n/learning-restart-copy";
import { readRestartHelpLocale } from "@/infrastructure/data/learning-restart-progress";
import { RestartToolCard } from "./RestartToolCard";

/** Optional first-attempt production support only; never shown during timed retakes or questions. */
export function RestartToolNote({ language, stageId }: { language: TestLanguage; stageId: string }) {
  const { baseLocale, locale } = useI18n();
  const helpLocale = readRestartHelpLocale(language, baseLocale ?? locale);
  const lesson = getRestartLessonForStage(language, stageId);
  if (!lesson) return null;
  const copy = learningRestartCopy[helpLocale];
  return <details className="restart-tool-note" lang={helpLocale}>
    <summary>{copy.consult}</summary>
    <RestartToolCard lesson={lesson} locale={helpLocale} language={language} />
    <Link target="_blank" rel="noopener noreferrer" to={`/study/${language === "en" ? "english" : "korean"}?intro=${lesson.id}#language-tests`}>{copy.revisit}<span aria-hidden="true"> ↗</span></Link>
  </details>;
}
