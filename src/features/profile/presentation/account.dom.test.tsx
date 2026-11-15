// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PRIVACY_VERSION } from "@learnv/schemas/sync-api";
import { I18nProvider } from "@/application/i18n/I18nContext";
import { useLearningJourney } from "@/application/controllers/useLearningJourney";
import { announceStorageChange } from "@/infrastructure/storage/storage-events";
import { emptySyncMeta, syncMetaStore } from "@/infrastructure/sync/sync-meta-store";
import { AccountSyncPanel } from "./AccountSyncPanel";
import { AccountVerifyPage } from "./AccountVerifyPage";

vi.mock("@/infrastructure/sync/sync-config", () => ({ syncApiBase: "/api/v1/" }));

const account = { id: "0b8c7a52-9a52-4b0e-8a8f-0d9f1f2b6c11", email: "ana@example.com", createdAt: "2026-11-15T10:00:00.000Z", consent: { age: "14-plus", privacy: PRIVACY_VERSION, at: "2026-11-15T10:00:00.000Z" } };
type Call = { url: string; method: string; headers: Record<string, string>; body: unknown };
let calls: Call[];
let responses: Record<string, () => Response>;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  localStorage.clear();
  syncMetaStore.refresh();
  calls = [];
  responses = {
    "POST auth/magic-link": () => json({ status: "sent" }, 202),
    "GET me": () => json({ account }),
    "POST auth/verify": () => json({ account }),
    "POST auth/logout": () => new Response(null, { status: 204 }),
    "GET sync/manifest": () => json({ documents: [], usage: { chars: 0, limit: 5_000_000 } }),
    "POST sync/push": () => json({ results: [] }),
  };
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    const method = init.method ?? "GET";
    const path = url.replace("/api/v1/", "");
    calls.push({ url, method, headers: init.headers as Record<string, string>, body: init.body ? JSON.parse(init.body as string) : undefined });
    const respond = responses[`${method} ${path}`];
    return respond ? respond() : json({ error: "not-found" }, 404);
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AccountSyncPanel", () => {
  it("asks for the age declaration and consent before sending a sign-in link", async () => {
    render(<AccountSyncPanel locale="es" />);
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: " ana@example.com " } });
    fireEvent.click(screen.getByLabelText("Tengo 14 años o más."));
    fireEvent.click(screen.getByLabelText(/He leído qué se guarda/));
    fireEvent.click(screen.getByRole("button", { name: "Enviar enlace de acceso" }));
    await screen.findByText(/te llegará un enlace/);
    expect(calls[0]).toMatchObject({
      url: "/api/v1/auth/magic-link",
      method: "POST",
      headers: { "X-LearnV-Client": "web", "Content-Type": "application/json" },
      body: { email: "ana@example.com", locale: "es", consent: { age: "14-plus", privacy: PRIVACY_VERSION } },
    });
  });

  it("shows the account, syncs on demand and signs out keeping local data", async () => {
    localStorage.setItem("learnv-review-v1", "{}");
    syncMetaStore.set({ ...emptySyncMeta, account: { id: account.id, email: account.email } });
    render(<AccountSyncPanel locale="en" />);
    expect(screen.getByText("Signed in as ana@example.com")).toBeTruthy();
    responses["POST sync/push"] = () => json({ results: [{ key: "learnv-review-v1", status: "ok", revision: 1, updatedAt: "2026-11-15T10:00:00.000Z" }] });
    fireEvent.click(screen.getByRole("button", { name: "Sync now" }));
    await screen.findByText("Synced. Received: 0. Sent: 1. Merged: 0.");

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await screen.findByText("Signed out. Your data is still on this device.");
    expect(syncMetaStore.get().account).toBeNull();
    expect(localStorage.getItem("learnv-review-v1")).toBe("{}");
    expect(screen.getByLabelText("Email address")).toBeTruthy();
  });

  it("forgets an account whose session ended on the server", async () => {
    syncMetaStore.set({ ...emptySyncMeta, account: { id: account.id, email: account.email } });
    responses["GET me"] = () => json({ error: "signed-out" }, 401);
    render(<AccountSyncPanel locale="es" />);
    await screen.findByText(/La sesión ha caducado/);
    expect(syncMetaStore.get().account).toBeNull();
  });

  it("only enables deletion after typing the account address", async () => {
    syncMetaStore.set({ ...emptySyncMeta, account: { id: account.id, email: account.email } });
    responses["DELETE me"] = () => new Response(null, { status: 204 });
    render(<AccountSyncPanel locale="es" />);
    const remove = screen.getByRole("button", { name: "Borrar cuenta para siempre" }) as HTMLButtonElement;
    expect(remove.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Escribe tu correo para confirmar"), { target: { value: "ANA@example.com" } });
    expect(remove.disabled).toBe(false);
    fireEvent.click(remove);
    await screen.findByText("Cuenta borrada. Tus datos siguen en este dispositivo.");
    expect(calls.find((call) => call.method === "DELETE")?.body).toEqual({ confirm: "ANA@example.com" });
  });
});

describe("AccountVerifyPage", () => {
  const renderPage = () => render(<I18nProvider><MemoryRouter><AccountVerifyPage /></MemoryRouter></I18nProvider>);

  it("removes the token from the address and signs in only after a tap", async () => {
    localStorage.setItem("learnv-locale-v1", "es");
    window.history.replaceState(null, "", `/account/verify#token=${"a".repeat(43)}`);
    renderPage();
    expect(window.location.hash).toBe("");
    expect(calls).toEqual([]);
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar y entrar" }));
    await screen.findByText("Sesión iniciada. Sincronizando tu progreso…");
    expect(calls[0]).toMatchObject({ url: "/api/v1/auth/verify", body: { token: "a".repeat(43) } });
    expect(syncMetaStore.get().account).toEqual({ id: account.id, email: account.email });
  });

  it("explains an expired link", async () => {
    localStorage.setItem("learnv-locale-v1", "es");
    responses["POST auth/verify"] = () => json({ error: "invalid-token" }, 400);
    window.history.replaceState(null, "", `/account/verify#token=${"b".repeat(43)}`);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar y entrar" }));
    await screen.findByText(/El enlace ha caducado o ya se usó/);
  });
});

describe("stores follow account sync", () => {
  it("the learning journey adopts a copy written by the sync", async () => {
    const { result } = renderHook(() => useLearningJourney("/"));
    const synced = { ...result.current.journey, sessionCount: 42 };
    act(() => {
      const previous = localStorage.getItem("learnv-learning-journey-v1");
      localStorage.setItem("learnv-learning-journey-v1", JSON.stringify(synced));
      announceStorageChange("learnv-learning-journey-v1", previous, JSON.stringify(synced));
    });
    await waitFor(() => expect(result.current.journey.sessionCount).toBe(42));
  });
});
