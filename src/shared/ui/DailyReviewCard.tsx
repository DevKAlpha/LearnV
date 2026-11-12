import "@/styles/tailwind-study.css";
import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { useReviewDeck } from "@/application/controllers/useReviewDeck";
import { reviewDeck } from "@/infrastructure/data/review-deck-cards";
import { reviewCopy } from "@/infrastructure/i18n/review-copy";

const link = "inline-flex min-h-11 items-center rounded-full border-2 px-5 py-2 font-extrabold no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current";

/**
 * Today's spaced-review load with a direct entry. Loaded lazily (it carries the deck), so it
 * never weighs on the first paint of Home.
 */
export function DailyReviewCard({ tools = false }: { tools?: boolean }) {
  const { locale } = useI18n();
  const copy = reviewCopy[locale];
  const { summary } = useReviewDeck(reviewDeck);
  const pending = summary.due + summary.fresh;
  return (
    <section className="my-4 grid gap-2.5 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,3.5vw,24px)] text-left text-fg" aria-labelledby="daily-review-title">
      <span className="eyebrow">{copy.todayKicker}</span>
      <h2 id="daily-review-title" className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">
        {pending > 0 ? copy.pending(summary.due, summary.fresh) : copy.upToDate}
      </h2>
      {tools && <p className="m-0 text-[0.95rem] leading-relaxed">{copy.toolsIntro}</p>}
      <div className="flex flex-wrap gap-2.5">
        <Link className={`${link} border-ink bg-accent text-ink`} to="/study/review">{copy.cta} →</Link>
        {tools && <Link className={`${link} border-edge bg-paper text-fg`} to="/study/hangul">{copy.hangul}</Link>}
        {tools && <Link className={`${link} border-edge bg-paper text-fg`} to="/study/writing-lab">{copy.writingLab}</Link>}
      </div>
    </section>
  );
}
