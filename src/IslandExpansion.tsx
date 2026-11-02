import CSSMotion from "@rc-component/motion";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { islandRegionSync } from "./islandRegion";

export function IslandExpansion({ open, children, onCollapsed, onError }: {
  open: boolean; children: ReactNode; onCollapsed: () => void; onError: (error: string) => void;
}) {
  const [maximum, setMaximum] = useState(364);
  const [reduced, setReduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const region = useRef<ReturnType<typeof islandRegionSync> | null>(null);
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
    const measure = () => setContentHeight(Math.min(content?.scrollHeight ?? 0, maximum));
    const observer = new ResizeObserver(measure);
    if (content) observer.observe(content);
    measure();
    return () => observer.disconnect();
  }, [maximum, open, content]);
  useEffect(() => {
    if (!isTauri()) return;
    const sync = islandRegionSync(invoke, onError);
    region.current = sync;
    return () => { sync.dispose(); region.current = null; };
  }, [onError]);
  useEffect(() => {
    if (!container) return;
    const measure = () => {
      const height = Math.min(maximum + 56, Math.max(56, container.getBoundingClientRect().height + 56));
      // Keep held through the leave animation; release only at its endpoint.
      region.current?.update(height, openRef.current || height > 56.5);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container); measure();
    return () => observer.disconnect();
  }, [container, maximum, open]);
  const measured = (element: HTMLElement) => Math.min(element.scrollHeight, maximum);
  return <CSSMotion visible={open} motionName="island-reveal" motionAppear={!reduced} motionEnter={!reduced} motionLeave={!reduced}
    forceRender removeOnLeave={false} motionDeadline={260}
    onAppearStart={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onEnterStart={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onAppearActive={element => ({ height: measured(element), opacity: 1, transform: "translateY(0)" })}
    onEnterActive={element => ({ height: measured(element), opacity: 1, transform: "translateY(0)" })}
    onLeaveStart={element => ({ height: element.getBoundingClientRect().height, opacity: 1, transform: "translateY(0)" })}
    onLeaveActive={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onVisibleChanged={visible => {
      if (!visible && !openRef.current) {
        region.current?.update(56, false);
        onCollapsed();
      }
    }}>
    {({ className, style }, ref) => <div ref={node => {
      setContainer(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }}
      className={`island-expansion ${className || ""}`} style={{ height: open ? contentHeight : 0, maxHeight: maximum, ...style }} aria-hidden={!open} inert={!open}>
      <div className="island-expansion-content" ref={setContent}>{children}</div>
    </div>}
  </CSSMotion>;
}
