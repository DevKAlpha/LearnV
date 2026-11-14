import { emptyApplicantProfile, normalizeApplicantProfile, type ApplicantProfile } from "@/domain/models/applicant-profile";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { createLocalStore } from "@/infrastructure/storage/local-store";

/** The applicant's own profile; stays on this device and travels only in the device backup. */
export const applicantProfileStore = createLocalStore<ApplicantProfile>({
  key: scopedStorageKey("learnv-applicant-profile-v1"),
  fallback: emptyApplicantProfile,
  parse: normalizeApplicantProfile,
});
