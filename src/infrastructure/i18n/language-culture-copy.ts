import type { Locale } from "@/domain/models/i18n";
import type { TestLanguage } from "@/domain/models/language-test";

type CultureCopy = { name: string; greetingMeaning: string; context: string; motifs: string; detail: string };
export const languageCultureCopy: Record<Locale, Record<TestLanguage, CultureCopy>> = {
  es: {
    en: { name: "Inglés", greetingMeaning: "Hola", context: "Un idioma, muchas voces", motifs: "Libros · ciudades · conversaciones", detail: "De una biblioteca a una conversación cotidiana: descubre distintas voces del mundo anglófono." },
    ko: { name: "Coreano", greetingMeaning: "Hola · saludo cortés", context: "Una puerta a Corea", motifs: "Hangul · hanok · vida cotidiana", detail: "Letras del Hangul y formas de la arquitectura hanok acompañan tu ruta hacia conversaciones en coreano." },
  },
  en: {
    en: { name: "English", greetingMeaning: "A friendly greeting", context: "One language, many voices", motifs: "Books · cities · conversations", detail: "From a library to an everyday conversation: explore different voices across the English-speaking world." },
    ko: { name: "Korean", greetingMeaning: "Hello · polite greeting", context: "A doorway to Korea", motifs: "Hangul · hanok · everyday life", detail: "Hangul letters and forms inspired by hanok architecture accompany your path towards conversations in Korean." },
  },
  ko: {
    en: { name: "영어", greetingMeaning: "친근한 인사", context: "하나의 언어, 다양한 목소리", motifs: "책 · 도시 · 대화", detail: "도서관부터 일상 대화까지, 영어권의 다양한 목소리를 만나 보세요." },
    ko: { name: "한국어", greetingMeaning: "정중한 인사", context: "한국으로 향하는 문", motifs: "한글 · 한옥 · 일상", detail: "한글과 한옥에서 영감을 받은 모양이 한국어로 대화하는 여정을 함께합니다." },
  },
};
