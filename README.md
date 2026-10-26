# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前是第一阶段的最小桌面工程，接入真实的 React → Tauri IPC → Rust 连接检查。
任务、SQLite、原生透明、换肤、历史和统计尚未实现。

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

原生窗口应显示「桌面连接正常」，「重新检查」会再次调用 Rust。
保留系统标题栏，可拖动、缩放和关闭。

```powershell
npm run build
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm run tauri build -- --no-bundle
```

Release 可执行文件：E:\WorkMemo\src-tauri\target\release\workmemo.exe。
当前只验证可执行文件构建；正式安装包在后续阶段验收。

`npm run dev` 仅为浏览器预览，不能证明原生能力，页面会明确提示预览模式。

## 文件关系

- src/：React 界面，通过 app_info 命令调用 Rust。
- src-tauri/src/：Rust 入口和连接检查。
- src-tauri/tauri.conf.json：窗口、构建、安全配置。
- src-tauri/capabilities/：原生权限，当前不申请额外权限。
- docs/PRODUCT-SPEC.md：用户提供的完整产品规范。
- docs/PHASE-1.md：交付、文件清单与实际验收记录。
- AGENTS.md：后续开发约束。
- package-lock.json / src-tauri/Cargo.lock：锁定前后端依赖。

开发顺序：可靠持久化与计时 → 原生透明 → 主题 → 主界面 → 历史统计 → 综合验收。
每阶段结束后等待用户确认。

## GitHub 同步

仓库：https://github.com/noharass/WorkMemo

每个明确完成的开发步骤或阶段，在检查并记录实际结果后提交、推送到 main。
同步操作不替代阶段验收。当前原生窗口交互、Release 独立启动仍有待验收项，见 docs/PHASE-1.md。
同步规则见 AGENTS.md，操作说明见 docs/GITHUB-SYNC.md。
