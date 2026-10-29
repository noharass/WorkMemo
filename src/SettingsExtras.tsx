import { CategoryNamesEditor } from "./CategoryNamesEditor";
import { useCategoryNames } from "./categoryNames";
import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { Surface, useDraft } from "./Drafts";
import { Icon } from "./Icon";
import { CATEGORIES } from "./types";
import {
  DEFAULT_LAYOUT,
  useLayout,
  WORK_ICONS,
  WorkBadge,
  type LayoutSettings,
  type PresentationController,
} from "./desktopPreferences";
const iconLabels: Record<string, string> = {
  checkSquare: "检查",
  safety: "盾牌",
  code: "代码",
  note: "文档",
  search: "搜索",
  chart: "图表",
  list: "清单",
  clock: "时钟",
  star: "星标",
  rocket: "火箭",
  bulb: "灵感",
  tool: "工具",
  read: "阅读",
  check: "完成",
  home: "主页",
  settings: "设置",
};
export function VisualSettings({
  presentation,
}: {
  presentation: PresentationController;
}) {
  const { name } = useCategoryNames();
  const { current, setVisual } = presentation;
  const compact = useLayout().current.density === "compact";
  useDraft(
    "category-visuals",
    presentation.dirty,
    presentation.busy,
    presentation.save,
    presentation.cancel,
  );
  return (
    <Surface
      title="工作名称、图标与颜色"
      actions={
        <>
          <button
            className="secondary"
            disabled={presentation.busy}
            onClick={presentation.cancel}
          >
            取消预览
          </button>
          <button
            disabled={presentation.busy || !presentation.loaded || !isTauri()}
            onClick={() => {
              void presentation.save();
            }}
          >
            保存工作外观
          </button>
        </>
      }
    >
      <p className="hint">
        同一类别在主页、状态岛和数据中心使用相同的图标与颜色。
      </p>
      <CategoryNamesEditor />
      {CATEGORIES.map((category) => {
        const visual = current.categories[category];
        return (
          <fieldset key={category} className="visual-category">
            <legend>
              <WorkBadge category={category} presentation={current} />
            </legend>
            <label className="color-field">
              类别颜色
              <input
                aria-label={`${name(category)}颜色`}
                type="color"
                value={visual.color}
                disabled={presentation.busy}
                onChange={(e) =>
                  setVisual(category, { ...visual, color: e.target.value })
                }
              />
              <span>{visual.color}</span>
            </label>
            <details open={!compact}>
              <summary>选择图标：{iconLabels[visual.icon]}</summary>
              <div className="icon-picker">
                {WORK_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    title={iconLabels[icon]}
                    aria-label={`${name(category)}使用${iconLabels[icon]}图标`}
                    aria-pressed={visual.icon === icon}
                    className="secondary"
                    disabled={presentation.busy}
                    onClick={() => setVisual(category, { ...visual, icon })}
                  >
                    <Icon name={icon} />
                  </button>
                ))}
              </div>
            </details>
          </fieldset>
        );
      })}
      {presentation.error && (
        <p className="error-banner" role="alert">
          {presentation.error}
        </p>
      )}
    </Surface>
  );
}
export function LayoutPanel() {
  const layout = useLayout();
  const [current, setCurrent] = useState(DEFAULT_LAYOUT);
  const [saved, setSaved] = useState(DEFAULT_LAYOUT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(current) !== JSON.stringify(saved);
  useEffect(() => {
    if (layout.loaded && !dirty && !busy) {
      setCurrent(layout.current);
      setSaved(layout.current);
    }
  }, [layout.current, layout.loaded]);
  async function save() {
    if (busy) return false;
    setBusy(true);
    setError("");
    try {
      const result = await invoke<LayoutSettings>("set_layout_options", {
        input: {
          density: current.density,
          sound_enabled: current.sound_enabled,
          font_size: current.font_size,
          font_weight: current.font_weight,
          line_spacing: current.line_spacing,
          expected_revision: saved.revision,
        },
      });
      setSaved(result);
      setCurrent(result);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  useDraft("layout", dirty, busy, save, () => {
    setCurrent(saved);
    setError("");
  });
  function field<K extends keyof LayoutSettings>(
    name: K,
    value: LayoutSettings[K],
  ) {
    setCurrent((p) => ({ ...p, [name]: value }));
  }
  return (
    <Surface
      title="布局与字体"
      actions={
        <button
          disabled={busy || !layout.loaded || !isTauri()}
          onClick={() => {
            void save();
          }}
        >
          保存布局
        </button>
      }
    >
      <div className="layout-form">
        <label className="monitor-toggle"><input type="checkbox" checked={current.sound_enabled} disabled={busy} onChange={e => field("sound_enabled", e.target.checked)}/>关键状态提示音</label>
        <button type="button" className="secondary" disabled={!isTauri() || busy} onClick={() => { void invoke("preview_sound").catch(e => setError(String(e))); }}>试听提示音</button>
        <label>
          界面模式
          <select
            disabled={busy}
            value={current.density}
            onChange={(e) =>
              field("density", e.target.value as LayoutSettings["density"])
            }
          >
            <option value="comfortable">舒展 · 完整信息</option>
            <option value="compact">紧凑 · 极简信息</option>
          </select>
        </label>
        <p className="hint">
          紧凑模式让主窗口成为小计时器，二级页面默认折叠辅助内容；错误与恢复提醒始终可见。
        </p>
        <label>
          正文字号：{current.font_size}px
          <input
            type="range"
            min={12}
            max={18}
            step={1}
            value={current.font_size}
            disabled={busy}
            onChange={(e) => field("font_size", Number(e.target.value))}
          />
        </label>
        <label>
          文字粗细
          <select
            disabled={busy}
            value={current.font_weight}
            onChange={(e) => field("font_weight", Number(e.target.value))}
          >
            {[
              [400, "常规"],
              [500, "中等"],
              [600, "半粗"],
              [700, "加粗"],
            ].map(([v, n]) => (
              <option value={v} key={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          行距
          <select
            disabled={busy}
            value={current.line_spacing}
            onChange={(e) =>
              field(
                "line_spacing",
                e.target.value as LayoutSettings["line_spacing"],
              )
            }
          >
            <option value="tight">紧密</option>
            <option value="standard">标准</option>
            <option value="loose">宽松</option>
          </select>
        </label>
        <div
          className="font-preview"
          style={{
            fontSize: current.font_size,
            fontWeight: current.font_weight,
            lineHeight: { tight: 1.35, standard: 1.6, loose: 1.85 }[
              current.line_spacing
            ],
          }}
        >
          把注意力留给手上的事。
          <br />
          计时、类别和操作，清楚就好。
        </div>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void invoke("reset_window_layout")
              .then(() => invoke<LayoutSettings>("get_layout_settings"))
              .then((result) => {
                setCurrent(result);
                setSaved(result);
                void layout.reload();
              })
              .catch((e) => setError(String(e)))
              .finally(() => setBusy(false));
          }}
        >
          恢复所有窗口默认布局
        </button>
      </div>
      {(error || layout.error) && (
        <p className="error-banner" role="alert">
          {error || layout.error}
        </p>
      )}
    </Surface>
  );
}
