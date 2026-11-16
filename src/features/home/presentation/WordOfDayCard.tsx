import "@/styles/tailwind-study.css";
import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { useLocalToday } from "@/application/controllers/useLocalToday";
import { useQuickSpeech } from "@/application/controllers/useQuickSpeech";
import { pickOfTheDay } from "@/domain/models/milestones";
import type { ReviewCard } from "@/domain/models/review-deck";
import { reviewDeck } from "@/infrastructure/data/review-deck-cards";
import { immersionCopy } from "@/infrastructure/i18n/immersion-copy";

const words = (language: "en" | "ko") => reviewDeck.filter((card) => card.language === language && card.group === "vocabulary" && card.exercise === "recall");
const koreanWords = words("ko");
const englishWords = words("en");

const listenButton = "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-2 border-edge bg-paper px-3 font-extrabold text-fg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current";

function Word({ card, label, listen, speak, available }: { card: ReviewCard; label: string; listen: string; speak: (text: string) => void; available: boolean }) {
  const { locale } = useI18n();
  const meaning = locale === "es" ? card.meaning.es : card.meaning.en;
  const note = locale === "es" ? card.note.es : card.note.en;
  return (
    <div className="grid content-start gap-1 rounded-2xl border-2 border-edge bg-cream p-3">
      <small className="text-xs font-extrabold uppercase tracking-wider">{label}</small>
      <div className="flex items-center justify-between gap-2">
        <strong className="text-2xl leading-tight" lang={card.language}>{card.prompt}</strong>
        {available && <button type="button" className={listenButton} aria-label={listen} title={listen} onClick={() => speak(card.audio ?? card.prompt)}><span aria-hidden="true">🔊</span></button>}
      </div>
      <p className="m-0 text-[0.95rem]">{meaning}</p>
      {note && <p className="m-0 text-sm leading-relaxed">{note}</p>}
    </div>
  );
}

/** One Korean and one English word a day, the same on every device, with audio. */
export function WordOfDayCard() {
  const { locale } = useI18n();
  const copy = immersionCopy[locale].word;
  const today = useLocalToday();
  const korean = useQuickSpeech("ko");
  const english = useQuickSpeech("en");
  const ko = pickOfTheDay(koreanWords, today, "ko");
  const en = pickOfTheDay(englishWords, today, "en");
  if (!ko || !en) return null;

  return (
    <section className="my-4 grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-left text-fg" aria-labelledby="word-of-day-title" data-word-of-day>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="grid gap-1">
          <span className="eyebrow">{copy.kicker}</span>
          <h2 id="word-of-day-title" className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">{copy.title}</h2>
        </div>
        <Link className="font-extrabold text-fg underline underline-offset-4" to="/study/review">{copy.practice} →</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Word card={ko} label={copy.korean} listen={copy.listen(ko.prompt)} speak={korean.speak} available={korean.available} />
        <Word card={en} label={copy.english} listen={copy.listen(en.prompt)} speak={english.speak} available={english.available} />
      </div>
    </section>
  );
}
