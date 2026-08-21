import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../application/i18n/I18nContext";
import { localize } from "../../domain/models/i18n";
import { interviewQuestions, interviewTips } from "../../infrastructure/data/interview-prep";

type Category = "all" | "motivation" | "academic" | "adaptation" | "contribution";

export function InterviewPrepPage() {
  const { locale, copy } = useI18n();
  const [category, setCategory] = useState<Category>("all");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false]);
  const visibleQuestions = useMemo(() => interviewQuestions.filter((question) => category === "all" || question.category === category), [category]);
  const practiceQuestion = visibleQuestions[practiceIndex % visibleQuestions.length] ?? interviewQuestions[0];
  const categories: Category[] = ["all", "motivation", "academic", "adaptation", "contribution"];

  const nextPractice = () => {
    setPracticeIndex((current) => (current + 1) % visibleQuestions.length);
    setAnswer("");
    setChecked([false, false, false, false]);
  };

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
          <span><b>01</b>{copy.interview.factDocuments}</span>
          <span><b>02</b>{copy.interview.factEvidence}</span>
          <span><b>03</b>{copy.interview.factAdaptation}</span>
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
          {categories.map((item) => <button type="button" className={category === item ? "type-chip type-chip--active" : "type-chip"} aria-pressed={category === item} onClick={() => { setCategory(item); setPracticeIndex(0); }} key={item}>{copy.interview.categories[item]}</button>)}
        </div>
        <article className="interview-practice-card">
          <div className="interview-practice-card__top"><span>{copy.interview.randomQuestion}</span><small>{copy.interview.answerTime}</small></div>
          <h3>{localize(practiceQuestion.question, locale)}</h3>
          <p><strong>{copy.interview.whatItChecks}</strong>{localize(practiceQuestion.purpose, locale)}</p>
          <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={copy.interview.notesPlaceholder} aria-label={copy.interview.notesPlaceholder} />
          <details><summary>{copy.interview.showFollowUp}<span>＋</span></summary><p>{localize(practiceQuestion.followUp, locale)}</p></details>
          <div className="interview-self-check">
            <strong>{copy.interview.selfCheck}</strong>
            {copy.interview.rubric.map((item, index) => <label key={item}><input type="checkbox" checked={checked[index]} onChange={(event) => setChecked((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))} /><span>{item}</span></label>)}
          </div>
          <button className="interview-next-button" type="button" onClick={nextPractice}>{copy.interview.nextQuestion}<span>→</span></button>
        </article>
      </section>

      <section className="interview-tips" aria-labelledby="tips-title">
        <div className="section-heading"><div><span className="eyebrow">{copy.interview.tipsKicker}</span><h2 id="tips-title">{copy.interview.tipsTitle}</h2></div></div>
        <div className="interview-tip-list">{interviewTips.map((tip, index) => <article key={index}><span>{String(index + 1).padStart(2, "0")}</span><p>{localize(tip, locale)}</p></article>)}</div>
      </section>

      <section className="interview-video" aria-labelledby="video-title">
        <div className="section-heading"><div><span className="eyebrow">{copy.interview.videoKicker}</span><h2 id="video-title">{copy.interview.videoTitle}</h2></div></div>
        <div className="interview-video__frame"><iframe src="https://www.youtube-nocookie.com/embed/vmPwtGfny9Y" title={copy.interview.videoTitle} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
        <div className="interview-video__copy"><span>{copy.interview.experienceBadge}</span><p>{copy.interview.videoText}</p><a href="https://www.youtube.com/watch?v=vmPwtGfny9Y" target="_blank" rel="noreferrer">{copy.interview.openYoutube} ↗</a></div>
      </section>

      <section className="interview-sources">
        <span className="eyebrow">{copy.interview.sourcesTitle}</span>
        <a href="https://www.studyinkorea.go.kr/ko/notice/scholarshipsRead.do?bbsId=BBSMSTR_000000000461&boardSort=3&nttId=4385" target="_blank" rel="noreferrer">Study in Korea · GKS-U 2026 ↗</a>
        <a href="https://overseas.mofa.go.kr/es-es/brd/m_8065/list.do" target="_blank" rel="noreferrer">Embajada de Corea en España · avisos ↗</a>
      </section>
    </div>
  );
}
