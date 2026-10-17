import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { PathCultureAccent } from "@/features/study/presentation/components/PathCultureAccent";
import { pathSkillOrder } from "@/features/study/presentation/components/learning-path-layout";

const artDirectory = new URL("../../public/illustrations/learning-path/", import.meta.url);
afterEach(() => vi.unstubAllEnvs());

describe.each(["en", "ko"] as const)("local path illustrations for %s", (language) => {
  it.each(pathSkillOrder)("varies all six landmarks across the %s route without repeating", (skill) => {
    const sources = Array.from({ length: 6 }, (_, index) => {
      const html = renderToStaticMarkup(<PathCultureAccent language={language} skill={skill} stageIndex={index * 4} />);
      expect(html).toContain('loading="lazy"');
      expect(html).toContain('decoding="async"');
      expect(html).toContain('alt="" aria-hidden="true"');
      expect(html).toContain('width="200" height="160"');
      const source = html.match(/src="([^"]+)"/)![1];
      expect(source).toContain(`/illustrations/learning-path/${language}-`);
      expect(statSync(new URL(source.split("/").at(-1)!, artDirectory)).size).toBeLessThan(3_072);
      return source;
    });
    expect(new Set(sources).size).toBe(6);
  });
});

it.each(["/LearnV/", "/LearnV/qa/"])("resolves illustrations relative to deployment base %s", (base) => {
  vi.stubEnv("BASE_URL", base);
  const html = renderToStaticMarkup(<PathCultureAccent language="ko" skill="reading" stageIndex={0} />);
  expect(html).toContain(`src="${base}illustrations/learning-path/ko-hanok.svg"`);
});

it("keeps the complete original SVG collection within its static-asset budget", () => {
  const files = readdirSync(artDirectory).filter((name) => name.endsWith(".svg"));
  expect(files).toHaveLength(12);
  let totalBytes = 0;
  for (const name of files) {
    const source = readFileSync(new URL(name, artDirectory), "utf8");
    totalBytes += Buffer.byteLength(source);
    expect(source).toContain('viewBox="0 0 200 160"');
    // No remote dependencies, executable content, embedded bitmaps or costly filters.
    expect(source).not.toMatch(/<(?:script|image|foreignObject|filter|text)\b|\b(?:href|onload|onclick)=|url\(/i);
  }
  expect(totalBytes).toBeLessThan(25_600);
});
