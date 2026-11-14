import { useCallback } from "react";
import { buildCalendar, type CalendarEvent } from "@/domain/models/calendar-export";
import type { Locale } from "@/domain/models/i18n";
import { localDateKey } from "@/domain/models/learning-journey";
import { isLearningQa } from "@/application/qa/qa-learning-scope";
import { reminderStore } from "@/infrastructure/data/reminder-store";
import { readTaskBoard } from "@/infrastructure/data/task-board-storage";
import { dailyHabitCopy } from "@/infrastructure/i18n/daily-habit-copy";
import { gksProfileCopy } from "@/infrastructure/i18n/gks-profile-copy";
import { useGksCycle } from "./useApplicantProfile";

export type CalendarParts = { gks: boolean; board: boolean; study: boolean };

/** Builds the .ics file from the GKS cycle, dated board tasks and the daily study time. */
export function useCalendarExport(locale: Locale) {
  const cycle = useGksCycle();
  return useCallback((parts: CalendarParts) => {
    const copy = dailyHabitCopy[locale].reminders;
    const cycleCopy = gksProfileCopy[locale].cycle;
    const events: CalendarEvent[] = [];
    if (parts.gks && !isLearningQa) {
      for (const milestone of cycle.timeline) {
        if (milestone.end < cycle.today) continue;
        events.push({
          uid: `gks-${cycle.entryYear}-${milestone.phase}@learnv`,
          title: `${cycleCopy.cycle(cycle.entryYear)} · ${cycleCopy.phases[milestone.phase].title}`,
          date: milestone.start,
          endDate: milestone.end,
          description: `${cycleCopy.phases[milestone.phase].text}\n${copy.gksDescription(milestone.estimated)}`,
          // A week's notice for the dates that need action; the rest on the morning itself.
          alarmDaysBefore: milestone.phase === "call" || milestone.phase === "application" ? 7 : 0,
        });
      }
    }
    if (parts.board) {
      for (const task of readTaskBoard().board.tasks) {
        if (task.status === "done" || !task.dueDate || task.dueDate < cycle.today) continue;
        events.push({ uid: `board-${task.id}@learnv`, title: task.title, date: task.dueDate, alarmDaysBefore: 0 });
      }
    }
    const { time } = reminderStore.get();
    return buildCalendar({
      name: copy.calendarName,
      events,
      study: parts.study ? { time, minutes: 25, title: copy.studyTitle, description: copy.studyDescription, startDate: localDateKey(new Date()) } : null,
      now: new Date(),
    });
  }, [cycle, locale]);
}
