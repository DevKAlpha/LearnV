import "@/styles/tailwind-study.css";
import { Link } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { useGksCycle } from "@/application/controllers/useApplicantProfile";
import { ACTION_ROUTES } from "./gks-action-routes";
import { gksProfileCopy } from "@/infrastructure/i18n/gks-profile-copy";

const link = "inline-flex min-h-11 w-fit items-center rounded-full border-2 border-ink bg-accent px-5 py-2 font-extrabold text-ink no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current";

/** "You are here" in the GKS-U cycle with the one next action that matters now. */
export function GksCycleCard() {
  const { locale } = useI18n();
  const copy = gksProfileCopy[locale].cycle;
  const cycle = useGksCycle();
  const phase = copy.phases[cycle.phase];
  const action = copy.actions[cycle.action];
  const target = ACTION_ROUTES[cycle.action];
  const external = target.startsWith("https://");
  return (
    <section className="my-4 grid gap-2 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,3.5vw,24px)] text-left text-fg" aria-labelledby="gks-cycle-card-title">
      <span className="eyebrow">{copy.kicker} · {copy.cycle(cycle.entryYear)}</span>
      <p className="m-0 text-sm font-extrabold uppercase tracking-wide">{copy.here}: {phase.title}</p>
      <h2 id="gks-cycle-card-title" className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">{action.title}</h2>
      <p className="m-0 text-[0.95rem] leading-relaxed">{action.text}</p>
      {cycle.phase === "preparation" && <p className="m-0 text-sm">{copy.daysToCall(cycle.daysToCall)} <small>({copy.estimated})</small></p>}
      {external
        ? <a className={link} href={target} target="_blank" rel="noreferrer">{action.cta} ↗</a>
        : <Link className={link} to={target}>{action.cta} →</Link>}
    </section>
  );
}
