import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyCsp, inlineScriptHashes } from "./csp.mjs";

const html = `<!doctype html><html><head>
    <meta charset="UTF-8" />
    <script>console.log("boot")</script>
    <script type="module" crossorigin src="/assets/index.js"></script>
  </head><body></body></html>`;

describe("content security policy", () => {
  it("hashes only inline scripts", () => {
    const expected = createHash("sha256").update('console.log("boot")').digest("base64");
    expect(inlineScriptHashes(html)).toEqual([`'sha256-${expected}'`]);
  });

  it("hashes CRLF sources the way the browser does (LF-normalised)", () => {
    const crlf = "<head><meta charset=\"UTF-8\" /><script>a()\r\nb()</script></head>";
    const expected = createHash("sha256").update("a()\nb()").digest("base64");
    expect(inlineScriptHashes(crlf)).toEqual([`'sha256-${expected}'`]);
  });

  it("places the policy before the first script and is idempotent", () => {
    const once = applyCsp(html);
    expect(once.indexOf("Content-Security-Policy")).toBeLessThan(once.indexOf("<script"));
    expect(once).toContain("object-src 'none'");
    expect(once).toContain("frame-src https://www.youtube-nocookie.com");
    expect(applyCsp(once)).toBe(once);
  });

  it("covers every inline script in the real index.html", () => {
    const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    const result = applyCsp(source);
    for (const hash of inlineScriptHashes(source)) expect(result).toContain(hash);
    expect(inlineScriptHashes(source).length).toBeGreaterThanOrEqual(3);
  });
});
