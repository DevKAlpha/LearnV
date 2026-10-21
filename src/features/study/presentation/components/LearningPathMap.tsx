import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import type { StageProgress, TestLanguage, TestSkill, TestStage } from "@/domain/models/language-test";
import type { LanguagePathPhase } from "@/domain/models/language-path";
import { isLanguageStageUnlocked } from "@/infrastructure/data/language-paths";
import { learningPathCopy } from "@/infrastructure/i18n/learning-path-copy";
import { AppIcon, type AppIconName } from "@/shared/ui/AppIcon";
import { getMotionScrollBehavior } from "@/shared/ui/motion-preferences";
import { getPathPlacement, getPathWindow } from "./learning-path-layout";
import { PathCultureAccent } from "./PathCultureAccent";

type Props = {
  language: TestLanguage;
  phase: LanguagePathPhase;
  skill: TestSkill;
  stages: TestStage[];
  progress: Record<string, StageProgress>;
  icon: AppIconName;
  label: string;
  description: string;
};

export function LearningPathMap({ language, phase, skill, stages, progress, icon, label, description }: Props) {
  const { copy, locale } = useI18n();
  const text = learningPathCopy[locale];
  const [expanded, setExpanded] = useState(false);
  const wasExpanded = useRef(false);
  const mapRef = useRef<HTMLOListElement>(null);
  const { currentIndex, start, visibleStages, completed } = getPathWindow(stages, progress, expanded);
  const mapId = `learning-path-${language}-${phase}-${skill}`;
  const headingId = `${mapId}-heading`;
  const captionId = `${mapId}-caption`;

  useEffect(() => {
    if (wasExpanded.current && !expanded) {
      const target = mapRef.current?.querySelector<HTMLAnchorElement>('[aria-current="step"]')
        ?? mapRef.current?.querySelector<HTMLAnchorElement>("li:last-child a");
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "center", behavior: getMotionScrollBehavior() });
    }
    wasExpanded.current = expanded;
  }, [expanded]);

  const toggle = (bottom = false) => <button className={`test-path-expand${bottom ? " test-path-expand--bottom" : ""}`} type="button" aria-expanded={expanded} aria-controls={mapId} onClick={() => setExpanded((value) => !value)}>{expanded ? text.collapse : text.expand(stages.length)}</button>;

  return <section className={`test-skill-section test-skill-section--${skill}`} aria-labelledby={headingId}>
    <header className="test-skill-header">
      <span aria-hidden="true"><AppIcon name={icon} /></span>
      <div><small>{completed}/{stages.length} {copy.tests.completed}</small><h2 id={headingId}>{label}</h2><p>{description}</p></div>
    </header>
    <div className="test-path-tools">
      <p id={captionId}>{completed === stages.length ? text.finished : text.window(start + 1, start + visibleStages.length, stages.length)}</p>
      {stages.length > 3 && toggle()}
    </div>
    <p className="test-path-legend">{text.legend}</p>
    <ol className="test-map" id={mapId} ref={mapRef} start={start + 1} role="list" aria-labelledby={headingId} aria-describedby={captionId}>
      {visibleStages.map((stage, visibleIndex) => {
        const index = start + visibleIndex;
        const placement = getPathPlacement(skill, index);
        const next = getPathPlacement(skill, index + 1);
        const unlocked = isLanguageStageUnlocked(language, stage.id, progress);
        const result = progress[stage.id];
        const passed = Boolean(result?.passed);
        const state = passed ? "passed" : unlocked ? "open" : "locked";
        const stateLabel = passed ? copy.tests.passed : unlocked ? copy.tests.current : copy.tests.locked;
        const style = { "--path-x": placement.x, "--path-mobile-x": placement.mobileX } as CSSProperties;
        const content = <>
          <span className="test-node-ring" aria-hidden="true">
            <span className="test-node-core"><AppIcon name={icon} /><b>{String(index + 1).padStart(2, "0")}</b></span>
            {passed && <i>✓</i>}
            {!unlocked && <i><AppIcon name="lock" /></i>}
          </span>
          <span className="test-node-copy">
            <small>{phase === "advanced" && <span className="test-path-c1-label">C1</span>}{String(index + 1).padStart(2, "0")} · {stateLabel}</small>
            <strong>{stage.title}</strong>
            {result && <b>{copy.tests.best} · {result.bestScore}%</b>}
          </span>
        </>;

        return <li className={`test-path-step test-path-step--${placement.shape}`} id={`path-${stage.id}`} value={index + 1} style={style} key={stage.id}>
          {visibleIndex < visibleStages.length - 1 && <>
            <svg className={`test-path-connector test-path-connector--${state}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d={`M ${placement.x} 0 C ${placement.x} 48, ${next.x} 52, ${next.x} 100`} /></svg>
            <svg className={`test-path-connector test-path-connector--mobile test-path-connector--${state}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d={`M ${placement.mobileX} 0 C ${placement.mobileX} 48, ${next.mobileX} 52, ${next.mobileX} 100`} /></svg>
          </>}
          {(expanded ? index % 4 === 0 : visibleIndex === 0) && <span className="test-path-decoration" data-side={placement.decorationSide} aria-hidden="true"><PathCultureAccent language={language} skill={skill} stageIndex={index} /></span>}
          <div className="test-path-stop">
            {unlocked ? <Link className={`test-map-node test-map-node--${state}`} aria-current={index === currentIndex && !passed ? "step" : undefined} to={`/tests/${language}/${stage.id}`}>{content}</Link>
              : <div className="test-map-node test-map-node--locked" aria-disabled="true" aria-label={`${stage.title} · ${stateLabel}. ${copy.tests.unlockHint}`}>{content}</div>}
            {index === currentIndex && !passed && unlocked && <details className="test-path-preparation">
              <summary>{text.preparation}</summary>
              <div>
                <strong>{stage.focus}</strong>
                <p>{result ? copy.tests.retakeAttempt : copy.tests.firstAttempt}</p>
                {stage.learningBridge && <p>{copy.tests.spiralPrevious}: {stage.learningBridge.recall}</p>}
              </div>
            </details>}
          </div>
        </li>;
      })}
    </ol>
    {expanded && stages.length > 3 && toggle(true)}
  </section>;
}
