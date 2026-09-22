import { useState } from "react";
import { useGksRadar } from "@/application/controllers/useGksRadar";
import { useI18n } from "@/application/i18n/I18nContext";
import { currentCycle, gksCertifications, keyFacts, sources, targetPrograms } from "@/infrastructure/data/gks-2026";
import { gksFeedbackVideos } from "@/infrastructure/data/gks-feedback-videos";
import { SourceLink } from "@/shared/ui/SourceLink";
import { LiteYouTube } from "@/shared/ui/LiteYouTube";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { Link } from "react-router-dom";
import { BrandMark } from "@/shared/ui/BrandMark";

const dateLocales = { es: "es-ES", en: "en-GB", ko: "ko-KR" } as const;

export function GksPage() {
  const { locale, copy } = useI18n();
  const radar = useGksRadar();
  const [videoIndex, setVideoIndex] = useState(0);
  const [titleLineOne, titleLineTwo] = copy.gks.title.split("\n");
  const onlineSources = radar.sourceChecks.filter((source) => source.ok).length;
  const changedSources = radar.sourceChecks.filter((source) => source.changed);
  const checkedAt = new Intl.DateTimeFormat(dateLocales[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(radar.checkedAt));
  const latestSource = sources.find((source) => source.id === "study-in-korea-2027");
  const spainSource = sources.find((source) => source.id === "spain-embassy-notices");
  const callSourceUrl = latestSource?.url ?? radar.sourceChecks.find((source) => source.detectsCall)?.url;
  const callIsPublished = currentCycle.status === "published";
  const hasUnreviewedCall = radar.callDetected && !callIsPublished;
  const selectedVideo = gksFeedbackVideos[videoIndex];
  const selectedVideoCopy = copy.gks.videoItems[selectedVideo.id];
  const moveVideo = (direction: number) => setVideoIndex((current) => (
    current + direction + gksFeedbackVideos.length
  ) % gksFeedbackVideos.length);

  return (
    <div className="page page--gks-radar" data-visual-pending={radar.isLoading ? "true" : undefined}>
      <header className="page-header page-header--gks">
        <div>
          <span className="sticker sticker--pink">{copy.gks.sticker}</span>
          <h1>{titleLineOne}<br />{titleLineTwo}</h1>
          <p>{copy.gks.intro}</p>
        </div>
        <div className="tulip-mark" aria-hidden="true"><BrandMark showLetter={false} /></div>
      </header>

      <section className="gks-daily-radar" aria-labelledby="daily-radar-title">
        <div className="gks-daily-radar__topline">
          <span className="live-pill"><i />{copy.gks.dailyLive}</span>
          <span>{copy.gks.dailyChecked} · {checkedAt}</span>
        </div>

        <div className="gks-daily-radar__heading">
          <div>
            <span className="eyebrow">{copy.gks.dailyKicker}</span>
            <h2 id="daily-radar-title">{copy.gks.dailyTitle}</h2>
          </div>
          <div className={`radar-signal${hasUnreviewedCall ? " radar-signal--alert" : ""}`} aria-hidden="true">
            <span>{hasUnreviewedCall ? "!" : "✓"}</span>
          </div>
        </div>

        <article className={`gks-priority gks-priority--main${hasUnreviewedCall ? " gks-priority--alert" : ""}`}>
          <span>{copy.gks.callLabel}</span>
          <strong>{currentCycle.target} · {callIsPublished ? copy.gks.callPublished : hasUnreviewedCall ? copy.gks.callDetected : copy.gks.callPending}</strong>
          <p>{hasUnreviewedCall ? copy.gks.callDetectedText : copy.gks.latestUpdateText}</p>
          {callSourceUrl && <a href={callSourceUrl} target="_blank" rel="noreferrer">{copy.gks.openOfficial}<span aria-hidden="true">↗</span></a>}
        </article>

        <div className="gks-priority-grid">
          <article className="gks-priority">
            <span>{copy.gks.spainLabel}</span>
            <strong>{copy.gks.spainTitle}</strong>
            <p>{copy.gks.spainText}</p>
            {spainSource && <a href={spainSource.url} target="_blank" rel="noreferrer">{copy.gks.openOfficial}<span aria-hidden="true">↗</span></a>}
          </article>
          <article className="gks-priority">
            <span>{copy.gks.nextActionLabel}</span>
            <strong>{copy.gks.nextActionTitle}</strong>
            <p>{copy.gks.nextActionText}</p>
            <Link to="/checklist">{copy.nav.documents}<span aria-hidden="true">→</span></Link>
          </article>
        </div>

        {changedSources.length > 0 && (
          <div className="gks-change-alert" role="alert">
            <strong>{copy.gks.changeDetected}</strong>
            <span>{copy.gks.changeDetectedText}</span>
          </div>
        )}

        <div className="gks-daily-radar__footer">
          <span><b>{onlineSources}/{radar.sourceChecks.length}</b>{copy.gks.sourcesOnline}</span>
          <span><b>24 h</b>{copy.gks.refreshFrequency}</span>
          <span><b>{copy.gks.referenceYear}</b>{copy.gks.referenceOnly}</span>
        </div>
      </section>

      <section className="gks-certifications" id="gks-certifications" aria-labelledby="gks-certifications-title">
        <div className="gks-certifications__heading">
          <div>
            <span className="eyebrow">{copy.gks.certifications.kicker}</span>
            <h2 id="gks-certifications-title">{copy.gks.certifications.title}</h2>
            <p>{copy.gks.certifications.intro}</p>
          </div>
          <span className="gks-certifications__cycle">GKS-U 2027</span>
        </div>

        <div className="gks-certification-grid">
          {gksCertifications.map((certificate) => {
            const certificateCopy = copy.gks.certifications.items[certificate.id];
            const studyPath = certificate.id === "topik"
              ? "/study/korean"
              : certificate.id === "toefl" || certificate.id === "ielts"
                ? "/study/english"
                : null;

            return (
              <article className={`gks-certification-card gks-certification-card--${certificate.priority}`} key={certificate.id}>
                <header>
                  <span className="gks-certification-card__icon" aria-hidden="true">{certificate.icon}</span>
                  <div>
                    <small>{certificateCopy.subtitle}</small>
                    <h3>{certificateCopy.title}</h3>
                  </div>
                  <span className="gks-certification-card__priority">
                    {copy.gks.certifications.priorityLabel} · {copy.gks.certifications.priorities[certificate.priority]}
                  </span>
                </header>

                <p>{certificateCopy.text}</p>

                {certificate.scoreBands.length > 0 && (
                  <div className="gks-certification-bands" aria-label={copy.gks.certifications.languageWeight}>
                    {certificate.scoreBands.map((band) => (
                      <span key={`${certificate.id}-${band.score}`}>
                        <b>{band.score}</b>
                        <i>{band.weight}</i>
                      </span>
                    ))}
                  </div>
                )}

                <div className="gks-certification-card__note">{certificateCopy.note}</div>
                <footer>
                  <SourceLink sourceId={certificate.sourceId} />
                  {studyPath && (
                    <Link to={studyPath}>
                      {certificate.id === "topik" ? copy.gks.certifications.prepareKorean : copy.gks.certifications.prepareEnglish}
                      <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </footer>
              </article>
            );
          })}
        </div>

        <div className="gks-certifications__notes">
          <p><strong>50%</strong>{copy.gks.certifications.noScore}</p>
          <p>{copy.gks.certifications.bandLegend}</p>
          <p>{copy.gks.certifications.bestOnly}</p>
          <p>{copy.gks.certifications.validity}</p>
        </div>
      </section>

      <section className="gks-video-slider" aria-labelledby="gks-video-title">
        <div className="gks-video-slider__heading">
          <div>
            <span className="eyebrow">{copy.gks.videoKicker}</span>
            <h2 id="gks-video-title">{copy.gks.videoTitle}</h2>
            <p>{copy.gks.videoIntro}</p>
          </div>
          <span className="gks-video-slider__count" aria-live="polite">{videoIndex + 1} / {gksFeedbackVideos.length}</span>
        </div>

        <article
            className="gks-video-slide"
            id="gks-video-panel"
            role="tabpanel"
            aria-labelledby={`gks-video-tab-${selectedVideo.id}`}
            key={selectedVideo.id}
          >
            <div className="gks-video-slide__frame">
              <LiteYouTube videoId={selectedVideo.videoId} title={selectedVideoCopy.title} />
            </div>
            <div className="gks-video-slide__copy">
              <span>{selectedVideoCopy.badge}</span>
              <h3>{selectedVideoCopy.title}</h3>
              <small>{selectedVideo.creator}</small>
              <p>{selectedVideoCopy.text}</p>
              <a href={selectedVideo.sourceUrl} target="_blank" rel="noreferrer">{copy.gks.openVideo}<span aria-hidden="true">↗</span></a>
            </div>
        </article>

        <div className="gks-video-slider__controls">
          <button type="button" onClick={() => moveVideo(-1)} aria-label={copy.gks.previousVideo}>←</button>
          <div className="gks-video-tabs" role="tablist" aria-label={copy.gks.chooseVideo}>
            {gksFeedbackVideos.map((video, index) => (
              <button
                id={`gks-video-tab-${video.id}`}
                type="button"
                role="tab"
                aria-selected={videoIndex === index}
                aria-controls="gks-video-panel"
                onClick={() => setVideoIndex(index)}
                key={video.id}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => moveVideo(1)} aria-label={copy.gks.nextVideo}>→</button>
        </div>

        <p className="gks-video-slider__notice">{copy.gks.videoNotice} {spainSource && <a href={spainSource.url} target="_blank" rel="noreferrer">{copy.gks.verifySpain} ↗</a>}</p>
      </section>

      <section className="gks-details" aria-labelledby="gks-details-title">
        <div className="section-heading">
          <div><span className="eyebrow">{copy.gks.detailsKicker}</span><h2 id="gks-details-title">{copy.gks.detailsTitle}</h2></div>
        </div>

        <details className="gks-disclosure">
          <summary><span><b>01</b>{copy.gks.factsSummary}</span><i aria-hidden="true">＋</i></summary>
          <div className="gks-disclosure__content gks-fact-list">
            {keyFacts.map((fact) => {
              const factCopy = copy.gks.facts[fact.id as keyof typeof copy.gks.facts];
              return (
                <article key={fact.id}>
                  <span className="fact-icon" aria-hidden="true">{fact.icon}</span>
                  <div><small>{factCopy.label}</small><strong>{fact.value}</strong><p>{factCopy.detail}</p><SourceLink sourceId={fact.sourceId} /></div>
                  <StatusBadge status={fact.status} />
                </article>
              );
            })}
          </div>
        </details>

        <details className="gks-disclosure">
          <summary><span><b>02</b>{copy.gks.eligibilitySummary}</span><i aria-hidden="true">＋</i></summary>
          <div className="gks-disclosure__content"><ol className="rule-list">{copy.gks.eligibilityRules.map((rule, index) => <li key={rule}><span>{index + 1}</span><p>{rule}</p></li>)}</ol></div>
        </details>

        <details className="gks-disclosure">
          <summary><span><b>03</b>{copy.gks.programsSummary}</span><i aria-hidden="true">＋</i></summary>
          <div className="gks-disclosure__content">
            <p className="section-intro">{copy.gks.programsIntro}</p>
            <div className="gks-program-list">
              {targetPrograms.map((program) => {
                const programCopy = copy.gks.programTargets[program.id];
                return <article className={`gks-program-row program-card--${program.tone}`} key={program.id}><span aria-hidden="true">▰</span><div><strong>{programCopy.title}</strong><small>{programCopy.detail}</small></div><i>{copy.gks.programCategories[program.category]}</i></article>;
              })}
            </div>
          </div>
        </details>

        <details className="gks-disclosure">
          <summary><span><b>04</b>{copy.gks.certificationsSummary}</span><i aria-hidden="true">＋</i></summary>
          <div className="gks-disclosure__content">
            <p className="section-intro">{copy.gks.certifications.intro}</p>
            <a className="gks-certification-jump" href="#gks-certifications">{copy.gks.certifications.title}<span aria-hidden="true">↑</span></a>
          </div>
        </details>

        <details className="gks-disclosure">
          <summary><span><b>05</b>{copy.gks.sourcesSummary}</span><i aria-hidden="true">＋</i></summary>
          <div className="gks-disclosure__content">
            <p className="section-intro">{copy.gks.sourcesIntro}</p>
            <div className="source-list source-list--compact">{sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}><span><strong>{source.title}</strong><small>{source.organization}</small></span><span aria-hidden="true">↗</span></a>)}</div>
          </div>
        </details>
      </section>
    </div>
  );
}
