import { defineConfig, devices } from "@playwright/test";

const PORT = 4180;
/** Deployment base ("/LearnV/" on GitHub Pages); tests navigate relative to it. */
const BASE = process.env.E2E_BASE ?? "/";

/** Smoke + accessibility checks against the production build (`pnpm build` first). */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `node node_modules/vite/bin/vite.js preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${BASE}`,
    // Never reuse: a leftover preview with another base path would serve the wrong build.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
