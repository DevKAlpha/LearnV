import { describe, expect, it } from "vitest";
import { cacheVersion, selectPrecache, serviceWorkerSource } from "./build-sw.mjs";

describe("service worker build", () => {
  it("precaches the shell, every chunk, the manifest and the icons, but not fonts or art", () => {
    const files = ["index.html", "404.html", "sw.js", "manifest.webmanifest", "favicon.svg", "icons/icon-192.png", "assets/index-a1.js", "assets/ReviewPage-b2.js", "assets/app-c3.css", "assets/noto-kr-0.woff2", "illustrations/storybook/seoul.svg", "data/gks-radar.json"];
    expect(selectPrecache(files)).toEqual(["assets/ReviewPage-b2.js", "assets/app-c3.css", "assets/index-a1.js", "favicon.svg", "icons/icon-192.png", "index.html", "manifest.webmanifest"]);
  });

  it("changes the cache version when any precached file changes", () => {
    const a = cacheVersion([{ path: "index.html", content: Buffer.from("v1") }]);
    expect(cacheVersion([{ path: "index.html", content: Buffer.from("v1") }])).toBe(a);
    expect(cacheVersion([{ path: "index.html", content: Buffer.from("v2") }])).not.toBe(a);
  });

  it("writes a worker that only handles same-scope GET requests", () => {
    const source = serviceWorkerSource({ version: "abc", precache: ["index.html"] });
    expect(source).toContain('const VERSION = "abc";');
    expect(source).toContain('const PRECACHE = ["index.html"];');
    expect(source).toContain('if (request.method !== "GET") return;');
    expect(source).toContain("url.pathname.startsWith(scope.pathname)");
    expect(source).toContain('url.pathname.startsWith(scope.pathname + "qa/")');
    expect(() => new Function(source)).not.toThrow();
  });
});
