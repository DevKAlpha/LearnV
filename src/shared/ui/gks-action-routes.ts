import type { NextActionId } from "@/domain/models/gks-cycle";
import { sources } from "@/infrastructure/data/gks-2026";

const OFFICIAL_NOTICES = sources.find((source) => source.id === "study-in-korea-notices")?.url ?? "https://www.studyinkorea.go.kr/";

/** Where each cycle action is done: an app route, or the official notices page. */
export const ACTION_ROUTES: Record<NextActionId, string> = {
  "language-exam": "/study",
  documents: "/checklist",
  drafts: "/study/written-simulator",
  "read-guide": OFFICIAL_NOTICES,
  submit: "/checklist",
  interview: "/study/interviews",
  "keep-practising": "/study/review",
  "check-results": OFFICIAL_NOTICES,
  "pre-departure": "/gks",
};
