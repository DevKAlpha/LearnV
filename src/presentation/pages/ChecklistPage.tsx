import type { CSSProperties } from "react";
import { documents } from "../../infrastructure/data/gks-2026";
import { useI18n } from "../../application/i18n/I18nContext";

type Props = {
  progress: { completedDocuments: string[] };
  toggleDocument: (id: string) => void;
};

export function ChecklistPage({ progress, toggleDocument }: Props) {
  const { copy } = useI18n();
  const completed = progress.completedDocuments.length;
  const percent = Math.round((completed / documents.length) * 100);
  const [titleLineOne, titleLineTwo] = copy.checklist.title.split("\n");

  return (
    <div className="page">
      <header className="page-header">
        <span className="sticker sticker--green">{copy.checklist.sticker}</span>
        <h1>{titleLineOne}<br />{titleLineTwo}</h1>
        <p>{copy.checklist.intro}</p>
      </header>

      <section className="checklist-progress">
        <div><span className="eyebrow">{copy.checklist.referenceFile}</span><strong>{completed} {copy.checklist.of} {documents.length}</strong><p>{copy.checklist.prepared}</p></div>
        <div className="mini-progress" style={{ "--progress": `${percent * 3.6}deg` } as CSSProperties}><span>{percent}%</span></div>
      </section>

      <section className="document-list" aria-label={copy.checklist.listAria}>
        {documents.map((document) => {
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
      </section>

    </div>
  );
}
