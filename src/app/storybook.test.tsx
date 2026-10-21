import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { StoryFolio } from "@/shared/ui/StoryFolio";
import { SceneArt, sceneNames } from "@/shared/ui/SceneArt";
import { translations } from "@/infrastructure/i18n/translations";
import { storybookCopy } from "@/infrastructure/i18n/storybook-copy";

const scenario = vi.hoisted(() => ({ locale: "es" as "es" | "en" | "ko", qa: false }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale, copy: translations[scenario.locale] }) }));
vi.mock("@/application/qa/qa-learning-scope", () => ({ get isLearningQa() { return scenario.qa; } }));

describe.each(["es", "en", "ko"] as const)("editorial chapters in %s", (locale) => {
  it.each([["/", "01"], ["/gks", "02"], ["/study", "03"], ["/study/english", "03"], ["/checklist", "04"], ["/profile", "05"]])("labels %s without adding links or headings", (pathname, number) => {
    scenario.locale = locale; scenario.qa = false;
    const html = renderToStaticMarkup(<StoryFolio pathname={pathname} />);
    expect(html).toContain(storybookCopy[locale].chapter);
    expect(html).toContain(`<b>${number}</b>`);
    expect(html).not.toMatch(/<a\b|<h[1-6]\b|role="navigation"/);
  });
});
it("does not add chrome to exercises or restricted QA links", () => {
  scenario.locale = "es"; scenario.qa = true;
  expect(renderToStaticMarkup(<StoryFolio pathname="/study" />)).toContain("<b>02</b>");
  for (const pathname of ["/tests/en", "/tests/ko/ko-reading-01", "/study/written-simulator"])
    expect(renderToStaticMarkup(<StoryFolio pathname={pathname} />)).toBe("");
});
it.each(sceneNames)("keeps %s a local, bounded, decorative vector loaded independently", (scene) => {
  const html = renderToStaticMarkup(<SceneArt scene={scene} />);
  expect(html).toContain('alt=""');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('loading="lazy"');
  expect(html).toContain('decoding="async"');
  expect(html).toContain(`illustrations/storybook/${scene}.svg`);
  const svg = readFileSync(new URL(`../../public/illustrations/storybook/${scene}.svg`, import.meta.url), "utf8");
  expect(svg.length).toBeLessThan(12_000);
  expect(svg).toMatch(/viewBox="0 0 \d+ \d+"/);
  expect(svg).not.toMatch(/<(?:image|filter|script|animate|text|foreignObject)\b|href=|data:|@import/);
  expect(svg).not.toMatch(/\bon\w+\s*=|javascript:/i);
  expect(svg).toMatch(/stroke="#[234][0-9a-f]{5}"/);
});
describe.each(["/", "/LearnV/", "/LearnV/qa/"])("illustrations deployed under %s", (base) => {
  it.each(sceneNames)("keeps %s under the deployment prefix with the SVG's actual aspect ratio", (scene) => {
    vi.stubEnv("BASE_URL", base);
    try {
      const html = renderToStaticMarkup(<SceneArt scene={scene} />);
      const svg = readFileSync(new URL(`../../public/illustrations/storybook/${scene}.svg`, import.meta.url), "utf8");
      const [, width, height] = svg.match(/viewBox="0 0 (\d+) (\d+)"/)!;
      expect(html).toContain(`src="${base}illustrations/storybook/${scene}.svg"`);
      expect(html).toContain(`width="${width}" height="${height}"`);
      expect(html).not.toMatch(/tabindex=|role=|title=/i);
    } finally { vi.unstubAllEnvs(); }
  });
});
it("keeps all six scene transfers inside their combined size budget", () => {
  const bytes = sceneNames.reduce((total, scene) => total + readFileSync(new URL(`../../public/illustrations/storybook/${scene}.svg`, import.meta.url)).byteLength, 0);
  expect(bytes).toBeLessThan(20_000);
});
it("prioritises only explicitly eager illustrations and restores the original display family", () => {
  const html = renderToStaticMarkup(<SceneArt scene="reader" eager />);
  expect(html).toContain('loading="eager"');
  expect(html).toContain('fetchPriority="high"');
  const css = readFileSync(new URL("../styles/storybook.css", import.meta.url), "utf8");
  expect(css).not.toMatch(/Georgia|Times New Roman|serif;/);
  expect(css).toContain('font-family: var(--font-display)');
  expect(css).toContain(':is(.brand-mark,.mobile-brand__mark) { display: grid; place-items: center; padding: 0; }');
});
it("uses no remote texture, persistent compositor hint or looping page animation", () => {
  const css = readFileSync(new URL("../styles/storybook.css", import.meta.url), "utf8");
  expect(css).not.toMatch(/url\(|infinite|will-change:\s*(?!auto)[\w-]+|transition:\s*all/);
  expect(css).toContain("prefers-reduced-motion: reduce");
  expect(css).toContain("forced-colors: active");
  expect(css).toContain('--story-ink: #fff8f2');
});
it("keeps the flat hero rule strong enough to override both legacy theme rules", () => {
  const css = readFileSync(new URL("../styles/storybook.css", import.meta.url), "utf8");
  const rule = css.match(/:root \.app-shell--storybook \.hero-grid\s*\{([^}]+)\}/)?.[1];
  expect(rule).toContain("backdrop-filter: none");
  expect(rule).toContain("background: var(--paper)");
  expect(css).toContain("grid-template-columns: 44px minmax(0,1fr) auto");
  expect(css).toContain(".desktop-brand > div:last-child { display: none; }");
});
it("gives cultural text the full column when its old thumbnail is hidden", () => {
  const css = readFileSync(new URL("../styles/storybook.css", import.meta.url), "utf8");
  const rule = css.match(/\.study-language-space \.language-culture\s*\{([^}]+)\}/)?.[1];
  expect(rule).toContain("grid-template-columns: minmax(0,1fr)");
});
it("keeps the starter illustration away from full-width tablet and mobile steps", () => {
  const css = readFileSync(new URL("../styles/storybook.css", import.meta.url), "utf8");
  expect(css).toMatch(/@media \(max-width: 899px\)\s*\{\s*\.study-start-illustration\s*\{\s*display: none;/);
  expect(css).toMatch(/@media \(min-width: 720px\) and \(max-width: 899px\)\s*\{\s*:root \.app-shell--storybook \.study-start-card \{ padding-inline-end: 24px;/);
});
it("gives language volumes a contrasting keyboard focus ring in either theme", () => {
  const css = readFileSync(new URL("../styles/storybook.css", import.meta.url), "utf8");
  const rule = css.match(/:root \.app-shell--storybook \.story-volume:focus-visible\s*\{([^}]+)\}/)?.[1];
  expect(rule).toContain("outline: 3px solid var(--story-ink)");
  expect(rule).toContain("outline-offset: 5px");
});
it("collapses decorative frames in forced colours without hiding progress or actions", () => {
  const css = readFileSync(new URL("../styles/storybook.css", import.meta.url), "utf8");
  const forced = css.slice(css.lastIndexOf("@media (forced-colors: active)"));
  for (const art of [".story-panels", ".story-masthead__art", ".study-volume-art", ".story-lab-art", ".story-volume__art", ".language-culture__scene"])
    expect(forced).toContain(art);
  expect(forced).toContain("display: none");
  expect(forced).toContain("grid-template-columns: minmax(0,1fr)");
  expect(forced).toContain("outline-color: Highlight");
  expect(forced).toContain(".study-start-card { padding-inline-end: 24px; }");
  expect(forced).not.toMatch(/progress-orbit|primary-button|nav-item|profile-score|__copy/);
});
