import { useEffect } from "react";
import { localDateKey } from "@/domain/models/learning-journey";
import type { Locale } from "@/domain/models/i18n";
import { nextReminderDelay, shouldRemind } from "@/domain/models/study-reminder";
import { reminderStore } from "@/infrastructure/data/reminder-store";
import { reminderNotificationCopy } from "@/infrastructure/i18n/reminder-copy";
import { useLocalStore } from "./useLocalStore";

/** Shows a notification through the service worker when there is one (it also works installed). */
export async function showStudyNotification(locale: Locale) {
  const { title, body } = reminderNotificationCopy[locale];
  const options: NotificationOptions = { body, tag: "learnv-daily", icon: `${import.meta.env.BASE_URL}icons/icon-192.png` };
  const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (registration) await registration.showNotification(title, options);
  else new Notification(title, options);
}

/**
 * The daily reminder. Browsers only run this while LearnV is open (or installed and kept
 * alive by the system); the calendar export is the reliable channel, and the reminder
 * settings say so. Never fires without explicit permission, nor after practice today.
 */
export function useStudyReminder(activeDates: readonly string[], locale: Locale) {
  const settings = useLocalStore(reminderStore);
  useEffect(() => {
    if (!settings.enabled || typeof Notification === "undefined") return;
    const check = () => {
      const now = new Date();
      if (Notification.permission !== "granted" || !shouldRemind(settings, now, activeDates.includes(localDateKey(now)))) return;
      reminderStore.set({ ...settings, lastShown: localDateKey(now) });
      void showStudyNotification(locale).catch(() => { /* A blocked notification is not an error worth showing. */ });
    };
    check();
    const timer = setTimeout(check, nextReminderDelay(settings.time, new Date()));
    document.addEventListener("visibilitychange", check);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", check); };
  }, [settings, activeDates, locale]);
}
