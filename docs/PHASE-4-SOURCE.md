# 第四阶段完整源码与配置

以下是本阶段变更源码、配置、测试与开发说明的完整内容，没有截断。完整依赖锁文件保留在 E:\WorkMemo\src-tauri\Cargo.lock。验收、截图及清单见 PHASE-4.md、PHASE-4-FILES.md。

## UPDATE — E:\WorkMemo\AGENTS.md

````
# WorkMemo 开发约束

- 开发前阅读 `docs/PRODUCT-SPEC.md`，这是用户提供的完整长期产品规范。
- 固定技术栈：Tauri 2、React、TypeScript、Vite、Rust、SQLite；保持轻量依赖。
- 优先级：数据可靠性 > 业务逻辑正确性 > 核心功能完整性 > 界面可用性 > 视觉精致度。
- 先检查实际文件、实现与启动状态，再制定最小改动；不覆盖可靠的已有功能。
- 按阶段开发，每阶段结束后总结并等待用户确认，不自动跨入下一阶段。
- 用户已确认进入第四阶段：四种预设皮肤、背景透明度调节与独立外观配置持久化。完成后等待确认，不自动进入下一阶段。
- 不使用虚构记录、统计数据或装饰性按钮，不把未完成的功能包装为可用功能。
- Rust 校验并持久化业务数据，使用 SQLite；外观设置与工作记录分开管理。
- 同时只能有一个活动任务；暂停不计时；重启必须处理未完成任务。
- 计时不能只靠前端逐秒累加，必须基于真实时间和状态。
- 原生透明与 Glass / Cream / Dark / Neon 四种皮肤是必需功能，CSS 透明不能代替原生验证。
- 权限仅授予当前功能确实需要的范围。
- 只有实际执行过的启动、构建和测试才能报告为通过。
- 中文交付包含目标、检查结果、完整路径及 NEW FILE / UPDATE、完整代码、PowerShell 命令、测试方法与预期、兼容性和 Git 命令。
- 完整代码保存在项目文件中，较长交付另提供完整源码清单，不能用省略号代替代码。
- 当前阶段进度见 `docs/PHASE-4.md`，已有阶段记录保留在 docs 中，启动方式见 `README.md`。

## GitHub 同步约定

- 用户已授权：每个明确完成的开发步骤或阶段，在完成适当检查并记录结果后，创建 Git 提交并推送到 `origin`；不需要重复询问是否推送。
- 本项目仓库为 `https://github.com/noharass/WorkMemo`，默认分支 `main`。修改远程地址、公开范围或进行破坏性操作需要新的明确授权。
- 提交身份只在当前仓库设置，使用用户提供的身份；不修改全局 Git 身份。
- 推送前检查暂存区，不提交依赖目录、构建产物、本地工作数据库、凭据或环境私密配置。
- 验收受限或未通过的项目必须如实记录。保存当前开发进度不代表相关功能已经验收通过。
- 不强制推送。远程有新提交时，先检查并安全整合，不能覆盖远程历史。
- 推送后比较本地提交和远程分支的提交标识，并检查工作区状态，确认同步结果。
- 认证、网络或冲突导致推送失败时，保留本地提交并明确报告，不声称已同步，也不将凭据写入文件或远程 URL。

````

## UPDATE — E:\WorkMemo\README.md

````
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前处于第四阶段：在 SQLite 工作记录、可靠计时与原生透明窗口基础上，提供 Glass、Cream、Dark、Neon 四种皮肤，以及背景不透明度调节和独立外观配置保存。支持开始、暂停、继续、结束、暂停后切换任务，以及未结束任务恢复为暂停。界面显示最近 5 条真实完成记录，并保留基础连接检查。
完整历史查询/删除与统计尚未实现。

## Windows 环境

- Node.js：使用与 Vite 兼容的版本，本机为 Node 24。
- Rust stable 的 x86_64-pc-windows-msvc 工具链。
- Visual Studio 2022 C++ Build Tools 和 Windows SDK。
- Microsoft Edge WebView2 Runtime。

安装工具链后重新打开 PowerShell，以刷新 PATH。
环境依据：https://v2.tauri.app/start/prerequisites/

## PowerShell 命令

```powershell
Set-Location 'E:\WorkMemo'
npm ci
npm run tauri dev
```

原生窗口应显示任务表单；基础连接检查折叠面板中的「重新检查」仍会调用 Rust。
标题栏左侧可拖动窗口；右侧提供最小化与保存关闭，输入区不参与拖动。拖动窗口边缘或四角可缩放，内容区可滚动。窗口保留任务栏入口，不强制置顶。
用户已在本机确认透明效果、文字可读性、移动、缩放和最小化恢复正常；其他实际验收结果见 docs/PHASE-3.md。
用户已确认保存关闭正常退出，正式版已在开发服务器关闭后独立启动并读取本地记录。

```powershell
npm run build
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
npm run test:themes
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm run tauri build -- --no-bundle
```

Release 可执行文件：E:\WorkMemo\src-tauri\target\release\workmemo.exe。
构建不生成安装包；正式安装包在后续阶段验收。当前阶段实际验证结果见 docs/PHASE-4.md。

`npm run dev` 仅为浏览器预览，不能证明原生能力，页面会明确提示预览模式。

## 文件关系

- src/：React 界面、表单、任务接口与轮询逻辑，不保存业务数据。
- src-tauri/src/database.rs：任务状态机、SQLite 校验与事务。
- src-tauri/src/clock.rs：单调时钟与实际日期时间。
- src-tauri/src/service.rs：Tauri 命令、后台检查点与关闭保存。
- src-tauri/migrations/：按 user_version 管理的数据库结构。
- src-tauri/tauri.conf.json：窗口、构建、安全配置。
- src-tauri/capabilities/：仅开放保存错误通知的事件订阅及移动、缩放、最小化、关闭所需窗口权限，不向界面开放文件系统或 SQL。
- src/DesktopWindow.tsx：自定义标题栏、窗口控制和边缘缩放，关闭使用 Tauri close 保留保存事件。
- src/themes.ts：四种皮肤的完整设计令牌；src/useAppearance.ts：预览、取消、加载和保存状态。
- src/AppearanceSettings.tsx：外观选择、滑块及保存面板；src-tauri/src/appearance.rs：独立配置校验与文件保存。
- docs/PRODUCT-SPEC.md：用户提供的完整产品规范。
- docs/PHASE-1.md：交付、文件清单与实际验收记录。
- docs/PHASE-2.md：第二阶段设计、完整文件清单、测试与兼容性说明。
- docs/PHASE-3.md：原生透明、窗口操作与实际验收记录。
- docs/PHASE-4.md：换肤、外观持久化、测试及文件清单。
- AGENTS.md：后续开发约束。
- package-lock.json / src-tauri/Cargo.lock：锁定前后端依赖。

开发顺序：可靠持久化与计时 → 原生透明 → 主题 → 主界面 → 历史统计 → 综合验收。
每阶段结束后等待用户确认。

## GitHub 同步

仓库：https://github.com/noharass/WorkMemo

每个明确完成的开发步骤或阶段，在检查并记录实际结果后提交、推送到 main。
同步操作不替代阶段验收；未完成的原生交互验收在阶段文档中保留。
同步规则见 AGENTS.md，操作说明见 docs/GITHUB-SYNC.md。

## 数据与恢复规则

数据库位于 Windows 当前用户的本地应用数据目录，默认是
`%LOCALAPPDATA%\com.workmemo.desktop\workmemo.sqlite3`，不在 Git 仓库中。
数据库使用 WAL；应用打开期间请勿单独移动数据库文件或删除其 -wal/-shm 文件。

Rust 使用单调时钟计算有效时长，每秒尝试保存检查点；暂停不计时。
正常关闭会保存并暂停当前任务。重新打开时，未完成任务保持原 id 并恢复为暂停，关闭期间不计时。
异常退出只恢复最后成功保存的检查点，不能保证最后一秒绝不丢失；调度或磁盘问题可能使检查点间隔更长。
不要用手机时间与记录起止时间之差代替有效工作时间。
Windows 仅允许一个进程持有同一数据目录的锁，第二个窗口会显示错误并保持数据不变。

## 透明窗口

Tauri 窗口配置 transparent=true、decorations=false、backgroundColor=#00000000；HTML、body、根节点和外围容器均保持透明。只有圆角面板使用半透明背景，文字保持不透明。禁用 Windows 原生阴影，使用面板内的 CSS 轻阴影；noRedirectionBitmap 用于缓解 Windows 透明窗口初始白闪。
点击「外观 · 当前皮肤」打开设置。切换皮肤与滑块会即时预览，点击「保存外观」后下次沿用；取消、右上角关闭或 Esc 会还原到上次保存的外观。
背景不透明度范围 80%–100%，仅影响面板背景，文字和可用按钮不整体变淡。可恢复当前皮肤的默认值：Glass 82%、Cream 88%、Dark 94%、Neon 90%。
外观保存到 `%APPDATA%\com.workmemo.desktop\appearance.json`，与本地工作 SQLite 分开。临时文件写入并同步后再替换原配置；损坏配置在明确保存修复前会备份，较新版本配置不会覆盖。
浏览器只支持预览，不能保存桌面配置，也不能证明原生透明效果。重开恢复的实际验收状态见阶段报告。

````

## UPDATE — E:\WorkMemo\package.json

````
{
  "name": "workmemo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "test:themes": "node --test tests/themes.test.mjs",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@tauri-apps/api": "^2"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^6.0.2",
    "typescript": "~6.0.3",
    "vite": "^8.0.16",
    "@tauri-apps/cli": "^2"
  }
}

````

## NEW FILE — E:\WorkMemo\src\themes.ts

````
import type { CSSProperties } from "react";

export const THEME_IDS = ["glass", "cream", "dark", "neon"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const MIN_OPACITY = 80;
export const MAX_OPACITY = 100;

export interface Appearance {
  version: 1;
  theme: ThemeId;
  opacity: number;
}

export const DEFAULT_APPEARANCE: Appearance = { version: 1, theme: "cream", opacity: 88 };

interface Theme {
  name: string;
  description: string;
  defaultOpacity: number;
  scheme: "light" | "dark";
  windowRgb: string;
  surfaceRgb: string;
  inputRgb: string;
  text: string;
  muted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  onAccent: string;
  line: string;
  border: string;
  header: string;
  controlHover: string;
  secondaryHover: string;
  shadow: string;
  panelShadow: string;
  buttonShadow: string;
  timerShadow: string;
  timerFont: string;
  radius: number;
  controlRadius: number;
  noticeText: string;
  noticeBg: string;
  noticeBorder: string;
  errorText: string;
  errorBg: string;
  errorBorder: string;
  closeBg: string;
  onClose: string;
  scroll: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  glass: {
    name: "Glass", description: "清透玻璃", defaultOpacity: 82, scheme: "light",
    windowRgb: "225 237 242", surfaceRgb: "247 252 255", inputRgb: "252 254 255",
    text: "#233e45", muted: "#344d54", accent: "#365e70", accentHover: "#244959",
    accentText: "#214955", onAccent: "#ffffff", line: "#c0d0d8", border: "rgb(255 255 255 / 85%)",
    header: "rgb(255 255 255 / 24%)", controlHover: "rgb(48 85 104 / 13%)", secondaryHover: "#e4eff4",
    shadow: "0 2px 6px rgb(18 45 60 / 20%)", panelShadow: "0 4px 18px rgb(31 72 89 / 5%)",
    buttonShadow: "none", timerShadow: "none", timerFont: '"Segoe UI", sans-serif', radius: 20, controlRadius: 9,
    noticeText: "#2b4e60", noticeBg: "#e5eff6", noticeBorder: "#b8d0df",
    errorText: "#852e2d", errorBg: "#f9e8e6", errorBorder: "#e6bdb7",
    closeBg: "#a84a48", onClose: "#ffffff", scroll: "rgb(54 94 112 / 42%)",
  },
  cream: {
    name: "Cream", description: "温暖奶油", defaultOpacity: 88, scheme: "light",
    windowRgb: "245 243 238", surfaceRgb: "255 253 248", inputRgb: "255 254 250",
    text: "#303b35", muted: "#435247", accent: "#3b6551", accentHover: "#2c513e",
    accentText: "#284b38", onAccent: "#ffffff", line: "#d7d8c9", border: "rgb(255 255 247 / 85%)",
    header: "rgb(255 255 255 / 15%)", controlHover: "rgb(70 90 65 / 12%)", secondaryHover: "#eeeee5",
    shadow: "0 2px 6px rgb(51 43 25 / 18%)", panelShadow: "0 6px 24px rgb(74 65 43 / 4%)",
    buttonShadow: "none", timerShadow: "none", timerFont: '"Segoe UI", sans-serif', radius: 22, controlRadius: 10,
    noticeText: "#625022", noticeBg: "#ece5d4", noticeBorder: "#d7c89e",
    errorText: "#8b392e", errorBg: "#f6e7e2", errorBorder: "#e5c1b7",
    closeBg: "#a94f43", onClose: "#ffffff", scroll: "rgb(79 102 71 / 42%)",
  },
  dark: {
    name: "Dark", description: "安静深色", defaultOpacity: 94, scheme: "dark",
    windowRgb: "23 29 38", surfaceRgb: "32 40 51", inputRgb: "28 35 45",
    text: "#edf2f8", muted: "#c2ccd8", accent: "#a8d8be", accentHover: "#c2ead1",
    accentText: "#bce5cd", onAccent: "#16291f", line: "#4b596a", border: "rgb(156 181 203 / 34%)",
    header: "rgb(0 0 0 / 12%)", controlHover: "rgb(188 211 235 / 15%)", secondaryHover: "#344254",
    shadow: "0 2px 6px rgb(0 0 0 / 45%)", panelShadow: "0 6px 20px rgb(0 0 0 / 10%)",
    buttonShadow: "none", timerShadow: "none", timerFont: '"Segoe UI", sans-serif', radius: 18, controlRadius: 8,
    noticeText: "#f1db9f", noticeBg: "#3b3526", noticeBorder: "#766643",
    errorText: "#ffd3ca", errorBg: "#472d30", errorBorder: "#8c5558",
    closeBg: "#a8434c", onClose: "#ffffff", scroll: "rgb(184 205 229 / 42%)",
  },
  neon: {
    name: "Neon", description: "赛博微光", defaultOpacity: 90, scheme: "dark",
    windowRgb: "15 22 35", surfaceRgb: "22 32 49", inputRgb: "18 28 44",
    text: "#edf9ff", muted: "#c0d3e7", accent: "#6ef3da", accentHover: "#a6ffed",
    accentText: "#87f7e2", onAccent: "#092c29", line: "#3e697d", border: "rgb(110 243 218 / 57%)",
    header: "rgb(80 141 202 / 7%)", controlHover: "rgb(110 243 218 / 15%)", secondaryHover: "#234256",
    shadow: "0 1px 6px rgb(44 211 194 / 30%)", panelShadow: "inset 0 0 18px rgb(57 139 199 / 5%)",
    buttonShadow: "0 0 14px rgb(110 243 218 / 14%)", timerShadow: "0 0 18px rgb(110 243 218 / 20%)",
    timerFont: 'Consolas, "Cascadia Mono", monospace', radius: 12, controlRadius: 6,
    noticeText: "#f8e2a0", noticeBg: "#343526", noticeBorder: "#76754a",
    errorText: "#ffd0e1", errorBg: "#402b42", errorBorder: "#936581",
    closeBg: "#a9426c", onClose: "#ffffff", scroll: "rgb(110 243 218 / 45%)",
  },
};

export function isAppearance(value: unknown): value is Appearance {
  if (typeof value !== "object" || value === null) return false;
  const settings = value as Partial<Appearance>;
  return settings.version === 1 && THEME_IDS.some((id) => id === settings.theme)
    && typeof settings.opacity === "number" && Number.isInteger(settings.opacity)
    && settings.opacity >= MIN_OPACITY && settings.opacity <= MAX_OPACITY;
}

export function themeStyle(settings: Appearance): CSSProperties {
  const theme = THEMES[settings.theme];
  const variables: Record<string, string | number> = {
    "--text-primary": theme.text, "--text-muted": theme.muted,
    "--accent": theme.accent, "--accent-hover": theme.accentHover,
    "--accent-text": theme.accentText, "--on-accent": theme.onAccent,
    "--line": theme.line, "--window-rgb": theme.windowRgb,
    "--surface-rgb": theme.surfaceRgb, "--input-rgb": theme.inputRgb,
    "--window-opacity": settings.opacity / 100, "--surface-opacity": 0.94,
    "--window-border": theme.border, "--header-background": theme.header,
    "--control-hover": theme.controlHover, "--secondary-hover": theme.secondaryHover,
    "--window-shadow": theme.shadow, "--panel-shadow": theme.panelShadow,
    "--button-shadow": theme.buttonShadow, "--timer-shadow": theme.timerShadow,
    "--timer-font": theme.timerFont, "--window-radius": `${theme.radius}px`,
    "--panel-radius": `${Math.max(10, theme.radius - 2)}px`, "--control-radius": `${theme.controlRadius}px`,
    "--notice-text": theme.noticeText, "--notice-background": theme.noticeBg, "--notice-border": theme.noticeBorder,
    "--error": theme.errorText, "--error-background": theme.errorBg, "--error-border": theme.errorBorder,
    "--close-background": theme.closeBg, "--on-close": theme.onClose, "--scroll-thumb": theme.scroll,
  };
  return { ...variables, colorScheme: theme.scheme } as CSSProperties;
}

````

## NEW FILE — E:\WorkMemo\src\useAppearance.ts

````
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { DEFAULT_APPEARANCE, isAppearance, MAX_OPACITY, MIN_OPACITY, THEMES, type Appearance, type ThemeId } from "./themes";

export function useAppearance() {
  const native = isTauri();
  const [saved, setSaved] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [current, setCurrent] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [loading, setLoading] = useState(native);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const mounted = useRef(false);
  const savingRef = useRef(false);
  const revision = useRef(0);

  const reload = useCallback(async () => {
    if (!native || savingRef.current) return;
    const request = ++revision.current;
    setLoading(true);
    try {
      const settings = await invoke<unknown>("get_appearance");
      if (!isAppearance(settings)) throw new Error("外观设置格式或版本不受支持。");
      if (mounted.current && request === revision.current) {
        setSaved(settings); setCurrent(settings); setLoadError("");
      }
    } catch (error: unknown) {
      if (mounted.current && request === revision.current) setLoadError(String(error));
    } finally {
      if (mounted.current && request === revision.current) setLoading(false);
    }
  }, [native]);

  useEffect(() => {
    mounted.current = true;
    if (native) void reload();
    return () => { mounted.current = false; revision.current += 1; };
  }, [native, reload]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function begin() {
    if (loading || savingRef.current) return;
    setCurrent(saved); setSaveError(""); setNotice(""); setOpen(true);
  }

  function cancel() {
    if (savingRef.current) return;
    setCurrent(saved); setSaveError(""); setOpen(false);
  }

  function selectTheme(theme: ThemeId) {
    if (savingRef.current) return;
    setCurrent({ version: 1, theme, opacity: THEMES[theme].defaultOpacity }); setSaveError("");
  }

  function changeOpacity(opacity: number) {
    if (savingRef.current || !Number.isFinite(opacity)) return;
    setCurrent((previous) => ({ ...previous, opacity: Math.max(MIN_OPACITY, Math.min(MAX_OPACITY, Math.round(opacity))) }));
    setSaveError("");
  }

  async function save() {
    if (!native || savingRef.current || !isAppearance(current)) return;
    savingRef.current = true; setSaving(true); setSaveError("");
    ++revision.current;
    try {
      const settings = await invoke<unknown>("save_appearance", { settings: current });
      if (!isAppearance(settings)) throw new Error("保存结果格式不正确，请重新打开外观设置确认。");
      if (mounted.current) {
        setSaved(settings); setCurrent(settings); setLoadError(""); setOpen(false);
        setNotice("外观已保存，下次打开自动沿用。");
      }
    } catch (error: unknown) {
      if (mounted.current) setSaveError(String(error));
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  return {
    native, current, loading, saving, open, loadError, saveError, notice,
    begin, cancel, selectTheme, changeOpacity, reload, save,
    resetOpacity: () => changeOpacity(THEMES[current.theme].defaultOpacity),
  };
}

export type AppearanceController = ReturnType<typeof useAppearance>;

````

## NEW FILE — E:\WorkMemo\src\AppearanceSettings.tsx

````
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
          disabled={appearance.saving} onClick={appearance.cancel}>×</button>
      </div>
      <p className="hint">即时预览，保存后下次沿用。</p>
      <fieldset disabled={appearance.saving} className="theme-fieldset">
        <legend>选择皮肤</legend>
        <div className="theme-grid">
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
      <div className="settings-actions">
        <button type="button" className="secondary" disabled={appearance.saving} onClick={appearance.cancel}>取消</button>
        <button type="button" disabled={!appearance.native || appearance.saving}
          onClick={() => { void appearance.save(); }}>{appearance.saving ? "正在保存…" : "保存外观"}</button>
      </div>
    </dialog>
  );
}

````

## UPDATE — E:\WorkMemo\src\App.tsx

````
import { ConnectionPanel } from "./ConnectionPanel";
import { DesktopWindow } from "./DesktopWindow";
import { AppearanceSettings } from "./AppearanceSettings";
import { useAppearance } from "./useAppearance";
import { THEMES, themeStyle } from "./themes";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { formatDuration, formatTime } from "./types";
import "./App.css";

function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const active = session.snapshot?.active;
  const unavailable = !session.native || session.loading || session.busy
    || Boolean(session.connectionError) || !session.snapshot;

  return (
    <DesktopWindow appearanceStyle={themeStyle(appearance.current)}>
    <main className="workspace">
      <div className="workspace-toolbar">
        <span className="eyebrow">工作手记</span>
        <div className="toolbar-actions">
          <button className="text-button" type="button" disabled={appearance.loading}
            onClick={appearance.begin}>外观 · {THEMES[appearance.current.theme].name}</button>
          <button className="text-button" type="button" disabled={!session.native || session.busy}
            onClick={() => { void session.refresh(); }}>刷新记录</button>
        </div>
      </div>

      {appearance.notice && <p className="hint appearance-feedback" role="status">{appearance.notice}</p>}
      {appearance.loadError && <div className="notice" role="alert">
        <p>外观设置读取失败，暂时使用默认外观。工作记录不受影响。</p>
        <p className="appearance-error-detail">{appearance.loadError}</p>
        <button type="button" className="text-button" disabled={appearance.loading || appearance.open}
          onClick={() => { void appearance.reload(); }}>重新读取外观</button>
      </div>}

      {!session.native && <p className="notice" role="status">浏览器预览模式。请打开桌面应用，使用本地计时和保存功能。</p>}
      {session.loading && <p className="hint" role="status">正在读取本地工作记录…</p>}
      {session.connectionError && <div className="error-banner" role="alert">
        <strong>无法读取或保存本地数据</strong>
        <p>{session.connectionError}</p>
        <p>显示为上次读取的状态，操作暂不可用。可先尝试刷新；若已打开另一个 WorkMemo，请使用原窗口。仍无法恢复时请重新打开应用。</p>
      </div>}
      {session.commandError && <p className="error-banner" role="alert">{session.commandError}</p>}
      {session.snapshot?.warning && <p className="notice" role="alert">{session.snapshot.warning}</p>}
      {active?.recovery_pending && <p className="notice" role="status">
        已恢复上次未结束的任务，并保持暂停。应用关闭期间不计时，请确认后继续。
      </p>}

      <section className="timer-card" aria-label="当前工作">
        <div className="card-heading">
          <span className="eyebrow">{active ? active.category : "为今天留下一笔"}</span>
          <span className={`state-label ${active && !active.is_paused ? "working" : ""}`}>
            {active ? (active.is_paused ? "已暂停" : "进行中") : "准备开始"}
          </span>
        </div>
        <output className="timer" aria-label="有效工作时长">
          {formatDuration(active?.duration_seconds ?? 0)}
        </output>
        <p className="timer-caption">
          {session.connectionError ? "连接中断，时长暂未更新" : active?.is_paused ? "暂停期间不计时" : "有效工作时长"}
        </p>
        {active && <>
          <div className="task-meta"><span>工作数量</span><strong>{active.quantity}</strong></div>
          {active.remark && <p className="task-remark">{active.remark}</p>}
          <p className="hint">开始于 {formatTime(active.start_time)}</p>
          <div className="actions">
            <button type="button" disabled={unavailable}
              onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}>
              {active.is_paused ? "继续工作" : "暂停"}
            </button>
            <button className="secondary" type="button" disabled={unavailable}
              onClick={() => { void session.finish(active.id); }}>结束并保存</button>
          </div>
        </>}
      </section>

      {!active && <section className="form-card" aria-label="开始新的工作">
        <h1>工作，从一次专注开始。</h1>
        <WorkForm disabled={unavailable} onStart={session.start} />
      </section>}
      {active?.is_paused && <details className="switch-panel">
        <summary>开始另一项工作</summary>
        <WorkForm disabled={unavailable} switching onStart={session.start} />
      </details>}

      <details className="recent-panel">
        <summary>最近保存的记录</summary>
        {session.snapshot?.recent_records.length ? <ul className="record-list">
          {session.snapshot.recent_records.map((record) => <li key={record.id}>
            <div className="record-heading"><strong>{record.category} · {record.quantity}</strong>
              <span>{formatDuration(record.duration_seconds)}</span></div>
            <p className="hint">{formatTime(record.start_time)}<br />至 {record.end_time !== null ? formatTime(record.end_time) : "—"}</p>
            {record.remark && <p className="record-remark">{record.remark}</p>}
          </li>)}
        </ul> : <p className="hint">{session.snapshot ? "还没有已完成的记录。完成后会保存在这台电脑上。" : "连接本地数据后可查看真实记录。"}</p>}
        <p className="hint">此处显示最近 5 条，完整历史查询将在后续阶段加入。</p>
      </details>
      <ConnectionPanel />
      <footer>本地保存 · 让每一份投入都有迹可循</footer>
      <AppearanceSettings appearance={appearance} />
    </main>
    </DesktopWindow>
  );
}

export default App;

````

## UPDATE — E:\WorkMemo\src\DesktopWindow.tsx

````
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

````

## UPDATE — E:\WorkMemo\src\App.css

````
:root {
  font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
  color: #303b35;
  background: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; background: transparent; }
body { overflow: hidden; }
button, input, select, textarea { font: inherit; }
button, input, select, textarea, summary { -webkit-tap-highlight-color: transparent; }
.desktop-frame { position: relative; width: 100%; height: 100%; padding: 8px; color: var(--text-primary); --panel: rgb(var(--surface-rgb) / var(--surface-opacity)); }
.app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border: 1px solid var(--window-border); border-radius: var(--window-radius); background: rgb(var(--window-rgb) / var(--window-opacity)); box-shadow: var(--window-shadow); }
.titlebar { display: flex; align-items: center; gap: 6px; flex-shrink: 0; min-height: 60px; padding: 8px 10px 8px 14px; border-bottom: 1px solid var(--line); background: var(--header-background); user-select: none; }
.titlebar-drag { display: flex; flex: 1; align-items: center; gap: 10px; min-width: 0; min-height: 40px; cursor: grab; touch-action: none; }
.titlebar-drag:active { cursor: grabbing; }
.brand-mark { display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0; border-radius: var(--control-radius); background: var(--accent); color: var(--on-accent); font: 600 24px Georgia, serif; padding-bottom: 5px; }
.brand-name { display: block; font-size: 15px; font-weight: 650; letter-spacing: -.3px; }
.brand-caption { display: block; margin-top: 3px; font-size: 10px; color: var(--text-muted); letter-spacing: 1px; }
.drag-grip { margin-left: auto; color: var(--text-muted); opacity: .5; padding: 0 5px; font-size: 18px; }
.window-controls { display: flex; flex-shrink: 0; gap: 3px; }
.window-content { min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.window-content::-webkit-scrollbar { width: 6px; }
.window-content::-webkit-scrollbar-track { background: transparent; }
.window-content::-webkit-scrollbar-thumb { border-radius: 6px; background: var(--scroll-thumb); }
.workspace { max-width: 520px; margin: 0 auto; padding: 20px; }
.workspace-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 17px; }
.toolbar-actions { display: flex; gap: 6px; margin-left: auto; }
.window-error { flex-shrink: 0; margin: 8px 14px 0; padding: 8px 10px; max-height: 90px; overflow: auto; border-radius: var(--control-radius); background: var(--error-background); color: var(--error); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.resize-handle { position: absolute; z-index: 10; touch-action: none; }
.resize-North, .resize-South { left: 12px; right: 12px; height: 8px; cursor: ns-resize; }
.resize-North { top: 0; }
.resize-South { bottom: 0; }
.resize-East, .resize-West { top: 12px; bottom: 12px; width: 8px; cursor: ew-resize; }
.resize-East { right: 0; }
.resize-West { left: 0; }
.resize-NorthEast, .resize-NorthWest, .resize-SouthEast, .resize-SouthWest { width: 12px; height: 12px; }
.resize-NorthEast { top: 0; right: 0; cursor: nesw-resize; }
.resize-NorthWest { top: 0; left: 0; cursor: nwse-resize; }
.resize-SouthEast { bottom: 0; right: 0; cursor: nwse-resize; }
.resize-SouthWest { bottom: 0; left: 0; cursor: nesw-resize; }
button { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; background: var(--accent); color: var(--on-accent); border: 1px solid transparent; border-radius: var(--control-radius); font-size: 12px; cursor: pointer; box-shadow: var(--button-shadow); transition: background .15s; }
button:hover:not(:disabled) { background: var(--accent-hover); }
button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, summary:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 3px; }
button.secondary { background: var(--panel); color: var(--accent-text); border-color: var(--line); justify-content: center; box-shadow: none; }
button.secondary:hover:not(:disabled) { background: var(--secondary-hover); }
button.text-button { width: auto; background: transparent; color: var(--text-muted); border-color: var(--line); padding: 7px 10px; font-size: 10px; box-shadow: none; }
button.text-button:hover:not(:disabled) { background: var(--panel); }
button.window-control { width: 30px; height: 30px; padding: 6px; justify-content: center; border-radius: var(--control-radius); background: transparent; color: var(--text-muted); box-shadow: none; }
button.window-control:hover:not(:disabled) { background: var(--control-hover); }
button.window-close:hover:not(:disabled) { color: var(--on-close); background: var(--close-background); }
.window-control svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.timer-card { padding: 21px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: var(--panel); box-shadow: var(--panel-shadow); }
.card-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.eyebrow { font-size: 11px; color: var(--accent-text); letter-spacing: 1px; }
.state-label { font-size: 10px; color: var(--text-muted); }
.state-label.working { color: var(--accent-text); }
.state-label.working::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
.timer { display: block; margin: 18px 0 4px; text-align: center; font-family: var(--timer-font); text-shadow: var(--timer-shadow); font-size: clamp(33px, 10vw, 45px); font-weight: 550; font-variant-numeric: tabular-nums; letter-spacing: -1px; line-height: 1.4; overflow-wrap: anywhere; }
.timer-caption { font-size: 10px; color: var(--text-muted); text-align: center; margin: 0 0 16px; }
.task-meta { display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding-top: 15px; border-top: 1px solid var(--line); }
.task-meta span { color: var(--text-muted); }
.task-meta strong { font-size: 14px; font-weight: 600; }
.task-remark, .record-remark { font-size: 12px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.task-remark { max-height: 100px; overflow-y: auto; }
.actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 15px; }
.actions button { justify-content: center; }
.form-card { margin-top: 22px; }
h1 { font-size: 16px; font-weight: 550; margin: 0 0 17px; }
.work-form { display: grid; gap: 14px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 7px; padding: 10px 11px; min-width: 0; border: 1px solid var(--line); border-radius: var(--control-radius); color: inherit; background: rgb(var(--input-rgb) / 96%); font-size: 12px; }
input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: .85; }
option { color: var(--text-primary); background: rgb(var(--input-rgb)); }
input:disabled, select:disabled, textarea:disabled { opacity: .55; }
textarea { resize: vertical; min-height: 65px; max-height: 200px; line-height: 1.6; }
.hint { color: var(--text-muted); font-size: 10px; line-height: 1.8; margin: 9px 0 0; overflow-wrap: anywhere; }
.notice, .error-banner { border-radius: var(--control-radius); padding: 12px; margin: 0 0 16px; font-size: 11px; line-height: 1.8; overflow-wrap: anywhere; }
.notice { color: var(--notice-text); background: var(--notice-background); border: 1px solid var(--notice-border); }
.notice p { margin: 0 0 6px; }
.error-banner { color: var(--error); background: var(--error-background); border: 1px solid var(--error-border); }
.error-banner p { margin: 5px 0 0; }
.inline-error { font-size: 11px; color: var(--error); margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.switch-panel, .recent-panel, .connection-panel { border-top: 1px solid var(--line); margin-top: 22px; padding-top: 14px; font-size: 11px; }
summary { color: var(--text-muted); cursor: pointer; padding: 3px 0; }
details[open] > summary { margin-bottom: 15px; }
.connection-panel { margin-top: 15px; font-size: 10px; }
.connection-panel > p { font-size: 11px; }
.connection-panel button { margin-top: 10px; }
.record-list { list-style: none; padding: 0; margin: 0; }
.record-list li { padding: 12px 0; border-bottom: 1px solid var(--line); }
.record-list li:last-child { border-bottom: 0; }
.record-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; }
.record-heading strong { font-weight: 550; }
.record-heading span { font-variant-numeric: tabular-nums; color: var(--accent-text); }
.record-remark { margin: 7px 0 0; font-size: 11px; }
footer { margin-top: 22px; color: var(--text-muted); font-size: 9px; text-align: center; line-height: 1.8; }
.appearance-feedback { margin: -7px 0 14px; color: var(--accent-text); }
.appearance-error-detail { font-size: 10px; }
.appearance-dialog { width: min(390px, calc(100% - 40px)); max-height: calc(100% - 36px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.appearance-dialog::backdrop { background: transparent; }
.settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.settings-heading h2 { margin: 0; font-size: 17px; font-weight: 600; }
.settings-heading button { font-size: 22px; line-height: 1; }
.theme-fieldset { padding: 0; margin: 20px 0; border: 0; min-width: 0; }
.theme-fieldset legend { margin-bottom: 10px; padding: 0; font-size: 11px; color: var(--text-muted); }
.theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
button.theme-choice { display: flex; align-items: center; gap: 9px; padding: 12px 10px; text-align: left; background: rgb(var(--window-rgb)); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); box-shadow: none; }
button.theme-choice:hover:not(:disabled) { background: rgb(var(--surface-rgb)); }
button.theme-choice[aria-pressed="true"] { outline: 2px solid var(--accent-text); outline-offset: 1px; }
.theme-sample { display: grid; align-content: center; gap: 4px; flex-shrink: 0; width: 30px; height: 35px; padding: 5px; border-radius: 5px; background: rgb(var(--surface-rgb)); border: 1px solid var(--line); }
.theme-sample span { height: 2px; width: 100%; background: var(--text-muted); border-radius: 2px; }
.theme-sample span:first-child { width: 60%; height: 4px; background: var(--accent); }
.theme-label { display: grid; gap: 5px; min-width: 0; }
.theme-label strong { font-size: 12px; font-weight: 600; }
.theme-label > span { font-size: 9px; color: var(--text-muted); white-space: nowrap; }
.opacity-heading { display: flex; align-items: center; justify-content: space-between; }
.opacity-heading output { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--accent-text); }
input.opacity-slider { padding: 0; margin: 10px 0 3px; border: 0; background: transparent; min-height: 24px; accent-color: var(--accent); cursor: pointer; }
.opacity-scale { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 9px; }
button.reset-opacity { margin: 15px 0 0; padding: 6px 8px; font-size: 10px; }
.settings-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
.settings-actions button { justify-content: center; }
.appearance-dialog > .notice, .appearance-dialog > .error-banner { margin: 14px 0 0; }
@media (max-width: 380px) { .workspace { padding: 17px; } .timer-card { padding: 17px; } .drag-grip { display: none; } }
@media (prefers-reduced-motion: reduce) { button { transition: none; } }

````

## UPDATE — E:\WorkMemo\src-tauri\Cargo.toml

````
[package]
name = "workmemo"
version = "0.1.0"
description = "Local personal work journal and focus timer"
edition = "2024"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[lib]
# The `_lib` suffix may seem redundant but it is necessary
# to make the lib name unique and wouldn't conflict with the bin name.
# This seems to be only an issue on Windows, see https://github.com/rust-lang/cargo/issues/8519
name = "workmemo_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
rusqlite = { version = "0.41", features = ["bundled"] }


# Read the optimization guideline for more details: https://tauri.app/concept/size/#cargo-configuration
[profile.release]
codegen-units = 1
lto = true
opt-level = 3
panic = "abort"
strip = true

````

## UPDATE — E:\WorkMemo\src-tauri\src\lib.rs

````
use serde::Serialize;
use tauri::{Emitter, Manager};

mod appearance;
mod clock;
mod database;
mod service;

/// A real IPC round trip verifies that the desktop backend is available.
#[derive(Serialize)]
struct AppInfo {
    name: &'static str,
    version: &'static str,
}

#[tauri::command]
fn app_info() -> AppInfo {
    AppInfo {
        name: "WorkMemo",
        version: env!("CARGO_PKG_VERSION"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(service::Backend::initialize(app));
            app.manage(appearance::AppearanceState::initialize(app));
            Ok(())
        })
        .on_window_event(service::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            app_info,
            appearance::get_appearance,
            appearance::save_appearance,
            service::get_snapshot,
            service::start_task,
            service::pause_task,
            service::resume_task,
            service::finish_task,
        ])
        .build(tauri::generate_context!())
        .expect("WorkMemo failed to start")
        .run(|app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if let Err(error) = app.state::<service::Backend>().save_on_exit() {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:storage-error", error);
                }
            }
        });
}

````

## NEW FILE — E:\WorkMemo\src-tauri\src\appearance.rs

````
use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
    sync::{
        Mutex,
        atomic::{AtomicU64, Ordering},
    },
};
use tauri::{Manager, State};

const VERSION: u32 = 1;
const MAX_BYTES: u64 = 65_536;
static NEXT_TEMP: AtomicU64 = AtomicU64::new(0);
type Result<T> = std::result::Result<T, String>;

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Glass,
    Cream,
    Dark,
    Neon,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct Appearance {
    pub version: u32,
    pub theme: Theme,
    pub opacity: u8,
}

impl Default for Appearance {
    fn default() -> Self {
        Self {
            version: VERSION,
            theme: Theme::Cream,
            opacity: 88,
        }
    }
}

impl Appearance {
    fn validate(&self) -> Result<()> {
        if self.version != VERSION {
            return Err("外观设置版本不受支持，请使用匹配的应用版本。".into());
        }
        if !(80..=100).contains(&self.opacity) {
            return Err("背景不透明度须在 80% 到 100% 之间。".into());
        }
        Ok(())
    }
}

fn io_error(error: std::io::Error) -> String {
    format!("外观设置读写失败：{error}")
}

fn read_bytes(path: &Path) -> Result<Option<Vec<u8>>> {
    let file = match File::open(path) {
        Ok(file) => file,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(io_error(error)),
    };
    let mut bytes = Vec::new();
    file.take(MAX_BYTES + 1)
        .read_to_end(&mut bytes)
        .map_err(io_error)?;
    if bytes.len() as u64 > MAX_BYTES {
        return Err("外观配置文件过大，请检查配置后重试。".into());
    }
    Ok(Some(bytes))
}

fn decode(bytes: &[u8]) -> Result<Appearance> {
    let settings: Appearance =
        serde_json::from_slice(bytes).map_err(|e| format!("无法读取外观配置：{e}"))?;
    settings.validate()?;
    Ok(settings)
}

pub fn load(path: &Path) -> Result<Appearance> {
    match read_bytes(path)? {
        Some(bytes) => decode(&bytes),
        None => Ok(Appearance::default()),
    }
}

struct TemporaryFile(PathBuf);
impl Drop for TemporaryFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}

fn write_unique(parent: &Path, label: &str, extension: &str, bytes: &[u8]) -> Result<PathBuf> {
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let sequence = NEXT_TEMP.fetch_add(1, Ordering::Relaxed);
    let path = parent.join(format!(
        "appearance.{label}.{}.{nonce}.{sequence}.{extension}",
        std::process::id()
    ));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&path)
        .map_err(io_error)?;
    if let Err(error) = file.write_all(bytes).and_then(|_| file.sync_all()) {
        drop(file);
        let _ = fs::remove_file(&path);
        return Err(io_error(error));
    }
    Ok(path)
}

pub fn save(path: &Path, settings: Appearance) -> Result<Appearance> {
    settings.validate()?;
    let previous = read_bytes(path)?;
    if let Some(bytes) = &previous {
        if let Ok(value) = serde_json::from_slice::<serde_json::Value>(bytes) {
            if value
                .get("version")
                .and_then(|v| v.as_u64())
                .is_some_and(|v| v > u64::from(VERSION))
            {
                return Err("外观配置来自较新版本，未覆盖文件。请升级应用。".into());
            }
        }
    }
    let parent = path.parent().ok_or("外观配置目录无效。")?;
    fs::create_dir_all(parent).map_err(io_error)?;
    // An explicit save can repair invalid settings, retaining the original bytes.
    if let Some(bytes) = &previous {
        if decode(bytes).is_err() {
            write_unique(parent, "recovery", "json", bytes)?;
        }
    }
    let mut bytes =
        serde_json::to_vec_pretty(&settings).map_err(|e| format!("无法编码外观配置：{e}"))?;
    bytes.push(b'\n');
    let temporary = TemporaryFile(write_unique(parent, "pending", "tmp", &bytes)?);
    // Same-directory replacement: never truncate the live configuration first.
    fs::rename(&temporary.0, path).map_err(io_error)?;
    Ok(settings)
}

pub struct AppearanceState {
    path: Result<PathBuf>,
    gate: Mutex<()>,
}

impl AppearanceState {
    pub fn initialize(app: &tauri::App) -> Self {
        Self {
            path: app
                .path()
                .app_config_dir()
                .map(|p| p.join("appearance.json"))
                .map_err(|e| format!("无法定位外观配置目录：{e}")),
            gate: Mutex::new(()),
        }
    }
}

#[tauri::command]
pub async fn get_appearance(app: tauri::AppHandle) -> Result<Appearance> {
    tauri::async_runtime::spawn_blocking(move || {
        let state: State<'_, AppearanceState> = app.state();
        let _guard = state
            .gate
            .lock()
            .map_err(|_| "外观设置服务异常，请重新打开应用。")?;
        load(state.path.as_ref().map_err(|e| e.clone())?)
    })
    .await
    .map_err(|e| format!("无法加载外观设置：{e}"))?
}

#[tauri::command]
pub async fn save_appearance(app: tauri::AppHandle, settings: Appearance) -> Result<Appearance> {
    tauri::async_runtime::spawn_blocking(move || {
        let state: State<'_, AppearanceState> = app.state();
        let _guard = state
            .gate
            .lock()
            .map_err(|_| "外观设置服务异常，请重新打开应用。")?;
        save(state.path.as_ref().map_err(|e| e.clone())?, settings)
    })
    .await
    .map_err(|e| format!("无法保存外观设置：{e}"))?
}

#[cfg(test)]
#[path = "appearance_tests.rs"]
mod tests;

````

## NEW FILE — E:\WorkMemo\src-tauri\src\appearance_tests.rs

````
use super::*;

struct Directory(PathBuf);
impl Directory {
    fn new() -> Self {
        let sequence = NEXT_TEMP.fetch_add(1, Ordering::Relaxed);
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path = std::env::temp_dir().join(format!(
            "workmemo-appearance-{}-{nonce}-{sequence}",
            std::process::id()
        ));
        fs::create_dir(&path).unwrap();
        Self(path)
    }
    fn settings(&self) -> PathBuf {
        self.0.join("appearance.json")
    }
}
impl Drop for Directory {
    fn drop(&mut self) {
        for item in fs::read_dir(&self.0).unwrap().flatten() {
            let _ = fs::remove_file(item.path());
        }
        let _ = fs::remove_dir(&self.0);
    }
}

#[test]
fn missing_file_uses_default_without_writing() {
    let directory = Directory::new();
    assert_eq!(load(&directory.settings()).unwrap(), Appearance::default());
    assert!(!directory.settings().exists());
}

#[test]
fn all_themes_and_boundaries_round_trip_over_existing_file() {
    let directory = Directory::new();
    for theme in [Theme::Glass, Theme::Cream, Theme::Dark, Theme::Neon] {
        for opacity in [80, 88, 100] {
            let expected = Appearance {
                version: 1,
                theme,
                opacity,
            };
            save(&directory.settings(), expected.clone()).unwrap();
            assert_eq!(load(&directory.settings()).unwrap(), expected);
        }
    }
    assert_eq!(fs::read_dir(&directory.0).unwrap().count(), 1);
}

#[test]
fn invalid_opacity_does_not_replace_saved_settings() {
    let directory = Directory::new();
    save(&directory.settings(), Appearance::default()).unwrap();
    let original = fs::read(directory.settings()).unwrap();
    for opacity in [0, 79, 101, 255] {
        assert!(
            save(
                &directory.settings(),
                Appearance {
                    opacity,
                    ..Appearance::default()
                }
            )
            .is_err()
        );
    }
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
}

#[test]
fn corrupted_file_is_reported_and_backed_up_before_explicit_repair() {
    let directory = Directory::new();
    let original = b"invalid settings";
    fs::write(directory.settings(), original).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
    save(&directory.settings(), Appearance::default()).unwrap();
    assert_eq!(load(&directory.settings()).unwrap(), Appearance::default());
    let backup = fs::read_dir(&directory.0)
        .unwrap()
        .flatten()
        .find(|item| item.file_name().to_string_lossy().contains("recovery"))
        .unwrap();
    assert_eq!(fs::read(backup.path()).unwrap(), original);
}

#[test]
fn newer_schema_is_not_overwritten() {
    let directory = Directory::new();
    let original = br#"{"version":2,"theme":"future","opacity":90}"#;
    fs::write(directory.settings(), original).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert!(save(&directory.settings(), Appearance::default()).is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
}

#[test]
fn rejects_unknown_theme_and_oversized_configuration() {
    let directory = Directory::new();
    fs::write(
        directory.settings(),
        br#"{"version":1,"theme":"unknown","opacity":90}"#,
    )
    .unwrap();
    assert!(load(&directory.settings()).is_err());
    fs::write(directory.settings(), vec![b' '; MAX_BYTES as usize + 1]).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert!(save(&directory.settings(), Appearance::default()).is_err());
}

#[cfg(windows)]
#[test]
fn failed_replace_keeps_original_and_removes_temporary_file() {
    let directory = Directory::new();
    save(&directory.settings(), Appearance::default()).unwrap();
    let original_bytes = fs::read(directory.settings()).unwrap();
    let original_permissions = fs::metadata(directory.settings()).unwrap().permissions();
    let mut readonly = original_permissions.clone();
    readonly.set_readonly(true);
    fs::set_permissions(directory.settings(), readonly).unwrap();
    let result = save(
        &directory.settings(),
        Appearance {
            theme: Theme::Dark,
            ..Appearance::default()
        },
    );
    fs::set_permissions(directory.settings(), original_permissions).unwrap();
    assert!(result.is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original_bytes);
    assert_eq!(fs::read_dir(&directory.0).unwrap().count(), 1);
}

#[test]
fn saving_appearance_never_changes_the_work_session() {
    use crate::{
        clock::SystemClock,
        database::{StartInput, Store},
    };
    let directory = Directory::new();
    let mut store = Store::open(
        &directory.0.join("workmemo.sqlite3"),
        Box::new(SystemClock::new()),
    )
    .unwrap();
    store
        .start(StartInput {
            category: "开发".into(),
            quantity: 2.5,
            remark: "isolation test".into(),
        })
        .unwrap();
    let original = store.snapshot().unwrap().active.unwrap();
    for theme in [Theme::Glass, Theme::Cream, Theme::Dark, Theme::Neon] {
        save(
            &directory.settings(),
            Appearance {
                version: 1,
                theme,
                opacity: 85,
            },
        )
        .unwrap();
    }
    let current = store.snapshot().unwrap().active.unwrap();
    assert_eq!(current.id, original.id);
    assert_eq!(current.start_time, original.start_time);
    assert_eq!(current.remark, original.remark);
    assert_eq!(current.quantity, original.quantity);
    assert_eq!(current.status, "WORKING");
    assert!(!current.is_paused);
    assert!(store.snapshot().unwrap().recent_records.is_empty());
}

````

## NEW FILE — E:\WorkMemo\tests\themes.test.mjs

````
import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_APPEARANCE, isAppearance, MAX_OPACITY, MIN_OPACITY, THEME_IDS, THEMES, themeStyle } from "../src/themes.ts";

function hex(value) {
  assert.match(value, /^#[0-9a-f]{6}$/i);
  return [1, 3, 5].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}
function rgb(value) { return value.split(" ").map(Number); }
function blend(foreground, background, opacity) {
  return foreground.map((value, index) => value * opacity + background[index] * (1 - opacity));
}
function luminance(color) {
  const linear = color.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function readable(foreground, background, label) {
  const values = [luminance(hex(foreground)), luminance(background)].sort((a, b) => a - b);
  const contrast = (values[1] + 0.05) / (values[0] + 0.05);
  assert.ok(contrast >= 4.5, `${label}: contrast ${contrast.toFixed(2)} is below 4.5`);
}

for (const id of THEME_IDS) {
  test(`${id}: readable foregrounds at both opacity boundaries over black and white`, () => {
    const theme = THEMES[id];
    assert.ok(theme.defaultOpacity >= MIN_OPACITY && theme.defaultOpacity <= MAX_OPACITY);
    for (const opacity of [MIN_OPACITY, MAX_OPACITY]) {
      for (const backdrop of [[0, 0, 0], [255, 255, 255]]) {
        const background = blend(rgb(theme.windowRgb), backdrop, opacity / 100);
        for (const [name, foreground] of Object.entries({ primary: theme.text, muted: theme.muted, accent: theme.accentText })) {
          readable(foreground, background, `${id}/${opacity}/${name}`);
        }
        const panel = blend(rgb(theme.surfaceRgb), background, 0.94);
        const input = blend(rgb(theme.inputRgb), background, 0.96);
        readable(theme.text, panel, `${id}/panel`);
        readable(theme.muted, input, `${id}/input`);
      }
    }
    readable(theme.onAccent, hex(theme.accent), `${id}/button`);
    readable(theme.onAccent, hex(theme.accentHover), `${id}/button-hover`);
    readable(theme.noticeText, hex(theme.noticeBg), `${id}/notice`);
    readable(theme.errorText, hex(theme.errorBg), `${id}/error`);
    readable(theme.onClose, hex(theme.closeBg), `${id}/close`);
  });
}

test("reject malformed or out-of-range appearance payloads", () => {
  assert.ok(isAppearance(DEFAULT_APPEARANCE));
  for (const value of [null, {}, { ...DEFAULT_APPEARANCE, version: 2 },
    { ...DEFAULT_APPEARANCE, theme: "unknown" }, { ...DEFAULT_APPEARANCE, opacity: 79 },
    { ...DEFAULT_APPEARANCE, opacity: 101 }, { ...DEFAULT_APPEARANCE, opacity: 88.5 },
    { ...DEFAULT_APPEARANCE, opacity: NaN }]) assert.equal(isAppearance(value), false);
});

test("all skins provide the same complete CSS token set without changing the selected settings", () => {
  const expected = Object.keys(themeStyle(DEFAULT_APPEARANCE)).sort();
  for (const id of THEME_IDS) {
    const settings = Object.freeze({ version: 1, theme: id, opacity: MIN_OPACITY });
    const style = themeStyle(settings);
    assert.deepEqual(Object.keys(style).sort(), expected);
    assert.ok(Object.values(style).every((value) => value !== undefined && value !== ""));
    assert.equal(style["--window-opacity"], MIN_OPACITY / 100);
    assert.equal(style.colorScheme, THEMES[id].scheme);
    assert.equal(settings.opacity, MIN_OPACITY);
  }
});

````
