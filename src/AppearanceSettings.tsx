import type { PresentationController } from "./desktopPreferences";
import { Surface, useDraft } from "./Drafts";
import {
  MAX_OPACITY,
  MIN_OPACITY,
  THEME_IDS,
  THEMES,
  themeStyle,
} from "./themes";
import type { AppearanceController } from "./useAppearance";

export function AppearanceSettings({
  appearance,
  presentation,
  onClose = appearance.cancel,
}: {
  appearance: AppearanceController;
  presentation: PresentationController;
  onClose?: () => void;
}) {
  const busy = appearance.saving || presentation.busy;
  async function save() {
    if (busy) return false;
    if (
      JSON.stringify(appearance.current) !== JSON.stringify(appearance.saved) &&
      !(await appearance.save())
    )
      return false;
    if (presentation.dirty && !(await presentation.save())) return false;
    return true;
  }
  function cancel() {
    appearance.cancel();
    presentation.cancel();
  }
  useDraft(
    "appearance",
    JSON.stringify(appearance.current) !== JSON.stringify(appearance.saved) ||
      presentation.dirty,
    busy,
    save,
    cancel,
  );
  return (
    <Surface
      title="外观设置"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={cancel}
          >
            取消预览
          </button>
          <button
            type="button"
            disabled={!appearance.native || busy || !presentation.loaded}
            onClick={() => {
              void save();
            }}
          >
            {busy ? "正在保存…" : "保存外观"}
          </button>
        </>
      }
    >
      <p className="hint">即时预览，保存后下次沿用。</p>
      <fieldset disabled={busy} className="theme-fieldset">
        <legend>选择皮肤</legend>
        <div className="theme-grid grid grid-cols-2 gap-3">
          {THEME_IDS.map((id) => (
            <button
              type="button"
              key={id}
              className="theme-choice"
              aria-pressed={appearance.current.theme === id}
              style={themeStyle({
                version: 1,
                theme: id,
                opacity: THEMES[id].defaultOpacity,
              })}
              onClick={() => appearance.selectTheme(id)}
            >
              <span className="theme-sample" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="theme-label">
                <strong>{THEMES[id].name}</strong>
                <span>
                  {appearance.current.theme === id ? "✓ " : ""}
                  {THEMES[id].description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="opacity-heading">
        <label htmlFor="appearance-opacity">背景不透明度</label>
        <output htmlFor="appearance-opacity">
          {appearance.current.opacity}%
        </output>
      </div>
      <input
        id="appearance-opacity"
        className="opacity-slider"
        type="range"
        min={MIN_OPACITY}
        max={MAX_OPACITY}
        step={1}
        value={appearance.current.opacity}
        disabled={busy}
        onChange={(event) =>
          appearance.changeOpacity(Number(event.target.value))
        }
      />
      <div className="opacity-scale">
        <span>更通透</span>
        <span>更实</span>
      </div>
      <button
        type="button"
        className="text-button reset-opacity"
        disabled={busy}
        onClick={appearance.resetOpacity}
      >
        恢复 {THEMES[appearance.current.theme].name} 默认透明度
      </button>
      <p className="hint">
        只调节背景，文字和按钮保持清晰。切换皮肤时会应用该皮肤的默认值。
      </p>
      <section className="background-settings">
        <h3>图片背景</h3>
        <p className="hint">
          图片用于主窗口与二级窗口，状态岛保持类别配色。支持PNG、JPEG、WebP，最多10
          MiB、1600万像素。
        </p>
        <div className="data-buttons">
          <button
            type="button"
            className="secondary"
            disabled={busy || !appearance.native}
            onClick={() => {
              void presentation.importImage();
            }}
          >
            {presentation.current.background ? "更换图片…" : "选择图片…"}
          </button>
          {presentation.current.background && (
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => presentation.setBackground(null)}
            >
              移除背景
            </button>
          )}
        </div>
        {presentation.current.background && (
          <label>
            图片透明度：{presentation.current.background.opacity}%
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              disabled={busy}
              value={presentation.current.background.opacity}
              onChange={(e) => {
                const bg = presentation.current.background;
                if (bg)
                  presentation.setBackground({
                    ...bg,
                    opacity: Number(e.target.value),
                  });
              }}
            />
          </label>
        )}
      </section>
      {presentation.error && (
        <p className="error-banner" role="alert">
          {presentation.error}
        </p>
      )}
      {!appearance.native && (
        <p className="notice">浏览器仅预览，不能保存桌面设置。</p>
      )}
      {appearance.loadError && (
        <p className="notice">原外观设置读取失败，当前为临时预览。</p>
      )}
      {appearance.saveError && (
        <p className="error-banner" role="alert">
          {appearance.saveError}
        </p>
      )}
    </Surface>
  );
}
