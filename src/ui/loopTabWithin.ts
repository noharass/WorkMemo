import type { KeyboardEvent } from "react";

/** Complete Ant Design's focus lock at Edge's browser-chrome Tab boundary. */
export function loopTabWithin(event: KeyboardEvent<HTMLElement>) {
  if (event.defaultPrevented || event.key !== "Tab") return;
  const controls = [...event.currentTarget.querySelectorAll<HTMLElement>(
    "button, input, textarea, select, a[href], [tabindex]",
  )].filter(element => element.tabIndex >= 0 && !element.matches(":disabled")
    && !element.closest("[inert]") && element.getClientRects().length > 0);
  const first = controls[0], last = controls[controls.length - 1];
  const target = event.shiftKey && document.activeElement === first ? last
    : !event.shiftKey && document.activeElement === last ? first : null;
  if (target) {
    event.preventDefault();
    target.focus({ preventScroll: true });
  }
}
