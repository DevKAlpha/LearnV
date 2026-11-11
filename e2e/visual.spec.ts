import { expect, test } from "@playwright/test";

/**
 * Local visual-regression net for CSS refactors (opt-in: VISUAL=1).
 * 1. Before the change:  VISUAL=1 pnpm e2e visual --update-snapshots
 * 2. After the change:   VISUAL=1 pnpm e2e visual
 * Baselines depend on the OS fonts, so they are not committed (see .gitignore).
 */
test.skip(process.env.VISUAL !== "1", "Visual comparison runs only with VISUAL=1.");

const TOURS = ["home", "scholarship", "study", "english-space", "korean-space", "interviews", "written", "test-path", "practice", "documents", "profile"];
const ROUTES = ["/", "/gks", "/study", "/study/korean", "/tests/en", "/tests/ko", "/checklist", "/profile"];

for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 1280]) {
    for (const route of ROUTES) {
      test(`${theme} ${width}px ${route}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript(([tours, chosenTheme]) => {
          localStorage.setItem("learnv-locale-v1", "es");
          localStorage.setItem("learnv-theme-v1", chosenTheme as string);
          localStorage.setItem("learnv-section-tours-v1", JSON.stringify(Object.fromEntries((tours as string[]).map((key) => [key, true]))));
        }, [TOURS, theme]);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(route === "/" ? "./" : `.${route}`);
        await expect(page.locator("#learnv-bootstrap-loader")).toHaveCount(0, { timeout: 15_000 });
        await page.waitForTimeout(600);
        await expect(page).toHaveScreenshot(`${theme}-${width}${route.replace(/\//g, "_") || "_home"}.png`, {
          fullPage: true,
          animations: "disabled",
          maxDiffPixelRatio: 0.001,
        });
      });
    }
  }
}
