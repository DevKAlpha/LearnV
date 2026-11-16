import "@/styles/celebration.css";
import type { Locale } from "@/domain/models/i18n";
import type { CelebrationKind, CelebrationPlan } from "@/domain/models/effects";
import type { StickerId } from "@/domain/models/milestones";
import { immersionCopy } from "@/infrastructure/i18n/immersion-copy";

const STATUS_ID = "learnv-celebration-status";
const TOAST_MS = 4200;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function celebrationMessage(kind: CelebrationKind, locale: Locale, sticker?: StickerId): string {
  const copy = immersionCopy[locale];
  if (!sticker) return copy.celebrate[kind];
  const earned = copy.celebrate.newSticker(copy.stickers.items[sticker].name);
  return kind === "sticker" ? earned : `${copy.celebrate[kind]} · ${earned}`;
}

/** One persistent polite status region, so screen readers announce every celebration. */
function showToast(text: string) {
  let region = document.getElementById(STATUS_ID);
  if (!region) {
    region = document.createElement("div");
    region.id = STATUS_ID;
    region.className = "celebration-toast";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.append(region);
  }
  const target = region;
  target.replaceChildren();
  target.classList.add("is-visible");
  // Filled on the next tick: a live region announces content added after it is in the page.
  setTimeout(() => {
    const mark = document.createElement("span");
    mark.className = "celebration-toast__mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "🌷";
    const label = document.createElement("span");
    label.textContent = text;
    target.replaceChildren(mark, label);
  }, 60);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { target.classList.remove("is-visible"); target.replaceChildren(); }, TOAST_MS);
}

function confetti(count: number) {
  if (count <= 0) return;
  const layer = document.createElement("div");
  layer.className = "celebration-confetti";
  layer.setAttribute("aria-hidden", "true");
  for (let index = 0; index < count; index++) {
    const piece = document.createElement("i");
    // CSSOM custom properties: allowed by the style CSP, unlike style attributes.
    piece.style.setProperty("--x", `${Math.round(Math.random() * 100)}vw`);
    piece.style.setProperty("--drift", `${Math.round((Math.random() - 0.5) * 30)}vw`);
    piece.style.setProperty("--delay", `${(Math.random() * 0.45).toFixed(2)}s`);
    piece.style.setProperty("--fall", `${(1.6 + Math.random() * 1.1).toFixed(2)}s`);
    piece.style.setProperty("--spin", `${Math.round(Math.random() * 360)}deg`);
    layer.append(piece);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 3400);
}

/** A soft three-note chime, generated (no audio file), kept quiet. */
function chime(kind: CelebrationKind) {
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) return;
  try {
    const context = new Context();
    const notes = kind === "cheer" ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 783.99, 1046.5];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.11;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.1, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.4);
    });
    setTimeout(() => { void context.close().catch(() => undefined); }, notes.length * 110 + 600);
  } catch { /* Audio is a bonus: never let it break the flow. */ }
}

function bloom() {
  const marks = document.querySelectorAll<SVGElement>(".brand-tulip");
  marks.forEach((mark) => mark.classList.add("is-blooming"));
  setTimeout(() => marks.forEach((mark) => mark.classList.remove("is-blooming")), 1600);
}

export function runCelebration(kind: CelebrationKind, plan: CelebrationPlan, locale: Locale, sticker?: StickerId) {
  if (plan.toast) showToast(celebrationMessage(kind, locale, sticker));
  if (kind === "bloom") bloom();
  confetti(plan.confetti);
  if (plan.sound) chime(kind);
  if (plan.vibrate) {
    try { navigator.vibrate?.(plan.vibrate); } catch { /* Unsupported or blocked. */ }
  }
}
