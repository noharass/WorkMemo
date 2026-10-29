import { Drawer, type DrawerProps } from "antd";
import { useMediaQuery } from "./UiProvider";

/** Ant Design owns motion, focus registration and scroll locking. */
export function BottomSheet({
  blocked = false,
  covered = false,
  ...props
}: DrawerProps & { blocked?: boolean; covered?: boolean }) {
  const narrow = useMediaQuery("(max-width: 640px)");
  // Percentages follow the fixed overlay's visible height, including CSS/browser zoom.
  return (
    <Drawer
      {...props}
      placement="bottom"
      size={narrow ? "92%" : "min(760px, 88%)"}
      rootClassName="dc-sheet-root"
      className="dc-sheet"
      destroyOnHidden={false}
      push={false}
      mask={{ closable: false }}
      keyboard={!blocked}
      focusable={{ trap: !covered, focusTriggerAfterClose: true }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        // Ant Design 6.6's focus lock handles DOM focus changes, but Edge can move
        // Tab from the final control into browser chrome without a focusin event.
        // Complete that boundary through the official Drawer's keyboard hook.
        if (covered || event.defaultPrevented || event.key !== "Tab") return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            "button, input, textarea, select, a[href], [tabindex]",
          ),
        ].filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            !element.closest("[inert]") &&
            element.getClientRects().length > 0,
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        const target =
          event.shiftKey && document.activeElement === first
            ? last
            : !event.shiftKey && document.activeElement === last
              ? first
              : null;
        if (target) {
          event.preventDefault();
          target.focus({ preventScroll: true });
        }
      }}
      closable={{
        disabled: blocked,
        placement: "end",
        "aria-label": "关闭工作详情",
      }}
      styles={{
        wrapper: {
          width: narrow ? "100%" : "min(760px, calc(100% - 48px))",
          marginInline: "auto",
          insetInline: 0,
          bottom: narrow ? 0 : 24,
          borderRadius: narrow ? "20px 20px 0 0" : 20,
          overflow: "hidden",
        },
        section: {
          borderRadius: narrow ? "20px 20px 0 0" : 20,
          overflow: "hidden",
          boxShadow: "0 24px 90px #173c2b30",
        },
        header: { padding: "20px 24px", flexShrink: 0 },
        body: {
          padding: "22px 24px",
          overscrollBehavior: "contain",
          overflowY: blocked ? "hidden" : "auto",
        },
        footer: { flexShrink: 0, background: "#fff" },
        mask: {
          background: "rgb(20 38 30 / 30%)",
          backdropFilter: "blur(3px)",
        },
      }}
    />
  );
}
