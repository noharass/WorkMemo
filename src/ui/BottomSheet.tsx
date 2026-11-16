import { Drawer, type DrawerProps } from "antd";
import { useMediaQuery } from "./UiProvider";
import { loopTabWithin } from "./loopTabWithin";

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
      size={narrow ? "calc(100% - 24px)" : "min(760px, 88%)"}
      rootClassName="dc-sheet-root"
      className="dc-sheet"
      destroyOnHidden={false}
      push={false}
      mask={{ closable: false }}
      keyboard={!blocked}
      focusable={{ trap: !covered, focusTriggerAfterClose: true }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (!covered) loopTabWithin(event);
      }}
      closable={{
        disabled: blocked,
        placement: "end",
        "aria-label": "关闭工作详情",
      }}
      styles={{
        wrapper: {
          width: narrow ? "calc(100% - 24px)" : "min(760px, calc(100% - 48px))",
          marginInline: "auto",
          marginBlock: "auto",
          insetInline: 0,
          insetBlock: 0,
          borderRadius: 20,
          overflow: "hidden",
        },
        section: {
          background: "#fafdfa",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 90px #173c2b30",
        },
        header: { padding: "20px 24px", flexShrink: 0 },
        body: {
          padding: "22px 24px",
          overscrollBehavior: "contain",
          overflowY: "auto",
        },
        footer: { flexShrink: 0, background: "rgb(255 255 255 / 38%)" },
        mask: {
          background: "rgb(20 38 30 / 30%)",
        },
      }}
    />
  );
}
