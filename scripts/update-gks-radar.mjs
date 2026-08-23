import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const outputPath = resolve("public/data/gks-radar.json");
const liveSnapshotUrl = "https://devkalpha.github.io/LearnV/data/gks-radar.json";
const monitoredSources = [
  {
    id: "study-in-korea-notices",
    url: "https://www.studyinkorea.go.kr/ko/notice/scholarshipsList.do?boardSort=3",
  },
  {
    id: "niied-2027",
    url: "https://www.niied.go.kr/web/main/nid/niied_board/5745",
  },
  {
    id: "spain-embassy-notices",
    url: "https://overseas.mofa.go.kr/es-es/brd/m_8065/list.do",
  },
];

function normalisePage(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 20);
}

function monitoredText(content) {
  const withoutCounters = content
    .replace(/조회수\s*\d+/gi, "")
    .replace(/views?\s*[:：]?\s*\d+/gi, "");
  const matches = withoutCounters.match(/.{0,120}(?:GKS|Global Korea Scholarship|정부초청).{0,300}/gi);
  return matches?.slice(0, 60).join(" | ") ?? withoutCounters.slice(0, 1_000);
}

async function readJsonFile(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

async function readPreviousSnapshot() {
  const localSnapshot = await readJsonFile(outputPath);
  if (!process.env.GITHUB_ACTIONS) return localSnapshot;

  try {
    const response = await fetch(liveSnapshotUrl, {
      headers: { "cache-control": "no-cache", "user-agent": "LearnV-GKS-Radar" },
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok ? await response.json() : localSnapshot;
  } catch {
    return localSnapshot;
  }
}

async function checkSource(source, previous) {
  const prior = previous?.sourceChecks?.find((item) => item.id === source.id);

  try {
    const response = await fetch(source.url, {
      headers: { "user-agent": "LearnV-GKS-Radar/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const content = normalisePage(await response.text());
    const hash = fingerprint(monitoredText(content));
    const detectsCall = /2027.{0,100}(application guidelines|application guide|모집\s*요강|지원\s*모집)/i.test(content);

    return {
      id: source.id,
      url: source.url,
      ok: true,
      changed: Boolean(prior?.hash && prior.hash !== hash),
      hash,
      detectsCall,
      lastModified: response.headers.get("last-modified") ?? undefined,
    };
  } catch (error) {
    return {
      id: source.id,
      url: source.url,
      ok: false,
      changed: false,
      hash: prior?.hash,
      detectsCall: false,
      error: error instanceof Error ? error.message : "Unknown fetch error",
    };
  }
}

const previous = await readPreviousSnapshot();
const sourceChecks = await Promise.all(
  monitoredSources.map((source) => checkSource(source, previous)),
);
const checkedAt = new Date();
const nextCheckAt = new Date(checkedAt.getTime() + 24 * 60 * 60 * 1000);
const snapshot = {
  schemaVersion: 1,
  checkedAt: checkedAt.toISOString(),
  nextCheckAt: nextCheckAt.toISOString(),
  callDetected: sourceChecks.some((source) => source.detectsCall),
  sourceChecks,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`GKS radar updated: ${sourceChecks.filter((source) => source.ok).length}/${sourceChecks.length} official sources online.`);
