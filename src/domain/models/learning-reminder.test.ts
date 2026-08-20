import { describe, expect, it } from "vitest";
import { getReminderStage } from "./learning-reminder";

describe("learning reminder", () => {
  it("starts with an orientation message", () => {
    expect(getReminderStage(0, 0, 3)).toBe("start");
  });

  it("recognises active learning momentum", () => {
    expect(getReminderStage(18, 1, 3)).toBe("momentum");
  });

  it("moves to evidence after the daily plan is complete", () => {
    expect(getReminderStage(55, 3, 3)).toBe("planComplete");
  });

  it("prioritises the advanced reminder for strong overall progress", () => {
    expect(getReminderStage(75, 3, 3)).toBe("strong");
  });
});
