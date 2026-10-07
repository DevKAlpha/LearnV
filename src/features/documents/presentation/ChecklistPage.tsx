import { useState, type CSSProperties } from "react";
import { documents } from "@/infrastructure/data/gks-2026";
import { useI18n } from "@/application/i18n/I18nContext";
import { PageEmblem } from "@/shared/ui/PageEmblem";
import { getDocumentPlan, type DocumentStageId } from "@/domain/models/document-plan";

type Props = {
  progress: { completedDocuments: string[] };
  toggleDocument: (id: string) => void;
};

export function ChecklistPage({ progress, toggleDocument }: Props) {
  const { copy } = useI18n();
  const plan = getDocumentPlan(progress.completedDocuments);
  const completed = plan.completed;
  const percent = Math.round((completed / plan.total) * 100);
  const [titleLineOne, titleLineTwo] = copy.checklist.title.split("\n");
  const [openStages, setOpenStages] = useState<DocumentStageId[]>(() => plan.currentStage ? [plan.currentStage] : []);
  const openStage = (id: DocumentStageId) => {
    setOpenStages([id]);
    requestAnimationFrame(() => {
      const target = document.getElementById(`document-stage-${id}`);
      target?.querySelector("summary")?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "start", behavior: "auto" });
    });
  };

  return (
    <div className="page">
      <header className="page-header page-header--decorated">
        <PageEmblem icon="checklist" tone="green" />
        <span className="sticker sticker--green">{copy.checklist.sticker}</span>
        <h1>{titleLineOne}<br />{titleLineTwo}</h1>
        <p>{copy.checklist.intro}</p>
      </header>

      <section className="checklist-progress">
        <div aria-live="polite"><span className="eyebrow">{copy.checklist.referenceFile}</span><strong>{completed} {copy.checklist.of} {plan.total}</strong><p>{copy.checklist.prepared}</p></div>
        <div className="mini-progress" style={{ "--progress": `${percent * 3.6}deg` } as CSSProperties}><span>{percent}%</span></div>
      </section>

      <section className="document-route" aria-labelledby="document-route-title">
        <div className="document-route__heading">
          <span className="eyebrow">{copy.checklist.routeKicker}</span>
          <h2 id="document-route-title">{copy.checklist.routeTitle}</h2>
          <p>{copy.checklist.routeIntro}</p>
          <p>{copy.checklist.routeTiming}</p>
          <small><b>{copy.checklist.privacy}.</b> {copy.checklist.privacyText}</small>
        </div>

        <div className="document-stage-list" aria-label={copy.checklist.listAria}>
          {plan.stages.map((stage, stageIndex) => {
            const stageDocuments = documents.filter((document) => (stage.documentIds as readonly string[]).includes(document.id));
            const stageCompleted = stageDocuments.filter((document) => progress.completedDocuments.includes(document.id)).length;
            const isOpen = openStages.includes(stage.id);
            const stageCopy = copy.checklist.stages[stage.id];

            return (
              <details
                id={`document-stage-${stage.id}`}
                className={`document-stage document-stage--${stage.id}`}
                open={isOpen}
                onToggle={(event) => {
                  const nextOpen = event.currentTarget.open;
                  setOpenStages((current) => nextOpen
                    ? current.includes(stage.id) ? current : [...current, stage.id]
                    : current.filter((stageId) => stageId !== stage.id));
                }}
                key={stage.id}
              >
                <summary>
                  <b>{String(stageIndex + 1).padStart(2, "0")}</b>
                  <span><strong>{stageCopy.title}</strong><small>{stageCopy.text}</small></span>
                  <em>{stageCompleted}/{stageDocuments.length} {copy.checklist.stageProgress}</em>
                  <i aria-hidden="true">＋</i>
                </summary>

                {isOpen && (
                  <div className="document-stage__list">
                    {stageDocuments.map((document) => {
                      const checked = progress.completedDocuments.includes(document.id);
                      const documentCopy = copy.checklist.items[document.id as keyof typeof copy.checklist.items];

                      return (
                        <button
                          type="button"
                          className={`document-card${checked ? " document-card--done" : ""}`}
                          onClick={() => toggleDocument(document.id)}
                          aria-pressed={checked}
                          aria-label={`${checked ? copy.common.unmark : copy.common.mark} ${documentCopy.label}`}
                          key={document.id}
                        >
                          <span className="document-check" aria-hidden="true">{checked ? "✓" : ""}</span>
                          <div>
                            <div className="document-title">
                              <strong>{documentCopy.label}</strong>
                              <span className={document.required ? "required-pill" : "optional-pill"}>{document.required ? copy.common.required : copy.common.optional}</span>
                            </div>
                            <p>{documentCopy.detail}</p>
                            <div className="document-tags">
                              {document.needsApostille && <span>{copy.common.apostille}</span>}
                              {document.needsTranslation && <span>{copy.common.certifiedTranslation}</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {stageCompleted === stage.total && plan.stages[stageIndex + 1] && (
                      <button className="primary-button document-stage__next" type="button" onClick={() => openStage(plan.stages[stageIndex + 1].id)}>
                        {copy.checklist.nextStage}: {copy.checklist.stages[plan.stages[stageIndex + 1].id].title}<span aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                )}
              </details>
            );
          })}
        </div>
      </section>

    </div>
  );
}
