export type Locale = "es" | "en" | "ko";

export type LocalizedText = Record<Locale, string>;

export function localize(text: LocalizedText, locale: Locale) {
  return text[locale];
}
