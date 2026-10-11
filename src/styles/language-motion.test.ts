import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("./language-motion.css", import.meta.url), "utf8");
const baseCss = readFileSync(new URL("./app.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");

describe("bounded language motion", () => {
  it("loads after existing palettes and responsive styles", () => {
    expect(entry.indexOf('styles/language-motion.css')).toBeGreaterThan(entry.indexOf('styles/language-culture.css'));
  });
  it("uses finite short animations without expensive animated properties", () => {
    const animations = [...css.matchAll(/animation:\s*([^;]+);/g)].map((match) => match[1]);
    expect(animations).toHaveLength(3); // Art, selected icons, reduced-motion reset.
    const animated = animations.filter((value) => !value.startsWith("none"));
    for (const declaration of animated) {
      expect(declaration).not.toMatch(/infinite|\bboth\b|\bforwards\b/);
      expect(Number(declaration.match(/(\d+)ms/)?.[1])).toBeLessThanOrEqual(500);
    }
    const keyframes = css.slice(css.indexOf("@keyframes"), css.indexOf("@media (prefers-reduced-motion: reduce)"));
    const properties = [...keyframes.matchAll(/([\w-]+):/g)].map((match) => match[1]);
    expect(new Set(properties)).toEqual(new Set(["opacity", "transform"]));
    expect(css).not.toMatch(/transition:\s*all|will-change|backdrop-filter|setTimeout|url\(/);
    expect(baseCss).not.toContain("node-pulse");
  });
  it("keeps text and exercise badges stable, with no hidden content or layout animation", () => {
    expect(css).not.toMatch(/language-culture__(?:copy|greeting|identity|detail)\s*\{|\.test-session-page|\.test-result-page|opacity:\s*0\b|display:\s*none|(?:width|height|margin|padding):/);
    for (const declaration of css.matchAll(/transition:\s*([^;]+);/g)) {
      expect(declaration[1]).toMatch(/^(?:transform |none)/);
    }
  });
  it("separates hover from touch and explicitly disables local motion for accessibility", () => {
    expect(css).toContain('(hover: hover) and (pointer: fine)');
    expect(css).toContain(':focus-within');
    expect(css).toContain(':focus-visible');
    expect(css).toContain(':active');
    expect(css).toContain('(update: slow)');
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    for (const reset of ["animation: none !important", "transition: none !important", "transform: none !important"]) expect(reduced).toContain(reset);
    for (const selector of [".language-culture__art", ".test-path-page .app-icon", ".test-skill-tabs > button", ".language-card__action"]) expect(reduced).toContain(selector);
  });
});
