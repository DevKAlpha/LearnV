import { normalizeCulturePreparation, type CulturePreparation } from "@/domain/models/cultural-guide";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";

export const culturePreparationKey = scopedStorageKey("learnv-culture-preparation-v1");
export function readCulturePreparation(storage?: Pick<Storage, "getItem">): CulturePreparation {
  try { return normalizeCulturePreparation(JSON.parse((storage ?? localStorage).getItem(culturePreparationKey) ?? "null")); }
  catch { return []; }
}
export function saveCulturePreparation(value: CulturePreparation, storage?: Pick<Storage, "setItem">) {
  try { (storage ?? localStorage).setItem(culturePreparationKey, JSON.stringify(normalizeCulturePreparation(value))); return true; }
  catch { return false; }
}
