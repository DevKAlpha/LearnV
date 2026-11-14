import { useCallback, useMemo } from "react";
import { normalizeApplicantProfile, type ApplicantProfile } from "@/domain/models/applicant-profile";
import { buildCycleTimeline, currentPhase, daysBetween, nextAction, targetEntryYear } from "@/domain/models/gks-cycle";
import { applicantProfileStore } from "@/infrastructure/data/applicant-profile-store";
import { confirmedCycleWindows } from "@/infrastructure/data/gks-cycle-data";
import { useLocalStore } from "./useLocalStore";
import { useLocalToday } from "./useLocalToday";

export function useApplicantProfile() {
  const profile = useLocalStore(applicantProfileStore);
  const update = useCallback((change: Partial<ApplicantProfile>) => {
    applicantProfileStore.set((current) => normalizeApplicantProfile({ ...current, ...change }));
  }, []);
  return { profile, update };
}

/** Where the applicant is in the GKS-U cycle they are working towards, and what to do next. */
export function useGksCycle() {
  const { profile } = useApplicantProfile();
  const today = useLocalToday();
  return useMemo(() => {
    const entryYear = targetEntryYear(today, profile.applicationStatus);
    const confirmed = confirmedCycleWindows[entryYear];
    const timeline = buildCycleTimeline(entryYear, confirmed?.windows);
    const phase = currentPhase(timeline, today);
    const call = timeline.find((milestone) => milestone.phase === "call")!;
    const application = timeline.find((milestone) => milestone.phase === "application")!;
    const daysToCall = Math.max(0, daysBetween(today, call.start));
    return {
      today,
      entryYear,
      timeline,
      phase,
      daysToCall,
      submissionDeadline: application.end,
      submissionEstimated: application.estimated,
      action: nextAction(phase, daysToCall),
      sourceId: confirmed?.sourceId,
      status: profile.applicationStatus,
    };
  }, [today, profile.applicationStatus]);
}
