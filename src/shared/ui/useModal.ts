import { useLayoutEffect, useRef, type RefObject } from "react";

const FOCUSABLE = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]';

type ModalOptions = {
  open: boolean;
  onClose: () => void;
  /** Container whose controls form the focus loop. */
  dialogRef: RefObject<HTMLElement | null>;
  /** Receives focus on open (usually the close button). Falls back to the first control. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Gets focus back on close. Defaults to the element focused when the dialog opened. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Escape closes unless false (e.g. while a destructive confirmation is pending). */
  closeOnEscape?: boolean;
  /** Make #root inert. Only valid when the dialog is portalled outside #root. */
  inertRoot?: boolean;
};

/**
 * Shared modal behaviour: the app behind becomes `inert`, page scroll is locked, Tab stays
 * inside the dialog, Escape closes it, and focus returns to whatever opened it.
 */
export function useModal({ open, onClose, dialogRef, initialFocusRef, returnFocusRef, closeOnEscape = true, inertRoot = true }: ModalOptions) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    if (!open) return;
    // iOS Safari does not focus tapped buttons, so prefer an explicit trigger when given.
    const opener = returnFocusRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const root = inertRoot ? document.getElementById("root") : null;
    const wasInert = root?.hasAttribute("inert");
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    root?.setAttribute("inert", "");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const controls = () => [...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
      .filter((element) => element.getClientRects().length > 0 && element.tabIndex >= 0);
    (initialFocusRef?.current ?? controls()[0])?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === "Escape" && closeOnEscape) { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (!wasInert) root?.removeAttribute("inert");
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, dialogRef, initialFocusRef, returnFocusRef, closeOnEscape, inertRoot]);
}
