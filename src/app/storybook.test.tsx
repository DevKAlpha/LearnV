import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { StoryFolio } from "@/shared/ui/StoryFolio";
import { StorybookArt } from "@/shared/ui/StorybookArt";
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
it("keeps the new atlas vector-only, decorative and bounded", () => {
  const html = renderToStaticMarkup(<StorybookArt />);
  expect(html).toContain('viewBox="0 0 480 340"');
  expect(html).toContain('aria-hidden="true" focusable="false"');
  expect(html.length).toBeLessThan(6_000);
  expect(html).not.toMatch(/<(?:image|filter|script|animate|text)\b|https?:|data:/);
});
it("uses no remote texture, persistent compositor hint or looping page animation", () => {
  const css = readFileSync(new URL("../styles/storybook.css", import.meta.url), "utf8");
  expect(css).not.toMatch(/url\(|infinite|will-change:\s*(?!auto)[\w-]+|transition:\s*all/);
  expect(css).toContain("prefers-reduced-motion: reduce");
  expect(css).toContain("forced-colors: active");
  expect(css).toContain('--story-ink: #fff8f2');
});
