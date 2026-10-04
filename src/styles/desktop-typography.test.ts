import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./desktop-typography.css", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").trim();

describe("desktop typography isolation", () => {
  it("keeps every declaration inside the desktop breakpoint", () => {
    expect(css.startsWith("@media (min-width: 900px) {")).toBe(true);
    let depth = 0;
    for (let index = css.indexOf("{"); index < css.length; index++) {
      if (css[index] === "{") depth++;
      if (css[index] === "}") depth--;
      if (depth === 0) expect(index).toBe(css.length - 1);
    }
    expect(depth).toBe(0);
    // Any narrower adjustment must remain nested in the desktop-only block.
    expect(css.match(/@media/g)).toHaveLength(3);
  });

  it("preserves container geometry, colours and display heading sizes", () => {
    // Only navigation may adjust its internal spacing to avoid cropping larger labels.
    const withoutNavFit = css.replace(/[^{}]+\{[^{}]*(?<![-\w])(?:grid-template-columns|padding-inline|gap|width|height):[^{}]+\}/g, (rule) => {
      expect(rule).toMatch(/\.app-shell \.nav|\.app-shell \.bottom-nav/);
      return "";
    });
    const properties = [...withoutNavFit.matchAll(/(?:[;{]\s*)([-\w]+)\s*:/g)].map((match) => match[1]);
    const allowed = new Set([
      "font-size", "font-weight", "line-height", "-webkit-font-smoothing", "-moz-osx-font-smoothing",
      "--desktop-copy-size", "--desktop-detail-size", "--desktop-caption-size",
    ]);
    expect(properties.length).toBeGreaterThan(0);
    expect(properties.filter((property) => !allowed.has(property))).toEqual([]);
    expect(css).not.toMatch(/(?:h[12]|html|:root)\s*\{[^}]*font-size:/);
    expect(css.match(/[^{}]+\{[^{}]*grid-template-columns:[^{}]+\}/g))
      .toEqual([expect.stringContaining(".app-shell .bottom-nav")]);
  });
});
