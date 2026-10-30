// Explicit network check: not part of normal builds or navigation.
import { readingLibrary } from "../src/infrastructure/data/reading-library.ts";
const targets = [...new Set(readingLibrary.map((item) => item.url))];
const results = [];
for (let start = 0; start < targets.length; start += 5) {
  await Promise.all(targets.slice(start, start + 5).map(async (url) => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
      const html = await response.text();
      const title = (html.match(/<title[^>]*>([^<]+)/i)?.[1] ?? "").trim();
      const blocked = /client challenge|just a moment|checking your browser|page not found|404 page/i.test(title) || /404 page not found/i.test(html);
      const attachment = /attachment/i.test(response.headers.get("content-disposition") ?? "");
      const ok = response.ok && /text\/html/i.test(response.headers.get("content-type") ?? "") && !blocked && !attachment && title.length > 0;
      results.push({ url, status: response.status, title, ok });
    } catch (error) { results.push({ url, ok: false, error: error.message }); }
  }));
}
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), readings: readingLibrary.length, targets: targets.length, results }, null, 2));
if (results.some((item) => !item.ok)) process.exitCode = 1;
