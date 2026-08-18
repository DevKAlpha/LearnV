import type { CSSProperties } from "react";
import { documents } from "../../infrastructure/data/gks-2026";

type Props = {
  progress: { completedDocuments: string[] };
  toggleDocument: (id: string) => void;
};

export function ChecklistPage({ progress, toggleDocument }: Props) {
  const completed = progress.completedDocuments.length;
  const percent = Math.round((completed / documents.length) * 100);

  return (
    <div className="page">
      <header className="page-header">
        <span className="sticker sticker--green">Document hub</span>
        <h1>Todo en orden.<br />Sin pánico.</h1>
        <p>Marca la preparación, nunca subas documentos personales a este sitio.</p>
      </header>

      <section className="checklist-progress">
        <div><span className="eyebrow">Expediente de referencia</span><strong>{completed} de {documents.length}</strong><p>elementos preparados</p></div>
        <div className="mini-progress" style={{ "--progress": `${percent * 3.6}deg` } as CSSProperties}><span>{percent}%</span></div>
      </section>

      <section className="document-list" aria-label="Lista de documentos">
        {documents.map((document) => {
          const checked = progress.completedDocuments.includes(document.id);
          return (
            <article className={`document-card${checked ? " document-card--done" : ""}`} key={document.id}>
              <button
                type="button"
                className="document-check"
                onClick={() => toggleDocument(document.id)}
                aria-pressed={checked}
                aria-label={`${checked ? "Desmarcar" : "Marcar"} ${document.label}`}
              >{checked ? "✓" : ""}</button>
              <div>
                <div className="document-title">
                  <strong>{document.label}</strong>
                  <span className={document.required ? "required-pill" : "optional-pill"}>{document.required ? "Obligatorio" : "Opcional"}</span>
                </div>
                <p>{document.detail}</p>
                <div className="document-tags">
                  {document.needsApostille && <span>Apostilla</span>}
                  {document.needsTranslation && <span>Traducción certificada</span>}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <aside className="privacy-note">
        <span aria-hidden="true">⌁</span>
        <div><strong>Privacidad primero</strong><p>Solo guardamos el estado de tus casillas en este dispositivo. No almacenamos certificados, pasaportes ni expedientes.</p></div>
      </aside>
    </div>
  );
}
