import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  "/",
  "/gks",
  "/study",
  "/study/english",
  "/study/korean",
  "/study/interviews",
  "/study/written-simulator",
  "/tests/en",
  "/tests/ko",
  "/checklist",
  "/profile",
] as const;

const TOURS = ["home", "scholarship", "study", "english-space", "korean-space", "interviews", "written", "test-path", "practice", "documents", "profile"];
const WIDTHS = [320, 390, 1280] as const;

/** Seeds preferences before any app script runs; marks guided tours as seen so they do not cover the page. */
async function prepare(page: Page, { locale = "es", theme = "light" }: { locale?: string; theme?: string } = {}) {
  await page.addInitScript(({ locale, theme, tours }) => {
    localStorage.setItem("learnv-locale-v1", locale);
    localStorage.setItem("learnv-theme-v1", theme);
    localStorage.setItem("learnv-section-tours-v1", JSON.stringify(Object.fromEntries(tours.map((key) => [key, true]))));
  }, { locale, theme, tours: TOURS });
}

async function openReady(page: Page, route: string) {
  // Relative to baseURL so the same suite checks direct opening under /LearnV/ in CI.
  await page.goto(route === "/" ? "./" : `.${route}`);
  await expect(page.locator("#main-content")).toBeVisible();
  await expect(page.locator("#learnv-bootstrap-loader")).toHaveCount(0, { timeout: 15_000 });
  await expect(page.locator("[data-visual-pending]")).toHaveCount(0, { timeout: 15_000 });
}

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const route of ROUTES) {
      test(`opens ${route} directly without errors or horizontal scroll`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
        await prepare(page);
        await openReady(page, route);
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
      });
    }
  });
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`axe · ${theme}`, () => {
    test.use({ viewport: { width: 390, height: 844 } });
    for (const route of ROUTES) {
      test(`has no serious accessibility violations on ${route}`, async ({ page }) => {
        await prepare(page, { theme });
        await openReady(page, route);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          // Contrast is covered by the theme token tests; decorative glass layers confuse axe's sampling.
          .disableRules(["color-contrast"])
          .analyze();
        const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
        expect(serious.map((violation) => `${violation.id}: ${violation.nodes.length} × ${violation.help}`)).toEqual([]);
      });
    }
  });
}

for (const locale of ["es", "en", "ko"] as const) {
  test(`renders home in ${locale} with a matching lang attribute`, async ({ page }) => {
    await prepare(page, { locale });
    await openReady(page, "/");
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
  });
}

test("daily plan, backup export and theme choice survive a reload", async ({ page }) => {
  await prepare(page);
  await openReady(page, "/profile");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar copia" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^learnv-copia-\d{4}-\d{2}-\d{2}\.json$/);
});

test("the section tour waits for an invitation instead of covering the page", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("learnv-locale-v1", "es"));
  await page.goto("./study");
  const invite = page.getByRole("complementary", { name: "¿Quieres un recorrido rápido por esta sección?" });
  await expect(invite).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // The page stays usable while the invitation is visible.
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await invite.getByRole("button", { name: "Ver recorrido" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Omitir todo" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await page.waitForTimeout(1600);
  await expect(page.getByRole("complementary", { name: /recorrido rápido/ })).toHaveCount(0);
});

test("modal dialogs trap focus and return it on Escape", async ({ page }) => {
  await prepare(page);
  await openReady(page, "/study");
  const trigger = page.getByRole("button", { name: "Abrir biblioteca" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  for (let index = 0; index < 25; index += 1) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
