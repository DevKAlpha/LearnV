import { defineConfig, loadEnv } from "vite";
import { execFileSync } from "node:child_process";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

function githubPagesBase() {
  if (!process.env.GITHUB_ACTIONS) return "/";

  const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const account = process.env.GITHUB_REPOSITORY_OWNER;

  return repository === `${account}.github.io` ? "/" : `/${repository ?? "LearnV"}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  let branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
  if (!branch) {
    try { branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim(); }
    catch { /* An exported source archive defaults to the full app. */ }
  }
  const scope = process.env.VITE_APP_SCOPE || env.VITE_APP_SCOPE || (mode === "full" ? "full" : mode === "qa" || branch === "qa" ? "learning-qa" : "full");
  if (scope !== "full" && scope !== "learning-qa") throw new Error(`Invalid VITE_APP_SCOPE: ${scope}`);
  return {
    define: { "import.meta.env.VITE_APP_SCOPE": JSON.stringify(scope) },
    plugins: [react()],
    base: githubPagesBase(),
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
