import { describe, expect, it } from "vitest";
import { emptyTaskBoard, parseTaskBoard, type BoardTask } from "@/domain/models/task-board";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { readTaskBoard, readTaskBoardBackup, restoreTaskBoard, taskBoardBackupKey, taskBoardStorageKey, writeTaskBoard } from "./task-board-storage";

const task: BoardTask = { id:"a",title:"한국어 연습",area:"korean",status:"todo",dueDate:null,createdAt:1,updatedAt:1 };
function memory() { const values = new Map<string,string>(); return { values, getItem:(key:string) => values.get(key) ?? null, setItem:(key:string,value:string) => { values.set(key,value); } }; }
it("isolates QA board and backup keys from production learning data", () => {
  expect(taskBoardStorageKey).toBe(scopedStorageKey("learnv-task-board-v1"));
  expect(taskBoardBackupKey).toBe(`${taskBoardStorageKey}:before-restore`);
  expect(scopedStorageKey("learnv-task-board-v1",true)).toBe("qa:learnv-task-board-v1");
});
it("loads an empty board without writing or treating a first visit as an error", () => {
  const storage = memory(); expect(readTaskBoard(storage)).toEqual({board:emptyTaskBoard(),raw:null,issue:null}); expect(storage.values.size).toBe(0);
});
it.each(["{broken",'{"version":2,"tasks":[]}',"null"])("preserves unreadable stored data and refuses to overwrite it: %s", (raw) => {
  const storage = memory(); storage.setItem(taskBoardStorageKey,raw);
  expect(readTaskBoard(storage)).toMatchObject({raw,issue:"invalid"});
  expect(writeTaskBoard([task],0,storage)).toMatchObject({saved:false,issue:"invalid"});
  expect(storage.getItem(taskBoardStorageKey)).toBe(raw);
});
it("keeps work in memory if reads are denied, without trying a destructive blind write", () => {
  let writes = 0; const storage = { getItem:()=>{throw new Error("denied");},setItem:()=>{writes++;} };
  const result = writeTaskBoard([task],0,storage);
  expect(result).toMatchObject({saved:false,issue:"unavailable",board:{revision:0,tasks:[task]}}); expect(writes).toBe(0);
});
it("keeps unsaved notes and the original revision when browser storage is full", () => {
  const result = writeTaskBoard([task],0,{getItem:()=>null,setItem:()=>{throw new Error("quota");}});
  expect(result).toMatchObject({saved:false,issue:"unavailable",board:{revision:0,tasks:[task]}});
});
it("saves changes with revisions and detects another tab's write", () => {
  const storage = memory(); const first = writeTaskBoard([task],0,storage);
  expect(first).toMatchObject({saved:true,board:{revision:1}});
  const before = storage.getItem(taskBoardStorageKey);
  expect(writeTaskBoard([],0,storage)).toMatchObject({saved:false,conflict:true,board:{revision:1,tasks:[task]}});
  expect(storage.getItem(taskBoardStorageKey)).toBe(before);
  const second = writeTaskBoard([],1,storage); expect(second.saved).toBe(true); expect(second.board.revision).toBe(2);
  expect(storage.values.size).toBe(1);
});
it("restores a reviewed copy while retaining the complete previous version", () => {
  const storage = memory(); const original = writeTaskBoard([task],0,storage);
  const imported = {version:1 as const,revision:0,tasks:[{...task,id:"b",title:"Leer requisitos"}]};
  const restored = restoreTaskBoard(imported,original.raw,storage);
  expect(restored).toMatchObject({saved:true,board:{revision:2,tasks:imported.tasks}});
  expect(readTaskBoardBackup(storage)).toEqual(original.board);
  expect(parseTaskBoard(storage.getItem(taskBoardStorageKey)!)).toEqual(restored.board);
});
it("requires the expected copy even when recovering damaged data", () => {
  const storage = memory(); storage.setItem(taskBoardStorageKey,"{broken");
  expect(restoreTaskBoard(emptyTaskBoard(),null,storage).conflict).toBe(true);
  expect(storage.getItem(taskBoardStorageKey)).toBe("{broken");
  expect(restoreTaskBoard(emptyTaskBoard(),"{broken",storage).saved).toBe(true);
  expect(storage.getItem(taskBoardBackupKey)).toBe("{broken");
  expect(readTaskBoardBackup(storage)).toBeNull();
});
describe.each(["backup", "board"])("restore failure at %s", (step) => {
  it("retains the original board and reports the failed save", () => {
    const storage = memory(); const original = writeTaskBoard([task],0,storage);
    const failing = {getItem:storage.getItem,setItem:(key:string,value:string)=>{if(key === (step === "backup" ? taskBoardBackupKey : taskBoardStorageKey)) throw new Error("quota");storage.setItem(key,value);}};
    expect(restoreTaskBoard(emptyTaskBoard(),original.raw,failing)).toMatchObject({saved:false,issue:"unavailable"});
    expect(storage.getItem(taskBoardStorageKey)).toBe(original.raw);
  });
});
