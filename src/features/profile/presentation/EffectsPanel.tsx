import "@/styles/tailwind-study.css";
import { useI18n } from "@/application/i18n/I18nContext";
import { useLocalStore } from "@/application/controllers/useLocalStore";
import type { EffectsPreferences } from "@/domain/models/effects";
import { effectsStore } from "@/infrastructure/data/effects-store";
import { immersionCopy } from "@/infrastructure/i18n/immersion-copy";
import { celebrate, prefersReducedMotion } from "@/shared/effects/celebrate";

const button = "min-h-11 w-fit cursor-pointer rounded-full border-2 border-edge bg-paper px-4 font-extrabold text-fg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current";

/** Celebrations, sound, vibration and the seasonal theme. Stored on this device only. */
export function EffectsPanel() {
  const { locale } = useI18n();
  const copy = immersionCopy[locale].effects;
  const effects = useLocalStore(effectsStore);
  const reduced = prefersReducedMotion();
  const canVibrate = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  const toggle = (key: keyof EffectsPreferences) => effectsStore.set((current) => ({ ...current, [key]: !current[key] }));
  const option = (key: keyof EffectsPreferences, label: string, hint?: string) => (
    <label className="flex min-h-11 items-start gap-2">
      <input type="checkbox" className="mt-0.5 size-5 shrink-0" checked={effects[key]} onChange={() => toggle(key)} />
      <span className="grid gap-0.5"><span className="font-extrabold">{label}</span>{hint && <small className="text-sm">{hint}</small>}</span>
    </label>
  );

  return (
    <section className="my-4 grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-left text-fg" aria-labelledby="effects-title" data-effects-panel>
      <div className="grid gap-1">
        <span className="eyebrow">{copy.kicker}</span>
        <h2 id="effects-title" className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">{copy.title}</h2>
        <p className="m-0 text-[0.95rem] leading-relaxed">{copy.intro}</p>
      </div>
      <fieldset className="m-0 grid gap-1 border-0 p-0">
        <legend className="sr-only">{copy.title}</legend>
        {option("celebrations", copy.celebrations, copy.celebrationsHint)}
        {option("sound", copy.sound)}
        {canVibrate && option("vibration", copy.vibration, copy.vibrationHint)}
        {option("seasonal", copy.seasonal)}
      </fieldset>
      {reduced && <p className="m-0 text-sm">{copy.reducedMotion}</p>}
      <button type="button" className={button} onClick={() => void celebrate("pass", locale)}>{copy.preview}</button>
    </section>
  );
}
