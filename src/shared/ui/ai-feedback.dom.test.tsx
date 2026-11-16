// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AI_CONSENT_VERSION, type FeedbackResult } from "@learnv/schemas/feedback-api";
import { PRIVACY_VERSION } from "@learnv/schemas/sync-api";
import { I18nProvider } from "@/application/i18n/I18nContext";
import { emptySyncMeta, syncMetaStore } from "@/infrastructure/sync/sync-meta-store";
import { AiFeedbackPanel } from "./AiFeedbackPanel";

vi.mock("@/infrastructure/sync/sync-config", () => ({ syncApiBase: "/api/v1/" }));

const account = { id: "0b8c7a52-9a52-4b0e-8a8f-0d9f1f2b6c11", email: "ana@example.com", createdAt: "2026-11-15T10:00:00.000Z", consent: { age: "14-plus" as const, privacy: PRIVACY_VERSION, at: "2026-11-15T10:00:00.000Z" } };
const feedback: FeedbackResult = {
  summary: "El texto responde a la tarea.",
  criteria: [{ id: "content", score: 9, max: 12, comment: "Cubre los dos puntos." }, { id: "organisation", score: 8, max: 12, comment: "Falta conclusión." }, { id: "language", score: 18, max: 26, comment: "Mezcla -요 y -다." }],
  total: { score: 35, max: 50, kind: "points" },
  strengths: ["Ejemplo concreto."],
  corrections: [{ original: "중요해요", suggestion: "중요하다", explanation: "Estilo escrito." }],
  nextStep: "Añade una conclusión.",
};
type Call = { method: string; path: string; body: unknown };
let calls: Call[];
let status: { enabled: boolean; consent: null | { version: string; at: string }; consentOutdated: boolean; quota: { used: number; limit: number } };
let writing: () => Response;
const json = (body: unknown, code = 200) => new Response(JSON.stringify(body), { status: code, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("learnv-locale-v1", "es");
  syncMetaStore.refresh();
  syncMetaStore.set({ ...emptySyncMeta, account });
  calls = [];
  status = { enabled: true, consent: null, consentOutdated: false, quota: { used: 0, limit: 10 } };
  writing = () => json({ feedback, quota: { used: 1, limit: 10 } });
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    const method = init.method ?? "GET";
    const path = url.replace("/api/v1/", "");
    calls.push({ method, path, body: init.body ? JSON.parse(init.body as string) : undefined });
    if (method === "GET" && path === "feedback") return json(status);
    if (method === "PUT" && path === "feedback/consent") { status = { ...status, consent: { version: AI_CONSENT_VERSION, at: "2026-11-16T10:00:00.000Z" } }; return json(status); }
    if (method === "DELETE" && path === "feedback/consent") return new Response(null, { status: 204 });
    if (method === "POST" && path === "feedback/writing") return writing();
    return json({ error: "not-found" }, 404);
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const request = () => ({ kind: "writing" as const, body: { format: "topik-54" as const, task: "주제", text: "유학은 중요해요.", locale: "es" as const } });
const wrap = (text = "유학은 중요해요.") => render(<I18nProvider><MemoryRouter><AiFeedbackPanel text={text} textLanguage="ko" request={request} /></MemoryRouter></I18nProvider>);

describe("AI feedback panel", () => {
  it("asks for explicit consent before sending anything", async () => {
    wrap();
    const accept = await screen.findByRole("button", { name: "Activar" });
    expect(screen.getByText(/se envían a Anthropic/)).toBeTruthy();
    expect((accept as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(accept);
    await screen.findByRole("button", { name: "Pedir comentario" });
    expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual(["GET feedback", "PUT feedback/consent"]);
    expect(calls[1]!.body).toEqual({ version: AI_CONSENT_VERSION });
  });

  it("shows the rubric result, the quota and when the text changed since", async () => {
    status.consent = { version: AI_CONSENT_VERSION, at: "2026-11-16T10:00:00.000Z" };
    const { rerender } = wrap();
    fireEvent.click(await screen.findByRole("button", { name: "Pedir comentario" }));
    expect(await screen.findByText("Puntuación orientativa: 35 / 50")).toBeTruthy();
    expect(screen.getByText("Contenido y tarea")).toBeTruthy();
    expect(screen.getByText("중요하다").getAttribute("lang")).toBe("ko");
    expect(screen.getByText("1 de 10 peticiones hoy")).toBeTruthy();
    expect(calls.at(-1)).toEqual({ method: "POST", path: "feedback/writing", body: request().body });
    rerender(<I18nProvider><MemoryRouter><AiFeedbackPanel text="유학은 중요하다." textLanguage="ko" request={request} /></MemoryRouter></I18nProvider>);
    expect(screen.getByText("Has cambiado el texto desde este comentario.")).toBeTruthy();
  });

  it("explains a spent quota and disables the button", async () => {
    status.consent = { version: AI_CONSENT_VERSION, at: "2026-11-16T10:00:00.000Z" };
    writing = () => json({ error: "ai-quota", quota: { used: 10, limit: 10 } }, 429);
    wrap();
    fireEvent.click(await screen.findByRole("button", { name: "Pedir comentario" }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Has usado todas las peticiones de hoy. Mañana tendrás más.");
    await waitFor(() => expect((screen.getByRole("button", { name: "Pedir comentario" }) as HTMLButtonElement).disabled).toBe(true));
  });

  it("withdraws consent in one step and asks again for an outdated notice", async () => {
    status.consent = { version: AI_CONSENT_VERSION, at: "2026-11-16T10:00:00.000Z" };
    wrap();
    fireEvent.click(await screen.findByRole("button", { name: "Retirar permiso" }));
    expect(await screen.findByText("Permiso retirado. Ya no se enviará ningún texto.")).toBeTruthy();
    expect(calls.at(-1)).toMatchObject({ method: "DELETE", path: "feedback/consent" });
    cleanup();
    status.consent = { version: "2025-01", at: "2025-01-01T10:00:00.000Z" };
    status.consentOutdated = true;
    wrap();
    expect(await screen.findByText(/El aviso ha cambiado/)).toBeTruthy();
  });

  it("points to Profile when signed out and stays hidden when the server has no AI", async () => {
    syncMetaStore.set({ ...emptySyncMeta });
    wrap();
    expect(screen.getByRole("link", { name: /Ir a Perfil/ }).getAttribute("href")).toBe("/profile");
    expect(calls).toEqual([]);
    cleanup();
    syncMetaStore.set({ ...emptySyncMeta, account });
    status.enabled = false;
    const { container } = wrap();
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(container.querySelector("[data-ai-feedback]")).toBeNull();
  });
});
