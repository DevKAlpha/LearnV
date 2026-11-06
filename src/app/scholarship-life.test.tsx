import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ScholarshipLifeEntry } from "@/features/scholarship/presentation/ScholarshipLifeEntry";
import { ScholarshipLifeGuide } from "@/features/scholarship/presentation/ScholarshipLifeGuide";
import { scholarshipLifeEntryCopy } from "@/infrastructure/i18n/scholarship-life-entry-copy";
import { scholarshipLifeCopy } from "@/infrastructure/i18n/scholarship-life-copy";
import { scholarshipLifeSources, scholarshipStages } from "@/infrastructure/data/scholarship-life";
import { getDefinition } from "./layout/section-help";

const scenario = vi.hoisted(() => ({ locale: "es" as "es" | "en" | "ko" }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale }) }));
afterEach(() => { vi.unstubAllGlobals(); scenario.locale = "es"; });
describe.each(["es", "en", "ko"] as const)("scholarship lifecycle in %s", (locale) => {
  it("keeps the unopened entry light and does not read personal preparation", () => {
    scenario.locale = locale;
    const getItem = vi.fn(); vi.stubGlobal("localStorage", { getItem });
    const html = renderToStaticMarkup(<ScholarshipLifeEntry />);
    expect(html).toContain(scholarshipLifeEntryCopy[locale].title);
    expect(html).toContain('id="gks-life"');
    expect(html).not.toMatch(/<textarea|<input|<iframe|https:|<details[^>]* open=/);
    expect(getItem).not.toHaveBeenCalled();
  });
  it("renders labelled stages, an actionable situation and optional enquiry without requesting personal data", () => {
    scenario.locale = locale;
    const html = renderToStaticMarkup(<ScholarshipLifeGuide />);
    expect((html.match(/aria-controls="scholarship-life-workspace"/g) ?? []).length).toBe(scholarshipStages.length);
    expect((html.match(/aria-controls="scholarship-life-case"/g) ?? []).length).toBe(2);
    expect(html).toContain('aria-labelledby="scholarship-life-case-title"');
    expect(html).toContain('for="scholarship-life-outline"');
    expect(html).toContain('readOnly=""');
    expect(html).toContain('type="checkbox"');
    expect(html).not.toMatch(/<iframe|<form|checked=""/);
    for (const source of Object.values(scholarshipLifeSources)) expect(html).toContain(`target="_blank" rel="noopener noreferrer" href="${source.url.replaceAll("&", "&amp;")}"`);
    expect(html).toContain(scholarshipLifeCopy[locale].local);
    expect(html).toContain(scholarshipLifeCopy[locale].scope);
  });
  it("maps the guide in contextual scholarship help", () => {
    const step = getDefinition("/gks").steps.find((entry) => entry.selector === ".scholarship-life-entry");
    expect(step?.text[locale].length).toBeGreaterThan(30);
  });
});
