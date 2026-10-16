import type { TestLanguage } from "@/domain/models/language-test";

/** Small original line drawings; decorative and shared by both responsive layouts. */
export function PathCultureAccent({ language, variant }: { language: TestLanguage; variant: number }) {
  const artwork = language === "ko" ? [
    <><path d="M10 57h94M21 55V35l36-22 36 22v20M16 36h82M37 55V40h40v15M47 55V43h20v12" /><path d="M57 13v-7M29 55l-5 9M84 55l6 9" /></>,
    <><path d="M20 62c12-17 27-22 40-10 14-20 31-16 42 8M14 65h92M72 19v31M65 24l7-9 7 9M74 16h17" /><circle cx="29" cy="28" r="8" /></>,
    <><rect x="22" y="18" width="75" height="50" rx="6" /><path d="M35 32h19m-9-9v25m19-16h20m-20 10h20M33 57h52" /></>,
  ] : [
    <><path d="M18 64h88M30 62V26h45v36M75 42h19v20M35 33h9m8 0h9m-26 9h9m8 0h9m-26 9h9m8 0h9M87 42V25M81 26h12" /><circle cx="86" cy="15" r="6" /></>,
    <><path d="M14 54c17-8 30-8 45 0 15-8 28-8 45 0v10c-16-7-29-7-45 0-16-7-29-7-45 0V54ZM59 53V22M19 30c11-7 23-7 35 0m10 0c11-7 23-7 35 0M19 30v20m35-20v20m10-20v20m35-20v20" /></>,
    <><path d="M18 54h70a13 13 0 0 1-13 12H32a14 14 0 0 1-14-12ZM88 56c18-2 20-18 2-19M37 32c-8-8 5-10 0-18m18 18c-8-8 5-10 0-18m18 18c-8-8 5-10 0-18" /></>,
  ];
  return <svg className="test-path-culture-accent" viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{artwork[variant % artwork.length]}</svg>;
}
