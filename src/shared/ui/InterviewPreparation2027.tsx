import { interview2027, interview2027Copy } from "@/infrastructure/data/interview-2027";
import type { Locale } from "@/domain/models/i18n";
import { INTERVIEW_STAGES } from "@/domain/models/interview-chatbot";
import { AppIcon } from "@/shared/ui/AppIcon";
import { InterviewScene } from "./InterviewScene";
import "@/styles/interview-preparation.css";

export function InterviewPreparation2027({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const copy = interview2027Copy[locale];
  const content = <>
    <p>{copy.scope}</p>
    <div className="interview-preparation__cards">{INTERVIEW_STAGES.map((stage, index) => <article key={stage}>
      <span aria-hidden="true">0{index + 1}</span><h3>{copy.cards[stage].title}</h3><p>{copy.cards[stage].text}</p>
    </article>)}</div>
    <nav aria-label={copy.source}>
      <a href={interview2027.noticeUrl} target="_blank" rel="noopener noreferrer"><AppIcon name="document" />{copy.source}<span aria-hidden="true">↗</span></a>
      <a href={interview2027.guideUrl} target="_blank" rel="noopener noreferrer">{copy.guide}<span aria-hidden="true">↗</span></a>
      <a href={interview2027.embassyUrl} target="_blank" rel="noopener noreferrer">{copy.embassy}<span aria-hidden="true">↗</span></a>
    </nav>
    <p className="interview-preparation__reviewed">{copy.reviewed}: <time dateTime={interview2027.reviewedAt}>{interview2027.reviewedAt}</time></p>
    <p className="interview-preparation__notice">{copy.practice}</p>
  </>;
  if (compact) return <details className="interview-preparation interview-preparation--compact" lang={locale}><summary><AppIcon name="book" />{copy.badge}</summary>{content}</details>;
  return <section className="interview-preparation" lang={locale} aria-label={copy.badge}>
    <header><div><span className="eyebrow">{copy.badge}</span><h2>{copy.title}</h2></div><InterviewScene /></header>{content}
  </section>;
}
