import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function githubPagesBase() {
  if (!process.env.GITHUB_ACTIONS) return "/";

  const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const account = process.env.GITHUB_REPOSITORY_OWNER;

  return repository === `${account}.github.io` ? "/" : `/${repository ?? "LearnV"}/`;
}

export default defineConfig({
  plugins: [react()],
  base: githubPagesBase(),
  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: true,
  },
});
