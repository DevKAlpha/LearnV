import { NavLink, useLocation } from "react-router-dom";
import { useI18n } from "../../application/i18n/I18nContext";

export function BottomNav() {
  const { copy } = useI18n();
  const location = useLocation();
  const items = [
    { to: "/", symbol: "⌂", label: copy.nav.home, end: true },
    { to: "/gks", symbol: "◎", label: copy.nav.gks },
    { to: "/study", symbol: "文", label: copy.nav.study },
    { to: "/checklist", symbol: "✓", label: copy.nav.documents },
    { to: "/profile", symbol: "☺", label: copy.nav.profile },
  ];

  return (
    <nav className="bottom-nav" aria-label={copy.nav.mainAria}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-item${isActive || (item.to === "/study" && location.pathname.startsWith("/tests/")) ? " nav-item--active" : ""}`}
        >
          <span className="nav-symbol" aria-hidden="true">{item.symbol}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
