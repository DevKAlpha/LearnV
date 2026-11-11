import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Content-Security-Policy for the static build. Inline bootstrap scripts are allowed by
 * hash only, so any injected inline script is blocked. Styles keep 'unsafe-inline'
 * because React writes style attributes (progress bars, CSS variables).
 */
export const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", "https://i.ytimg.com"],
  "media-src": ["'self'", "blob:"],
  // Vite inlines small font subsets as data: URIs.
  "font-src": ["'self'", "data:"],
  "connect-src": ["'self'"],
  "frame-src": ["https://www.youtube-nocookie.com"],
  "manifest-src": ["'self'"],
  "worker-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

const META = /\s*<meta http-equiv="Content-Security-Policy"[^>]*>/gi;
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;

export function inlineScriptHashes(html) {
  return [...html.matchAll(INLINE_SCRIPT)]
    // Browsers hash the script text after HTML input normalisation, which turns CRLF/CR into LF.
    .map((match) => match[1].replace(/\r\n?/g, "\n"))
    .filter((body) => body.trim().length > 0)
    .map((body) => `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
}

export function buildPolicy(hashes) {
  return Object.entries(CSP_DIRECTIVES)
    .map(([name, values]) => [name, ...(name === "script-src" ? [...values, ...new Set(hashes)] : values)].join(" "))
    .join("; ");
}

/** Idempotent: replaces any previous policy, then places the new one before the first script. */
export function applyCsp(html) {
  const clean = html.replace(META, "");
  const policy = buildPolicy(inlineScriptHashes(clean));
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}" />`;
  const charset = clean.match(/<meta charset="[^"]*"\s*\/?>/i);
  if (charset?.index !== undefined) {
    const at = charset.index + charset[0].length;
    return `${clean.slice(0, at)}\n    ${meta}${clean.slice(at)}`;
  }
  return clean.replace(/<head>/i, `<head>\n    ${meta}`);
}

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  }));
  return nested.flat();
}

export async function applyCspToDirectory(directory) {
  const files = await htmlFiles(resolve(directory));
  for (const file of files) await writeFile(file, applyCsp(await readFile(file, "utf8")));
  return files;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const files = await applyCspToDirectory(process.argv[2] ?? "dist");
  console.log(`Content-Security-Policy applied to ${files.length} HTML file(s).`);
}
