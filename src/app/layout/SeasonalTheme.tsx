import { useEffect } from "react";
import { useLocalStore } from "@/application/controllers/useLocalStore";
import { useLocalToday } from "@/application/controllers/useLocalToday";
import { activeFestival } from "@/domain/models/cultural-calendar";
import { festivals } from "@/infrastructure/data/cultural-calendar";
import { effectsStore } from "@/infrastructure/data/effects-store";

/** Marks Korean festival days with a decorative ribbon; its styles load only on those days. */
export function SeasonalTheme() {
  const effects = useLocalStore(effectsStore);
  const today = useLocalToday();
  const season = effects.seasonal ? activeFestival(today, festivals)?.id ?? null : null;

  useEffect(() => {
    if (!season) return;
    const root = document.documentElement;
    root.dataset.season = season;
    void import("@/styles/season.css").catch(() => undefined);
    return () => { delete root.dataset.season; };
  }, [season]);

  return season ? <div className={`season-ribbon season-ribbon--${season}`} aria-hidden="true" data-testid="season-ribbon" /> : null;
}
