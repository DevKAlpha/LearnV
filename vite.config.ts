import { loadEnv } from "vite";
import { configDefaults, defineConfig } from "vitest/config";
import { execFileSync } from "node:child_process";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { pagesBase } from "./scripts/pages-paths.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  let branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
  if (!branch) {
    try { branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim(); }
    catch { /* An exported source archive defaults to the full app. */ }
  }
  const scope = process.env.VITE_APP_SCOPE || env.VITE_APP_SCOPE || (mode === "full" ? "full" : mode === "qa" || branch === "qa" ? "learning-qa" : "full");
  if (scope !== "full" && scope !== "learning-qa") throw new Error(`Invalid VITE_APP_SCOPE: ${scope}`);
  const base = pagesBase({ actions: process.env.GITHUB_ACTIONS, repository: process.env.GITHUB_REPOSITORY, owner: process.env.GITHUB_REPOSITORY_OWNER, scope, override: process.env.VITE_BASE_PATH || env.VITE_BASE_PATH });
  let revision = "local";
  try { revision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch { /* Source archive. */ }
  return {
    define: { "import.meta.env.VITE_APP_SCOPE": JSON.stringify(scope), "import.meta.env.VITE_BUILD_SHA": JSON.stringify(revision) },
    plugins: [react(), {
      name: "learnv-deployment-identity",
      transformIndexHtml(html) {
        return { html: scope === "learning-qa" ? html.replace("<title>LearnV", "<title>QA · LearnV") : html, tags: [
          { tag: "meta", attrs: { name: "learnv-scope", content: scope }, injectTo: "head" },
          { tag: "meta", attrs: { name: "learnv-base", content: base }, injectTo: "head" },
          { tag: "meta", attrs: { name: "learnv-revision", content: revision }, injectTo: "head" },
        ] };
      },
    }],
    base,
    test: { exclude: [...configDefaults.exclude, ".qa-source/**", "dist-qa-pages-validation/**"] },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      target: "es2022",
      cssCodeSplit: true,
      sourcemap: true,
    },
  };
});
