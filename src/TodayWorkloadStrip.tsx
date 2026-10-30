import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useCategoryNames } from "./categoryNames";
import { Icon } from "./Icon";
import { workloadLabel, type TodayWorkload } from "./workload";

export function TodayWorkloadStrip({ items, error, onOpen }: {
  items: TodayWorkload[] | null; error: string; onOpen: () => void;
}) {
  const { name } = useCategoryNames();
  const viewport = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);
  const text = error ? "工作量暂不可用" : items === null ? "正在读取今日工作量…" : items.length ? items.map(item => {
    const label = workloadLabel(item);
    return `${name(item.category)} ${label.main}${label.pending ? `（${label.pending}）` : ""}`;
  }).join("  ·  ") : "今天还没有工作记录";
  useLayoutEffect(() => {
    const measure = () => {
      if (viewport.current && content.current) {
        setDistance(content.current.scrollWidth > viewport.current.clientWidth + 1
          ? content.current.scrollWidth + 32 : 0);
      }
    };
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    if (content.current) observer.observe(content.current);
    measure();
    return () => observer.disconnect();
  }, [text]);
  return <button type="button" className="today-strip" aria-label={`打开当天工作量详情：${text}`} title={error || "点击查看当天全部工作详情"} onClick={onOpen}
    onKeyDown={event => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        viewport.current?.scrollBy({ left: event.key === "ArrowLeft" ? -100 : 100 });
      }
    }}>
    <span className="today-strip-label"><Icon name="chart" />今日工作量</span>
    <span className="today-strip-viewport" ref={viewport}>
      <span className={`today-strip-track${distance ? " is-scrolling" : ""}`} style={{ "--scroll-distance": `${distance}px`, "--scroll-duration": `${Math.max(12, distance / 28)}s` } as CSSProperties}>
        <span ref={content}>{text}</span>
        {distance > 0 && <span aria-hidden="true">{text}</span>}
      </span>
    </span>
    <Icon name="right" />
  </button>;
}
