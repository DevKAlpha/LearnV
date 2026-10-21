import { readFileSync } from "node:fs";
import { inspectStartup } from "./startup-budget.mjs";

const dist = new URL("../dist/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL(".vite/manifest.json", dist), "utf8"));
const report = inspectStartup(manifest, (file) => readFileSync(new URL(file, dist)));
console.log(`Startup budget OK: ${report.bytes} B / ${report.gzip} B gzip across ${report.files.length} static chunk(s); question banks remain lazy.`);
