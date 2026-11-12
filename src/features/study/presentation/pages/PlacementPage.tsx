import "@/styles/tailwind-study.css";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import type { TestLanguage, TestQuestion } from "@/domain/models/language-test";
import { applyPlacement, PLACEMENT_CHECKPOINTS, PLACEMENT_SKILLS, placedStages, type PlacementSkill } from "@/domain/models/placement";
import { placementStore } from "@/infrastructure/data/placement-store";
import { practiceTestTracks } from "@/infrastructure/data/practice-tests";
import { placementCopy } from "@/infrastructure/i18n/placement-copy";
import { PageEmblem } from "@/shared/ui/PageEmblem";

type Copy = (typeof placementCopy)[keyof typeof placementCopy];
type Results = Partial<Record<PlacementSkill, boolean[]>>;

const panel = "grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-fg";
const button = "min-h-11 w-fit cursor-pointer rounded-full border-2 px-5 py-2 font-extrabold no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-50";
const primary = `${button} border-ink bg-accent text-ink`;
const secondary = `${button} border-edge bg-paper text-fg`;

/** The core ("context") item of each checkpoint stage and the one after it, per skill. */
function checkpointQuestions(language: TestLanguage) {
  const stages = practiceTestTracks[language].stages;
  return Object.fromEntries(PLACEMENT_SKILLS.map((skill) => {
    const path = stages.filter((stage) => stage.skill === skill);
    const pick = (index: number) => path[index]?.questions.find((question) => question.id.endsWith("-context")) ?? path[index]?.questions[0];
    return [skill, PLACEMENT_CHECKPOINTS.map((index) => [pick(index), pick(index + 1)].filter(Boolean) as TestQuestion[])];
  })) as Record<PlacementSkill, TestQuestion[][]>;
}

function Runner({ language, copy, onDone }: { language: TestLanguage; copy: Copy; onDone: (results: Results) => void }) {
  const bank = useMemo(() => checkpointQuestions(language), [language]);
  const [skillIndex, setSkillIndex] = useState(0);
  const [checkpoint, setCheckpoint] = useState(0);
  const [step, setStep] = useState(0);
  const [firstRight, setFirstRight] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<Results>({});
  const skill = PLACEMENT_SKILLS[skillIndex];
  const questions = bank[skill][checkpoint];
  const question = questions[step];

  const advance = () => {
    if (picked === null) return;
    const right = picked === question.correctIndex;
    const lastStep = step + 1 >= questions.length;
    if (!lastStep && right) { setFirstRight(true); setStep(step + 1); setPicked(null); return; }
    const passed = right && (step === 0 || firstRight);
    const skillResults = [...(results[skill] ?? []), passed];
    const nextResults = { ...results, [skill]: skillResults };
    setResults(nextResults);
    setPicked(null); setStep(0); setFirstRight(false);
    // A miss (or the last checkpoint) ends this skill; the next skill starts from its easiest level.
    if (passed && checkpoint + 1 < PLACEMENT_CHECKPOINTS.length) { setCheckpoint(checkpoint + 1); return; }
    if (skillIndex + 1 < PLACEMENT_SKILLS.length) { setSkillIndex(skillIndex + 1); setCheckpoint(0); return; }
    onDone(nextResults);
  };

  return (
    <section className={panel} aria-labelledby="placement-question">
      <p className="m-0 text-sm font-extrabold uppercase tracking-wide">{copy.skills[skill]} · {copy.level(checkpoint + 1, PLACEMENT_CHECKPOINTS.length)}</p>
      {question.passage && <blockquote className="m-0 whitespace-pre-line rounded-2xl border-l-4 border-edge bg-cream p-3" lang={language}>{question.passage}</blockquote>}
      <h2 id="placement-question" className="m-0 text-xl" lang={language}>{question.prompt}</h2>
      <div className="grid gap-2" role="radiogroup" aria-labelledby="placement-question">
        {question.options.map((option, index) => (
          <label key={`${question.id}-${index}`} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border-2 px-3 py-2 ${picked === index ? "border-ink bg-accent-soft text-ink" : "border-current/30"}`}>
            <input type="radio" name={question.id} checked={picked === index} onChange={() => setPicked(index)} />
            <span lang={language}>{option}</span>
          </label>
        ))}
      </div>
      <button type="button" className={primary} disabled={picked === null} onClick={advance}>{copy.next} →</button>
    </section>
  );
}

export function PlacementPage() {
  const { locale } = useI18n();
  const copy = placementCopy[locale];
  const [params, setParams] = useSearchParams();
  const language: TestLanguage = params.get("lang") === "ko" ? "ko" : "en";
  const [phase, setPhase] = useState<"intro" | "test" | "done">("intro");
  const [placed, setPlaced] = useState<Partial<Record<PlacementSkill, number>>>({});
  const [run, setRun] = useState(0);

  const finish = (results: Results) => {
    const next = Object.fromEntries(PLACEMENT_SKILLS.map((skill) => [skill, placedStages(results[skill] ?? [])])) as Record<PlacementSkill, number>;
    placementStore.refresh();
    placementStore.set((state) => applyPlacement(state, language, next));
    setPlaced(next);
    setPhase("done");
  };

  return (
    <div className="page page--placement">
      <header className="page-header">
        <PageEmblem icon="study" />
        <span className="eyebrow">{copy.kicker}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>
      <div className="grid gap-4">
        {phase === "intro" && (
          <section className={panel} aria-labelledby="placement-intro">
            <h2 id="placement-intro" className="m-0 text-xl">{copy.choose}</h2>
            <div className="flex flex-wrap gap-2">
              {(["en", "ko"] as const).map((value) => (
                <button key={value} type="button" aria-pressed={language === value} className={language === value ? primary : secondary} onClick={() => setParams({ lang: value }, { replace: true })}>{copy[value]}</button>
              ))}
            </div>
            <ul className="m-0 grid gap-1 pl-5">{copy.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
            <button type="button" className={primary} onClick={() => { setRun(run + 1); setPhase("test"); }}>{copy.start}</button>
          </section>
        )}
        {phase === "test" && <Runner key={`${language}:${run}`} language={language} copy={copy} onDone={finish} />}
        {phase === "done" && (
          <section className={panel} aria-labelledby="placement-result" role="status">
            <h2 id="placement-result" className="m-0 text-xl">{copy.resultTitle}</h2>
            <ul className="m-0 grid list-none gap-2 p-0">
              {PLACEMENT_SKILLS.map((skill) => (
                <li key={skill} className="rounded-2xl border-2 border-current/30 px-3 py-2"><strong>{copy.skills[skill]}:</strong> {copy.unlocked(placed[skill] ?? 0)}</li>
              ))}
            </ul>
            <small>{copy.note}</small>
            <div className="flex flex-wrap gap-2.5">
              <Link className={primary} to={`/tests/${language}`}>{copy.toPath} →</Link>
              <button type="button" className={secondary} onClick={() => setPhase("intro")}>{copy.again}</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
