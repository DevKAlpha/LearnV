// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/application/i18n/I18nContext";
import { effectsStore } from "@/infrastructure/data/effects-store";
import { stickerStore } from "@/infrastructure/data/sticker-store";
import { celebrate, earnStoredSticker } from "@/shared/effects/celebrate";
import { EffectsPanel } from "./EffectsPanel";
import { StickerCollection } from "./StickerCollection";

const wrap = (node: React.ReactNode) => render(<I18nProvider><MemoryRouter>{node}</MemoryRouter></I18nProvider>);
const status = () => document.getElementById("learnv-celebration-status");

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("learnv-locale-v1", JSON.stringify("es"));
  stickerStore.refresh();
  effectsStore.refresh();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  status()?.remove();
  document.querySelectorAll(".celebration-confetti").forEach((node) => node.remove());
});

const matchMedia = (reduced: boolean) => vi.stubGlobal("matchMedia", (query: string) => ({ matches: reduced && query.includes("reduce"), media: query, addEventListener() {}, removeEventListener() {} }));

describe("celebrations", () => {
  it("announces the moment and drops confetti, but no confetti with reduced motion", async () => {
    matchMedia(false);
    await celebrate("pass", "es");
    await waitFor(() => expect(status()?.textContent).toContain("¡Etapa superada!"));
    expect(status()?.getAttribute("role")).toBe("status");
    expect(document.querySelector(".celebration-confetti")?.getAttribute("aria-hidden")).toBe("true");

    document.querySelectorAll(".celebration-confetti").forEach((node) => node.remove());
    matchMedia(true);
    await celebrate("review", "es");
    await waitFor(() => expect(status()?.textContent).toContain("Repaso terminado"));
    expect(document.querySelector(".celebration-confetti")).toBeNull();
  });

  it("follows the learner's settings for vibration and confetti", async () => {
    matchMedia(false);
    const vibrate = vi.fn();
    vi.stubGlobal("navigator", { ...navigator, vibrate });
    effectsStore.set({ celebrations: false, sound: false, vibration: true, seasonal: true });
    await celebrate("cheer", "es");
    expect(document.querySelector(".celebration-confetti")).toBeNull();
    expect(vibrate).toHaveBeenCalledWith([40, 60, 40]);
  });

  it("earns a stored sticker once", async () => {
    matchMedia(false);
    expect(earnStoredSticker("hwaiting", "es", "cheer")).toBe(true);
    const first = stickerStore.get().earned.hwaiting;
    expect(earnStoredSticker("hwaiting", "es", "cheer")).toBe(false);
    expect(stickerStore.get().earned.hwaiting).toBe(first);
    await waitFor(() => expect(status()?.textContent).toContain("화이팅"));
  });
});

describe("profile panels", () => {
  it("saves effects preferences on this device", () => {
    matchMedia(false);
    wrap(<EffectsPanel />);
    const sound = screen.getByRole("checkbox", { name: "Sonido" }) as HTMLInputElement;
    expect(sound.checked).toBe(false);
    fireEvent.click(sound);
    expect(JSON.parse(localStorage.getItem("learnv-effects-v1")!)).toMatchObject({ sound: true, celebrations: true });
  });

  it("shows held stickers and hints for the hidden ones", () => {
    stickerStore.set({ version: 1, earned: { tulip: "2026-11-16T10:00:00.000Z" } });
    const { container } = wrap(<StickerCollection longestStreak={7} />);
    expect(container.querySelector('[data-sticker="tulip"]')?.getAttribute("data-held")).toBe("true");
    expect(container.querySelector('[data-sticker="streak-7"]')?.getAttribute("data-held")).toBe("true");
    expect(container.querySelector('[data-sticker="credit"]')?.textContent).toContain("Mira bien quién hizo LearnV.");
    expect(screen.getByText("2 de 16")).toBeTruthy();
  });
});
