import type { TestLanguage, TestSkill } from "@/domain/models/language-test";
import { pathSkillOrder } from "./learning-path-layout";

const scenes = {
  en: ["campus", "reading", "city", "tea", "letters", "coast"],
  ko: ["hanok", "hangul", "seoul", "fan", "tea", "market"],
} as const;

/** Static local SVGs are shared by repeated stops and loaded only near the viewport. */
export function PathCultureAccent({ language, skill, stageIndex }: { language: TestLanguage; skill: TestSkill; stageIndex: number }) {
  const variants = scenes[language];
  const variant = (Math.floor(stageIndex / 4) + pathSkillOrder.indexOf(skill)) % variants.length;
  return <img className="test-path-culture-accent" src={`${import.meta.env.BASE_URL}illustrations/learning-path/${language}-${variants[variant]}.svg`} width="200" height="160" loading="lazy" decoding="async" alt="" aria-hidden="true" draggable="false" />;
}
