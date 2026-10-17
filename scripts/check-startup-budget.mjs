import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";

const assets = new URL("../dist/assets/", import.meta.url);
const entries = readdirSync(assets).filter((name) => /^index-.+\.js$/.test(name));
if (entries.length !== 1) throw new Error("Expected exactly one initial JavaScript entry.");
const entry = new URL(entries[0], assets);
const bytes = statSync(entry).size;
const gzip = gzipSync(readFileSync(entry), { level: 9 }).length;
const map = JSON.parse(readFileSync(new URL(`${entries[0]}.map`, assets), "utf8"));
const banks = map.sources.filter((source) => /\/(?:practice-tests|foundation-practice-tests|extension-practice-tests|advanced-practice-tests)\.ts$/.test(source));
if (banks.length) throw new Error(`Question banks leaked into startup: ${banks.join(", ")}`);
if (bytes > 450_000 || gzip > 150_000) throw new Error(`Startup budget exceeded: ${bytes} B / ${gzip} B gzip.`);
console.log(`Startup budget OK: ${bytes} B / ${gzip} B gzip; question banks remain lazy.`);
