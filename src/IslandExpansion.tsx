import CSSMotion from "@rc-component/motion";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function IslandExpansion({ open, children, onCollapsed, onError }: {
  open: boolean; children: ReactNode; onCollapsed: () => void; onError: (error: string) => void;
}) {
  const [maximum, setMaximum] = useState(364);
  const [reduced, setReduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const container = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!isTauri()) return;
    const update = () => { void invoke<number>("get_island_viewport").then(height => setMaximum(Math.max(0, height - 56))).catch(e => onError(String(e))); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [onError]);
  useEffect(() => {
    if (isTauri() && open) void invoke("hold_island", { holding: true }).catch(e => onError(String(e)));
  }, [open, onError]);
  useEffect(() => {
    const measure = () => setContentHeight(Math.min(content.current?.scrollHeight ?? 0, maximum));
    const observer = new ResizeObserver(measure);
    if (content.current) observer.observe(content.current);
    measure();
    return () => observer.disconnect();
  }, [maximum, open]);
  useEffect(() => {
    if (!isTauri() || !container.current) return;
    let stopped = false, sending = false;
    let next: number | null = null;
    const send = async () => {
      if (sending || stopped) return;
      sending = true;
      while (next !== null && !stopped) {
        const height = next; next = null;
        try { await invoke("set_island_region", { height }); }
        catch (e) { if (!stopped) onError(String(e)); }
      }
      sending = false;
    };
    const observer = new ResizeObserver(() => {
      next = Math.min(maximum + 56, Math.max(56, (container.current?.getBoundingClientRect().height ?? 0) + 56));
      void send();
    });
    observer.observe(container.current);
    return () => { stopped = true; observer.disconnect(); };
  }, [maximum, onError]);
  const measured = (element: HTMLElement) => Math.min(element.scrollHeight, maximum);
  return <CSSMotion visible={open} motionName="island-reveal" motionAppear={!reduced} motionEnter={!reduced} motionLeave={!reduced}
    removeOnLeave={false} motionDeadline={260}
    onAppearStart={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onEnterStart={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onAppearActive={element => ({ height: measured(element), opacity: 1, transform: "translateY(0)" })}
    onEnterActive={element => ({ height: measured(element), opacity: 1, transform: "translateY(0)" })}
    onLeaveStart={element => ({ height: element.getBoundingClientRect().height, opacity: 1, transform: "translateY(0)" })}
    onLeaveActive={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onVisibleChanged={visible => {
      if (!visible && !openRef.current) {
        if (isTauri()) void invoke("set_island_region", { height: 56 })
          .then(() => { if (!openRef.current) return invoke("hold_island", { holding: false }); })
          .catch(e => onError(String(e)));
        onCollapsed();
      }
    }}>
    {({ className, style }, ref) => <div ref={node => {
      container.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }}
      className={`island-expansion ${className || ""}`} style={{ height: open ? contentHeight : 0, maxHeight: maximum, ...style }} aria-hidden={!open} inert={!open}>
      <div className="island-expansion-content" ref={content}>{children}</div>
    </div>}
  </CSSMotion>;
}
