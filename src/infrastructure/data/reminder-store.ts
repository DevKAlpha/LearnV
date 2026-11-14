import { defaultReminderSettings, normalizeReminderSettings, type ReminderSettings } from "@/domain/models/study-reminder";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { createLocalStore } from "@/infrastructure/storage/local-store";

/** Daily study reminder: on/off, time and the last day it was shown. */
export const reminderStore = createLocalStore<ReminderSettings>({
  key: scopedStorageKey("learnv-reminders-v1"),
  fallback: defaultReminderSettings,
  parse: normalizeReminderSettings,
});
