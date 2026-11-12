import "@/styles/tailwind-study.css";
import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { trackLearning } from "@/application/controllers/learningJourneyEvents";
import { useQuickSpeech } from "@/application/controllers/useQuickSpeech";
import { compose, FINALS, INITIALS, KEYBOARD_ROWS, readingQuiz, romanize, VOWELS, type FinalSound } from "@/domain/models/hangul";
import { seededRandom } from "@/domain/models/random";
import { hangulCopy } from "@/infrastructure/i18n/hangul-copy";
import { PageEmblem } from "@/shared/ui/PageEmblem";

type Copy = (typeof hangulCopy)[keyof typeof hangulCopy];

const BASIC_VOWELS = ["ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ"];
const COMPOUND_VOWELS = ["ㅐ", "ㅒ", "ㅔ", "ㅖ", "ㅘ", "ㅙ", "ㅚ", "ㅝ", "ㅞ", "ㅟ", "ㅢ"];
const PLAIN = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅎ"];
const ASPIRATED = ["ㅋ", "ㅌ", "ㅍ", "ㅊ"];
const TENSE = ["ㄲ", "ㄸ", "ㅃ", "ㅆ", "ㅉ"];
const BATCHIM: { sound: FinalSound; rr: string; letters: string; examples: [string, string?][] }[] = [
  { sound: "ㄱ", rr: "k", letters: "ㄱ ㄲ ㅋ ㄳ ㄺ", examples: [["학"], ["밖", "박"], ["부엌", "부억"], ["닭", "닥"]] },
  { sound: "ㄴ", rr: "n", letters: "ㄴ ㄵ ㄶ", examples: [["산"], ["앉다", "안따"], ["많다", "만타"]] },
  { sound: "ㄷ", rr: "t", letters: "ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ", examples: [["옷", "옫"], ["낮", "낟"], ["꽃", "꼳"], ["밭", "받"]] },
  { sound: "ㄹ", rr: "l", letters: "ㄹ ㄼ ㄽ ㄾ ㅀ", examples: [["물"], ["여덟", "여덜"]] },
  { sound: "ㅁ", rr: "m", letters: "ㅁ ㄻ", examples: [["밤"], ["삶", "삼"]] },
  { sound: "ㅂ", rr: "p", letters: "ㅂ ㅍ ㅄ ㄿ", examples: [["밥"], ["앞", "압"], ["값", "갑"]] },
  { sound: "ㅇ", rr: "ng", letters: "ㅇ", examples: [["방"], ["학생"]] },
];
const LIAISON: [string, string][] = [["음악", "으막"], ["한국어", "한구거"], ["옷이", "오시"], ["읽어요", "일거요"]];
const QUIZ_POOL = [..."가나다라마바사아자차카타파하고노도로모보소오조구누두루무부수우주학생한국글밥물산강집책문길꽃옷밤빵떡쌀커피김치"];
const QUIZ_LENGTH = 8;

const section = "grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-fg";
const heading = "m-0 text-[clamp(1.25rem,4vw,1.6rem)] leading-tight";
const tile = "grid min-h-20 min-w-0 cursor-pointer place-items-center gap-0.5 rounded-2xl border-2 px-2 py-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current";
const button = "min-h-11 cursor-pointer rounded-full border-2 px-5 py-2 font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-50";

function LetterGrid({ letters, example, speak, copy }: { letters: readonly string[]; example: (letter: string) => string; speak: (text: string) => void; copy: Copy }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2">
      {letters.map((letter) => {
        const syllable = example(letter);
        return (
          <button key={letter} type="button" className={`${tile} border-edge bg-cream text-fg`} onClick={() => speak(syllable)}>
            <span className="text-3xl font-black leading-none" lang="ko">{letter}</span>
            <span className="text-sm" lang="ko">{syllable}</span>
            <span className="text-xs font-bold opacity-80">{romanize(syllable) || "—"}</span>
            <span className="sr-only">{copy.listen}</span>
          </button>
        );
      })}
    </div>
  );
}

function BlockBuilder({ copy, speak }: { copy: Copy; speak: (text: string) => void }) {
  const id = useId();
  const [initial, setInitial] = useState("ㅎ");
  const [vowel, setVowel] = useState("ㅏ");
  const [final, setFinal] = useState("ㄴ");
  const syllable = compose(initial, vowel, final) ?? "";
  const select = "min-h-11 rounded-xl border-2 border-edge bg-paper px-2 text-xl text-fg";
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
      <div className="grid grid-cols-3 gap-2">
        <label className="grid gap-1 font-bold" htmlFor={`${id}-i`}>{copy.initial}
          <select id={`${id}-i`} className={select} lang="ko" value={initial} onChange={(event) => setInitial(event.target.value)}>{INITIALS.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        </label>
        <label className="grid gap-1 font-bold" htmlFor={`${id}-v`}>{copy.vowel}
          <select id={`${id}-v`} className={select} lang="ko" value={vowel} onChange={(event) => setVowel(event.target.value)}>{VOWELS.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        </label>
        <label className="grid gap-1 font-bold" htmlFor={`${id}-f`}>{copy.final}
          <select id={`${id}-f`} className={select} lang="ko" value={final} onChange={(event) => setFinal(event.target.value)}>{FINALS.map((value) => <option key={value || "none"} value={value}>{value || copy.none}</option>)}</select>
        </label>
      </div>
      <button type="button" className={`${tile} min-h-32 min-w-32 border-ink bg-accent text-ink`} onClick={() => speak(syllable)}>
        <span className="text-6xl font-black leading-none" lang="ko" aria-live="polite">{syllable}</span>
        <span className="text-base font-bold">{romanize(syllable)}</span>
        <span className="sr-only">{copy.listen}</span>
      </button>
    </div>
  );
}

function ReadingQuiz({ copy }: { copy: Copy }) {
  const [round, setRound] = useState(() => Math.floor(Math.random() * 1_000_000));
  const questions = useMemo(() => readingQuiz(QUIZ_POOL, QUIZ_LENGTH, seededRandom(round)), [round]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const question = questions[index];

  const choose = (option: number) => {
    if (picked !== null) return;
    setPicked(option);
    if (option === question.correctIndex) setScore((value) => value + 1);
  };
  const next = () => {
    if (index + 1 === questions.length) {
      trackLearning({ kind: "practice", itemId: "hangul-reading-quiz", language: "ko", skill: "reading", score: Math.round((score / questions.length) * 100), passed: score >= questions.length - 1 });
    }
    setIndex((value) => value + 1);
    setPicked(null);
  };
  const restart = () => { setRound((value) => value + 1); setIndex(0); setPicked(null); setScore(0); };

  if (!question) {
    return (
      <div className="grid gap-2" role="status">
        <p className="m-0 text-2xl font-black">{copy.result(score, questions.length)}</p>
        <p className="m-0">{copy.resultTip}</p>
        <button type="button" className={`${button} w-fit border-ink bg-accent text-ink`} onClick={restart}>{copy.retry}</button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <p className="m-0 text-sm font-bold">{copy.question} {index + 1} {copy.of} {questions.length}</p>
      <p className="m-0 text-center text-7xl font-black leading-none" lang="ko" id="hangul-quiz-syllable">{question.syllable}</p>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="hangul-quiz-syllable">
        {question.options.map((option, optionIndex) => {
          const state = picked !== null && optionIndex === question.correctIndex ? "border-ink bg-accent text-ink" : `border-edge bg-paper text-fg${picked === optionIndex ? " opacity-60 line-through" : ""}`;
          return (
            <button key={option} type="button" role="radio" aria-checked={picked === optionIndex} disabled={picked !== null} className={`${button} text-lg ${state}`} onClick={() => choose(optionIndex)}>{option}</button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="flex flex-wrap items-center justify-between gap-2" aria-live="polite">
          <strong>{picked === question.correctIndex ? copy.correct : `${copy.wrong}: ${question.options[question.correctIndex]}`}</strong>
          <button type="button" className={`${button} border-ink bg-accent text-ink`} onClick={next}>{index + 1 === questions.length ? copy.finish : copy.next}</button>
        </div>
      )}
    </div>
  );
}

export function HangulPage() {
  const { locale } = useI18n();
  const copy = hangulCopy[locale];
  const { speak, available } = useQuickSpeech("ko");

  return (
    <div className="page page--hangul">
      <header className="page-header">
        <PageEmblem icon="study" />
        <span className="eyebrow">{copy.kicker}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>

      <div className="grid gap-4">
        <p className="m-0 text-sm" role="note">{copy.romanNote}{available ? "" : ` ${copy.noVoice}`}</p>

        <section className={section} aria-labelledby="hangul-vowels">
          <h2 id="hangul-vowels" className={heading}>{copy.vowelsTitle}</h2>
          <p className="m-0">{copy.vowelsText}</p>
          <h3 className="m-0 text-base">{copy.basicVowels}</h3>
          <LetterGrid letters={BASIC_VOWELS} example={(vowel) => compose("ㅇ", vowel) ?? vowel} speak={speak} copy={copy} />
          <h3 className="m-0 text-base">{copy.compoundVowels}</h3>
          <LetterGrid letters={COMPOUND_VOWELS} example={(vowel) => compose("ㅇ", vowel) ?? vowel} speak={speak} copy={copy} />
        </section>

        <section className={section} aria-labelledby="hangul-consonants">
          <h2 id="hangul-consonants" className={heading}>{copy.consonantsTitle}</h2>
          <p className="m-0">{copy.consonantsText}</p>
          {([[copy.plain, PLAIN], [copy.aspirated, ASPIRATED], [copy.tense, TENSE]] as const).map(([label, letters]) => (
            <div key={label} className="grid gap-2">
              <h3 className="m-0 text-base">{label}</h3>
              <LetterGrid letters={letters} example={(consonant) => compose(consonant, "ㅏ") ?? consonant} speak={speak} copy={copy} />
            </div>
          ))}
          <ul className="m-0 grid gap-1 pl-5">{copy.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
        </section>

        <section className={section} aria-labelledby="hangul-builder">
          <h2 id="hangul-builder" className={heading}>{copy.builderTitle}</h2>
          <p className="m-0">{copy.builderText}</p>
          <BlockBuilder copy={copy} speak={speak} />
        </section>

        <section className={section} aria-labelledby="hangul-batchim">
          <h2 id="hangul-batchim" className={heading}>{copy.batchimTitle}</h2>
          <p className="m-0">{copy.batchimText}</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead><tr className="border-b-2 border-edge"><th className="p-2">{copy.sound}</th><th className="p-2">{copy.letters}</th><th className="p-2">{copy.examples}</th></tr></thead>
              <tbody>
                {BATCHIM.map((row) => (
                  <tr key={row.sound} className="border-b border-current/25">
                    <td className="p-2 text-xl font-black" lang="ko">{row.sound} <small className="text-sm font-bold">[{row.rr}]</small></td>
                    <td className="p-2" lang="ko">{row.letters}</td>
                    <td className="p-2" lang="ko">
                      <span className="flex flex-wrap gap-1.5">
                        {row.examples.map(([word, sounds]) => (
                          <button key={word} type="button" className="min-h-9 cursor-pointer rounded-full border border-edge bg-cream px-2.5 text-fg" onClick={() => speak(word)}>{word}{sounds ? ` [${sounds}]` : ""}</button>
                        ))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="m-0 text-base">{copy.liaisonTitle}</h3>
          <p className="m-0">{copy.liaisonText}</p>
          <div className="flex flex-wrap gap-2" lang="ko">
            {LIAISON.map(([word, sounds]) => (
              <button key={word} type="button" className="min-h-11 cursor-pointer rounded-full border-2 border-edge bg-cream px-3 text-lg text-fg" onClick={() => speak(word)}>{word} → [{sounds}]</button>
            ))}
          </div>
        </section>

        <section className={section} aria-labelledby="hangul-keyboard">
          <h2 id="hangul-keyboard" className={heading}>{copy.keyboardTitle}</h2>
          <p className="m-0">{copy.keyboardText}</p>
          <div className="grid gap-1.5" aria-hidden="true">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1" style={{ paddingInlineStart: `${rowIndex * 0.9}rem` }}>
                {row.map(([key, jamo, shifted]) => (
                  <span key={key} className="relative grid aspect-square w-[min(8vw,3rem)] place-items-center rounded-xl border-2 border-edge bg-cream text-[clamp(0.95rem,4vw,1.35rem)] font-black" lang="ko">
                    {jamo}
                    <small className="absolute bottom-0.5 right-1 text-xs font-bold uppercase opacity-70">{key}</small>
                    {shifted && <small className="absolute left-1 top-0.5 text-xs opacity-70">{shifted}</small>}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className={section} aria-labelledby="hangul-quiz">
          <h2 id="hangul-quiz" className={heading}>{copy.quizTitle}</h2>
          <p className="m-0">{copy.quizText}</p>
          <ReadingQuiz copy={copy} />
        </section>

        <nav className="flex flex-wrap gap-2.5" aria-label={copy.nextStep}>
          <Link className={`${button} border-ink bg-accent text-ink no-underline`} to="/study/korean">{copy.toPath} →</Link>
          <Link className={`${button} border-edge bg-paper text-fg no-underline`} to="/study/review">{copy.toReview} →</Link>
        </nav>
      </div>
    </div>
  );
}
