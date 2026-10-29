import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { invoke, isTauri, convertFileSrc } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { CATEGORIES, type Category } from "./types";
import { useCategoryNames } from "./categoryNames";
import { Icon, type IconName } from "./Icon";

export type CategoryVisual = { icon: IconName; color: string };
export type Background = { file: string; opacity: number };
export type Presentation = {
  version: 1;
  revision: number;
  categories: Record<string, CategoryVisual>;
  background: Background | null;
};
export const DEFAULT_PRESENTATION: Presentation = {
  version: 1,
  revision: 0,
  background: null,
  categories: Object.fromEntries(
    CATEGORIES.map((name, i) => [
      name,
      {
        icon: (["checkSquare", "safety", "code", "note"] as IconName[])[i],
        color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
      },
    ]),
  ),
};
export const WORK_ICONS: IconName[] = [
  "checkSquare",
  "safety",
  "code",
  "note",
  "search",
  "chart",
  "list",
  "clock",
  "star",
  "rocket",
  "bulb",
  "tool",
  "read",
  "check",
  "home",
  "settings",
];
export type LayoutSettings = {
  density: "compact" | "comfortable";
  revision: number;
  sound_enabled: boolean;
  sound_theme: "soft" | "crisp";
  font_size: number;
  font_weight: number;
  line_spacing: "tight" | "standard" | "loose";
};
export const DEFAULT_LAYOUT: LayoutSettings = {
  density: "comfortable",
  revision: 0,
  sound_enabled: true,
  sound_theme: "soft",
  font_size: 14,
  font_weight: 400,
  line_spacing: "standard",
};
export function layoutStyle(layout: LayoutSettings): CSSProperties {
  return {
    "--body-size": `${layout.font_size}px`,
    "--body-weight": layout.font_weight,
    "--body-line": { tight: 1.35, standard: 1.6, loose: 1.85 }[
      layout.line_spacing
    ],
  } as CSSProperties;
}
export function backgroundStyle(background: Background): CSSProperties {
  return {
    backgroundImage: `url("${convertFileSrc(background.file, "background")}")`,
    opacity: background.opacity / 100,
  };
}
export function WorkBadge({
  category,
  presentation,
  showName = true,
}: {
  category: string;
  presentation: Presentation;
  showName?: boolean;
}) {
  const { name } = useCategoryNames();
  const visual =
    presentation.categories[category] ??
    DEFAULT_PRESENTATION.categories["开发"];
  return (
    <span
      className="work-badge"
      style={{ "--work-color": visual.color } as CSSProperties}
    >
      <span className="work-symbol">
        <Icon name={visual.icon} />
      </span>
      {showName && <span>{name(category)}</span>}
    </span>
  );
}
export function useLayout() {
  const [current, setCurrent] = useState(DEFAULT_LAYOUT);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!isTauri());
  const reload = useCallback(async () => {
    if (!isTauri()) return;
    try {
      setCurrent(await invoke<LayoutSettings>("get_layout_settings"));
      setError("");
      setLoaded(true);
    } catch (e) {
      setError(String(e));
    }
  }, []);
  useEffect(() => {
    void reload();
    if (!isTauri()) return;
    const p = listen("workmemo:layout-changed", () => {
      void reload();
    });
    return () => {
      void p.then((f) => f()).catch(() => {});
    };
  }, [reload]);
  return { current, error, loaded, reload };
}
export function usePresentation() {
  const [current, setCurrent] = useState(DEFAULT_PRESENTATION);
  const [saved, setSaved] = useState(DEFAULT_PRESENTATION);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!isTauri());
  const saving = useRef(false);
  const state = useRef({ current, saved });
  state.current = { current, saved };
  const reload = useCallback(async () => {
    if (
      !isTauri() ||
      saving.current ||
      JSON.stringify(state.current.current) !==
        JSON.stringify(state.current.saved)
    )
      return;
    try {
      const p = await invoke<Presentation>("get_presentation");
      setSaved(p);
      setCurrent(p);
      setError("");
      setLoaded(true);
    } catch (e) {
      setError(String(e));
    }
  }, []);
  useEffect(() => {
    void reload();
    if (!isTauri()) return;
    const p = listen("workmemo:presentation-changed", () => {
      void reload();
    });
    return () => {
      void p.then((f) => f()).catch(() => {});
    };
  }, [reload]);
  async function save() {
    if (!isTauri() || saving.current) return false;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const p = await invoke<Presentation>("save_presentation", {
        settings: current,
      });
      setCurrent(p);
      setSaved(p);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  async function importImage() {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const bg = await invoke<Background | null>("import_background");
      if (bg) setCurrent((p) => ({ ...p, background: bg }));
    } catch (e) {
      setError(String(e));
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return {
    current,
    saved,
    busy,
    error,
    loaded,
    dirty: JSON.stringify(current) !== JSON.stringify(saved),
    save,
    reload,
    importImage,
    cancel: () => {
      if (!saving.current) {
        setCurrent(saved);
        setError("");
      }
    },
    setBackground: (background: Background | null) =>
      setCurrent((p) => ({ ...p, background })),
    setVisual: (category: Category | string, visual: CategoryVisual) =>
      setCurrent((p) => ({
        ...p,
        categories: { ...p.categories, [category]: visual },
      })),
  };
}
export type PresentationController = ReturnType<typeof usePresentation>;
export function useDashboard() {
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const last = useRef({ view: "all", scope: "real" });
  async function open(view = "all", scope = "real", defaultBrowser = false) {
    last.current = { view, scope };
    setError("");
    try {
      await invoke("open_dashboard", { view, scope, defaultBrowser });
      setUrl("");
    } catch (e) {
      setError(String(e));
      try {
        setUrl(await invoke<string>("get_dashboard_address", { view, scope }));
      } catch (f) {
        setError(String(f));
      }
    }
  }
  return {
    open,
    fallback: error && (
      <div className="error-banner" role="alert">
        <p>{error}</p>
        {url && (
          <>
            <input
              aria-label="本机数据中心地址"
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
            />
            <div className="data-buttons">
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(url)
                    .catch(() =>
                      setError("请选中上面的地址，按 Ctrl+C 复制。"),
                    );
                }}
              >
                复制地址
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  void open(last.current.view, last.current.scope, true);
                }}
              >
                使用默认浏览器
              </button>
            </div>
          </>
        )}
      </div>
    ),
  };
}
