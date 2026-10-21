import { useI18n } from "@/application/i18n/I18nContext";
import type { TestLanguage } from "@/domain/models/language-test";
import { LearningAudioPlayer } from "./LearningAudioPlayer";

type Props = { script: string; language: TestLanguage; stageId: string; onCompleted: () => void; onTranscript: () => void };

export function ScriptListeningPractice({ script, language, stageId, onCompleted, onTranscript }: Props) {
  const { copy } = useI18n();
  return <div className="script-listening-practice">
    <LearningAudioPlayer text={script} language={language} stageId={stageId} label={copy.tests.syntheticAudio} onCompleted={onCompleted} onTranscript={onTranscript} />
    <p>{copy.tests.transcriptOnlyNotice}</p>
  </div>;
}
