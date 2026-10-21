import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguageTestProgress } from "@/application/controllers/useLanguageTestProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import type { TestLanguage } from "@/domain/models/language-test";
import { learningResources } from "@/infrastructure/data/learning-resources";
import { getLanguagePathSummary as getLanguagePath } from "@/infrastructure/data/language-path-summary";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";
import { ResourceLibrary } from "@/features/study/presentation/components/ResourceLibrary";
import { TestTrackCards } from "@/features/study/presentation/components/TestTrackCards";
import { LanguageRestartModule } from "@/features/study/presentation/components/LanguageRestartModule";
import { AppIcon } from "@/shared/ui/AppIcon";
import { LanguageCulture } from "@/shared/ui/LanguageCulture";
import { getMotionScrollBehavior } from "@/shared/ui/motion-preferences";

type LanguageStudyPageProps = {
  language: TestLanguage;
};

export function LanguageStudyPage({ language }: LanguageStudyPageProps) {
  const { copy, locale } = useI18n();
  const { totals, progress } = useLanguageTestProgress();
  const path = getLanguagePath(language, progress[language]);
  const advanced = path.phase === "advanced";
  const advancedCopy = advancedPathCopy[locale];
  const isEnglish = language === "en";
  const resourceCount = learningResources.filter((resource) => resource.languages.includes(language)).length;
  const otherLanguage = isEnglish ? "korean" : "english";
  const [activeSection, setActiveSection] = useState<"tests" | "materials">("tests");
  const scrollToSection = (id: "language-tests" | "language-materials") => {
    setActiveSection(id === "language-tests" ? "tests" : "materials");
    document.getElementById(id)?.scrollIntoView({ behavior: getMotionScrollBehavior(), block: "start" });
  };

  useEffect(() => {
    let frame = 0;
    const updateActiveSection = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const materials = document.getElementById("language-materials");
        if (!materials) return;
        setActiveSection(materials.getBoundingClientRect().top <= 190 ? "materials" : "tests");
      });
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [language]);

  return (
    <div className={`page language-study-page language-study-page--${language}`}>
      <header className="language-study-hero">
        <Link className="test-back-link" to="/study"><span aria-hidden="true">←</span>{copy.study.backStudy}</Link>
        <div className="language-study-hero__main">
          <span className="language-study-symbol" aria-hidden="true">{isEnglish ? "A+" : "한"}</span>
          <div>
            <span className="eyebrow">{copy.study.independentSpace}</span>
            <h1>{advanced ? (isEnglish ? advancedCopy.title : advancedCopy.koreanTitle) : isEnglish ? copy.study.englishSpaceTitle : copy.study.koreanSpaceTitle}</h1>
            <p>{advanced ? advancedCopy.intro : isEnglish ? copy.study.englishSpaceText : copy.study.koreanSpaceText}</p>
          </div>
        </div>
        <LanguageCulture language={language} variant="hero" illustrated />
        <div className="language-study-facts">
          <span><strong>{advanced ? path.completed : totals[language]}/{path.track.stages.length}</strong>{copy.study.testsPassed}</span>
          <span><strong>{resourceCount}</strong>{copy.study.resourcesAvailable}</span>
        </div>
      </header>

      <nav className="language-study-jump-nav" aria-label={copy.study.spaceNavigation}>
        <button className={activeSection === "tests" ? "is-active" : ""} type="button" aria-pressed={activeSection === "tests"} onClick={() => scrollToSection("language-tests")}><span aria-hidden="true"><AppIcon name="test" /></span>{copy.study.goTests}</button>
        <button className={activeSection === "materials" ? "is-active" : ""} type="button" aria-pressed={activeSection === "materials"} onClick={() => scrollToSection("language-materials")}><span aria-hidden="true"><AppIcon name="document" /></span>{copy.study.goMaterials}</button>
        <Link to={`/study/${otherLanguage}`}><span className="language-swap-icon" aria-hidden="true">EN<small>한</small></span>{copy.study.changeLanguage}</Link>
      </nav>

      <div id="language-tests">
        <LanguageRestartModule key={language} language={language} />
        <TestTrackCards languages={[language]} />
      </div>
      <ResourceLibrary language={language} />
    </div>
  );
}
