import { readFileSync } from "node:fs";
import { inspectStartup, inspectStartupCss } from "./startup-budget.mjs";

const dist = new URL("../dist/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL(".vite/manifest.json", dist), "utf8"));
const read = (file) => readFileSync(new URL(file, dist));
const report = inspectStartup(manifest, read);
console.log(`Startup budget OK: ${report.bytes} B / ${report.gzip} B gzip across ${report.files.length} static chunk(s); question banks remain lazy.`);
const css = inspectStartupCss(manifest, read);
console.log(`Startup CSS budget OK: ${css.bytes} B / ${css.gzip} B gzip across ${css.files.length} stylesheet(s).`);
