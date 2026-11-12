import "@/styles/tailwind-study.css";
import { useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { trackLearning } from "@/application/controllers/learningJourneyEvents";
import { useReviewDeck } from "@/application/controllers/useReviewDeck";
import { buildSession, isOrderCorrect, isTypedAnswerCorrect, type ReviewCard, type ReviewLanguage } from "@/domain/models/review-deck";
import { newCard, previewIntervals, type CardState, type Rating } from "@/domain/models/srs";
import { seededRandom, shuffle } from "@/domain/models/random";
import { reviewDeck } from "@/infrastructure/data/review-deck-cards";
import { formatInterval, reviewCopy } from "@/infrastructure/i18n/review-copy";
import { PageEmblem } from "@/shared/ui/PageEmblem";
import { LearningAudioPlayer } from "../components/LearningAudioPlayer";

type Copy = (typeof reviewCopy)[keyof typeof reviewCopy];
type Filter = "all" | ReviewLanguage;
type Outcome = { correct: boolean; transcriptUsed?: boolean };

const button = "min-h-11 cursor-pointer rounded-full border-2 px-5 py-2 font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-50";
const primary = `${button} border-ink bg-accent text-ink`;
const secondary = `${button} border-edge bg-paper text-fg`;
const panel = "grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-fg";
/** Speech synthesis is needed for dictation; without it those cards are left out. */
const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Shuffled blocks for an order card; never shown already in the right order. */
function shuffledBlocks(card: ReviewCard) {
  if (!card.tokens) return [];
  const seed = [...card.id].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  const blocks = shuffle(card.tokens.map((token, index) => ({ token, index })), seededRandom(seed));
  return blocks.length > 1 && blocks.every((block, position) => block.token === card.tokens![position]) ? [...blocks.slice(1), blocks[0]] : blocks;
}

function Rater({ card, cardState, copy, allowAgain, onRate }: { card: ReviewCard; cardState?: CardState; copy: Copy; allowAgain: boolean; onRate: (rating: Rating) => void }) {
  const [now] = useState(() => new Date());
  const preview = previewIntervals(cardState ?? newCard(card.id, now), now);
  const ratings: [Rating, string][] = [[1, copy.again], [2, copy.hard], [3, copy.good], [4, copy.easy]];
  return (
    <fieldset className="m-0 grid gap-2 border-0 p-0">
      <legend className="mb-2 font-extrabold">{copy.rateTitle}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ratings.filter(([rating]) => allowAgain || rating !== 1).map(([rating, label]) => (
          <button key={rating} type="button" className={rating === 3 ? primary : secondary} onClick={() => onRate(rating)}>
            {label}<small className="block text-xs font-semibold opacity-80">{formatInterval(preview[rating], copy)}</small>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Explanation({ card, copy, note, meaning }: { card: ReviewCard; copy: Copy; note: string; meaning: string }) {
  return (
    <div className="grid gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--yellow)_16%,var(--paper))] p-3.5">
      <p className="m-0"><strong>{copy.theAnswer}:</strong> <span lang={card.language}>{card.exercise === "cloze" ? card.prompt.replace("___", card.answer) : card.answer}</span></p>
      {meaning && <p className="m-0">{meaning}</p>}
      {note && <p className="m-0 text-[0.95rem] leading-relaxed"><strong>{copy.why}:</strong> {note}</p>}
    </div>
  );
}

function CardView({ card, cardState, copy, locale, onDone, onRemove }: { card: ReviewCard; cardState?: CardState; copy: Copy; locale: "es" | "en" | "ko"; onDone: (rating: Rating, firstTry: boolean) => void; onRemove: () => void }) {
  const inputId = useId();
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<number[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const transcriptUsed = useRef(false);
  const blocks = useMemo(() => shuffledBlocks(card), [card]);
  const meaning = locale === "es" ? card.meaning.es : card.meaning.en;
  const note = locale === "es" ? card.note.es : card.note.en;
  const lang = card.language;

  const check = () => {
    if (card.exercise === "cloze" || card.exercise === "dictation") {
      const correct = isTypedAnswerCorrect(typed, card) && !transcriptUsed.current;
      setOutcome({ correct, transcriptUsed: transcriptUsed.current });
    } else if (card.exercise === "order") {
      setOutcome({ correct: isOrderCorrect(picked.map((index) => card.tokens![index]), card) });
    }
  };
  const choose = (index: number) => {
    if (choice !== null) return;
    setChoice(index);
    setOutcome({ correct: index === card.correctIndex });
  };

  const finished = card.exercise === "recall" ? revealed : outcome !== null;

  return (
    <article className={panel} aria-labelledby={`${inputId}-title`}>
      <p className="m-0 text-sm font-extrabold uppercase tracking-wide opacity-80">{copy.exercise[card.exercise]} · {lang === "ko" ? "한국어" : "English"}</p>

      {card.exercise === "recall" && (
        <h2 id={`${inputId}-title`} className="m-0 text-[clamp(2rem,9vw,3.25rem)] leading-tight" lang={lang}>{card.prompt}</h2>
      )}
      {card.exercise === "cloze" && (
        <>
          <h2 id={`${inputId}-title`} className="m-0 text-[clamp(1.35rem,5vw,1.9rem)] leading-snug" lang={lang}>{card.prompt}</h2>
          <p className="m-0"><strong>{copy.hint}:</strong> {meaning}</p>
        </>
      )}
      {card.exercise === "order" && (
        <>
          <h2 id={`${inputId}-title`} className="m-0 text-xl">{meaning}</h2>
          <p className="m-0 text-sm">{copy.orderHint}</p>
          <p className="m-0 min-h-12 rounded-2xl border-2 border-dashed border-edge px-3 py-2.5 text-lg" lang={lang} aria-live="polite">
            {picked.map((index) => card.tokens![index]).join(" ")}
          </p>
          <div className="flex flex-wrap gap-2" lang={lang}>
            {blocks.map(({ token, index }) => (
              <button key={index} type="button" className={secondary} disabled={picked.includes(index) || outcome !== null} onClick={() => setPicked((current) => [...current, index])}>{token}</button>
            ))}
          </div>
          {picked.length > 0 && outcome === null && <button type="button" className="w-fit cursor-pointer border-0 bg-transparent p-1 font-extrabold text-fg underline" onClick={() => setPicked([])}>{copy.reset}</button>}
        </>
      )}
      {card.exercise === "dictation" && (
        <>
          <h2 id={`${inputId}-title`} className="m-0 text-xl">{copy.dictationHint}</h2>
          <LearningAudioPlayer text={card.audio ?? card.answer} language={lang} stageId="review" questionId={card.id} onTranscript={() => { transcriptUsed.current = true; }} />
        </>
      )}
      {card.exercise === "choice" && (
        <>
          <p className="m-0 text-sm">{copy.mistakeOrigin}</p>
          {card.passage && <blockquote className="m-0 rounded-2xl border-l-4 border-edge bg-cream p-3" lang={lang}>{card.passage}</blockquote>}
          {card.audio && <LearningAudioPlayer text={card.audio} language={lang} stageId="review" questionId={card.id} />}
          <h2 id={`${inputId}-title`} className="m-0 text-xl" lang={lang}>{card.prompt}</h2>
          <div className="grid gap-2" role="radiogroup" aria-labelledby={`${inputId}-title`}>
            {card.options?.map((option, index) => (
              <label key={index} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border-2 px-3 py-2 ${choice === index ? "border-ink bg-accent-soft text-ink" : "border-current/30"}`}>
                <input type="radio" name={card.id} checked={choice === index} disabled={choice !== null} onChange={() => choose(index)} />
                <span lang={lang}>{option}</span>
              </label>
            ))}
          </div>
        </>
      )}

      {(card.exercise === "cloze" || card.exercise === "dictation") && (
        <div className="grid gap-1.5">
          <label htmlFor={inputId} className="font-extrabold">{copy.answerLabel}</label>
          <input
            id={inputId}
            lang={lang}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-h-11 rounded-xl border-2 border-edge bg-paper px-3 text-lg text-fg"
            value={typed}
            readOnly={outcome !== null}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && typed.trim() && outcome === null) check(); }}
          />
        </div>
      )}

      {!finished && card.exercise === "recall" && <button type="button" className={primary} onClick={() => setRevealed(true)}>{copy.show}</button>}
      {!finished && (card.exercise === "cloze" || card.exercise === "dictation") && <button type="button" className={primary} disabled={!typed.trim()} onClick={check}>{copy.check}</button>}
      {!finished && card.exercise === "order" && <button type="button" className={primary} disabled={picked.length !== (card.tokens?.length ?? 0)} onClick={check}>{copy.check}</button>}

      {finished && (
        <div className="grid gap-3" aria-live="polite">
          {outcome && <p className={`m-0 text-lg font-extrabold ${outcome.correct ? "text-fg" : "text-[#b3263e] in-data-[theme=dark]:text-[#ff9cad]"}`}>{outcome.correct ? `✓ ${copy.correct}` : `↺ ${copy.incorrect}`}</p>}
          {outcome?.transcriptUsed && <p className="m-0 text-sm">{copy.transcriptUsed}</p>}
          <Explanation card={card} copy={copy} note={note} meaning={card.exercise === "recall" || card.exercise === "dictation" ? meaning : ""} />
          {card.audio && card.exercise !== "dictation" && card.exercise !== "choice" && <LearningAudioPlayer text={card.audio} language={lang} stageId="review" questionId={card.id} />}
          {outcome && !outcome.correct
            ? <button type="button" className={primary} onClick={() => onDone(1, false)}>{copy.next}</button>
            : <Rater card={card} cardState={cardState} copy={copy} allowAgain={card.exercise === "recall"} onRate={(rating) => onDone(rating, rating !== 1)} />}
          {card.group === "mistake" && <button type="button" className="w-fit cursor-pointer border-0 bg-transparent p-1 text-sm font-bold text-fg underline" onClick={onRemove}>{copy.remove}</button>}
        </div>
      )}
    </article>
  );
}

function Session({ cards, copy, locale, filter, onExit }: { cards: ReviewCard[]; copy: Copy; locale: "es" | "en" | "ko"; filter: Filter; onExit: () => void }) {
  const { state, rate, forget } = useReviewDeck(reviewDeck);
  const [queue, setQueue] = useState(cards);
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState({ reviewed: 0, firstTry: 0 });
  const seen = useRef(new Set<string>());
  const card = queue[index];

  const advance = (rating: Rating, firstTry: boolean) => {
    rate(card.id, rating);
    const first = !seen.current.has(card.id);
    seen.current.add(card.id);
    const next = { reviewed: stats.reviewed + (first ? 1 : 0), firstTry: stats.firstTry + (first && firstTry ? 1 : 0) };
    setStats(next);
    // A forgotten card comes back once at the end of this session (its learning step).
    const repeats = queue.filter((item) => item.id === card.id).length;
    if (rating === 1 && repeats < 2) setQueue((current) => [...current, card]);
    if (index + 1 >= queue.length + (rating === 1 && repeats < 2 ? 1 : 0)) {
      trackLearning({
        kind: "practice", itemId: "review-session", language: filter === "all" ? "general" : filter, skill: "vocabulary",
        score: next.reviewed ? Math.round((next.firstTry / next.reviewed) * 100) : 0, passed: next.reviewed > 0 && next.firstTry / next.reviewed >= 0.7,
      });
    }
    setIndex((current) => current + 1);
  };

  if (!card) {
    return (
      <section className={panel} aria-labelledby="review-done-title">
        <h2 id="review-done-title" className="m-0 text-2xl">{copy.doneTitle}</h2>
        <p className="m-0">{copy.doneText(stats.reviewed, stats.firstTry)}</p>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" className={primary} onClick={onExit}>{copy.again2}</button>
          <Link className={`${secondary} no-underline`} to="/study">{copy.back}</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-3" aria-label={copy.title}>
      <div className="h-2.5 overflow-hidden rounded-full border-2 border-edge bg-paper" role="progressbar" aria-label={copy.progress} aria-valuemin={1} aria-valuemax={queue.length} aria-valuenow={index + 1} aria-valuetext={`${copy.progress} ${index + 1} ${copy.of} ${queue.length}`}>
        <span className="block h-full bg-accent" style={{ width: `${((index + 1) / queue.length) * 100}%` }} />
      </div>
      <CardView key={`${card.id}:${index}`} card={card} cardState={state.cards[card.id]} copy={copy} locale={locale} onDone={advance} onRemove={() => { forget(card.id); setQueue((current) => current.filter((item, position) => position <= index || item.id !== card.id)); setIndex((current) => current + 1); }} />
    </section>
  );
}

export function ReviewPage() {
  const { locale } = useI18n();
  const copy = reviewCopy[locale];
  const { state, summary } = useReviewDeck(reviewDeck);
  const [filter, setFilter] = useState<Filter>("all");
  const [session, setSession] = useState<ReviewCard[] | null>(null);
  const [run, setRun] = useState(0);

  const start = () => {
    const cards = buildSession(reviewDeck, state, new Date(), filter === "all" ? undefined : filter)
      .filter((card) => card.exercise !== "dictation" || canSpeak());
    setSession(cards);
    setRun((value) => value + 1);
  };
  const available = useMemo(() => buildSession(reviewDeck, state, new Date(), filter === "all" ? undefined : filter).length, [state, filter]);
  const filters: [Filter, string][] = [["all", copy.all], ["ko", copy.ko], ["en", copy.en]];

  return (
    <div className="page page--review">
      <header className="page-header">
        <PageEmblem icon="study" />
        <span className="eyebrow">{copy.kicker}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>

      {session ? (
        <Session key={run} cards={session} copy={copy} locale={locale} filter={filter} onExit={() => setSession(null)} />
      ) : (
        <section className={panel} aria-labelledby="review-start-title">
          <h2 id="review-start-title" className="sr-only">{copy.start}</h2>
          <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
            <legend className="sr-only">{copy.filter}</legend>
            {filters.map(([value, label]) => (
              <label key={value} className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 px-4 font-extrabold has-focus-visible:outline-3 has-focus-visible:outline-offset-2 ${filter === value ? "border-ink bg-accent text-ink" : "border-edge bg-paper text-fg"}`}>
                <input className="sr-only" type="radio" name="review-filter" value={value} checked={filter === value} onChange={() => setFilter(value)} />
                {label}
              </label>
            ))}
          </fieldset>
          <dl className="m-0 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[[summary.due, copy.due], [summary.fresh, copy.fresh], [summary.reviewedToday, copy.reviewedToday], [summary.learned, copy.learned]].map(([value, label]) => (
              <div key={label} className="grid rounded-2xl border-2 border-current/30 p-3">
                <dt className="order-2 text-sm">{label}</dt>
                <dd className="m-0 text-3xl font-black">{value}</dd>
              </div>
            ))}
          </dl>
          {summary.mistakes > 0 && <p className="m-0 text-sm">{summary.mistakes} {copy.mistakes}</p>}
          {available > 0
            ? <button type="button" className={`${primary} w-fit`} onClick={start}>{copy.start} · {available}</button>
            : <p className="m-0" role="status">{copy.empty}</p>}
        </section>
      )}

      {!session && (
        <nav className="mt-4 flex flex-wrap gap-2.5" aria-label={copy.tools}>
          <Link className={`${secondary} no-underline`} to="/study/hangul">{copy.hangul} →</Link>
          <Link className={`${secondary} no-underline`} to="/study/writing-lab">{copy.writingLab} →</Link>
          <Link className={`${secondary} no-underline`} to="/study/level-test">{copy.levelTest} →</Link>
        </nav>
      )}
    </div>
  );
}
