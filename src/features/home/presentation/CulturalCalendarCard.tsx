import "@/styles/tailwind-study.css";
import { useState, type SyntheticEvent } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { useLocalStore } from "@/application/controllers/useLocalStore";
import { useLocalToday } from "@/application/controllers/useLocalToday";
import { useQuickSpeech } from "@/application/controllers/useQuickSpeech";
import { activeFestival, daysUntil, upcomingFestival } from "@/domain/models/cultural-calendar";
import { festivals } from "@/infrastructure/data/cultural-calendar";
import { stickerStore } from "@/infrastructure/data/sticker-store";
import { festivalLessons } from "@/infrastructure/i18n/cultural-calendar-copy";
import { immersionCopy } from "@/infrastructure/i18n/immersion-copy";
import { earnStoredSticker } from "@/shared/effects/celebrate";

const listenButton = "inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-edge bg-paper px-3 font-extrabold text-fg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current";

/**
 * Today's Korean festival, or the next one within two months, with a three-expression
 * mini-lesson. Opening the lesson on the day itself earns that festival's sticker.
 */
export function CulturalCalendarCard() {
  const { locale } = useI18n();
  const copy = immersionCopy[locale].calendar;
  const today = useLocalToday();
  const speech = useQuickSpeech("ko");
  const stickers = useLocalStore(stickerStore);
  const [justEarned, setJustEarned] = useState(false);
  const active = activeFestival(today, festivals);
  const festival = active ?? upcomingFestival(today, festivals, 60);
  if (!festival) return null;

  const lesson = festivalLessons[festival.id];
  const days = daysUntil(today, festival.date);
  const when = active ? copy.today : copy.inDays(days);
  const date = new Intl.DateTimeFormat({ es: "es-ES", en: "en-GB", ko: "ko-KR" }[locale], { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${festival.date}T12:00:00Z`));
  const held = Boolean(stickers.earned[festival.id]);

  const onToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    if (active && event.currentTarget.open && !held) setJustEarned(earnStoredSticker(festival.id, locale));
  };

  return (
    <section className="my-4 grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-left text-fg" aria-labelledby="culture-calendar-title" data-culture-calendar={festival.id}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <span className="eyebrow">{copy.kicker} · {when}</span>
          <h2 id="culture-calendar-title" className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">
            <span lang="ko">{lesson.hangul}</span>{locale !== "ko" && <> · {lesson.name[locale]}</>}
          </h2>
          <p className="m-0 text-sm font-extrabold">{date}</p>
        </div>
        <span className="grid size-16 place-items-center rounded-full border-2 border-ink bg-accent text-2xl font-black text-ink" lang="ko" aria-hidden="true">{lesson.hangul.slice(0, 1)}</span>
      </div>
      <p className="m-0 text-[0.95rem] leading-relaxed">{lesson.about[locale]}</p>
      <details className="rounded-2xl border-2 border-current/25 p-3" onToggle={onToggle}>
        <summary className="min-h-11 cursor-pointer content-center font-extrabold">{copy.lesson}</summary>
        <ul className="m-0 mt-2 grid list-none gap-2 p-0">
          {lesson.phrases.map((phrase) => (
            <li key={phrase.ko} className="flex items-center justify-between gap-3 rounded-xl bg-cream p-2">
              <span className="grid gap-0.5"><strong lang="ko" className="text-lg">{phrase.ko}</strong><span className="text-sm">{phrase.meaning[locale]}</span></span>
              {speech.available && <button type="button" className={listenButton} aria-label={copy.listen(phrase.ko)} title={copy.listen(phrase.ko)} onClick={() => speech.speak(phrase.ko)}><span aria-hidden="true">🔊</span></button>}
            </li>
          ))}
        </ul>
        {(justEarned || (active && held)) && <p className="m-0 mt-2 text-sm font-extrabold" role="status">🌷 {copy.earned}</p>}
      </details>
      <p className="m-0 text-xs leading-relaxed">{copy.note}</p>
    </section>
  );
}
