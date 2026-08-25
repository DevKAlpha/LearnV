import { Link } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import type { TestLanguage } from "@/domain/models/language-test";
import { learningResources } from "@/infrastructure/data/learning-resources";
import { TESTS_PER_LANGUAGE } from "@/infrastructure/data/practice-tests";
import { ResourceLibrary } from "@/features/study/presentation/components/ResourceLibrary";
import { TestTrackCards } from "@/features/study/presentation/components/TestTrackCards";
import { AppIcon } from "@/shared/ui/AppIcon";

type LanguageStudyPageProps = {
  language: TestLanguage;
};

export function LanguageStudyPage({ language }: LanguageStudyPageProps) {
  const { copy } = useI18n();
  const { totals } = useLanguageTestProgress();
  const isEnglish = language === "en";
  const resourceCount = learningResources.filter((resource) => resource.languages.includes(language)).length;
  const otherLanguage = isEnglish ? "korean" : "english";
  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className={`page language-study-page language-study-page--${language}`}>
      <header className="language-study-hero">
        <Link className="test-back-link" to="/study"><span aria-hidden="true">←</span>{copy.study.backStudy}</Link>
        <div className="language-study-hero__main">
          <span className="language-study-symbol" aria-hidden="true">{isEnglish ? "A+" : "한"}</span>
          <div>
            <span className="eyebrow">{copy.study.independentSpace}</span>
            <h1>{isEnglish ? copy.study.englishSpaceTitle : copy.study.koreanSpaceTitle}</h1>
            <p>{isEnglish ? copy.study.englishSpaceText : copy.study.koreanSpaceText}</p>
          </div>
        </div>
        <div className="language-study-facts">
          <span><strong>{totals[language]}/{TESTS_PER_LANGUAGE}</strong>{copy.study.testsPassed}</span>
          <span><strong>{resourceCount}</strong>{copy.study.resourcesAvailable}</span>
        </div>
      </header>

      <nav className="language-study-jump-nav" aria-label={copy.study.spaceNavigation}>
        <button type="button" onClick={() => scrollToSection("language-tests")}><span aria-hidden="true"><AppIcon name="test" /></span>{copy.study.goTests}</button>
        <button type="button" onClick={() => scrollToSection("language-materials")}><span aria-hidden="true"><AppIcon name="document" /></span>{copy.study.goMaterials}</button>
        <Link to={`/study/${otherLanguage}`}><span className="language-swap-icon" aria-hidden="true">EN<small>한</small></span>{copy.study.changeLanguage}</Link>
      </nav>

      <div id="language-tests">
        <TestTrackCards languages={[language]} />
      </div>
      <ResourceLibrary language={language} />
    </div>
  );
}
