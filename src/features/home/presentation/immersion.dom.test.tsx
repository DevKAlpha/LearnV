// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/application/i18n/I18nContext";
import { languageTestProgressStore } from "@/application/controllers/useLanguageTestProgress";
import { stickerStore } from "@/infrastructure/data/sticker-store";
import { CulturalCalendarCard } from "./CulturalCalendarCard";
import { MilestoneVolumes } from "./MilestoneVolumes";
import { WordOfDayCard } from "./WordOfDayCard";

const wrap = (node: React.ReactNode) => render(<I18nProvider><MemoryRouter>{node}</MemoryRouter></I18nProvider>);

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("learnv-locale-v1", JSON.stringify("es"));
  stickerStore.refresh();
  languageTestProgressStore.refresh();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.getElementById("learnv-celebration-status")?.remove();
});

const at = (iso: string) => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(iso));
};

describe("cultural calendar card", () => {
  it("announces the next festival with its date and mini-lesson", () => {
    at("2026-11-16T10:00:00");
    wrap(<CulturalCalendarCard />);
    expect(screen.getByRole("heading", { name: /수능/ })).toBeTruthy();
    expect(screen.getByText(/Dentro de 3 días/)).toBeTruthy();
    expect(screen.getByText("수능 대박 나세요").getAttribute("lang")).toBe("ko");
  });

  it("earns the festival sticker only when the lesson is opened on the day", async () => {
    at("2026-11-19T10:00:00");
    const { container } = wrap(<CulturalCalendarCard />);
    expect(screen.getByText(/Hoy en Corea/)).toBeTruthy();
    const details = container.querySelector("details")!;
    details.open = true;
    fireEvent(details, new Event("toggle"));
    expect(stickerStore.get().earned.suneung).toBeTruthy();
    expect(await screen.findByText(/Pegatina conseguida/)).toBeTruthy();
    await waitFor(() => expect(document.getElementById("learnv-celebration-status")?.textContent).toContain("Pegatina nueva: 수능"));
  });

  it("shows nothing when no festival is near", () => {
    at("2026-07-01T10:00:00");
    const { container } = wrap(<CulturalCalendarCard />);
    expect(container.querySelector("[data-culture-calendar]")).toBeNull();
  });
});

describe("word of the day", () => {
  it("shows one Korean and one English word, stable for the day", () => {
    at("2026-11-16T10:00:00");
    const { container, unmount } = wrap(<WordOfDayCard />);
    const words = [...container.querySelectorAll("strong[lang]")].map((node) => `${node.getAttribute("lang")}:${node.textContent}`);
    expect(words.map((word) => word.split(":")[0])).toEqual(["ko", "en"]);
    unmount();
    const again = wrap(<WordOfDayCard />).container;
    expect([...again.querySelectorAll("strong[lang]")].map((node) => `${node.getAttribute("lang")}:${node.textContent}`)).toEqual(words);
  });
});

describe("milestone volumes", () => {
  it("keeps volumes locked with a hint until the milestone is in saved practice", () => {
    const { container, unmount } = wrap(<MilestoneVolumes longestStreak={0} />);
    expect(container.querySelectorAll('[data-locked="true"]')).toHaveLength(3);
    expect(container.querySelector('[data-volume="hangul-first"] p')?.textContent).toMatch(/(coreano|Korean)/);
    unmount();

    languageTestProgressStore.set({ en: {}, ko: { "ko-writing-01": { attempts: 1, bestScore: 90, lastScore: 90, passed: true, lastCompletedAt: "2026-11-16T10:00:00.000Z" } } });
    const opened = wrap(<MilestoneVolumes longestStreak={0} />).container;
    const volume = opened.querySelector('[data-volume="hangul-first"]')!;
    expect(volume.getAttribute("data-locked")).toBe("false");
    expect(volume.querySelector("a")?.getAttribute("href")).toBe("/study/korean");
    expect(volume.querySelector("img")?.getAttribute("src")).toContain("illustrations/storybook/hangul-first.svg");
  });
});
