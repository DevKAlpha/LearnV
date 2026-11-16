import "@/styles/tailwind-study.css";
import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { useVolumes } from "@/application/controllers/useMilestones";
import { volumeIds, type VolumeId } from "@/domain/models/milestones";
import { immersionCopy } from "@/infrastructure/i18n/immersion-copy";
import { storybookCopy } from "@/infrastructure/i18n/storybook-copy";
import { SceneArt } from "@/shared/ui/SceneArt";

const ROUTES: Record<VolumeId, string> = { "hangul-first": "/study/korean", "topik-bridge": "/study/korean", "c1-summit": "/study/english" };
const card = "grid content-start gap-2 overflow-hidden rounded-3xl border-2 p-3 text-left no-underline";

/** Volumes 03–05 of the storybook: each one opens with a real milestone in saved practice. */
export function MilestoneVolumes({ longestStreak }: { longestStreak: number }) {
  const { locale } = useI18n();
  const copy = immersionCopy[locale].volumes;
  const reached = useVolumes(longestStreak);

  return (
    <div className="mt-4 grid gap-2" data-milestone-volumes>
      <span className="eyebrow">{copy.kicker}</span>
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3">
        {volumeIds.map((id, index) => {
          const text = copy.items[id];
          const label = `${storybookCopy[locale].volume} ${String(index + 3).padStart(2, "0")}`;
          if (!reached.has(id)) {
            return (
              <li key={id} className={`${card} border-dashed border-edge bg-cream text-fg`} data-volume={id} data-locked="true">
                <div className="grid aspect-[8/5] place-items-center rounded-2xl border-2 border-dashed border-current/40 text-3xl" aria-hidden="true">🔒</div>
                <small className="text-xs font-extrabold uppercase tracking-wider">{label} · {copy.locked}</small>
                <strong className="text-lg leading-tight">{text.title}</strong>
                <p className="m-0 text-sm leading-relaxed">{text.hint}</p>
              </li>
            );
          }
          return (
            <li key={id} data-volume={id} data-locked="false" className="grid">
              <Link className={`${card} border-edge bg-paper text-fg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current`} to={ROUTES[id]}>
                <SceneArt scene={id} className="aspect-[8/5] h-auto w-full rounded-2xl object-cover" />
                <small className="text-xs font-extrabold uppercase tracking-wider">{label}</small>
                <strong className="text-lg leading-tight">{text.title}</strong>
                <p className="m-0 text-sm leading-relaxed">{text.caption}</p>
                <b className="font-extrabold">{copy.open} <span aria-hidden="true">↗</span></b>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
