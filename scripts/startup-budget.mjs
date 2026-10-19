import { gzipSync } from "node:zlib";

export const STARTUP_LIMITS = { bytes: 450_000, gzip: 150_000 };
const banks = /(?:^|\/)(?:practice-tests|foundation-practice-tests|extension-practice-tests|advanced-practice-tests)\.ts$/;

/** Count the complete static entry graph, not lazy destinations or unrelated chunks. */
export function inspectStartup(manifest, readAsset, limits = STARTUP_LIMITS) {
  const entries = Object.values(manifest).filter((chunk) => chunk.isEntry);
  if (entries.length !== 1) throw new Error("Expected exactly one initial JavaScript entry.");
  const visited = new Set();
  const report = { files: [], bytes: 0, gzip: 0 };
  const visit = (chunk) => {
    if (visited.has(chunk.file)) return;
    visited.add(chunk.file);
    if (!chunk.file.endsWith(".js")) throw new Error(`Unexpected startup asset: ${chunk.file}`);
    const contents = readAsset(chunk.file);
    const map = JSON.parse(readAsset(`${chunk.file}.map`).toString());
    if (!Array.isArray(map.sources)) throw new Error(`Missing source list for ${chunk.file}`);
    const leaked = map.sources.filter((source) => banks.test(source.replaceAll("\\", "/")));
    if (leaked.length) throw new Error(`Question banks leaked into startup: ${leaked.join(", ")}`);
    report.files.push(chunk.file);
    report.bytes += Buffer.byteLength(contents);
    report.gzip += gzipSync(contents, { level: 9 }).length;
    for (const key of chunk.imports ?? []) {
      if (!manifest[key]) throw new Error(`Missing static startup dependency: ${key}`);
      visit(manifest[key]);
    }
  };
  visit(entries[0]);
  if (report.bytes > limits.bytes || report.gzip > limits.gzip)
    throw new Error(`Startup budget exceeded: ${report.bytes} B / ${report.gzip} B gzip.`);
  return report;
}
