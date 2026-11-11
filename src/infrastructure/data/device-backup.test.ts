import { describe, expect, it } from "vitest";
import { createDeviceBackup, parseDeviceBackup, restoreDeviceBackup, summarizeDeviceBackup } from "./device-backup";

function memoryStorage(initial: Record<string, string> = {}, failOnWrite = false) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    get length() { return map.size; },
    key: (index: number) => [...map.keys()][index] ?? null,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { if (failOnWrite) throw new Error("QuotaExceededError"); map.set(key, value); },
    removeItem: (key: string) => { map.delete(key); },
  };
}

const now = new Date("2026-11-10T09:00:00.000Z");

describe("device backup", () => {
  it("exports learner data but not diagnostics, caches or other scopes", () => {
    const storage = memoryStorage({
      "learnv-language-tests-v1": "{\"en\":{},\"ko\":{}}",
      "learnv-task-board-v1": "{}",
      "learnv-theme-v1": "dark",
      "learnv-learning-error-log-v1:study-overview": "[]",
      "learnv-gks-certification-backup-v1": "{}",
      "qa:learnv-progress-v1": "{}",
      "other-app": "x",
    });
    const backup = createDeviceBackup(storage, now, false);
    expect(Object.keys(backup.data).sort()).toEqual(["learnv-language-tests-v1", "learnv-task-board-v1", "learnv-theme-v1"]);
    expect(summarizeDeviceBackup(backup)).toMatchObject({ entries: 3, languageTests: true, taskBoard: true, drafts: false });
  });

  it("round-trips through JSON and replaces existing data", () => {
    const source = memoryStorage({ "learnv-progress-v1": "{\"completedDocuments\":[\"essay\"]}" });
    const file = JSON.stringify(createDeviceBackup(source, now, false));
    const parsed = parseDeviceBackup(file);
    if (!("backup" in parsed)) throw new Error("expected a backup");
    const target = memoryStorage({ "learnv-task-board-v1": "{}", "unrelated": "keep" });
    expect(restoreDeviceBackup(target, parsed.backup, false)).toBe(true);
    expect(target.getItem("learnv-progress-v1")).toContain("essay");
    expect(target.getItem("learnv-task-board-v1")).toBeNull();
    expect(target.getItem("unrelated")).toBe("keep");
  });

  it("keeps QA data inside the QA scope", () => {
    const target = memoryStorage({ "learnv-progress-v1": "production" });
    restoreDeviceBackup(target, { app: "learnv", format: 1, exportedAt: now.toISOString(), data: { "learnv-progress-v1": "qa" } }, true);
    expect(target.getItem("qa:learnv-progress-v1")).toBe("qa");
    expect(target.getItem("learnv-progress-v1")).toBe("production");
  });

  it("rejects files that are not LearnV backups and drops unknown keys", () => {
    expect(parseDeviceBackup("nope")).toEqual({ issue: "not-json" });
    expect(parseDeviceBackup("[]")).toEqual({ issue: "not-learnv" });
    expect(parseDeviceBackup(JSON.stringify({ app: "learnv", format: 9, data: {} }))).toEqual({ issue: "unsupported-format" });
    expect(parseDeviceBackup(JSON.stringify({ app: "learnv", format: 1, data: { "__proto__": "x", "evil": "y", "learnv-x-v1": 3 } }))).toEqual({ issue: "empty" });
    expect(parseDeviceBackup("x".repeat(5_000_001))).toEqual({ issue: "too-large" });
  });

  it("restores the original data when storage refuses the write", () => {
    const storage = memoryStorage({ "learnv-progress-v1": "original" }, true);
    expect(restoreDeviceBackup(storage, { app: "learnv", format: 1, exportedAt: now.toISOString(), data: { "learnv-progress-v1": "new" } }, false)).toBe(false);
    expect(storage.getItem("learnv-progress-v1")).toBe("original");
  });
});
