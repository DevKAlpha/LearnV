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
    <m.nav
      className="bottom-nav"
      aria-label={copy.nav.mainAria}
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
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
          aria-current={active ? "page" : undefined}
        >
          {active && (
            <m.span
              className="nav-active-pill"
              layoutId="bottom-nav-active"
              transition={{ type: "spring", stiffness: 430, damping: 36 }}
            />
          )}
          <m.span
            className="nav-item__motion"
            animate={active ? { y: -2, scale: 1.06 } : { y: 0, scale: 1 }}
            whileTap={{ y: 2, scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <m.span
              className="nav-symbol"
              aria-hidden="true"
              animate={active ? { rotate: [0, -8, 7, 0] } : { rotate: 0 }}
              transition={{ duration: 0.38 }}
            >{item.symbol}</m.span>
            <span className="nav-label">{item.label}</span>
          </m.span>
        </NavLink>
        );
      })}
    </m.nav>
  );
}
