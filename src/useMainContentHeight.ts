import { useEffect, useState, type RefObject } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";

/** Size the main window to natural content without changing its width or work state. */
export function useMainContentHeight(content: RefObject<HTMLElement | null>, ready: boolean) {
  const [error, setError] = useState("");
  useEffect(() => {
    if (!ready || !isTauri() || !content.current) return;
    const workspace = content.current;
    const frame = workspace.closest<HTMLElement>(".desktop-frame");
    const shell = frame?.querySelector<HTMLElement>(".app-shell");
    const header = frame?.querySelector<HTMLElement>(".titlebar");
    if (!frame || !shell || !header) return;
    let stopped = false, sending = false, scheduled = 0;
    let queued: number | null = null;
    let previous = 0;
    const send = async () => {
      if (sending) return;
      sending = true;
      while (queued !== null && !stopped) {
        const height = queued; queued = null;
        try { await invoke("fit_main_content", { height }); if (!stopped) setError(""); }
        catch (e) { if (!stopped) setError(`窗口高度未能调整：${String(e)}`); }
      }
      sending = false;
    };
    const measure = () => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(() => {
        const frameStyle = getComputedStyle(frame), shellStyle = getComputedStyle(shell);
        const windowError = frame.querySelector<HTMLElement>(".window-error");
        const errorStyle = windowError && getComputedStyle(windowError);
        const height = Math.ceil(workspace.getBoundingClientRect().height + header.getBoundingClientRect().height
          + parseFloat(frameStyle.paddingTop) + parseFloat(frameStyle.paddingBottom)
          + parseFloat(shellStyle.borderTopWidth) + parseFloat(shellStyle.borderBottomWidth)
          + (windowError ? windowError.getBoundingClientRect().height + parseFloat(errorStyle!.marginTop) + parseFloat(errorStyle!.marginBottom) : 0));
        if (Math.abs(height - previous) < 1) return;
        previous = height; queued = height;
        void send();
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(workspace); observer.observe(header);
    measure();
    return () => { stopped = true; cancelAnimationFrame(scheduled); observer.disconnect(); };
  }, [content, ready]);
  return error;
}
