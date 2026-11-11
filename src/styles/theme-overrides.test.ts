import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/*
 * Ratchet: per-component theme overrides (`[data-theme="dark"] .x { ... }`) are how the
 * theme system drifted. New styles must use the semantic tokens in tokens.css (which follow
 * the active theme) instead. These ceilings may only go down; lower them when you remove some.
 */
const MAX_DARK_OVERRIDES = 308;
const MAX_LIGHT_OVERRIDES = 51;

const dir = new URL("./", import.meta.url);
const css = readdirSync(dir).filter((file) => file.endsWith(".css")).map((file) => readFileSync(new URL(file, dir), "utf8")).join("\n");

describe("theme override ratchet", () => {
  it("does not add new dark-theme overrides", () => {
    expect(css.match(/data-theme="dark"/g)?.length ?? 0).toBeLessThanOrEqual(MAX_DARK_OVERRIDES);
  });
  it("does not add new light-theme overrides", () => {
    expect(css.match(/data-theme="light"/g)?.length ?? 0).toBeLessThanOrEqual(MAX_LIGHT_OVERRIDES);
  });
});
