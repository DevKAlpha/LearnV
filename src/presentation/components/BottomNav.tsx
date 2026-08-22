import { NavLink, useLocation } from "react-router-dom";
import { useI18n } from "../../application/i18n/I18nContext";
import { m } from "motion/react";

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
      {items.map((item) => {
        const active = location.pathname === item.to
          || (item.to !== "/" && location.pathname.startsWith(`${item.to}/`))
          || (item.to === "/study" && location.pathname.startsWith("/tests/"));
        return (
          <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={`nav-item${active ? " nav-item--active" : ""}`}
        >
          {active && (
            <m.span
              className="nav-active-pill"
              layoutId="bottom-nav-active"
              transition={{ type: "spring", stiffness: 430, damping: 36 }}
            />
          )}
          <span className="nav-symbol" aria-hidden="true">{item.symbol}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
        );
      })}
    </nav>
  );
}
