import { cp, readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { qaRedirectScript } from "./pages-paths.mjs";

function identity(html) {
  const get = (name) => html.match(new RegExp(`<meta name="learnv-${name}" content="([^"]+)"`))?.[1];
  return { scope: get("scope"), base: get("base"), revision: get("revision") };
}

export async function assemblePages(productionDirectory, qaDirectory) {
  const production = resolve(productionDirectory);
  const qa = resolve(qaDirectory);
  const nested = relative(production, qa);
  if (!nested || (!nested.startsWith("..") && !isAbsolute(nested))) throw new Error("QA source must be outside the production output");
  const productionHtml = await readFile(resolve(production, "index.html"), "utf8");
  const qaHtml = await readFile(resolve(qa, "index.html"), "utf8");
  const full = identity(productionHtml);
  const restricted = identity(qaHtml);
  if (full.scope !== "full" || restricted.scope !== "learning-qa" || !full.base || restricted.base !== `${full.base}qa/`) {
    throw new Error("Refusing to deploy: production/QA scope or base mismatch");
  }
  // Vite empties dist before each build. Refuse stale/previous QA output rather than overwrite it.
  await mkdir(resolve(production, "qa"));
  await cp(qa, resolve(production, "qa"), { recursive: true, dereference: true });
  await writeFile(resolve(production, "404.html"), productionHtml.replace("<head>", `<head>\n${qaRedirectScript(full.base)}`));
  const builtAt = new Date().toISOString();
  await Promise.all([
    writeFile(resolve(production, "deployment.json"), JSON.stringify({ ...full, branch: "main", builtAt }, null, 2)),
    writeFile(resolve(production, "qa", "deployment.json"), JSON.stringify({ ...restricted, branch: "qa", builtAt }, null, 2)),
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await assemblePages(process.argv[2] ?? "dist", process.argv[3] ?? ".qa-source/dist");
  console.log("Pages assembled: main at root, learning QA at /qa/");
}
