# WorkMemo v0.2.2 同工作多个 URL

后续调整总览网格排版，当前成品摘要见 [UPDATE-0.2.2-LAYOUT.md](UPDATE-0.2.2-LAYOUT.md)；本文保留多 URL 修订交付记录。

日期：2026-10-28（Asia/Shanghai）。起点 1167216。目标：一项工作需要使用多个网站时，可在同一工作下添加并管理多个 URL，在匹配网站间切换时保持同一条计时记录。

## 检查与实现

已检查产品规范、自动记录补充、监测配置、Rust 状态机及启动状态。底层原本允许最多 50 条平面网址规则，已规定同记录内切换匹配 URL 不拆分；问题在于设置页把每个 URL 当作独立工作页面展示，没有明确的同工作多网址入口。

- 按现有工作类别评测、质检、开发、文档分组，显示每组 URL 数量。已有配置直接进入对应组，含网址的组默认展开，空组可展开添加。
- 每组有「为该工作添加 URL」按钮，可重复添加；每条网址独立选择路径前缀、整个站点、域名后缀，支持移除以及使用「归属工作」移动到其他组。
- 临时规则 ID 使用组件内递减序号，避免快速连续添加时 Date.now 碰撞。编辑、删除按规则 ID 操作，不因分组改变原数组索引而误改其他网址。
- 保存仍通过原有 save_monitor_config，由 Rust 规范化、验证并提交 SQLite。总上限 50 条、重复检查、配置版本冲突、保存失败保留输入及保存时自动任务保护沿用既有规则。
- 不新增 API、表或数据库迁移，仍为 schema 8；浏览器扩展仍接收原规则数组，只需为新增网站同步授权。切换网站沿用原计时规则，不新增记录、不重置时长。
- 不创建自定义工作名称或新的任务管理体系；这里的工作按当前应用已有四类别分组。当前活动记录的类别与修正行为保持原规则。

## 文件与完整代码

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\src\MonitoringSettings.tsx |
| UPDATE | E:\WorkMemo\src\App.css |
| UPDATE | E:\WorkMemo\src-tauri\src\tracking_tests.rs |
| NEW FILE | E:\WorkMemo\scripts\verify-multi-url.mjs |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| UPDATE | E:\WorkMemo\docs\UPDATE-0.2.2.md |
| UPDATE | E:\WorkMemo\docs\UPDATE-0.2.2-COMPACT.md |
| NEW FILE | E:\WorkMemo\docs\UPDATE-0.2.2-MULTI-URL.md |
| NEW FILE | E:\WorkMemo\docs\UPDATE-0.2.2-MULTI-URL-SOURCE.md |

完整实现与验证代码见 [UPDATE-0.2.2-MULTI-URL-SOURCE.md](UPDATE-0.2.2-MULTI-URL-SOURCE.md)，没有使用省略号替代代码。既有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md 保持原样，不提交。

## 实际验证结果

- TypeScript 与 Vite 生产构建通过；已有图表分块体积提示保留。
- Node 测试 46 项通过；Rust 格式检查通过。
- 定向 Rust 测试 multiple_sites_for_one_work_keep_one_record_and_continuous_time 通过：同一评测工作配置两个网站，交替切换六次，活动 ID、类别不变，不暂停、不重复出现开工候选，有效时长累计 11 秒，结束后只有一条待补全记录。这是状态机模拟测试，不是真实浏览器原生验收；本轮未声称重新运行此前全部 119 项 Rust 测试。
- 隔离浏览器 IPC 验证通过：添加第二 URL 并单独选择后缀模式、连续添加及精准移除、跨类别移动再移回、保存失败保留两个输入、成功保存并重新打开仍在同组。页面错误为空。测试发现夹具需要设置当前 Tauri API 使用的 isTauri 标识，修正夹具后完成，不将最初读取不到配置的夹具失败声称为产品问题。
- 实际打开检查多 URL 设置截图；截图只使用隔离测试配置，没有读取、改写用户真实配置。结果与截图位于 artifacts/0.2.2/qa/multi-url-result.json 和 multi-url-settings.png。
- 用户正在 Downloads 目录运行的程序保持运行，不为构建结束或暂停任务。实际 Chrome 新站点授权及多站点切换、Windows 原生透明／DPI 不由此浏览器夹具验证，仍需实机补验。

## PowerShell 命令

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --manifest-path .\src-tauri\Cargo.toml multiple_sites_for_one_work_keep_one_record_and_continuous_time
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.2\SHA256SUMS.txt
```

可选浏览器检查需本机 Edge 和已有 Playwright，不新增运行依赖；另一个终端先运行 npm run dev：

```powershell
$env:WORKMEMO_PLAYWRIGHT='C:/path/to/playwright/index.mjs'
node .\scripts\verify-multi-url.mjs
```

预期打印 Multi-URL settings regression passed。打包前关闭本轮开发服务，释放 Windows 原生模块。

## 使用与验收

1. 用户自行退出旧实例并换用更新后的 0.2.2 包，再进入「监测 → 工作与网址」。已有 URL 应按类别归入相应组，不需重填。
2. 展开「评测」，添加飞书站点与另一个工作平台 URL；分别选择匹配模式，保存配置。
3. 在扩展中同步新增站点授权。匹配后产生新操作并确认开工，在两个网站间切换，应保持同一记录与连续工时。离开全部匹配页面或空闲仍按原规则处理。
4. 移除其中一个 URL，其他网址应保留；保存失败时输入不得丢失；重新打开后配置仍在。

兼容性：Windows x64／WebView2，固定技术栈与依赖版本不变，数据库 schema 8 不变，保留旧配置与工作记录。版本继续为 0.2.2，使用最终摘要区分修订；旧进程需用户稍后退出并换新包才会加载新设置页。本轮不公开 Release。

## Git 命令

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "feat: group multiple URLs under each work category"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

按既有授权提交推送；不提交产物、依赖、真实数据库、凭据或个人配置。

## 最终本地成品

Windows 打包脚本完整执行通过，release 和中文 NSIS 构建成功；ZIP 共 15 项，主程序与 release EXE 一致，配套资源与 staging 一致，使用说明包含多 URL 操作步骤。全部 SHA256 已重新计算比对，包内不含用户数据库或个人设置。未运行安装／卸载。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.2_x64-setup.exe | 3204725 | `4d18e4c7b226b82a6a0f28268be0b66e6724d0a6dae77999848ae4a2874a8627` |
| WorkMemo_0.2.2_windows_x64.zip | 4420345 | `82fd40058c910b84722d18b0769dad621de31adfcd48d1fc02c6b655bcea6a9e` |
| THIRD-PARTY-LICENSES.txt | 2413135 | `e777d5ab332cfc49e972c31557a53981845dfb8ab75dcfd0d9ac03ec48d5b620` |

交付目录 `E:\WorkMemo\artifacts\0.2.2`。此前紧凑修订成品保留在 qa/compact-delivery-1167216；当前摘要以本节为准。Git 同步核对回执保存在 qa/git-sync-multi-url.txt。
