import { useEffect, useRef, useState } from "react";
import { changeBoardTasks, type BoardChange, type BoardIssue, type TaskBoard } from "@/domain/models/task-board";
import { readTaskBoard, restoreTaskBoard, taskBoardStorageKey, writeTaskBoard } from "@/infrastructure/data/task-board-storage";

export function useTaskBoard() {
  const [state, setState] = useState(() => ({ ...readTaskBoard(), unsaved: false }));
  const stateRef = useRef(state); stateRef.current = state;
  const [issue, setIssue] = useState<BoardIssue | null>(state.issue);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== null && event.key !== taskBoardStorageKey) return;
      if (stateRef.current.unsaved) { setIssue("conflict"); return; }
      const loaded = readTaskBoard();
      const latest = { ...loaded, board: loaded.issue ? stateRef.current.board : loaded.board, unsaved: false };
      stateRef.current = latest; setState(latest); setIssue(latest.issue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const commit = (change: BoardChange) => {
    const current = stateRef.current;
    if (current.issue === "invalid") { setIssue("invalid"); return false; }
    const changed = changeBoardTasks(current.board.tasks, change, Date.now());
    if (changed.issue) { setIssue(changed.issue); return false; }
    const result = writeTaskBoard(changed.tasks, current.board.revision);
    if (result.conflict || result.issue === "invalid") {
      if (!current.unsaved) { const next = { ...result, board: result.issue === "invalid" ? current.board : result.board, unsaved: false }; stateRef.current = next; setState(next); }
      setIssue(result.conflict ? "conflict" : "invalid"); return false;
    }
    const next = { ...result, unsaved: !result.saved };
    stateRef.current = next; setState(next); setIssue(result.issue);
    return true;
  };
  const restore = (board: TaskBoard) => {
    const result = restoreTaskBoard(board, stateRef.current.raw);
    if (!result.saved) { setIssue(result.conflict ? "conflict" : result.issue); return false; }
    const next = { ...result, unsaved: false }; stateRef.current = next; setState(next); setIssue(null); return true;
  };
  return { ...state, issue, damaged: state.issue === "invalid", commit, restore, clearIssue: () => setIssue(null) };
}
