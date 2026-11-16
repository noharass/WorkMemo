# 网页阶段 D：自动验收、人工回执与 Windows 候选交付

2026-11-16，按用户“继续下阶段”进入 D。用户随后要求“不用 computer-use，打开我来看一下就行了”；此后未用 computer-use 控制窗口，使用独立数据实例供用户手动查看。自动验收和候选构建已完成；真实读屏、系统 DPI、实际扩展联动及安装卸载尚未全验收，不能将 D 整体标为全部通过。

本轮未修改应用业务代码、schema 12、版本 0.2.10 或正式数据路径。打包脚本新增受限的输出目录参数，避免覆盖旧成品；新增验收脚本和独立标识配置。没有替换公开 Release 资产或移动 v0.2.10 标签。Windows 候选使用 C 阶段应用源码提交 1e4907d3e390d9ac537cb63b06cf8ecd744d75b4；该提交本轮已成功推送并核对远程一致。

## 实际检查

| 项目 | 结果与范围 |
| --- | --- |
| Node | 69 项通过，npm ci 恢复锁定依赖后再次执行 |
| Rust | 185 项通过（180 + 2 + 2 + 1），cargo fmt --check 通过 |
| 生产前端 | TypeScript/Vite 构建通过；Dashboard 大分块警告保留，未提高警告阈值 |
| 完整网页 | 保存失败保留输入、已提交后读取失败、重复提交、旧响应、草稿/确认、分页/范围、只读任务、取消删除、短屏/多宽度、减少动态等通过 |
| 补录/待补填 | 各 5 组通过，保留响应丢失原样重试去重和演示/真实范围隔离 |
| A/B/C 专项 | A 5 组、B 7 组、C 7 组通过，Rust/Node 共享趋势和状态契约保持通过 |
| 布局及桌面隔离回归 | 5 组布局、网页任务绑定/挂起恢复、状态岛手动展开/草稿/区域 IPC/四皮肤/减少动态通过；模拟 IPC 不等同原生验收 |
| axe/对比度 | B 的 6 个稳定状态无报告 violations，仍有 incomplete；30 个代表文字样本最低 4.67:1，不能替代人工读屏或整体 WCAG 验收 |
| 实际浏览器缩放 | Chromium 151.0.7922.34，125/150/200% 各通过布局、错误字段可见性、抽屉/确认/补录 Tab 循环、背景隔离；没有写入测试记录，活动任务样本未改 |
| 强制颜色 | Edge 的既有 B 专项及 Chromium 实际 200% 下字段焦点 outline 通过，截图复核完成 |
| Windows 正式构建 | Tauri release、原生浏览器 helper、NSIS x64 目标安装器和完整 ZIP 构建通过；未执行安装器 |
| 候选内容 | 主程序 PE 为 x64，ProductVersion 0.2.10 / FileVersion 0.2.10.0；ZIP 15 文件白名单及全部条目源字节、正式 helper profile、扩展 version_name、SHA256 一致 |
| 原有资产 | E:\WorkMemo\artifacts\0.2.10 的原校验文件及所列 3 个文件复算通过，未覆盖；未修改公开资产 |
| 独立原生实例 | 按新验收配置 debug 构建并启动；实际窗口标题“WorkMemo 网页改造验收（独立数据）”，进程响应正常。用户对显示/透明效果/窗口操作回答“正常” |
| 实际 Rust 网页服务 | 对上述隔离实例只读检查：无授权请求 403，授权 meta 200 / 0.2.10，内嵌 Dashboard/动态 JS/CSS/图片加载，实际 SQLite 查询可用、CSP 存在、页面无运行错误。没有 mock HTTP，没有调用补录/结算/删除接口 |

浏览器主回归使用 Edge 157。真实缩放由临时 Chromium 验收 profile 中的本地扩展调用 [tabs.setZoom/getZoom](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom)，回读倍率，并同时核对 innerWidth、devicePixelRatio、html CSS zoom=1。扩展只在 artifacts 下的临时测试 profile 加载，仅授予 127.0.0.1 host permission，不安装到用户浏览器、不增加产品权限；方法遵循 [Playwright 扩展测试文档](https://playwright.dev/docs/chrome-extensions)。

| 实际倍率 | CSS 视口 | devicePixelRatio | 页面横向溢出 | 字段错误/嵌套焦点/写入 |
| --- | --- | --- | --- | --- |
| 125% | 1139×724 | 1.25 | 无 | 可见 / 正常 / 0 |
| 150% | 949×603 | 1.5 | 无 | 可见 / 正常 / 0 |
| 200% | 712×452 | 2 | 无 | 可见 / 正常 / 0 |

发现测试工具 page.screenshot 在 viewport:null + 实际缩放下出现裁切/空白；改用 CDP Page.captureScreenshot，不调整窗口或页面缩放后复核截图正常。这是验收取证修正，未因此修改产品布局。现有窄屏 320×568 和 CSS 缩放回归仍保持通过；实际浏览器缩放不等同 Windows 系统 DPI。

## 用户人工回执与仍待检查项目

用户已明确确认：独立桌面窗口显示、透明效果和窗口操作“正常”。该回执不扩展为已逐项完成四种皮肤、所有不透明度、不同显示器 DPI、真实浏览器扩展和 Narrator 矩阵。

真实 Narrator + Edge 的朗读顺序、错误/状态播报、表格导航仍待人工检查；未把浏览器 AX 树或 axe 当作实际朗读结果。原生四皮肤逐项、系统 DPI、扩展实际联动、安装卸载和实际开机登录仍待确认。用户要求自行看界面后，本轮没有代为控制窗口完成这些步骤，也没有结束用户任务。

静态示例预览： http://127.0.0.1:4175/dashboard#token=isolated-phase-d ，页面明确标注“示例数据、内存操作、不影响真实记录”，使用当前源码 fixture；原 4173 实例保留。此地址不是正式用户数据中心，不能用于验收真实写入。原生验收实例使用 com.workmemo.test.webacceptance，数据目录 E:\WorkMemo 之外的 C:\Users\Administrator\AppData\Local\com.workmemo.test.webacceptance；配置沿用正式原生透明和窗口参数，但标识独立，debug / 非正式标识下正式自启注册不可用。没有为验收删除旧测试目录或用户记录。

原生实例和 4175 预览保留供用户查看。本轮未使用 UI 自动化修改其任务或关闭窗口。只读 HTTP 脚本在内存中使用隔离 endpoint token，证据不记录 token、meta 内容、工作记录或浏览器存储；不可把 endpoint 文件提交或随成品分发。

## 本地候选成品

候选目录：E:\WorkMemo\artifacts\web-phase-d\candidate-0.2.10。这些文件尚未公开发布，不能与既有 0.2.10 下载文件混用校验值。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.10_x64-setup.exe | 3834169 | 6d874b09dec632b609e1e2e8586c2505de849c858a5aebcea46ada8f1846852f |
| WorkMemo_0.2.10_windows_x64.zip | 5135088 | ef724a72ad99aa91177b59aa91693e3e22bee41364df014ddd96a110796b4998 |
| THIRD-PARTY-LICENSES.txt | 2570495 | 998efb4d5965b2fd8fe366b023a3b45855adc91dafabda9d20d195a6b8107b2c |
| SHA256SUMS.txt | 288 | 24aad6c79f5ac4478fcf0498c07e45f834ac8c748f9636be9c649243d93c0cdb |

正式候选使用 com.workmemo.desktop；运行/安装它会使用正式数据并遵循正式自启设置，因此本轮只构建、核验，没有启动该 release 程序或执行安装器。供人工查看的是上述独立标识的 debug 原生实例。成品仍需 Windows x64 / WebView2，安装器未签名；schema 12 不支持直接降级，更新前按现有使用指南备份。

首次打包在 Vite 构建预览仍运行时触发 npm ci 的 Windows 原生模块占用失败。只停止本轮 4174 构建预览后重试，依赖恢复、完整打包和各项回归通过；4173 / 4175 静态预览与真实用户任务未关闭。打包前应停止使用当前 node_modules 的 Vite 进程，不应强行删除被占用文件或强制结束不明进程。

## 完整路径与代码

| 类型 | 完整路径 | 用途 |
| --- | --- | --- |
| UPDATE | E:\WorkMemo\scripts\package-windows.ps1 | 可选 OutputDirectory，限制在 workspace artifacts 下，保留原默认输出行为 |
| NEW FILE | E:\WorkMemo\scripts\verify-web-phase-d.mjs | 隔离 Chromium 实际缩放、焦点/错误和强制颜色 |
| NEW FILE | E:\WorkMemo\scripts\verify-native-dashboard.mjs | 独立 Tauri 只读 HTTP/内嵌网页核验 |
| NEW FILE | E:\WorkMemo\scripts\verify-windows-candidate.ps1 | 主程序版本/架构、ZIP 白名单/字节、profile/扩展、SHA256 和旧资产 |
| NEW FILE | E:\WorkMemo\src-tauri\tauri.web-acceptance.conf.json | 具有独立数据标识的原生验收窗口，保留完整透明参数 |
| NEW FILE | E:\WorkMemo\docs\WEB-PHASE-D.md | 本交付、人工回执和限制 |
| NEW FILE | E:\WorkMemo\docs\WEB-PHASE-D-SOURCE.md | 上述 5 个脚本/配置完整源码，无省略 |
| UPDATE | E:\WorkMemo\docs\BUILDING.md | 候选打包和新验收入口 |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md | 进度及未完成项目 |

完整代码在项目文件和 WEB-PHASE-D-SOURCE.md。原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md 不暂存。忽略的本地证据：artifacts/web-phase-d/result.json、zoom-125/150/200.png、zoom-200-forced-colors.png、native-http-result.json、package-verification.json，日志为 artifacts/phase-d-*.log。临时 Chromium profile、扩展、静态预览脚本、成品及 endpoint 均不提交 Git；证据路径为 E:\WorkMemo 下完整 artifacts 路径。

## PowerShell 复核命令与预期

本轮构建与脚本校验使用 PowerShell 7。另尝试系统 Windows PowerShell 5.1 时遇到默认执行策略阻止脚本，未将其报告为最终通过，未修改系统执行策略；校验脚本保留 UTF-8 BOM 并避免依赖较新的十六进制 API。

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
# 先停止当前项目的 Vite 开发/构建预览，保留真实应用任务和静态预览。
& .\scripts\package-windows.ps1 -OutputDirectory artifacts/web-phase-d/candidate-0.2.10
& .\scripts\verify-windows-candidate.ps1
npm.cmd run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

打包命令会重建指定候选目录内的同名文件，不改 artifacts/0.2.10；不传 OutputDirectory 则仍使用原 artifacts/版本号 路径并可能覆盖该路径已有文件。验证旧资产需要本机 artifacts/0.2.10 的原四项文件；克隆仓库后应先从原发布获取这些文件再做“未覆盖”核验。测试编译和 Tauri 构建不要并行占用同一个 Cargo target。预期 Node 69、Rust 185 通过，候选校验为 true，ZIP 条目数 15，旧本地资产保留。

第二个窗口，以下路径按本机已有运行时调整：

```powershell
Set-Location E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT='C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_WEB_URL='http://127.0.0.1:4174'
$env:WORKMEMO_UI_URL='http://127.0.0.1:4174/'
$env:WORKMEMO_CHROMIUM_EXECUTABLE='C:\Users\Administrator\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe'
node scripts/verify-web-phase-d.mjs
npm.cmd run test:web
node scripts/verify-manual-entry.mjs
node scripts/verify-v027-web.mjs
node scripts/verify-web-phase-a.mjs
node scripts/verify-web-phase-c.mjs
$env:WORKMEMO_AXE='E:\WorkMemo\artifacts\audit-tools\package\axe.min.js'
$env:WORKMEMO_CONTRAST='1'
node scripts/verify-web-phase-b.mjs
node scripts/verify-v027-feedback.mjs
node scripts/verify-page-task-ui.mjs
node scripts/verify-island-manual-expand.mjs
```

缩放脚本需要 Playwright 的完整 Chromium（本机已有 151）；官方 Chrome/Edge 不适用于该扩展旁载启动方式。Edge 的其他主回归独立执行；临时 Chromium 检查不冒称为 Edge/Narrator 检查。axe/Pillow 的准备见 B 阶段文档，未设置工具路径会跳过相应检查，不能记作通过。

原生验收构建须在 release 打包完成之后单独执行，不覆盖正式安装包：

```powershell
Set-Location E:\WorkMemo
npm.cmd run tauri -- build --debug --ci --no-bundle --no-binary-patching --config src-tauri/tauri.web-acceptance.conf.json -- --locked
Start-Process 'E:\WorkMemo\src-tauri\target\debug\workmemo.exe' -WindowStyle Normal
$env:WORKMEMO_NATIVE_ENDPOINT=Join-Path $env:LOCALAPPDATA 'com.workmemo.test.webacceptance/dashboard.endpoint.json'
# 运行前核对该 endpoint 的 localhost 监听进程是刚启动的验收实例。
node scripts/verify-native-dashboard.mjs
```

原生脚本不启动应用、不截取用户数据、不点击控件。用户可手动按 Tab/Shift+Tab 检查对话框和数据表，用 Edge + Narrator 检查朗读，并逐项验证四皮肤与系统缩放；结果需另记，不能根据本次“正常”扩大验收范围。不要为了测试结束真实工作或删除记录。

本轮 Modern Web Guidance 的 accessibility 指南用于组合自动扫描、键盘/焦点、缩放和人工回执，遵循“Don't rely purely on scores”。未因此重写现有框架弹层或加入新功能。

## Git 与发布边界

已按授权恢复 C 的 GitHub 同步；代理只通过单条 Git 命令参数使用，没有修改全局或仓库代理设置。此机直连不稳定时可用既有 127.0.0.1:7890 代理，其他环境不要照搬。

```powershell
git fetch origin main
git add -- scripts/package-windows.ps1 scripts/verify-web-phase-d.mjs scripts/verify-native-dashboard.mjs scripts/verify-windows-candidate.ps1 src-tauri/tauri.web-acceptance.conf.json docs/WEB-PHASE-D.md docs/WEB-PHASE-D-SOURCE.md docs/BUILDING.md docs/PHASE-8.md
git diff --cached --check
git diff --cached --stat
git commit -m "test: validate web release candidate and isolated Windows preview"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

发布规则仍按已确认计划：“版本及发布目标另行确认，不因本计划覆盖0.2.10资产”。本轮准备了可审阅的候选，并记录人工限制；公开替换或新版本发布等待明确决定，不自动上传，也不强推或移动既有标签。最终同步结果见本轮回复。
