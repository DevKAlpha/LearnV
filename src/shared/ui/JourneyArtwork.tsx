/** Original, decorative vectors. Flat fills stay crisp without filters or image requests. */
export function JourneyEmblem() {
  return <svg className="journey-emblem" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
    <path className="journey-art__paper" d="M4 24c6-2 11-1 16 2 5-3 10-4 16-2v11c-6-2-11-1-16 2-5-3-10-4-16-2Z" />
    <path className="journey-art__line" d="M20 26v11M8 28l7 1M25 29l7-1M20 25V15" />
    <path className="journey-art__leaf" d="M20 23c-6 0-9-3-9-7 6 0 9 3 9 7ZM20 20c6 0 9-3 9-7-6 0-9 3-9 7Z" />
    <path className="journey-art__petal" d="M20 17C12 15 12 9 13 5l4 3 3-6 3 6 4-3c1 6-1 11-7 12Z" />
    <path className="journey-art__line" d="M17 8c0 3 1 6 3 9 2-3 3-6 3-9" />
    <path className="journey-art__gold" d="m33 7 1.5 3.5L38 12l-3.5 1.5L33 17l-1.5-3.5L28 12l3.5-1.5Z" />
  </svg>;
}

export function JourneyCoverArt() {
  return <svg className="journey-cover-art" viewBox="0 0 112 86" fill="none" aria-hidden="true" focusable="false">
    <circle cx="79" cy="27" r="22" className="journey-art__sun" />
    <path className="journey-art__line" strokeDasharray="2 4" d="M10 48c-9-18 18-29 31-14s25-6 18-15" />
    <path className="journey-art__back" d="m18 31 29-5 7 46-29 5Z" />
    <path className="journey-art__paper" d="M25 36c13-3 23-1 34 5 11-6 21-8 34-5v35c-13-3-23-1-34 5-11-6-21-8-34-5Z" />
    <path className="journey-art__line" d="M59 41v35M32 44l17 3M32 51l17 3M32 58l12 2M68 57l17-4M68 64l17-4M18 81h80" />
    <path className="journey-art__line" d="M76 49V29" />
    <path className="journey-art__leaf" d="M76 44c-7 0-10-4-10-8 7 0 10 4 10 8ZM76 40c8 0 11-4 11-8-7 0-11 4-11 8Z" />
    <path className="journey-art__petal" d="M76 32c-9-2-10-9-9-15l5 4 4-9 4 9 5-4c1 7-1 13-9 15Z" />
    <path className="journey-art__line" d="M72 21c0 4 2 8 4 11 2-3 4-7 4-11" />
    <path className="journey-art__gold" d="m100 13 1.5 4.5L106 19l-4.5 1.5L100 25l-1.5-4.5L94 19l4.5-1.5Z" />
  </svg>;
}

export function JourneyStatArt({ kind }: { kind: "streak" | "best" | "sessions" | "time" }) {
  return <svg className="journey-stat-art" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    {kind === "streak" && <><path d="M4 6h16v15H4ZM4 10h16M8 3v5M16 3v5" /><path d="m8 15 3 3 5-5" /></>}
    {kind === "best" && <><path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z" /><path d="m9 12 2 2 4-4" /></>}
    {kind === "sessions" && <><path d="M3 5c4-1 7 0 9 2 2-2 5-3 9-2v14c-4-1-7 0-9 2-2-2-5-3-9-2ZM12 7v14M6 10l3 1M15 11l3-1" /></>}
    {kind === "time" && <><circle cx="12" cy="13" r="8" /><path d="M12 9v5l3 2M9 2h6M12 2v3M18 5l2 2" /></>}
  </svg>;
}
