import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import {
  hasActiveWrittenSimulator,
  WRITTEN_SIMULATOR_STATE_EVENT,
} from "@/application/controllers/writtenSimulatorStatus";
import { useI18n } from "@/application/i18n/I18nContext";
import { AnimatePresence, m } from "motion/react";
import { AppIcon, type AppIconName } from "@/shared/ui/AppIcon";

export function BottomNav() {
  const { copy } = useI18n();
  const location = useLocation();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const isWrittenSimulator = location.pathname === "/study/written-simulator";
  const [writtenSimulatorStarted, setWrittenSimulatorStarted] = useState(
    () => isWrittenSimulator && hasActiveWrittenSimulator(),
  );

  useEffect(() => {
    setResetDialogOpen(false);
    setWrittenSimulatorStarted(isWrittenSimulator && hasActiveWrittenSimulator());
  }, [isWrittenSimulator, location.pathname]);

  useEffect(() => {
    const syncWrittenSimulator = (event: Event) => {
      const detail = (event as CustomEvent<{ active: boolean }>).detail;
      setWrittenSimulatorStarted(isWrittenSimulator && detail.active);
    };
    window.addEventListener(WRITTEN_SIMULATOR_STATE_EVENT, syncWrittenSimulator);
    return () => window.removeEventListener(WRITTEN_SIMULATOR_STATE_EVENT, syncWrittenSimulator);
  }, [isWrittenSimulator]);

  useEffect(() => {
    if (!resetDialogOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setResetDialogOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [resetDialogOpen]);
  const items: Array<{ to: string; icon: AppIconName; label: string; end?: boolean }> = [
    { to: "/", icon: "home", label: copy.nav.home, end: true },
    { to: "/gks", icon: "scholarship", label: copy.nav.gks },
    { to: "/study", icon: "study", label: copy.nav.study },
    { to: "/checklist", icon: "checklist", label: copy.nav.documents },
    { to: "/profile", icon: "profile", label: copy.nav.profile },
  ];

  return <>
    <m.nav
      className="bottom-nav"
      aria-label={copy.nav.mainAria}
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      {items.filter((item) => !(isWrittenSimulator && writtenSimulatorStarted && item.icon === "profile")).map((item) => {
        const active = location.pathname === item.to
          || (item.to !== "/" && location.pathname.startsWith(`${item.to}/`))
          || (item.to === "/study" && location.pathname.startsWith("/tests/"));
        return (
          <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={`nav-item${active ? " nav-item--active" : ""}`}
          data-nav={item.icon}
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
            ><AppIcon name={item.icon} /></m.span>
            <span className="nav-label">{item.label}</span>
          </m.span>
        </NavLink>
        );
      })}
      {isWrittenSimulator && writtenSimulatorStarted && (
        <button
          className="nav-item written-nav-reset"
          type="button"
          aria-label={copy.written.reset}
          aria-haspopup="dialog"
          onClick={() => setResetDialogOpen(true)}
        >
          <span className="nav-item__motion">
            <span className="nav-symbol" aria-hidden="true">↻</span>
            <span className="nav-label">{copy.written.reset}</span>
          </span>
        </button>
      )}
    </m.nav>

    {createPortal(
      <AnimatePresence>
        {resetDialogOpen && (
          <m.div
            className="reset-confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setResetDialogOpen(false);
            }}
          >
            <m.section
              className="reset-confirm-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-dialog-title"
              aria-describedby="reset-dialog-description"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              <span className="reset-confirm-dialog__icon" aria-hidden="true">↻</span>
              <span className="eyebrow">{copy.written.reset}</span>
              <h2 id="reset-dialog-title">{copy.written.resetDialogTitle}</h2>
              <p id="reset-dialog-description">{copy.written.resetDialogText}</p>
              <div className="reset-confirm-dialog__actions">
                <button type="button" autoFocus onClick={() => setResetDialogOpen(false)}>{copy.written.cancelReset}</button>
                <button
                  className="reset-confirm-dialog__accept"
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("learnv:written-reset"));
                    setWrittenSimulatorStarted(false);
                    setResetDialogOpen(false);
                  }}
                >{copy.written.confirmReset}</button>
              </div>
            </m.section>
          </m.div>
        )}
      </AnimatePresence>,
      document.body,
    )}
  </>;
}
