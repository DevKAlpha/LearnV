import { describe, expect, it } from "vitest";
import { gzipSync } from "node:zlib";
import { inspectStartup } from "./startup-budget.mjs";

const entry = { file: "assets/index.js", isEntry: true, imports: ["shared"], dynamicImports: ["practice"] };
const manifest = { "index.html": entry, shared: { file: "assets/shared.js" }, practice: { file: "assets/practice.js" } };
const js = { "assets/index.js": "export const home = true;", "assets/shared.js": "export const shared = true;" };
function reader(sources = {}) {
  return (file) => {
    if (file.endsWith(".map")) return JSON.stringify({ sources: sources[file] ?? ["../src/home.tsx"] });
    if (!js[file]) throw new Error(`Unexpected read: ${file}`);
    return js[file];
  };
}

describe("startup performance gate", () => {
  it("counts every static import but never reads a lazy question bank", () => {
    const report = inspectStartup(manifest, reader());
    expect(report.files).toEqual(["assets/index.js", "assets/shared.js"]);
    expect(report.bytes).toBe(Object.values(js).reduce((sum, contents) => sum + Buffer.byteLength(contents), 0));
    expect(report.gzip).toBe(Object.values(js).reduce((sum, contents) => sum + gzipSync(contents, { level: 9 }).length, 0));
  });
  it.each(["assets/index.js.map", "assets/shared.js.map"])("rejects a bank in %s", (file) => {
    for (const bank of ["practice-tests", "foundation-practice-tests", "extension-practice-tests", "advanced-practice-tests"])
      for (const prefix of ["", "../src/infrastructure/data/"])
        expect(() => inspectStartup(manifest, reader({ [file]: [`${prefix}${bank}.ts`] }))).toThrow("Question banks leaked");
  });
  it("checks transitive dependencies and Windows-style source paths", () => {
    const graph = { ...manifest, shared: { file: "assets/shared.js", imports: ["deep"] }, deep: { file: "assets/deep.js" } };
    const load = (file) => file === "assets/deep.js" ? "const bank = [];" : file === "assets/deep.js.map"
      ? JSON.stringify({ sources: ["..\\src\\infrastructure\\data\\advanced-practice-tests.ts"] }) : reader()(file);
    expect(() => inspectStartup(graph, load)).toThrow("Question banks leaked");
  });
  it("deduplicates shared imports and cycles", () => {
    const graph = { ...manifest, shared: { file: "assets/shared.js", imports: ["index.html", "shared"] } };
    expect(inspectStartup(graph, reader()).files).toHaveLength(2);
  });
  it("fails closed on a missing dependency or source map", () => {
    expect(() => inspectStartup({ "index.html": entry }, reader())).toThrow("Missing static");
    expect(() => inspectStartup(manifest, () => "not-json")).toThrow();
    expect(() => inspectStartup(manifest, (file) => file.endsWith(".map") ? "{}" : "js")).toThrow("Missing source list");
  });
  it("requires exactly one entry", () => {
    expect(() => inspectStartup({}, reader())).toThrow("exactly one");
    expect(() => inspectStartup({ a: entry, b: entry }, reader())).toThrow("exactly one");
  });
  it("enforces both combined byte and compressed transfer budgets, including their boundaries", () => {
    const report = inspectStartup(manifest, reader());
    expect(() => inspectStartup(manifest, reader(), { bytes: report.bytes - 1, gzip: Infinity })).toThrow("budget exceeded");
    expect(() => inspectStartup(manifest, reader(), { bytes: Infinity, gzip: report.gzip - 1 })).toThrow("budget exceeded");
    expect(inspectStartup(manifest, reader(), report)).toEqual(report);
  });
});
