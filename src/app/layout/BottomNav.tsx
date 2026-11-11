import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useModal } from "@/shared/ui/useModal";
import { isAppRouteAvailable } from "@/application/qa/qa-learning-scope";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { preloadAppRoute } from "@/app/routing/AppRoutes";
import {
  hasActiveWrittenSimulator,
} from "@/application/controllers/writtenSimulatorStatus";
import { useI18n } from "@/application/i18n/I18nContext";
import { emitLearnvEvent, onLearnvEvent } from "@/infrastructure/events/learnv-events";
import { AppIcon, type AppIconName } from "@/shared/ui/AppIcon";

export function BottomNav() {
  const { copy } = useI18n();
  const location = useLocation();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const resetDialogRef = useRef<HTMLElement>(null);
  const resetCancelRef = useRef<HTMLButtonElement>(null);
  const isWrittenSimulator = location.pathname === "/study/written-simulator";
  const [writtenSimulatorStarted, setWrittenSimulatorStarted] = useState(
    () => isWrittenSimulator && hasActiveWrittenSimulator(),
  );

  useEffect(() => {
    setPendingPath(null);
    setResetDialogOpen(false);
    setWrittenSimulatorStarted(isWrittenSimulator && hasActiveWrittenSimulator());
  }, [isWrittenSimulator, location.pathname]);

  useEffect(() => {
    return onLearnvEvent("learnv:written-state", (detail) => {
      setWrittenSimulatorStarted(isWrittenSimulator && detail?.active === true);
    });
  }, [isWrittenSimulator]);

  // Focus starts on Cancel, never on the destructive action.
  useModal({ open: resetDialogOpen, onClose: () => setResetDialogOpen(false), dialogRef: resetDialogRef, initialFocusRef: resetCancelRef });
  const items: Array<{ to: string; icon: AppIconName; label: string; end?: boolean }> = [
    { to: "/", icon: "home", label: copy.nav.home, end: true },
    { to: "/gks", icon: "scholarship", label: copy.nav.gks },
    { to: "/study", icon: "study", label: copy.nav.study },
    { to: "/checklist", icon: "checklist", label: copy.nav.documents },
    { to: "/profile", icon: "profile", label: copy.nav.profile },
  ];
  const activePath = pendingPath ?? location.pathname;
  const showReset = isWrittenSimulator && writtenSimulatorStarted;
  const visibleItems = items.filter((item) => isAppRouteAvailable(item.to) && !(showReset && item.icon === "profile"));

  return <>
    <nav
      className="bottom-nav"
      aria-label={copy.nav.mainAria}
      style={{ "--nav-item-count": visibleItems.length + Number(showReset) } as CSSProperties}
    >
      {visibleItems.map((item) => {
        const active = activePath === item.to
          || (item.to !== "/" && activePath.startsWith(`${item.to}/`))
          || (item.to === "/study" && activePath.startsWith("/tests/"));
        return (
          <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={`nav-item${active ? " nav-item--active" : ""}`}
          data-nav={item.icon}
          data-pending={pendingPath === item.to ? "true" : undefined}
          aria-current={active ? "page" : undefined}
          onFocus={() => preloadAppRoute(item.to)}
          onPointerEnter={() => preloadAppRoute(item.to)}
          onPointerDown={(event) => {
            if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            preloadAppRoute(item.to);
            setPendingPath(item.to);
          }}
          onPointerCancel={() => setPendingPath(null)}
        >
          {active && (
            <span className="nav-active-pill" />
          )}
          <span className="nav-item__motion">
            <span className="nav-symbol" aria-hidden="true"><AppIcon name={item.icon} /></span>
            <span className="nav-label">{item.label}</span>
          </span>
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
    </nav>

    {createPortal(
      resetDialogOpen ? (
          <div
            className="reset-confirm-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setResetDialogOpen(false);
            }}
          >
            <section
              ref={resetDialogRef}
              className="reset-confirm-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-dialog-title"
              aria-describedby="reset-dialog-description"
            >
              <span className="reset-confirm-dialog__icon" aria-hidden="true">↻</span>
              <span className="eyebrow">{copy.written.reset}</span>
              <h2 id="reset-dialog-title">{copy.written.resetDialogTitle}</h2>
              <p id="reset-dialog-description">{copy.written.resetDialogText}</p>
              <div className="reset-confirm-dialog__actions">
                <button ref={resetCancelRef} type="button" onClick={() => setResetDialogOpen(false)}>{copy.written.cancelReset}</button>
                <button
                  className="reset-confirm-dialog__accept"
                  type="button"
                  onClick={() => {
                    emitLearnvEvent("learnv:written-reset");
                    setWrittenSimulatorStarted(false);
                    setResetDialogOpen(false);
                  }}
                >{copy.written.confirmReset}</button>
              </div>
            </section>
          </div>
        ) : null,
      document.body,
    )}
  </>;
}
