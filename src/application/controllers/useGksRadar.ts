import { useEffect, useState } from "react";

export type GksSourceCheck = {
  id: string;
  url: string;
  ok: boolean;
  changed: boolean;
  hash?: string;
  detectsCall?: boolean;
  lastModified?: string;
  error?: string;
};

export type GksRadarSnapshot = {
  schemaVersion: number;
  checkedAt: string;
  nextCheckAt: string;
  callDetected: boolean;
  sourceChecks: GksSourceCheck[];
};

const fallbackSnapshot: GksRadarSnapshot = {
  schemaVersion: 1,
  checkedAt: "2026-08-21T12:00:00.000Z",
  nextCheckAt: "2026-08-22T12:00:00.000Z",
  callDetected: false,
  sourceChecks: [
    { id: "study-in-korea-notices", url: "https://www.studyinkorea.go.kr/ko/notice/scholarshipsList.do?boardSort=3", ok: true, changed: false },
    { id: "niied-2027", url: "https://www.niied.go.kr/web/main/nid/niied_board/5745", ok: true, changed: false },
    { id: "spain-embassy-notices", url: "https://overseas.mofa.go.kr/es-es/brd/m_8065/list.do", ok: false, changed: false },
  ],
};

function isRadarSnapshot(value: unknown): value is GksRadarSnapshot {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GksRadarSnapshot>;
  return typeof candidate.checkedAt === "string"
    && typeof candidate.callDetected === "boolean"
    && Array.isArray(candidate.sourceChecks);
}

export function useGksRadar() {
  const [snapshot, setSnapshot] = useState<GksRadarSnapshot>(fallbackSnapshot);

  useEffect(() => {
    const controller = new AbortController();
    const radarUrl = new URL("data/gks-radar.json", document.baseURI);
    fetch(radarUrl, {
      cache: "no-cache",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((value: unknown) => {
        if (isRadarSnapshot(value)) setSnapshot(value);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      });

    return () => controller.abort();
  }, []);

  return snapshot;
}
