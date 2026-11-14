import fs from "node:fs";
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
  "/study/review",
  "/study/hangul",
  "/study/writing-lab",
  "/study/level-test",
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

test("Korean practice keeps instructions in the learner's language until full immersion is chosen", async ({ page }) => {
  await prepare(page);
  await openReady(page, "/tests/ko");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  const toggle = page.getByRole("button", { name: "Toda la interfaz en coreano" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
});

test("a practice session exposes progress and a safe exit dialog", async ({ page }) => {
  await prepare(page);
  await openReady(page, "/tests/en/en-reading-01");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  const exit = page.locator(".session-exit-button");
  await exit.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(exit).toBeFocused();
});

test("a review session schedules a card and updates today's count", async ({ page }) => {
  await prepare(page);
  await openReady(page, "/study/review");
  await page.getByRole("radio", { name: "Coreano" }).check({ force: true });
  await page.getByRole("button", { name: /^Empezar repaso/ }).click();
  // Recall cards show the answer on request; typed cards are checked against the answer.
  const show = page.getByRole("button", { name: "Mostrar respuesta" });
  if (await show.isVisible()) await show.click();
  else {
    await page.getByLabel("Tu respuesta").fill("x");
    await page.getByRole("button", { name: "Comprobar" }).click();
  }
  const good = page.getByRole("button", { name: /^Bien/ });
  if (await good.isVisible()) await good.click();
  else await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("learnv-review-v1") ?? "{}"));
  expect(Object.keys(stored.cards ?? {})).toHaveLength(1);
});

test("the Hangul builder composes syllables from letters", async ({ page }) => {
  await prepare(page);
  await openReady(page, "/study/hangul");
  await page.getByRole("combobox", { name: /^Inicial/ }).selectOption("ㄱ");
  await page.getByRole("combobox", { name: /^Vocal/ }).selectOption("ㅡ");
  await page.getByRole("combobox", { name: /^Final/ }).selectOption("ㄹ");
  await expect(page.getByRole("button", { name: /^글\s*geul/ })).toBeVisible();
});

test("the writing lab reviews a draft and keeps saved versions", async ({ page }) => {
  await prepare(page);
  await openReady(page, "/study/writing-lab?task=ielts-task2-abroad");
  const draft = "Some people think studying abroad is essential. However, online courses are cheaper. For example, my cousin learned English at home. Therefore, both views have merit.";
  await page.getByLabel("Tu respuesta").fill(draft);
  const review = page.getByRole("region", { name: "Revisión de tu borrador" });
  await expect(review).toBeVisible();
  await expect(review).toContainText("however");
  await page.getByRole("button", { name: "Guardar versión" }).click();
  await expect(page.getByText("1 versión guardada")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Tu respuesta")).toHaveValue(draft);
});

test("the level test unlocks stages without marking them as passed", async ({ page }) => {
  await prepare(page);
  await openReady(page, "/study/level-test?lang=en");
  await page.getByRole("button", { name: "Empezar test" }).click();
  // Answer every question with the first option until the result appears.
  for (let index = 0; index < 40; index += 1) {
    if (await page.getByRole("heading", { name: "Resultado" }).isVisible()) break;
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: /^Siguiente/ }).click();
  }
  await expect(page.getByRole("heading", { name: "Resultado" })).toBeVisible();
  const progress = await page.evaluate(() => localStorage.getItem("learnv-language-tests-v1"));
  expect(progress).toBeNull();
});

test.describe("GKS cycle and applicant profile", () => {
  test.beforeEach(async ({ page }) => {
    // A fixed day keeps the cycle phase stable: 13 Nov 2026 is after the 2027 applications closed.
    await page.clock.setFixedTime(new Date("2026-11-13T10:00:00"));
    await prepare(page);
  });

  test("the scholarship page places the applicant in the right cycle and phase", async ({ page }) => {
    await openReady(page, "/gks");
    const timeline = page.getByRole("heading", { name: /Línea temporal del ciclo · GKS-U 2028/ });
    await expect(timeline).toBeVisible();
    await expect(page.locator('[aria-current="step"]')).toContainText("Preparación");
    await page.getByText("Ya presenté la solicitud").click();
    await expect(page.getByRole("heading", { name: /GKS-U 2027/ }).first()).toBeVisible();
    await expect(page.locator('[aria-current="step"]')).toContainText("Primera ronda");
    await expect(page.getByRole("heading", { name: "Prepara la entrevista" })).toBeVisible();
  });

  test("the profile keeps the major and checks the age limit", async ({ page }) => {
    await openReady(page, "/profile");
    const major = page.getByLabel("Carrera que quieres estudiar");
    await major.fill("Ingeniería de materiales");
    await major.blur();
    await page.getByLabel("Fecha de nacimiento").fill("2003-02-10");
    await expect(page.getByRole("status").filter({ hasText: "Superas el límite de edad para GKS-U 2028" })).toBeVisible();
    await expect(page.getByText("Último ciclo dentro del límite: GKS-U 2027.")).toBeVisible();
    await page.reload();
    await expect(page.locator(".profile-fields")).toContainText("Ingeniería de materiales");
  });

  test("a pending document becomes a dated task on the board", async ({ page }) => {
    await openReady(page, "/checklist");
    await expect(page.getByRole("heading", { name: "Calendario para GKS-U 2028" })).toBeVisible();
    const row = page.getByRole("listitem").filter({ hasText: "Pasaporte vigente" });
    await row.getByRole("button", { name: "Añadir al tablero" }).click();
    await expect(row.getByRole("button", { name: /En el tablero/ })).toBeDisabled();
    const board = await page.evaluate(() => JSON.parse(localStorage.getItem("learnv-task-board-v1") ?? "{}"));
    expect(board.tasks[0]).toMatchObject({ id: "gks-doc-passport-2028", area: "gks", status: "todo" });
    expect(board.tasks[0].dueDate).toMatch(/^2027-0[67]-\d{2}$/);
  });
});

test.describe("Daily plan, board Today view and weekly summary", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-14T10:00:00"));
    await prepare(page);
  });

  test("home builds today's plan and only the GKS step is ticked by hand", async ({ page }) => {
    await openReady(page, "/");
    const section = page.locator(".home-today");
    await expect(section.locator("[data-plan-item]")).toHaveCount(3);
    await expect(section.locator(".count-pill")).toHaveText("0/3");
    await expect(section.locator('[data-plan-item="review"] .task-card__body')).toHaveAttribute("href", /\/study\/review$/);
    await expect(section.locator('[data-plan-item="review"] button')).toHaveCount(0);
    const tick = section.getByRole("button", { name: /Marcar como hecho: Prioridad: tu certificado de idioma/ });
    await tick.click();
    await expect(section.getByRole("button", { name: /Desmarcar: / })).toHaveAttribute("aria-pressed", "true");
    await expect(section.locator(".count-pill")).toHaveText("1/3");
    await page.reload();
    await expect(page.locator(".home-today .count-pill")).toHaveText("1/3");
    const journey = await page.evaluate(() => JSON.parse(localStorage.getItem("learnv-learning-journey-v1") ?? "{}"));
    expect(journey.activeDates ?? []).toEqual([]);
  });

  test("the board's Today view accepts and sets aside suggestions", async ({ page }) => {
    await openReady(page, "/");
    await page.getByRole("button", { name: "Abrir mi tablero" }).click();
    const dialog = page.getByRole("dialog", { name: "Mi tablero" });
    await dialog.getByRole("button", { name: /^Hoy/ }).click();
    await expect(dialog.getByText("Nada vence hoy.", { exact: false })).toBeVisible();
    const suggestions = dialog.getByRole("region", { name: "Sugerencias para tu tablero" });
    await suggestions.getByRole("button", { name: /^Añadir: Repasar \d+ tarjetas de hoy/ }).click();
    await expect(dialog.getByRole("heading", { level: 3, name: /^Repasar \d+ tarjetas de hoy/ })).toBeVisible();
    await suggestions.getByRole("button", { name: /^Ahora no: GKS · / }).click();
    await expect(suggestions.getByRole("button", { name: /^Ahora no: GKS · / })).toHaveCount(0);
    const stored = await page.evaluate(() => ({
      board: JSON.parse(localStorage.getItem("learnv-task-board-v1") ?? "{}"),
      dismissed: JSON.parse(localStorage.getItem("learnv-board-suggestions-v1") ?? "[]"),
    }));
    expect(stored.board.tasks[0]).toMatchObject({ id: "srs-review-2026-11-14", dueDate: "2026-11-14", status: "todo" });
    expect(stored.dismissed).toEqual(["gks-step-language-exam-2028"]);
  });

  test("profile shows the weekly summary built from evidence", async ({ page }) => {
    await openReady(page, "/profile");
    const week = page.getByRole("region", { name: "Tu semana" });
    await expect(week).toBeVisible();
    await expect(week).toContainText("Del 8 de noviembre al 14 de noviembre");
    await expect(week).toContainText("Aún no hay prácticas puntuadas esta semana.");
  });
});

test.describe("Reminders and calendar export", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-14T10:00:00"));
    await prepare(page);
  });

  test("reminders need explicit permission and the calendar file carries GKS dates and the study session", async ({ page, context }) => {
    await context.grantPermissions(["notifications"]);
    await openReady(page, "/profile");
    const panel = page.getByRole("region", { name: "Recordatorios y calendario" });
    await panel.getByLabel("Hora de estudio").fill("07:30");
    await panel.getByRole("button", { name: "Activar avisos" }).click();
    await expect(panel.getByRole("status")).toHaveText("Avisos activados a las 07:30.");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("learnv-reminders-v1") ?? "{}"))).toMatchObject({ enabled: true, time: "07:30" });
    const [download] = await Promise.all([page.waitForEvent("download"), panel.getByRole("button", { name: "Descargar calendario" }).click()]);
    expect(download.suggestedFilename()).toBe("learnv-calendario-2026-11-14.ics");
    const ics = fs.readFileSync(await download.path(), "utf8");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:GKS-U 2028 · Convocatoria");
    expect(ics).toContain("DTSTART:20261114T073000");
    expect(ics).toContain("RRULE:FREQ=DAILY");
  });
});

test.describe("Installable app", () => {
  test.use({ serviceWorkers: "allow" });

  test("ships a manifest and opens offline once the worker is installed", async ({ page, context }) => {
    await prepare(page);
    await openReady(page, "/");
    const href = await page.locator('link[rel="manifest"]').getAttribute("href");
    const manifest = await (await page.request.get(new URL(href!, page.url()).href)).json();
    expect(manifest).toMatchObject({ short_name: "LearnV", display: "standalone", start_url: "./" });
    expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await openReady(page, "/study/review");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await context.setOffline(false);
  });
});
