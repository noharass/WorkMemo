import { Icon } from "./Icon";
import { useEffect, useRef } from "react";
import { MAX_OPACITY, MIN_OPACITY, THEME_IDS, THEMES, themeStyle } from "./themes";
import type { AppearanceController } from "./useAppearance";

export function AppearanceSettings({ appearance }: { appearance: AppearanceController }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (appearance.open && !element.open) element.showModal();
    if (!appearance.open && element.open) element.close();
  }, [appearance.open]);

  return (
    <dialog ref={dialog} className="appearance-dialog" aria-labelledby="appearance-title"
      onCancel={(event) => { event.preventDefault(); appearance.cancel(); }}>
      <div className="settings-heading">
        <h2 id="appearance-title">外观设置</h2>
        <button type="button" className="window-control" aria-label="取消预览并关闭外观设置"
          disabled={appearance.saving} onClick={appearance.cancel}><Icon name="close" /></button>
      </div>
      <p className="hint">即时预览，保存后下次沿用。</p>
      <fieldset disabled={appearance.saving} className="theme-fieldset">
        <legend>选择皮肤</legend>
        <div className="theme-grid grid grid-cols-2 gap-3">
          {THEME_IDS.map((id) => <button type="button" key={id}
            className="theme-choice" aria-pressed={appearance.current.theme === id}
            style={themeStyle({ version: 1, theme: id, opacity: THEMES[id].defaultOpacity })}
            onClick={() => appearance.selectTheme(id)}>
            <span className="theme-sample" aria-hidden="true"><span /><span /><span /></span>
            <span className="theme-label"><strong>{THEMES[id].name}</strong>
              <span>{appearance.current.theme === id ? "✓ " : ""}{THEMES[id].description}</span></span>
          </button>)}
        </div>
      </fieldset>
      <div className="opacity-heading">
        <label htmlFor="appearance-opacity">背景不透明度</label>
        <output htmlFor="appearance-opacity">{appearance.current.opacity}%</output>
      </div>
      <input id="appearance-opacity" className="opacity-slider" type="range" min={MIN_OPACITY} max={MAX_OPACITY}
        step={1} value={appearance.current.opacity} disabled={appearance.saving}
        onChange={(event) => appearance.changeOpacity(Number(event.target.value))} />
      <div className="opacity-scale"><span>更通透</span><span>更实</span></div>
      <button type="button" className="text-button reset-opacity" disabled={appearance.saving}
        onClick={appearance.resetOpacity}>恢复 {THEMES[appearance.current.theme].name} 默认透明度</button>
      <p className="hint">只调节背景，文字和按钮保持清晰。切换皮肤时会应用该皮肤的默认值。</p>
      {!appearance.native && <p className="notice">浏览器仅预览，不能保存桌面设置。</p>}
      {appearance.loadError && <p className="notice">原外观设置读取失败，当前为临时预览。</p>}
      {appearance.saveError && <p className="error-banner" role="alert">{appearance.saveError}</p>}
      <div className="settings-actions grid grid-cols-2 gap-3">
        <button type="button" className="secondary" disabled={appearance.saving} onClick={appearance.cancel}>取消</button>
        <button type="button" disabled={!appearance.native || appearance.saving}
          onClick={() => { void appearance.save(); }}>{appearance.saving ? "正在保存…" : "保存外观"}</button>
      </div>
    </dialog>
  );
}
