import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { localize } from "@/domain/models/i18n";
import { interviewQuestions, interviewTips } from "@/infrastructure/data/interview-prep";
import { LiteYouTube } from "@/shared/ui/LiteYouTube";
import { trackLearning } from "@/application/controllers/learningJourneyEvents";

type Category = "all" | "motivation" | "academic" | "adaptation" | "contribution";
type SavedPractice = Record<string, { answer: string; checked: boolean[] }>;
const INTERVIEW_STORAGE_KEY = "learnv-interview-practice-v1";

function readSavedPractice(): SavedPractice {
  try { return JSON.parse(localStorage.getItem(INTERVIEW_STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

export function InterviewPrepPage() {
  const { locale, copy } = useI18n();
  const [category, setCategory] = useState<Category>("all");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [savedPractice, setSavedPractice] = useState<SavedPractice>(readSavedPractice);
  const [secondsLeft, setSecondsLeft] = useState(75);
  const [timerRunning, setTimerRunning] = useState(false);
  const visibleQuestions = useMemo(() => interviewQuestions.filter((question) => category === "all" || question.category === category), [category]);
  const practiceQuestion = visibleQuestions[practiceIndex % visibleQuestions.length] ?? interviewQuestions[0];
  const currentPractice = savedPractice[practiceQuestion.id] ?? { answer: "", checked: [false, false, false, false] };
  const answer = currentPractice.answer;
  const checked = currentPractice.checked;
  const categories: Category[] = ["all", "motivation", "academic", "adaptation", "contribution"];
  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => { localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(savedPractice)); }, [savedPractice]);
  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, timerRunning]);
  useEffect(() => { if (secondsLeft === 0) setTimerRunning(false); }, [secondsLeft]);

  const changePractice = (direction: number) => {
    if (direction > 0 && (answer.trim().length > 0 || checked.some(Boolean))) {
      const score = Math.round((checked.filter(Boolean).length / checked.length) * 100);
      trackLearning({ kind: "practice", itemId: practiceQuestion.id, language: "general", skill: "interview", score, passed: checked.every(Boolean) });
    }
    setPracticeIndex((current) => (current + direction + visibleQuestions.length) % visibleQuestions.length);
    setSecondsLeft(75);
    setTimerRunning(false);
  };
  const updateCurrent = (next: Partial<{ answer: string; checked: boolean[] }>) => setSavedPractice((current) => ({ ...current, [practiceQuestion.id]: { ...currentPractice, ...next } }));

  return (
    <div className="page interview-page">
      <header className="interview-hero">
        <div className="interview-hero__topline">
          <Link className="test-back-link" to="/study"><span aria-hidden="true">←</span>{copy.interview.back}</Link>
          <span className="sticker sticker--yellow">{copy.interview.sticker}</span>
        </div>
        <h1>{copy.interview.title}</h1>
        <p>{copy.interview.intro}</p>
        <div className="interview-hero__facts">
          <button type="button" onClick={() => scrollToSection("simulator-title")}><b>01</b>{copy.interview.factDocuments}<i aria-hidden="true">↓</i></button>
          <button type="button" onClick={() => scrollToSection("interview-method-title")}><b>02</b>{copy.interview.factEvidence}<i aria-hidden="true">↓</i></button>
          <button type="button" onClick={() => scrollToSection("tips-title")}><b>03</b>{copy.interview.factAdaptation}<i aria-hidden="true">↓</i></button>
        </div>
      </header>

      <section className="interview-method" aria-labelledby="interview-method-title">
        <div className="section-heading"><div><span className="eyebrow">{copy.interview.methodKicker}</span><h2 id="interview-method-title">{copy.interview.methodTitle}</h2></div></div>
        <div className="interview-method-grid">
          {copy.interview.methodSteps.map((step, index) => <article key={step.title}><span>0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}
        </div>
      </section>

      <section className="interview-simulator" aria-labelledby="simulator-title">
        <div className="section-heading"><div><span className="eyebrow">{copy.interview.practiceKicker}</span><h2 id="simulator-title">{copy.interview.practiceTitle}</h2></div><span className="count-pill">{interviewQuestions.length}</span></div>
        <div className="interview-category-chips" role="group" aria-label={copy.interview.categoriesLabel}>
          {categories.map((item) => <button type="button" className={category === item ? "type-chip type-chip--active" : "type-chip"} aria-pressed={category === item} onClick={() => { setCategory(item); setPracticeIndex(0); setSecondsLeft(75); setTimerRunning(false); }} key={item}>{copy.interview.categories[item]}</button>)}
        </div>
        <article className="interview-practice-card">
          <div className="interview-practice-card__top"><span>{practiceIndex + 1}/{visibleQuestions.length} · {copy.interview.randomQuestion}</span><small>{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</small></div>
          <h3>{localize(practiceQuestion.question, locale)}</h3>
          <p><strong>{copy.interview.whatItChecks}</strong>{localize(practiceQuestion.purpose, locale)}</p>
          <div className="interview-timer-controls"><button type="button" onClick={() => setTimerRunning((current) => !current)}>{timerRunning ? (locale === "ko" ? "일시정지" : locale === "en" ? "Pause" : "Pausar") : (locale === "ko" ? "75초 시작" : locale === "en" ? "Start 75 s" : "Iniciar 75 s")}</button><button type="button" onClick={() => { setSecondsLeft(75); setTimerRunning(false); }}>{locale === "ko" ? "초기화" : locale === "en" ? "Reset timer" : "Reiniciar tiempo"}</button></div>
          <textarea value={answer} onChange={(event) => updateCurrent({ answer: event.target.value })} placeholder={copy.interview.notesPlaceholder} aria-label={copy.interview.notesPlaceholder} />
          <details><summary>{copy.interview.showFollowUp}<span>＋</span></summary><p>{localize(practiceQuestion.followUp, locale)}</p></details>
          <div className="interview-self-check">
            <strong>{copy.interview.selfCheck}</strong>
            {copy.interview.rubric.map((item, index) => <label key={item}><input type="checkbox" checked={checked[index]} onChange={(event) => updateCurrent({ checked: checked.map((value, itemIndex) => itemIndex === index ? event.target.checked : value) })} /><span>{item}</span></label>)}
          </div>
          <div className="interview-question-navigation"><button type="button" onClick={() => changePractice(-1)}><span>←</span>{locale === "ko" ? "이전" : locale === "en" ? "Previous" : "Anterior"}</button><button className="interview-next-button" type="button" onClick={() => changePractice(1)}>{copy.interview.nextQuestion}<span>→</span></button></div>
        </article>
      </section>

      <section className="interview-tips" aria-labelledby="tips-title">
        <div className="section-heading"><div><span className="eyebrow">{copy.interview.tipsKicker}</span><h2 id="tips-title">{copy.interview.tipsTitle}</h2></div></div>
        <div className="interview-tip-list">{interviewTips.map((tip, index) => <article key={index}><span>{String(index + 1).padStart(2, "0")}</span><p>{localize(tip, locale)}</p></article>)}</div>
      </section>

      <section className="interview-video" aria-labelledby="video-title">
        <div className="section-heading"><div><span className="eyebrow">{copy.interview.videoKicker}</span><h2 id="video-title">{copy.interview.videoTitle}</h2></div></div>
        <div className="interview-video__frame"><LiteYouTube videoId="VZhCWLIhcnA" title={copy.interview.videoTitle} /></div>
        <div className="interview-video__copy"><span>{copy.interview.experienceBadge}</span><p>{copy.interview.videoText}</p><a href="https://www.youtube.com/watch?v=VZhCWLIhcnA" target="_blank" rel="noreferrer">{copy.interview.openYoutube} ↗</a></div>
      </section>

      <section className="interview-sources">
        <span className="eyebrow">{copy.interview.sourcesTitle}</span>
        <a href="https://www.studyinkorea.go.kr/ko/notice/scholarshipsRead.do?bbsId=BBSMSTR_000000000461&boardSort=3&nttId=4385" target="_blank" rel="noreferrer">Study in Korea · GKS-U 2026 ↗</a>
        <a href="https://overseas.mofa.go.kr/es-es/brd/m_8065/list.do" target="_blank" rel="noreferrer">Embajada de Corea en España · avisos ↗</a>
      </section>
    </div>
  );
}
