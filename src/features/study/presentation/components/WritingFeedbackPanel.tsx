import "@/styles/tailwind-study.css";
import type { WritingAnalysis, WritingCheckId } from "@/domain/models/writing-feedback";
import { useI18n } from "@/application/i18n/I18nContext";
import { writingFeedbackCopy, writingFeedbackMessages } from "@/infrastructure/i18n/writing-feedback-copy";

type Props = {
  analysis: WritingAnalysis;
  minimum?: number;
  maximum?: number;
  targetGrammar?: readonly string[];
  improved?: readonly WritingCheckId[];
};

const marker = { ok: "✓", warn: "!", missing: "○" } as const;
const tone = {
  ok: "border-current/30",
  warn: "border-edge bg-[color-mix(in_srgb,var(--yellow)_18%,var(--paper))]",
  missing: "border-edge border-dashed",
} as const;

/** Objective checks on a draft, shared by practice tests, the simulator and the writing lab. */
export function WritingFeedbackPanel({ analysis, minimum, maximum, targetGrammar = [], improved = [] }: Props) {
  const { locale } = useI18n();
  const copy = writingFeedbackCopy[locale];
  const messages = writingFeedbackMessages[locale];
  const grammarCheck = analysis.checks.find((check) => check.id === "grammar");
  const missingGrammar = targetGrammar.filter((pattern) => !grammarCheck?.items?.includes(pattern));
  const context = { analysis, minimum, maximum, missingGrammar };
  return (
    <section className="grid gap-2 rounded-2xl border-2 border-edge bg-paper p-3.5 text-left text-fg" aria-label={copy.title}>
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <strong>{copy.title}</strong>
        <span className="text-sm font-bold">{copy.passed(analysis.passed, analysis.checks.length)}</span>
      </header>
      <p className="m-0 text-sm">{copy.intro}</p>
      <ul className="m-0 grid list-none gap-1.5 p-0">
        {analysis.checks.map((check) => (
          <li key={check.id} className={`flex gap-2 rounded-xl border-2 px-3 py-2 text-[0.95rem] leading-snug ${tone[check.status]}`}>
            <span aria-hidden="true" className="font-black">{marker[check.status]}</span>
            <span>
              <span className="sr-only">{copy[check.status]}: </span>
              {messages[check.id](check, context)}
              {improved.includes(check.id) && <strong className="ml-1 text-sm">↑ {copy.improved}</strong>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
