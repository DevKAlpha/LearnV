import { describe, expect, it } from "vitest";
import { analyzeWriting, improvedChecks } from "./writing-feedback";

const status = (analysis: ReturnType<typeof analyzeWriting>, id: string) => analysis.checks.find((check) => check.id === id)?.status;

describe("writing feedback", () => {
  it("does not reward length alone", () => {
    const padded = Array.from({ length: 160 }, () => "good").join(" ");
    const analysis = analyzeWriting(padded, { language: "en", minimum: 150, maximum: 200 });
    expect(status(analysis, "length")).toBe("ok");
    expect(status(analysis, "connectors")).toBe("missing");
    expect(status(analysis, "variety")).toBe("missing");
    expect(status(analysis, "repetition")).toBe("warn");
  });

  it("finds connectors, paragraphs and informal English", () => {
    const text = "Many students study abroad. However, costs are high.\n\nFor example, rent in Seoul rose. Therefore, I don't think it is easy.\n\nIn conclusion, support matters.";
    const analysis = analyzeWriting(text, { language: "en", format: "ielts-task2" });
    const connectors = analysis.checks.find((check) => check.id === "connectors");
    expect(connectors?.items).toEqual(expect.arrayContaining(["however", "for example", "therefore", "in conclusion"]));
    expect(status(analysis, "paragraphs")).toBe("ok");
    expect(analysis.checks.find((check) => check.id === "register")?.items).toContain("don't");
    expect(status(analysis, "conclusion")).toBe("ok");
    expect(status(analysis, "position")).toBe("ok");
  });

  it("flags polite endings in TOPIK essay formats", () => {
    const polite = analyzeWriting("한국 유학은 좋습니다. 그래서 저는 준비해요.", { language: "ko", format: "topik-54" });
    expect(status(polite, "register")).toBe("warn");
    expect(polite.checks.find((check) => check.id === "register")?.items).toEqual(["좋습니다", "준비해요"]);
    const plain = analyzeWriting("한국 유학은 좋다. 그러나 준비가 필요하다.", { language: "ko", format: "topik-54" });
    expect(status(plain, "register")).toBe("ok");
  });

  it("asks for data in chart descriptions", () => {
    const vague = analyzeWriting("Overall, the number went up a lot.", { language: "en", format: "ielts-task1" });
    expect(status(vague, "data")).toBe("missing");
    expect(status(vague, "overview")).toBe("ok");
    const precise = analyzeWriting("Overall, sales rose from 20% in 2010 to 45% in 2020.", { language: "en", format: "ielts-task1" });
    expect(status(precise, "data")).toBe("ok");
  });

  it("checks target grammar and reports improvements between drafts", () => {
    const first = analyzeWriting("저는 한국에 가고 싶다.", { language: "ko", targetGrammar: ["반면", "때문에"] });
    const second = analyzeWriting("서울은 비싼 반면 기회가 많기 때문에 가고 싶다. 그리고 공부하고 싶다.", { language: "ko", targetGrammar: ["반면", "때문에"] });
    expect(status(first, "grammar")).toBe("missing");
    expect(status(second, "grammar")).toBe("ok");
    expect(improvedChecks(first, second)).toEqual(expect.arrayContaining(["grammar", "connectors"]));
  });
});
