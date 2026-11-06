import { normalizeScholarshipPreparation, type ScholarshipLifeId } from "@/domain/models/scholarship-life";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";

export const scholarshipPreparationKey = scopedStorageKey("learnv-scholarship-life-v1");
export function readScholarshipPreparation(storage?: Pick<Storage, "getItem">): ScholarshipLifeId[] {
  try { return normalizeScholarshipPreparation(JSON.parse((storage ?? localStorage).getItem(scholarshipPreparationKey) ?? "null")); }
  catch { return []; }
}
export function saveScholarshipPreparation(value: ScholarshipLifeId[], storage?: Pick<Storage, "setItem">) {
  try { (storage ?? localStorage).setItem(scholarshipPreparationKey, JSON.stringify(normalizeScholarshipPreparation(value))); return true; }
  catch { return false; }
}
