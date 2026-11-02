import { memo, useEffect, useMemo, useRef } from "react";
import { init, use as registerCharts, type ECharts } from "echarts/core";
import { BarChart, LineChart, HeatmapChart, PieChart } from "echarts/charts";
import { Button, Empty } from "antd";
import { durationSlices } from "./durationPie";
import { formatDuration } from "../types";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import type { Data } from "./api";
import type { Presentation } from "../desktopPreferences";
import { localDate } from "../history";
import { useCategoryNames } from "../categoryNames";
import { useMediaQuery } from "../ui/UiProvider";

registerCharts([
  BarChart,
  LineChart,
  HeatmapChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
  CanvasRenderer,
]);
const tooltip = {
  renderMode: "richText" as const,
  backgroundColor: "#fff",
  borderColor: "#dce6df",
  textStyle: { color: "#243c33" },
};

const Chart = memo(function Chart({
  option,
  label,
  onCategory,
}: {
  option: EChartsOption;
  label: string;
  onCategory?: (name: string) => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const chart = useRef<ECharts | null>(null);
  const click = useRef(onCategory);
  click.current = onCategory;
  useEffect(() => {
    if (!node.current) return;
    const instance = init(node.current, undefined, { renderer: "canvas" });
    chart.current = instance;
    instance.on("click", (p) => {
      if (typeof p.name === "string") click.current?.(p.name);
    });
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const host = node.current;
        if (
          host &&
          (instance.getWidth() !== host.clientWidth ||
            instance.getHeight() !== host.clientHeight)
        )
          instance.resize();
      });
    });
    observer.observe(node.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      instance.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    // Merge named series; a poll must not replace the whole chart or replay its entrance.
    chart.current?.setOption(option, {
      replaceMerge: ["series"],
      lazyUpdate: true,
    });
  }, [option]);
  return <div ref={node} className="dc-chart" role="img" aria-label={label} />;
});

export function TrendChart({ trend, range }: Pick<Data, "trend" | "range">) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(
    () => ({
      animation: !reduced,
      animationDuration: 240,
      animationDurationUpdate: 160,
      tooltip: {
        ...tooltip,
        trigger: "axis",
        valueFormatter: (value: unknown) =>
          `${Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 4 })} 小时`,
      },
      legend: { top: 0, right: 16, data: ["有效工时"] },
      grid: { left: 22, right: 24, top: 64, bottom: 20, containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: trend.map((x) => x.date),
        axisLine: { lineStyle: { color: "#dce7e0" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#718078",
          hideOverlap: true,
          showMinLabel: true,
          showMaxLabel: true,
          formatter: (value: string) =>
            range.trend_unit === "hour" ? value : value.slice(5),
        },
      },
      yAxis: {
        type: "value",
        name: "小时",
        min: 0,
        axisLabel: { color: "#718078" },
        splitLine: { lineStyle: { color: "#edf2ef", type: "dashed" } },
      },
      series: [
        {
          id: "work-duration",
          name: "有效工时",
          type: "line",
          smooth: false,
          symbolSize: 5,
          data: trend.map((x) => x.duration_ms / 3600000),
          lineStyle: { width: 2.5, color: "#287b63" },
          itemStyle: { color: "#287b63" },
          areaStyle: { color: "#eaf3ee", opacity: 0.7 },
        },
      ],
    }),
    [trend, range, reduced],
  );
  return <Chart option={option} label="有效工时趋势" />;
}

export function CategoryChart({
  categories,
  presentation,
  metric,
  onCategory,
}: {
  categories: Data["categories"];
  presentation: Presentation;
  metric: string;
  onCategory: (name: string) => void;
}) {
  const { name } = useCategoryNames();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(
    () => ({
      animation: !reduced,
      animationDuration: 240,
      animationDurationUpdate: 160,
      tooltip: { ...tooltip, trigger: "axis" },
      grid: { left: 12, right: 22, top: 25, bottom: 28, containLabel: true },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#eef2f0" } } },
      yAxis: {
        type: "category",
        data: categories.map((x) => name(x.category)),
        axisLabel: { width: 100, overflow: "truncate" },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          id: "category-total",
          type: "bar",
          barMaxWidth: 24,
          data: categories.map((x) => ({
            name: name(x.category),
            value:
              metric === "duration"
                ? Number((x.duration_ms / 3600000).toFixed(2))
                : x.quantity,
            itemStyle: {
              color: presentation.categories[x.category]?.color,
              borderRadius: [0, 5, 5, 0],
            },
          })),
        },
      ],
    }),
    [categories, presentation, metric, name, reduced],
  );
  return (
    <Chart
      option={option}
      label="按类别汇总的工作分布"
      onCategory={onCategory}
    />
  );
}

export function DurationPieChart({ categories, presentation, onCategory }: {
  categories: Data["categories"];
  presentation: Presentation;
  onCategory: (category: string) => void;
}) {
  const { name } = useCategoryNames();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const slices = useMemo(() => durationSlices(categories), [categories]);
  const option = useMemo<EChartsOption>(() => ({
    animation: !reduced,
    animationDuration: 240,
    animationDurationUpdate: 160,
    tooltip: {
      ...tooltip, trigger: "item",
      formatter: params => {
        const point = Array.isArray(params) ? params[0] : params;
        const slice = slices.find(row => row.category === point.name);
        return slice ? `${name(slice.category)}\n${formatDuration(slice.value / 1000)} · ${slice.percentLabel}` : "";
      },
    },
    series: [{
      id: "category-duration-share", type: "pie", radius: "78%", center: ["50%", "50%"],
      stillShowZeroSum: false,
      label: { show: false },
      emphasis: { scaleSize: 4 },
      data: slices.map(slice => ({
        name: slice.category, value: slice.value,
        itemStyle: { color: presentation.categories[slice.category]?.color },
      })),
    }],
  }), [slices, name, presentation, reduced]);
  if (!slices.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无有效工时" />;
  return <>
    <Chart option={option} label="按类别汇总的工时占比" onCategory={onCategory} />
    <ul className="dc-pie-legend" aria-label="工时占比明细">
      {slices.map(slice => <li key={slice.category}>
        <Button type="text" style={{ width: "100%" }} onClick={() => onCategory(slice.category)} aria-label={`${name(slice.category)}：${formatDuration(slice.value / 1000)}，${slice.percentLabel}，筛选此类别`}>
          <i aria-hidden="true" style={{ background: presentation.categories[slice.category]?.color }} />
          <span className="dc-pie-name" title={name(slice.category)}>{name(slice.category)}</span>
          <span className="dc-pie-value">{slice.percentLabel}</span>
        </Button>
      </li>)}
    </ul>
  </>;
}

export function CalendarChart({
  calendar,
  range,
}: Pick<Data, "calendar" | "range">) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(() => {
    const end = range.end_date ?? localDate(new Date());
    const start = new Date(`${end}T12:00:00`);
    start.setDate(start.getDate() - 89);
    const startDate =
      range.start_date && range.start_date > localDate(start)
        ? range.start_date
        : localDate(start);
    const max = Math.max(1, ...calendar.map((v) => v[1]));
    return {
      animation: !reduced,
      tooltip: {
        ...tooltip,
        formatter: (p: unknown) => {
          const point = (p as { value?: [string, number] }).value;
          return point
            ? `${point[0]}  ${(point[1] / 3600000).toFixed(2)} 小时`
            : "";
        },
      },
      visualMap: {
        type: "piecewise",
        show: false,
        pieces: [
          { value: 0, color: "#ebedf0" },
          ...["#9be9a8", "#40c463", "#30a14e", "#216e39"].map((color, i) => ({
            gt: (i * max) / 4,
            lte: ((i + 1) * max) / 4,
            color,
          })),
        ],
      },
      calendar: {
        range: [startDate, end],
        cellSize: [16, 16],
        left: "center",
        top: 32,
        yearLabel: { show: false },
        monthLabel: { nameMap: "cn", color: "#65796f" },
        dayLabel: { firstDay: 1, nameMap: "cn", color: "#718078" },
        splitLine: { lineStyle: { color: "#dce6df" } },
        itemStyle: { borderWidth: 3, borderColor: "#fff", color: "#ebedf0" },
      },
      series: [
        {
          id: "work-calendar",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: calendar,
        },
      ],
    };
  }, [calendar, range, reduced]);
  return <Chart option={option} label="筛选范围内的有效工时工作日历" />;
}
