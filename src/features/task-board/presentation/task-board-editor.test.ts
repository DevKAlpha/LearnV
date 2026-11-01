import { expect, it } from "vitest";
import { taskInputFromForm } from "./task-board-editor";

it("saves a native picker value even when the draft's date has not received a React event", () => {
  const form = new FormData(); form.set("dueDate","2026-11-12");
  expect(taskInputFromForm({title:"Preparar entrevista",area:"gks",dueDate:null,showDate:true},form)).toEqual({title:"Preparar entrevista",area:"gks",dueDate:"2026-11-12"});
});
it("removes the date when its optional toggle is off, even if an older date exists", () => {
  const form = new FormData(); form.set("dueDate","2026-11-12");
  expect(taskInputFromForm({title:"Leer",area:"korean",dueDate:"2026-10-31",showDate:false},form).dueDate).toBeNull();
});
it("keeps an optional empty date empty instead of restoring a stale draft date", () => {
  expect(taskInputFromForm({title:"Leer",area:"english",dueDate:"2026-10-31",showDate:true},new FormData()).dueDate).toBeNull();
});
