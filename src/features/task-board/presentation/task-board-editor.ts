import type { TaskInput } from "@/domain/models/task-board";

/** Read the native date value at submit, including date-picker/autofill updates awaiting React events. */
export function taskInputFromForm(draft: TaskInput & { showDate: boolean }, form: Pick<FormData,"get">): TaskInput {
  const date = form.get("dueDate");
  return { title: draft.title, area: draft.area, dueDate: draft.showDate && typeof date === "string" && date ? date : null };
}
