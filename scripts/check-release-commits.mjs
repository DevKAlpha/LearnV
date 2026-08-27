import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const version = readFileSync(new URL("../VERSION", import.meta.url), "utf8").trim();
const base = process.env.BASE_SHA;
const head = process.env.HEAD_SHA;
const pullRequestTitle = process.env.PR_TITLE ?? "";

if (!base || !head) {
  console.error("BASE_SHA and HEAD_SHA are required to validate release commits.");
  process.exit(1);
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const versionCommits = git("log", "--reverse", "--format=%H", `${base}..${head}`, "--", "VERSION")
  .split(/\r?\n/)
  .filter(Boolean);

if (versionCommits.length === 0) {
  console.error("The release candidate must include a commit that creates or updates VERSION.");
  process.exit(1);
}

const firstVersionCommit = versionCommits[0];
const subjects = git("log", "--reverse", "--format=%s", `${firstVersionCommit}^..${head}`)
  .split(/\r?\n/)
  .filter(Boolean);
const marker = `[${version}]`;
const invalidSubjects = subjects.filter((subject) => !subject.includes(marker));

if (invalidSubjects.length > 0) {
  console.error(`Every commit from the VERSION change must include ${marker}:`);
  invalidSubjects.forEach((subject) => console.error(`- ${subject}`));
  process.exit(1);
}

if (!pullRequestTitle.includes(marker)) {
  console.error(`The release Pull Request title must include ${marker}.`);
  process.exit(1);
}

console.log(`${subjects.length} release commit(s) and the Pull Request title include ${marker}.`);
