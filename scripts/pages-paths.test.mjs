import { describe, expect, it } from "vitest";
import { readFile, writeFile, mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { pagesBase, qaRedirectScript } from "./pages-paths.mjs";
import { assemblePages } from "./assemble-pages.mjs";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const restore = html.match(/<script data-learnv-route-restore>([\s\S]*?)<\/script>/)[1];
function restoreRoute(route, base = "/LearnV/qa/") {
  const changes = [];
  runInNewContext(restore.replaceAll("%BASE_URL%", base), {
    location: { origin: "https://example.com", search: `?learnv-route=${encodeURIComponent(route)}` },
    URL, URLSearchParams, history: { replaceState: (_, __, url) => changes.push(url) },
  });
  return changes;
}

describe("isolated Pages base paths", () => {
  it("keeps local dev at root, with an explicit override for static QA", () => {
    expect(pagesBase({ scope: "learning-qa" })).toBe("/");
    expect(pagesBase({ override: "/LearnV/qa/" })).toBe("/LearnV/qa/");
    expect(() => pagesBase({ override: "https://external.test/" })).toThrow();
    expect(() => pagesBase({ override: "/../" })).toThrow();
  });
  it("supports both project and account Pages sites", () => {
    expect(pagesBase({ actions: "true" })).toBe("/LearnV/");
    expect(pagesBase({ actions: "true", scope: "learning-qa" })).toBe("/LearnV/qa/");
    expect(pagesBase({ actions: "true", repository: "DevKAlpha/devkalpha.github.io", scope: "learning-qa" })).toBe("/qa/");
  });
});

describe("QA deep-link fallback", () => {
  it.each(["/LearnV/qa/study/english", "/LearnV/qa/tests/ko/reading-01?from=plan&try=1#feedback", "/LearnV/qa", "/LearnV/qa/"])("round trips %s", (route) => {
    const destinations = [];
    const parsed = new URL(route, "https://example.com");
    const script = qaRedirectScript("/LearnV/").match(/<script[^>]*>([\s\S]*)<\/script>/)[1];
    runInNewContext(script, { location: { pathname: parsed.pathname, search: parsed.search, hash: parsed.hash, replace: (url) => destinations.push(url) }, encodeURIComponent });
    expect(destinations).toHaveLength(1);
    const saved = new URL(destinations[0], parsed.origin).searchParams.get("learnv-route");
    expect(restoreRoute(saved)).toEqual([route]);
  });
  it.each(["/LearnV/study", "/LearnV/qa-extra/study", "/other/qa/study"])("does not capture production/unrelated path %s", (pathname) => {
    const destinations = [];
    runInNewContext(qaRedirectScript("/LearnV/").match(/<script[^>]*>([\s\S]*)<\/script>/)[1], { location: { pathname, search: "", hash: "", replace: (url) => destinations.push(url) } });
    expect(destinations).toEqual([]);
  });
  it.each(["https://evil.test/", "//evil.test/", "/LearnV/study", "/LearnV/qa/../scholarship", "/LearnV/qa-extra", "/LearnV/qa/\\evil", "/LearnV/qa/\nwrong"])("rejects unsafe/out-of-scope restoration %s", (route) => {
    expect(restoreRoute(route)).toEqual([]);
  });
  it("removes nested restore parameters to avoid a reload loop", () => {
    expect(restoreRoute("/LearnV/qa/study?learnv-route=bad&from=plan#top")).toEqual(["/LearnV/qa/study?from=plan#top"]);
  });
});

describe("combined deployment", () => {
  const index = (scope, base) => `<html><head><meta name="learnv-scope" content="${scope}"><meta name="learnv-base" content="${base}"><meta name="learnv-revision" content="abcdef123"></head><body>${scope}</body></html>`;
  async function fixture(run) {
    const directory = await mkdtemp(join(tmpdir(), "learnv-pages-"));
    try {
      const production = join(directory, "dist"), qa = join(directory, "qa-source");
      await mkdir(production); await mkdir(qa);
      await writeFile(join(production, "index.html"), index("full", "/LearnV/"));
      await writeFile(join(qa, "index.html"), index("learning-qa", "/LearnV/qa/"));
      await writeFile(join(production, "prod.js"), "production");
      await writeFile(join(qa, "qa.js"), "qa");
      await run(production, qa);
    } finally { await rm(directory, { recursive: true, force: true }); }
  }
  it("retains production, nests QA and emits traceable metadata", async () => fixture(async (production, qa) => {
    await assemblePages(production, qa);
    expect(await readFile(join(production, "index.html"), "utf8")).toBe(index("full", "/LearnV/"));
    expect(await readFile(join(production, "qa", "qa.js"), "utf8")).toBe("qa");
    expect(await readFile(join(production, "prod.js"), "utf8")).toBe("production");
    expect(await readFile(join(production, "404.html"), "utf8")).toContain("data-learnv-qa-redirect");
    expect(JSON.parse(await readFile(join(production, "qa", "deployment.json"), "utf8"))).toMatchObject({ branch: "qa", scope: "learning-qa", base: "/LearnV/qa/" });
    await expect(assemblePages(production, qa)).rejects.toThrow();
  }));
  it.each([["full", "/LearnV/qa/"], ["learning-qa", "/LearnV/"]])("refuses wrong scope/base %s %s", async (scope, base) => fixture(async (production, qa) => {
    await writeFile(join(qa, "index.html"), index(scope, base));
    await expect(assemblePages(production, qa)).rejects.toThrow("scope or base mismatch");
  }));
  it("refuses overlapping output directories", async () => fixture(async (production) => {
    await expect(assemblePages(production, production)).rejects.toThrow("outside");
    await expect(assemblePages(production, join(production, "qa"))).rejects.toThrow("outside");
  }));
});
