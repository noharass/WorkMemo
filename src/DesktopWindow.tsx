import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

const DIRECTIONS = [
  "North", "NorthEast", "East", "SouthEast", "South", "SouthWest", "West", "NorthWest",
] as const;
type ResizeDirection = (typeof DIRECTIONS)[number];

/** Window controls stay outside the drag area; closing uses the save-on-close path. */
export function DesktopWindow({ children, appearanceStyle }: { children: ReactNode; appearanceStyle?: CSSProperties }) {
  const native = isTauri();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function control(action: "minimize" | "close") {
    if (!native || busy) return;
    setBusy(true);
    setError("");
    try {
      const window = getCurrentWindow();
      if (action === "close") await window.close(); else await window.minimize();
    } catch (cause: unknown) {
      setError(`${action === "close" ? "无法关闭窗口" : "无法最小化窗口"}：${String(cause)}`);
    } finally {
      setBusy(false);
    }
  }

  async function drag(event: MouseEvent, direction?: ResizeDirection) {
    if (!native || event.button !== 0 || busy) return;
    event.preventDefault();
    setError("");
    try {
      const window = getCurrentWindow();
      if (direction) await window.startResizeDragging(direction); else await window.startDragging();
    } catch (cause: unknown) {
      setError(`${direction ? "无法调整窗口大小" : "无法移动窗口"}：${String(cause)}`);
    }
  }

  return (
    <div className="desktop-frame" style={appearanceStyle}>
      <div className="app-shell">
        <header className="titlebar">
          <div className="titlebar-drag" title={native ? "按住这里移动窗口" : "请在桌面应用中移动窗口"}
            onMouseDown={(event) => { void drag(event); }}>
            <span className="brand-mark" aria-hidden="true">w.</span>
            <div>
              <span className="brand-name">WorkMemo</span>
              <span className="brand-caption">留住每一份投入</span>
            </div>
            <span className="drag-grip" aria-hidden="true">⠿</span>
          </div>
          <div className="window-controls" aria-label="窗口操作">
            <button type="button" className="window-control" aria-label="最小化窗口"
              title={native ? "最小化" : "仅桌面应用可用"} disabled={!native || busy}
              onClick={() => { void control("minimize"); }}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8.5h8" /></svg>
            </button>
            <button type="button" className="window-control window-close" aria-label="保存并关闭窗口"
              title={native ? "保存并关闭" : "仅桌面应用可用"} disabled={!native || busy}
              onClick={() => { void control("close"); }}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 4.5 7 7m0-7-7 7" /></svg>
            </button>
          </div>
        </header>
        {error && <div className="window-error" role="alert">{error}</div>}
        <div className="window-content">{children}</div>
      </div>
      {native && DIRECTIONS.map((direction) => (
        <div key={direction} className={`resize-handle resize-${direction}`} aria-hidden="true"
          onMouseDown={(event) => { void drag(event, direction); }} />
      ))}
    </div>
  );
}
