import { readFileSync } from "node:fs";

const VERSION_PATTERN = /^\d+\.\d+\.\d+[A-Z]$/;

let version;
try {
  version = readFileSync(new URL("../VERSION", import.meta.url), "utf8").trim();
} catch {
  console.error("VERSION is missing. Add it only when opening a release cycle (example: 1.0.0A).");
  process.exit(1);
}

if (!VERSION_PATTERN.test(version)) {
  console.error(`Invalid LearnV version: ${version}. Expected format: 1.0.0A.`);
  process.exit(1);
}

const releaseTag = process.env.RELEASE_TAG;
if (releaseTag && releaseTag !== `v${version}`) {
  console.error(`Tag ${releaseTag} does not match VERSION ${version}. Expected v${version}.`);
  process.exit(1);
}

console.log(`LearnV release version validated: ${version}`);
