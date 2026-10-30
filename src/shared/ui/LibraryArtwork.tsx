import type { ReadingCategory } from "@/domain/models/reading-library";

export function LibraryEmblem() {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false"><path d="M5 12h30v23H5z" fill="var(--library-paper,#fff7e8)" stroke="currentColor" strokeWidth="1.5"/><path d="M10 7h5v23h-5zm8 2h5v21h-5zm9-1 5 1-3 21-5-1z" fill="var(--library-petal,#b579cc)" stroke="currentColor" strokeWidth="1.4"/><path d="M5 31h30M3 36h34M20 5V2m-3 2 3-2 3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M12 14v7m8-4v6m8-8-1 6" stroke="var(--library-paper,#fff7e8)" strokeWidth="1.5"/></svg>;
}

/** Original vector covers: no publisher art, remote images or font downloads. */
export function LibraryBookArt({ category }: { category: ReadingCategory }) {
  return <svg className="library-book-art" viewBox="0 0 180 236" fill="none" aria-hidden="true" focusable="false">
    <path d="m13 9 154 5v210L13 231 5 219V20Z" fill="var(--book-shadow)" stroke="var(--book-ink)" strokeWidth="1.5"/>
    <path d="m18 214 145-5v12l-145 7Z" fill="#fff5df" stroke="var(--book-ink)" strokeWidth="1.4"/>
    <path d="m22 218 136-5m-136 9 136-5" stroke="var(--book-ink)" strokeOpacity=".4"/>
    <path d="M16 7h145v204L16 218C8 218 5 213 5 206V20C5 12 9 7 16 7Z" fill="var(--book-cover)" stroke="var(--book-ink)" strokeWidth="1.5"/>
    <path d="M18 8v207M27 20h122M27 194h122" stroke="var(--book-ink)" strokeWidth="1.2"/>
    <path d="M28 28h17m93 0h11M28 184h17m93 0h11" stroke="var(--book-ink)" strokeWidth="2"/>
    <g transform="translate(70 128)" stroke="var(--book-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {category === "business" && <><circle cx="20" cy="20" r="22"/><ellipse cx="20" cy="20" rx="10" ry="22"/><path d="M-2 20h44M2 8h36M2 32h36"/></>}
      {category === "health" && <><path d="M20 39 2 21C-12 4 10-6 20 8 30-6 52 4 38 21Z"/><path d="M0 21h11l5-11 7 22 5-11h13"/></>}
      {category === "data" && <><path d="M-3 40h46M2 34V21h8v13m7 0V10h8v24m7 0V0h8v34M0 6l12-9 10 5 18-12"/></>}
      {category === "gks" && <><path d="M20 42V12M20 31C4 32 0 23 0 19c13-1 20 7 20 12Zm0-6c16 1 20-7 20-12-14 1-20 8-20 12Z"/><path d="M20 15C3 12 4-3 7-9l7 7 6-15 6 15 7-7c3 8 4 21-13 24Z" fill="var(--book-flower)"/></>}
      {category === "writing" && <><path d="m0 39 5-15L32-5l10 10L14 33ZM5 24l9 9m-14 6 14-6M25 1l10 10M22 39h21"/></>}
      {category === "language" && <><path d="M-5 0h50v31H21L7 42V31H-5Z"/><path d="M3 9h14m-7-5v5m-6 6a6 6 0 1 0 12 0 6 6 0 0 0-12 0Zm20 8 6-17 6 17m-10-6h8"/></>}
    </g>
    <path d="M134 7v29l-7-5-7 5V7" fill="var(--book-flower)" stroke="var(--book-ink)" strokeWidth="1.2"/>
  </svg>;
}
