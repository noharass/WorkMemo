# 第五阶段完整源码与配置

以下为本阶段变更的全部源码、测试、配置和开发说明的完整内容。原文件为可直接编辑运行的版本。完整阶段报告和文件清单分别保存在 PHASE-5.md、PHASE-5-FILES.md；图片是独立 PNG，文档不递归嵌入自身。

## UPDATE — E:\WorkMemo\AGENTS.md

````
# WorkMemo 开发约束

- 开发前阅读 `docs/PRODUCT-SPEC.md`，这是用户提供的完整长期产品规范。
- 固定技术栈：Tauri 2、React、TypeScript、Vite、Rust、SQLite；保持轻量依赖。
- 优先级：数据可靠性 > 业务逻辑正确性 > 核心功能完整性 > 界面可用性 > 视觉精致度。
- 先检查实际文件、实现与启动状态，再制定最小改动；不覆盖可靠的已有功能。
- 按阶段开发，每阶段结束后总结并等待用户确认，不自动跨入下一阶段。
- 用户已确认进入第五阶段：主界面与各工作状态交互。完成后等待确认，不自动进入第六阶段的完整历史、删除和统计。
- 不使用虚构记录、统计数据或装饰性按钮，不把未完成的功能包装为可用功能。
- Rust 校验并持久化业务数据，使用 SQLite；外观设置与工作记录分开管理。
- 同时只能有一个活动任务；暂停不计时；重启必须处理未完成任务。
- 计时不能只靠前端逐秒累加，必须基于真实时间和状态。
- 原生透明与 Glass / Cream / Dark / Neon 四种皮肤是必需功能，CSS 透明不能代替原生验证。
- 权限仅授予当前功能确实需要的范围。
- 只有实际执行过的启动、构建和测试才能报告为通过。
- 中文交付包含目标、检查结果、完整路径及 NEW FILE / UPDATE、完整代码、PowerShell 命令、测试方法与预期、兼容性和 Git 命令。
- 完整代码保存在项目文件中，较长交付另提供完整源码清单，不能用省略号代替代码。
- 当前阶段进度见 `docs/PHASE-5.md`，已有阶段记录保留在 docs 中，启动方式见 `README.md`。

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
    "test:workflow": "node --test tests/workflow.test.mjs",
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

## UPDATE — E:\WorkMemo\README.md

````
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前处于第五阶段：完善主界面读取、就绪、工作、暂停、完成保存和连接失败的反馈。在 SQLite 工作记录、可靠计时与原生透明窗口基础上，保留 Glass、Cream、Dark、Neon 四种皮肤、背景不透明度调节和独立外观配置。支持开始、暂停、继续、结束、暂停后切换任务，以及未结束任务恢复为暂停。界面显示最近 5 条真实完成记录，并保留基础连接检查。
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
npm run test:workflow
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm run tauri build -- --no-bundle
```

Release 可执行文件：E:\WorkMemo\src-tauri\target\release\workmemo.exe。
构建不生成安装包；正式安装包在后续阶段验收。当前阶段实际验证结果见 docs/PHASE-5.md。

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
- src/workInput.ts：开始任务的前端字段校验；src/workView.ts：根据真实快照派生界面状态和保存确认。
- docs/PRODUCT-SPEC.md：用户提供的完整产品规范。
- docs/PHASE-1.md：交付、文件清单与实际验收记录。
- docs/PHASE-2.md：第二阶段设计、完整文件清单、测试与兼容性说明。
- docs/PHASE-3.md：原生透明、窗口操作与实际验收记录。
- docs/PHASE-4.md：换肤、外观持久化、测试及文件清单。
- docs/PHASE-5.md：主界面反馈、表单校验、实际测试与完整源码交付。
- AGENTS.md：后续开发约束。
- package-lock.json / src-tauri/Cargo.lock：锁定前后端依赖。

开发顺序：可靠持久化与计时 → 原生透明 → 主题 → 主界面 → 历史统计 → 综合验收。
每阶段结束后等待用户确认。

## 主界面状态

启动读取完成前及连接失败时，不把未知数据显示为准备开始；连接中断保留上次读取的任务和时长并禁用业务操作。前端每秒重新读取后端有效时长，不自行逐秒累加。

各业务按钮提交期间会显示正在开始、暂停、继续或保存，并禁止重复提交。结束命令成功且返回同 id、FINISHED、带结束时间的真实记录后，保留本次时长、数量与保存时间，并提示已保存在本机。开始下一项后清除本次完成提示；重启只读取真实记录，不伪造上次操作成功提示。

类别、数量与备注错误分别在字段旁提示，并将焦点移到首个错误字段。备注按 Unicode 字符计数，最多 2000 字符；后端仍保留最终校验。保存失败保留输入和现有任务，显示错误，不显示保存成功。

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
.field-error { display: block; margin-top: 6px; color: var(--error); font-size: 10px; overflow-wrap: anywhere; }
.field-count { display: block; text-align: right; margin-top: 4px; color: var(--text-muted); font-size: 10px; }
[aria-invalid="true"] { border-color: var(--error); }
.finished-card { border-color: var(--accent-text); }
.saved-feedback { margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--line); color: var(--accent-text); font-size: 11px; line-height: 1.8; }
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
import { workView } from "./workView";
import "./App.css";

function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const unavailable = !view.canOperate || session.busy;

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
      {session.connectionError && <div className="error-banner" role="alert">
        <strong>无法读取或保存本地数据</strong>
        <p>{session.connectionError}</p>
        <p>显示为上次读取的状态，操作暂不可用。可先尝试刷新；若已打开另一个 WorkMemo，请使用原窗口。仍无法恢复时请重新打开应用。</p>
      </div>}
      {!session.connectionError && session.commandError && <p className="error-banner" role="alert">{session.commandError}</p>}
      {!session.connectionError && !session.commandError && session.snapshot?.warning
        && <p className="notice" role="alert">{session.snapshot.warning}</p>}
      {active?.recovery_pending && <p className="notice" role="status">
        已恢复上次未结束的任务，并保持暂停。应用关闭期间不计时，请确认后继续。
      </p>}

      <section className={`timer-card${view.mode === "finished" ? " finished-card" : ""}`}
        aria-label="当前工作" aria-busy={session.loading || session.busy}>
        <div className="card-heading">
          <span className="eyebrow">{record ? record.category : "为今天留下一笔"}</span>
          <span className={`state-label ${view.mode === "working" ? "working" : ""}`} role="status">
            {view.label}
          </span>
        </div>
        <output className="timer" aria-label="有效工作时长" aria-live="off">
          {view.timer}
        </output>
        <p className="timer-caption">
          {view.caption}
        </p>
        {record && <>
          <div className="task-meta"><span>工作数量</span><strong>{record.quantity}</strong></div>
          {record.remark && <p className="task-remark">{record.remark}</p>}
          <p className="hint">开始于 {formatTime(record.start_time)}
            {record.end_time !== null && <><br />保存于 {formatTime(record.end_time)}</>}</p>
        </>}
        {view.mode === "finished" && <p className="saved-feedback">记录已保存在这台电脑上，可在下方查看，也可以开始下一项。</p>}
        {active && <>
          <div className="actions">
            <button type="button" disabled={unavailable}
              onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}>
              {session.pending === "resume_task" ? "正在继续…" : session.pending === "pause_task" ? "正在暂停…"
                : active.is_paused ? "继续工作" : "暂停"}
            </button>
            <button className="secondary" type="button" disabled={unavailable}
              onClick={() => { void session.finish(active.id); }}>{session.pending === "finish_task" ? "正在保存…" : "结束并保存"}</button>
          </div>
        </>}
      </section>

      {!active && (session.snapshot || !session.native) && <section className="form-card" aria-label="开始新的工作">
        <h1>{view.finished ? "下一份投入，从这里开始。" : "工作，从一次专注开始。"}</h1>
        <WorkForm disabled={unavailable} starting={session.pending === "start_task"} onStart={session.start} />
      </section>}
      {active?.is_paused && <details className="switch-panel">
        <summary>开始另一项工作</summary>
        <WorkForm disabled={unavailable} switching starting={session.pending === "start_task"} onStart={session.start} />
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

## UPDATE — E:\WorkMemo\src\useWorkSession.ts

````
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { Snapshot, StartInput } from "./types";
import { confirmedFinish } from "./workView";

type WorkCommand = "start_task" | "pause_task" | "resume_task" | "finish_task";

export function useWorkSession() {
  const native = isTauri();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(native);
  const [pending, setPending] = useState<WorkCommand | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState("");
  const [commandError, setCommandError] = useState("");
  const mounted = useRef(false);
  const busyRef = useRef(false);
  const polling = useRef(false);
  const revision = useRef(0);

  const refresh = useCallback(async () => {
    if (!native || busyRef.current || polling.current) return;
    polling.current = true;
    const request = ++revision.current;
    try {
      const data = await invoke<Snapshot>("get_snapshot");
      if (mounted.current && request === revision.current) {
        setSnapshot(data);
        setConnectionError("");
      }
    } catch (error: unknown) {
      if (mounted.current && request === revision.current) setConnectionError(String(error));
    } finally {
      polling.current = false;
      if (mounted.current && request === revision.current) setLoading(false);
    }
  }, [native]);

  useEffect(() => {
    mounted.current = true;
    if (!native) return () => { mounted.current = false; };
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 1000);
    const onFocus = () => { void refresh(); };
    const onVisibility = () => { if (!document.hidden) void refresh(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    let stopped = false;
    let unlisten: UnlistenFn | undefined;
    void listen<string>("workmemo:storage-error", ({ payload }) => {
      if (!stopped) setCommandError(`保存失败，已阻止关闭：${payload}`);
    }).then((unsubscribe) => {
      if (stopped) unsubscribe(); else unlisten = unsubscribe;
    }).catch((error: unknown) => {
      if (!stopped) setCommandError(`无法接收保存错误通知：${String(error)}`);
    });
    return () => {
      stopped = true;
      mounted.current = false;
      revision.current += 1;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      unlisten?.();
    };
  }, [native, refresh]);

  const run = useCallback(async (command: WorkCommand, args: Record<string, unknown>) => {
    if (!native || busyRef.current) return false;
    busyRef.current = true;
    setPending(command);
    setCommandError("");
    const request = ++revision.current;
    try {
      const data = await invoke<Snapshot>(command, args);
      if (mounted.current && request === revision.current) {
        setSnapshot(data);
        setConnectionError("");
        if (command === "start_task") setSavedId(null);
        if (command === "finish_task") {
          const id = typeof args.id === "number" ? args.id : null;
          setSavedId(confirmedFinish(data, id)?.id ?? null);
        }
      }
      return true;
    } catch (error: unknown) {
      if (mounted.current) setCommandError(String(error));
      return false;
    } finally {
      busyRef.current = false;
      if (mounted.current) { setPending(null); setLoading(false); }
    }
  }, [native]);

  return {
    native, snapshot, loading, busy: pending !== null, pending, savedId,
    connectionError, commandError, refresh,
    start: (input: StartInput) => run("start_task", { input }),
    pause: (id: number) => run("pause_task", { id }),
    resume: (id: number) => run("resume_task", { id }),
    finish: (id: number) => run("finish_task", { id }),
  };
}
````

## UPDATE — E:\WorkMemo\src\WorkForm.tsx

````
import { useId, useRef, useState, type FormEvent } from "react";
import { CATEGORIES, type StartInput } from "./types";
import { validateWorkInput, type InputErrors } from "./workInput";

interface Props {
  disabled: boolean;
  switching?: boolean;
  starting?: boolean;
  onStart: (input: StartInput) => Promise<boolean>;
}

export function WorkForm({ disabled, switching = false, starting = false, onStart }: Props) {
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState<InputErrors>({});
  const id = useId();
  const categoryRef = useRef<HTMLSelectElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const remarkRef = useRef<HTMLTextAreaElement>(null);

  function clearError(field: keyof StartInput) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    const result = validateWorkInput(category, quantity, remark);
    if (!result.ok) {
      setErrors(result.errors);
      (result.errors.category ? categoryRef : result.errors.quantity ? quantityRef : remarkRef).current?.focus();
      return;
    }
    setErrors({});
    await onStart(result.input);
  }

  return (
    <form className="work-form" aria-busy={starting} onSubmit={(event) => { void submit(event); }} noValidate>
      <div className="field-row">
        <label>工作类别
          <select ref={categoryRef} value={category} disabled={disabled}
            aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? `${id}-category` : undefined}
            onChange={(event) => { setCategory(event.target.value); clearError("category"); }}>
            <option value="">请选择类别</option>
            {CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          {errors.category && <span id={`${id}-category`} className="field-error" role="alert">{errors.category}</span>}
        </label>
        <label>工作数量
          <input ref={quantityRef} type="number" inputMode="decimal" min="0" max="1000000000" step="any"
            placeholder="大于 0" value={quantity} disabled={disabled}
            aria-invalid={Boolean(errors.quantity)} aria-describedby={errors.quantity ? `${id}-quantity` : undefined}
            onChange={(event) => { setQuantity(event.target.value); clearError("quantity"); }} />
          {errors.quantity && <span id={`${id}-quantity`} className="field-error" role="alert">{errors.quantity}</span>}
        </label>
      </div>
      <label>备注 <span className="optional">选填</span>
        <textarea ref={remarkRef} rows={2} maxLength={4000} placeholder="记下这次工作的内容…" value={remark}
          disabled={disabled} aria-invalid={Boolean(errors.remark)}
          aria-describedby={`${id}-remark-count${errors.remark ? ` ${id}-remark` : ""}`}
          onChange={(event) => { setRemark(event.target.value); clearError("remark"); }} />
        <span id={`${id}-remark-count`} className="field-count">{Array.from(remark.trim()).length} / 2000</span>
        {errors.remark && <span id={`${id}-remark`} className="field-error" role="alert">{errors.remark}</span>}
      </label>
      {switching && <p className="hint">开始后将结束并保存当前已暂停的任务。</p>}
      <button type="submit" disabled={disabled}>{starting ? (switching ? "正在保存并开始…" : "正在开始…") : switching ? "保存上一项，开始新工作" : "开始工作"}<span aria-hidden="true">↗</span></button>
    </form>
  );
}
````

## NEW FILE — E:\WorkMemo\src\workInput.ts

````
import { CATEGORIES, type StartInput } from "./types.ts";

export type InputErrors = Partial<Record<keyof StartInput, string>>;
type Validation = { ok: true; input: StartInput } | { ok: false; errors: InputErrors };

export function validateWorkInput(category: string, quantity: string, remark: string): Validation {
  const errors: InputErrors = {};
  if (!CATEGORIES.some((value) => value === category)) errors.category = "请选择工作类别。";
  const text = quantity.trim();
  const amount = Number(text);
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)
    || !Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
    errors.quantity = "请输入大于 0、且不超过 10 亿的数量。";
  }
  if (Array.from(remark.trim()).length > 2000) errors.remark = "备注不能超过 2000 个字符。";
  return Object.keys(errors).length ? { ok: false, errors }
    : { ok: true, input: { category, quantity: amount, remark: remark.trim() } };
}
````

## NEW FILE — E:\WorkMemo\src\workView.ts

````
import { formatDuration, type Snapshot, type WorkRecord } from "./types.ts";

interface ViewInput {
  native: boolean;
  loading: boolean;
  snapshot: Snapshot | null;
  connectionError: string;
  savedId: number | null;
}

export function confirmedFinish(snapshot: Snapshot | null, id: number | null): WorkRecord | null {
  if (id === null || !snapshot || snapshot.active) return null;
  return snapshot.recent_records.find((record) => record.id === id
    && record.status === "FINISHED" && record.end_time !== null) ?? null;
}

export function workView({ native, loading, snapshot, connectionError, savedId }: ViewInput) {
  const finished = confirmedFinish(snapshot, savedId);
  const record = snapshot?.active ?? finished;
  const mode = !native ? "preview" : loading ? "loading"
    : connectionError || !snapshot ? "unavailable"
    : snapshot.active ? (snapshot.active.is_paused ? "paused" : "working")
    : finished ? "finished" : "ready";
  const labels = { preview: "桌面预览", loading: "正在读取", unavailable: "暂不可用",
    paused: "已暂停", working: "进行中", finished: "已完成并保存", ready: "准备开始" };
  const captions = { preview: "请在桌面应用中开始工作", loading: "正在读取本地工作记录",
    unavailable: record ? "上次读取的时长，暂未更新" : "连接本地数据后显示时长",
    paused: "暂停期间不计时", working: "有效工作时长",
    finished: "本次有效工作时长", ready: "选择类别和数量，即可开始" };
  return {
    mode, record, finished, label: labels[mode], caption: captions[mode],
    timer: record ? formatDuration(record.duration_seconds) : mode === "ready" ? "00:00:00" : "--:--:--",
    canOperate: mode === "ready" || mode === "working" || mode === "paused" || mode === "finished",
  };
}
````

## NEW FILE — E:\WorkMemo\tests\workflow.test.mjs

````
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkInput } from '../src/workInput.ts';
import { confirmedFinish, workView } from '../src/workView.ts';

// Only test fixtures: never loaded into the app or written to a user's database.
const record = { id: 7, category: '开发', quantity: 1.5, remark: '测试夹具',
  start_time: 1000, end_time: null, duration_seconds: 65, duration_ms: 65000,
  status: 'WORKING', is_paused: false, recovery_pending: false };
const snapshot = { active: record, recent_records: [], warning: null };
const saved = { ...record, status: 'FINISHED', end_time: 100000 };
const finished = { active: null, recent_records: [saved], warning: null };
const view = (overrides = {}) => workView({ native: true, loading: false,
  snapshot, connectionError: '', savedId: null, ...overrides });

test('数量接受正小数、科学计数及上界，保留类别并去除备注首尾空白', () => {
  for (const [text, quantity] of [['1.25', 1.25], ['.5', .5], ['1e3', 1000], ['1000000000', 1e9]]) {
    assert.deepEqual(validateWorkInput('开发', text, '  内容  '), {
      ok: true, input: { category: '开发', quantity, remark: '内容' },
    });
  }
});

test('空值、非有限数、非正数、越界、十六进制及逗号不会启动任务', () => {
  for (const quantity of ['', ' ', 'NaN', 'Infinity', '0', '-1', '1000000001',
    '1e309', '1e-999', '0x10', '1,000', '1 2', 'abc']) {
    const result = validateWorkInput('开发', quantity, '');
    assert.equal(result.ok, false, quantity);
    assert.ok(result.errors.quantity, quantity);
  }
});

test('同时返回各字段错误，拒绝未知类别，按 Unicode 字符计算备注边界', () => {
  const invalid = validateWorkInput('', '0', '😀'.repeat(2001));
  assert.equal(invalid.ok, false);
  assert.deepEqual(Object.keys(invalid.errors), ['category', 'quantity', 'remark']);
  assert.equal(validateWorkInput('任意类别', '1', '').ok, false);
  assert.equal(validateWorkInput('文档', '1', ' 😀'.trim().repeat(2000)).ok, true);
});

test('首次读取和读取失败不伪装为空任务，不提供业务操作', () => {
  for (const overrides of [{ loading: true }, { connectionError: '读取失败' }, {}]) {
    const state = view({ snapshot: null, ...overrides });
    assert.notEqual(state.mode, 'ready');
    assert.equal(state.timer, '--:--:--');
    assert.equal(state.canOperate, false);
  }
  assert.equal(view({ snapshot: { active: null, recent_records: [], warning: null } }).mode, 'ready');
});

test('断线保留上次真实任务与时长，禁用操作；恢复后重新显示进行中', () => {
  const disconnected = view({ connectionError: '断线' });
  assert.equal(disconnected.mode, 'unavailable');
  assert.equal(disconnected.record.id, record.id);
  assert.equal(disconnected.timer, '00:01:05');
  assert.equal(disconnected.canOperate, false);
  assert.equal(view().mode, 'working');
  assert.equal(view().canOperate, true);
});

test('暂停、恢复使用同一条任务及后端累计时间', () => {
  const paused = view({ snapshot: { ...snapshot, active: { ...record, is_paused: true } } });
  assert.equal(paused.mode, 'paused');
  assert.equal(paused.timer, view().timer);
  assert.equal(paused.record.id, view().record.id);
});

test('只接受本次结束操作确认的已完成记录，有结束时间且没有活动任务', () => {
  assert.equal(confirmedFinish(finished, 7), saved);
  assert.equal(confirmedFinish(finished, null), null);
  assert.equal(confirmedFinish(finished, 8), null);
  assert.equal(confirmedFinish(snapshot, 7), null);
  assert.equal(confirmedFinish({ ...finished, active: record }, 7), null);
  assert.equal(confirmedFinish({ ...finished, recent_records: [{ ...saved, end_time: null }] }, 7), null);
  assert.equal(confirmedFinish({ ...finished, recent_records: [record] }, 7), null);
});

test('保存确认保留本次时长；失败、旧记录、开始新任务均不显示完成', () => {
  assert.equal(view({ snapshot: finished, savedId: 7 }).mode, 'finished');
  assert.equal(view({ snapshot: finished, savedId: 7 }).timer, '00:01:05');
  assert.equal(view({ snapshot: finished }).mode, 'ready');
  assert.equal(view({ savedId: 7 }).mode, 'working');
  assert.equal(view({ snapshot: finished, savedId: 7, connectionError: '断线' }).mode, 'unavailable');
});

test('浏览器预览不能通过已有快照启用业务操作', () => {
  assert.equal(view({ native: false }).mode, 'preview');
  assert.equal(view({ native: false }).canOperate, false);
});
````
