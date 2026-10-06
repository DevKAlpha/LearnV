import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./light-theme.css", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "");
const tokens = Object.fromEntries([...css.matchAll(/(--[\w-]+):\s*(#[\da-f]{6});/g)]
  .map((match) => [match[1], match[2]]));

function luminance(hex: string) {
  const rgb = hex.slice(1).match(/../g)!.map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("tulip daylight theme", () => {
  it("scopes every style rule to light mode, including media rules", () => {
    const selectors = [...css.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim());
    expect(selectors.length).toBeGreaterThan(30);
    for (const selector of selectors) {
      if (selector.startsWith("@media")) continue;
      expect(selector.startsWith(':root[data-theme="light"]')).toBe(true);
      expect(selector).not.toContain('data-theme="dark"');
    }
  });

  it("changes appearance only, preserving layout, type sizes and interaction", () => {
    const allowed = new Set([
      "color", "background", "border-color", "border-left-color", "box-shadow",
      "-webkit-backdrop-filter", "backdrop-filter", "opacity",
    ]);
    const properties = [...css.matchAll(/(?:[;{]\s*)([-\w]+)\s*:/g)].map((match) => match[1]);
    expect(properties.filter((property) => !property.startsWith("--") && !allowed.has(property))).toEqual([]);
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*opacity:[^{}]*)\}/g)) {
      expect(rule[1]).toMatch(/::before|::after/);
    }
  });

  it.each(["#fffaf1", "#fffdf8", "#ffd4c4", "#ffe1b8", "#fff2bc", "#ffded0", "#fff0bf"])(
    "keeps body and secondary text readable over %s", (surface) => {
      expect(contrast(tokens["--ink"], surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(tokens["--muted"], surface)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("keeps CTA text readable at both gradient endpoints", () => {
    for (const endpoint of ["--light-action-start", "--light-action-end"]) {
      expect(contrast(tokens["--light-action-text"], tokens[endpoint])).toBeGreaterThanOrEqual(4.5);
      expect(contrast("#ffe2a1", tokens[endpoint])).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("uses the same light canvas before and after React boots", () => {
    const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
    const provider = readFileSync(new URL("../application/theme/ThemeContext.tsx", import.meta.url), "utf8");
    expect(html).toContain(`<meta name="theme-color" content="${tokens["--cream"]}"`);
    expect(html).toContain(`[data-theme="light"] #learnv-bootstrap-loader{background:${tokens["--cream"]}`);
    expect(provider).toContain(`theme === "dark" ? "#101722" : "${tokens["--cream"]}"`);
  });

  it("retains semantic feedback and completion accents without hiding selection", () => {
    expect(css).toMatch(/\.question-feedback--correct\s*\{ border-left-color: var\(--green\)/);
    expect(css).toMatch(/\.question-feedback--review\s*\{ border-left-color: var\(--yellow\)/);
    expect(css).toMatch(/\.document-card--done\s*\{\s*border-color: var\(--green\)/);
    expect(css).not.toMatch(/\.written-(?:question|rubric) label\s*[,)]/);
  });
});
