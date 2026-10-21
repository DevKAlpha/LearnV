import { useI18n } from "@/application/i18n/I18nContext";
import { isLearningQa } from "@/application/qa/qa-learning-scope";
import { storybookCopy } from "@/infrastructure/i18n/storybook-copy";

/** A quiet chapter marker, never another navigation bar or an exercise distraction. */
export function StoryFolio({ pathname }: { pathname: string }) {
  const { locale, copy } = useI18n();
  if (pathname.startsWith("/tests/") || pathname === "/study/written-simulator") return null;
  const chapter = pathname === "/" ? [1, copy.nav.home]
    : pathname === "/gks" ? [2, copy.nav.gks]
      : pathname.startsWith("/study") ? [isLearningQa ? 2 : 3, copy.nav.study]
        : pathname === "/checklist" ? [4, copy.nav.documents] : [5, copy.nav.profile];
  const text = storybookCopy[locale];
  return <div className="story-folio">
    <span className="story-folio__chapter"><b>{String(chapter[0]).padStart(2, "0")}</b>{text.chapter} · {chapter[1]}</span>
    <span className="story-folio__edition">{text.edition}<i aria-hidden="true">✦</i></span>
  </div>;
}
