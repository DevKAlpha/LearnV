import { useI18n } from "@/application/i18n/I18nContext";
import type { TestStage } from "@/domain/models/language-test";

export function SpiralLearningNote({ stage, next = false }: { stage: TestStage; next?: boolean }) {
  const { copy } = useI18n();
  const bridge = stage.learningBridge;
  if (!bridge) return null;
  return <aside className="spiral-learning-note">
    <strong>{next ? copy.tests.spiralNext : copy.tests.spiralTitle}</strong>
    <p><span>{copy.tests.spiralPrevious}:</span> {bridge.recall} <span aria-hidden="true">→</span> <span>{copy.tests.spiralCurrent}:</span> {stage.focus}</p>
    <p>{bridge.application}</p>
    <details><summary>{copy.tests.spiralExample}</summary><small>{bridge.previousTitle}</small><p>{bridge.example}</p></details>
  </aside>;
}
