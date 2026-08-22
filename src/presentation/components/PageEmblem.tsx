import { AppIcon, type AppIconName } from "./AppIcon";

export function PageEmblem({ icon, tone = "purple" }: { icon: AppIconName; tone?: "purple" | "green" }) {
  return (
    <span className={`page-header-emblem page-header-emblem--${tone}`} aria-hidden="true">
      <span><AppIcon name={icon} /></span>
      <i />
    </span>
  );
}
