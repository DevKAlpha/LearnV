import { useEffect } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { matchSecret } from "@/domain/models/milestones";
import { earnStoredSticker } from "@/shared/effects/celebrate";

const WORDS = ["tulip"] as const;
const BUFFER = 12;

const isEditable = (target: EventTarget | null) => target instanceof HTMLElement
  && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Typing "tulip" anywhere outside a text field makes the logo bloom (and earns a sticker).
 * Touch users get the same sticker from the tulip on their profile.
 */
export function SecretWords() {
  const { locale } = useI18n();
  useEffect(() => {
    let buffer = "";
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1 || isEditable(event.target)) return;
      buffer = (buffer + event.key).slice(-BUFFER);
      if (matchSecret(buffer, WORDS)) {
        buffer = "";
        earnStoredSticker("tulip", locale, "bloom");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locale]);
  return null;
}
