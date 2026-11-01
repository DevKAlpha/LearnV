import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { TaskBoardQuickAccess } from "./layout/TaskBoardQuickAccess";
import { TaskBoardPanel } from "@/features/task-board/presentation/TaskBoardPanel";
import { TaskNoteCard } from "@/features/task-board/presentation/TaskNoteCard";
import { taskBoardCopy } from "@/infrastructure/i18n/task-board-copy";
import { taskBoardTriggerCopy } from "@/infrastructure/i18n/task-board-trigger-copy";
import { getDefinition } from "./layout/section-help";
import { boardAreas, boardStatuses, type BoardTask } from "@/domain/models/task-board";

const scenario = vi.hoisted(() => ({locale:"es" as "es"|"en"|"ko"}));
vi.mock("@/application/i18n/I18nContext",()=>({useI18n:()=>({locale:scenario.locale})}));
afterEach(()=>{vi.unstubAllGlobals();scenario.locale="es";});
describe.each(["es","en","ko"] as const)("task board in %s",(locale)=>{
  it("starts as a quiet first-access button without loading notes or storage",()=>{
    scenario.locale=locale;const getItem=vi.fn();vi.stubGlobal("localStorage",{getItem});
    const html=renderToStaticMarkup(<MemoryRouter><TaskBoardQuickAccess /></MemoryRouter>);
    expect(html).toContain(`aria-label="${taskBoardTriggerCopy[locale].open}"`);
    expect(html).toContain('aria-expanded="false"');expect(html).not.toMatch(/role="dialog"|<input|type="file"/);expect(getItem).not.toHaveBeenCalled();
  });
  it("offers four short, editable starting ideas with no pre-created or mandatory tasks",()=>{
    scenario.locale=locale;const setItem=vi.fn();vi.stubGlobal("localStorage",{getItem:()=>null,setItem});
    const html=renderToStaticMarkup(<TaskBoardPanel active />);
    for(const area of boardAreas){expect(taskBoardCopy[locale].templates[area].length).toBeLessThanOrEqual(100);expect(html).toContain(taskBoardCopy[locale].templates[area]);}
    expect(html).toContain(taskBoardCopy[locale].coach);expect(html).toContain(taskBoardCopy[locale].privacy);expect(html).not.toContain('class="task-note ');expect(setItem).not.toHaveBeenCalled();
    expect(getDefinition("/study/korean").steps.find(step=>step.selector===".task-board-trigger")?.text[locale]).toBeTruthy();
  });
  it("renders user content over a real SVG note with native movement and editing alternatives",()=>{
    const task:BoardTask={id:"safe",title:'<img src=x onerror="alert(1)"> 한국어',area:"culture",status:"todo",dueDate:"2026-10-31",createdAt:1,updatedAt:1};
    const html=renderToStaticMarkup(<TaskNoteCard task={task} locale={locale} today="2026-11-01" onEdit={()=>{}} onMove={()=>{}} onRemove={()=>{}} onDrag={()=>{}} onDragEnd={()=>{}} />);
    expect(html).toContain('<svg class="task-note-art"');expect(html).toContain('&lt;img src=x onerror=');expect(html).not.toContain('<img src=x');
    for(const status of boardStatuses)expect(html).toContain(taskBoardCopy[locale].statuses[status]);
    expect(html).toContain(taskBoardCopy[locale].edit);expect(html).toContain(taskBoardCopy[locale].remove);expect(html).toContain(taskBoardCopy[locale].overdue);expect(html).toContain('tabindex="-1"');
  });
});
