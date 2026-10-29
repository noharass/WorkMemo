import { App, ConfigProvider, type ThemeConfig } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const change = () => setMatches(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, [query]);
  return matches;
}

/** Shared Ant Design configuration; imported only by surfaces that opt into it. */
export function UiProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const theme = useMemo<ThemeConfig>(
    () => ({
      token: {
        colorPrimary: "#287b63",
        colorInfo: "#287b63",
        colorSuccess: "#287b63",
        colorText: "#243c33",
        colorTextSecondary: "#65796f",
        colorBgLayout: "#f4f7f5",
        colorBorder: "#dce6df",
        colorBorderSecondary: "#e9efeb",
        colorError: "#b74251",
        colorInfoBg: "#eef7f2",
        colorInfoBorder: "#cfe5d8",
        colorSuccessBg: "#edf7f0",
        colorSuccessBorder: "#cfe5d8",
        colorPrimaryBg: "#eaf3ee",
        fontFamily: '"Segoe UI", "Microsoft YaHei UI", sans-serif',
        fontSize: 14,
        borderRadius: 10,
        controlHeight: 38,
        motion: !reducedMotion,
        motionDurationMid: "0.18s",
        motionDurationSlow: "0.24s",
      },
      components: {
        Button: {
          primaryShadow: "none",
          defaultShadow: "none",
          fontWeight: 500,
        },
        Table: {
          headerBg: "#f6f9f7",
          headerColor: "#65796f",
          rowHoverBg: "#f7faf8",
          cellPaddingBlock: 16,
        },
        Drawer: { footerPaddingBlock: 16, footerPaddingInline: 24 },
        Menu: {
          collapsedWidth: 68,
          itemBorderRadius: 10,
          itemSelectedBg: "#eaf3ee",
        },
      },
    }),
    [reducedMotion],
  );
  return (
    <ConfigProvider
      prefixCls="wm"
      locale={zhCN}
      theme={theme}
      button={{ autoInsertSpace: false }}
    >
      <App className="wm-ui-root">{children}</App>
    </ConfigProvider>
  );
}
