import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import { InterviewChatPanel } from "@/features/interview-chatbot/presentation/InterviewChatPanel";
import { InterviewPreparation2027 } from "@/shared/ui/InterviewPreparation2027";
import { InterviewReportArt, InterviewScene } from "@/shared/ui/InterviewScene";
import { interview2027, interview2027Copy } from "@/infrastructure/data/interview-2027";
import { INTERVIEW_STAGES } from "@/domain/models/interview-chatbot";

describe.each(["es", "en", "ko"] as const)("2027 interview preparation in %s", (locale) => {
  it("connects every practice stage to a short, complete preparation task", () => {
    const copy = interview2027Copy[locale];
    expect(Object.keys(copy.cards)).toEqual(INTERVIEW_STAGES);
    for (const stage of INTERVIEW_STAGES) {
      expect(copy.cards[stage].title.length).toBeGreaterThan(3);
      expect(copy.cards[stage].text.length).toBeGreaterThan(35);
      expect(copy.cards[stage].text.length).toBeLessThan(240);
    }
    for (const label of [copy.scope,copy.practice,copy.changeWarning,copy.keepLanguage,copy.restartLanguage]) expect(label.trim().length).toBeGreaterThan(1);
    expect(copy.practice).toContain("LearnV");
    expect(copy.practice).toContain("90");
    expect(copy.badge).toContain("GKS-U 2027");
  });
  it.each([false,true])("renders reviewed official sources with no automatic downloads (compact=%s)", (compact) => {
    const html = renderToStaticMarkup(<InterviewPreparation2027 locale={locale} compact={compact} />);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain(interview2027Copy[locale].practice);
    expect(html).toContain(`dateTime="${interview2027.reviewedAt}"`);
    for (const url of [interview2027.noticeUrl,interview2027.guideUrl,interview2027.embassyUrl]) {
      const official = new URL(url);
      expect(official.protocol).toBe("https:");
      expect(["www.studyinkorea.go.kr","www.pcu.ac.kr","overseas.mofa.go.kr"]).toContain(official.hostname);
      expect(html).toContain(url.replaceAll("&","&amp;"));
    }
    expect(html.match(/rel="noopener noreferrer"/g)).toHaveLength(3);
    expect(html).not.toMatch(/<iframe|<img|download=|<script/);
    if (compact) { expect(html).toContain("<details"); expect(html).not.toContain('open=""'); }
    else expect(html).toContain('class="interview-scene"');
  });
});

it("keeps the chat modal, keyboard labels, reusable vectors and current call on its first screen", () => {
  const html = renderToStaticMarkup(<MemoryRouter><InterviewChatPanel onClose={() => {}} /></MemoryRouter>);
  expect(html).toContain('role="dialog"');
  expect(html).toContain('aria-modal="true"');
  expect(html).toContain('lang="es"');
  expect(html).toContain('aria-label="Cerrar entrevista"');
  expect(html).toContain(interview2027Copy.es.badge);
  expect(html).toContain("Comenzar entrevista");
  expect(html).toContain('class="interview-scene"');
  expect(html).not.toContain("interview-chat__composer");
});

it("draws original decorative SVGs without filters, network assets or repeated ids", () => {
  const html = renderToStaticMarkup(<><InterviewScene /><InterviewScene /></>);
  expect(html.match(/viewBox="0 0 360 150"/g)).toHaveLength(2);
  expect(html.match(/aria-hidden="true"/g)).toHaveLength(2);
  expect(html).not.toMatch(/<image|<filter|<foreignObject|id=|href=/);
  const report = renderToStaticMarkup(<InterviewReportArt />);
  expect(report).toContain('viewBox="0 0 96 96"');
  expect(report).toContain('aria-hidden="true"');
  expect(report).not.toMatch(/<image|<filter|id=|href=/);
});

it("loads typography only with the chat, uses real readable sizes and honours reduced motion", () => {
  const css = readFileSync(new URL("../styles/interview-chat-polish.css", import.meta.url),"utf8");
  expect(css).toContain("font-size: 1rem");
  expect(css).toContain("500 1rem/1.6");
  expect(css).toContain("prefers-reduced-motion: reduce");
  expect(css).toContain("forced-colors: active");
  expect(css).toContain("min-height: 0");
  expect(css).not.toMatch(/scale\(|translateZ|will-change|url\(/);
  expect(readFileSync(new URL("../main.tsx",import.meta.url),"utf8")).not.toContain("interview-chat-polish");
  const source = readFileSync(new URL("../features/interview-chatbot/presentation/InterviewChatPanel.tsx",import.meta.url),"utf8");
  const panel = source.slice(source.indexOf("export function InterviewChatPanel"));
  expect(panel).not.toContain("setInterval");
  expect(panel).toContain("getMotionScrollBehavior()");
  expect(panel).toContain('role="log"');
  expect(panel).toContain("if (nextLocale === locale) return;");
});
