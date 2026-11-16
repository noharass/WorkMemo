# 网页阶段 C：趋势连续性与加载成本

2026-11-16，按用户“继续下一阶段”授权执行 WEB-AUDIT-PLAN-2026-11-15.md 的 C 阶段（R02、R03）。先读取实际实现、确认生产预览可启动，复现后再修改。版本仍为 0.2.10，schema 12 不变；未操作真实任务或数据库，未重建/上传 Windows 安装包，不自动进入 D 阶段。

## 检查与修改

修改前，Rust 内存 SQLite 专项确认：2024-02-27 至 03-02 范围中只有两条记录时，趋势只返回两个日期；选中全年但记录集中在一天时，仍按天返回一个点。两项预期测试先失败，日志为 artifacts/phase-c-trend-before.log，修正后通过。

自定义趋势现在由 Rust 按筛选后的已结束记录、电脑本地日历统一聚合：

- 明确选择的开始/结束边界优先；未填的一侧使用筛选结果中最早/最晚已结束记录的本地日期。
- 包含已结束记录的范围，缺失周期补零；补零项 records=0，不创建工作记录，不把未补填数量算作已确认数量。真实零时长记录仍保留 records=1。
- 起止日期差不超过 120 天时按天补齐，最多 121 个点；更长范围按月聚合。按所选范围决定粒度，避免“全年只有一天有记录”仍画日桶。
- 月份数超过 1200 时，每 ceil(月份数/1200) 个月合并一桶，按所选开始月份对齐，总点数不超过 1200。完整 1970-01-01 至 9999-12-31 范围是 1190 桶、每桶 81 个月，最后一桶始于 9995-10；末端真实记录仍计入，不截断总额。
- 范围中没有已结束记录时，自定义趋势保持空数组，页面显示“当前范围没有已结束记录。”；自然日/周/月原有零桶行为不变。
- 响应增加 range.trend_step，UI 对多月桶明确显示合并宽度及起始月份含义；TypeScript 将步长设为可选，兼容旧后端。图表与 B 阶段数据表继续直接使用同一份服务端结果，不在前端重算业务统计。

Node fixture 和真实 Rust 查询共用 dashboard-trend-contract.json 的 8 个场景，验证桶数、首尾、非零值所属桶、时长总和、记录数、空结果、真实零值和开放边界，避免仅靠模拟实现掩盖差异。另有 Rust 专项覆盖闰日、数量/未补填、极大范围、最后一桶记录与精度。

性能 trace 显示，长帧脚本主要归于包含 React 调度器的入口回调，布局成本也明显；模块求值只是其中一部分。未用压缩函数名推断“全部是 ECharts”，未把可见趋势图延后加载或机械添加 scheduler.yield。

main.tsx 将桌面主窗、设置窗、状态岛按入口动态导入，网页避开未使用的桌面代码和 60.12 kB 桌面 CSS。设置窗显式导入自己的 App.css，修复它此前借用主窗导入样式的隐式依赖；网页只补齐原有工作类别徽标需要的局部样式和字体设置。保留 Ant Design / ECharts、现有 polling reconcile，不改 Vite 配置、不加运行依赖、Worker、Service Worker 或遥测。

评估了哈希资源缓存：本轮测量主要是冷启动 CPU/布局成本，改变缓存不能替代这些修正；未扩大服务端修改范围，现有 HTML/API/资源的 no-store 策略保留，未缓存私密业务数据。

## 最终构建的性能对比

同一台 Windows / Edge 157，1440×1000、Asia/Shanghai、4 倍 CPU 模拟、关闭 HTTP 缓存，每次新浏览器 context。前后各三次，使用相同初始日视图隔离数据、同一生产 CSP、相同观察窗口和交互顺序；冷启测量时不并行编译或运行其他验收浏览器。这里是本地内存 API，没有网络限速、真实大库或现场 INP 结论。

| 指标 | 修改前 3 次 | 最终修改后 3 次 |
| --- | --- | --- |
| 首屏实际请求 JS 解码字节 | 1,948,678 / 1,948,678 / 1,948,678 | 1,854,810 / 1,854,810 / 1,854,810 |
| 最大长任务 ms | 689 / 576 / 721 | 522 / 453 / 475 |
| LCP ms | 2660 / 1640 / 1904 | 1700 / 1140 / 1340 |
| CLS | 0.197173 / 0.081386 / 0.081386 | 0.070275 / 0.070275 / 0.070275 |
| 本次操作中捕获的最大 Event Timing duration ms | 344 / 192 / 280 | 152 / 160 / 248 |

首屏 JS 减少 93,868 字节，约 4.82%；最大长任务样本中位数 689→475 ms，LCP 中位数 1904→1340 ms。仍有数百毫秒长任务，不能承诺不同机器都达到相同比例。Dashboard 自身约 1,571.50 kB，构建分块警告仍存在，本轮没有靠调高阈值隐藏它。

| 相同交互的 click-to-settled 实验室中位数 ms | 修改前 | 修改后 |
| --- | --- | --- |
| 切换周 | 727.6 | 597.3 |
| 切换日 | 610.8 | 489.6 |
| 切换月 | 576.9 | 440.9 |
| 展开辅助图表 | 793.2 | 707.1 |

click-to-settled 包含 Playwright 点击、HTTP 响应、刷新完成和双 rAF；展开辅助图表还包含固定 350 ms 动画稳定等待。它不是 INP。Event Timing 仅收集观察到、达到 16 ms 阈值的交互事件，样本最大值也不是现场 INP。LoAF 只用于开发工具，功能检测后记录本地脚本来源/时长；trace 的嵌套 FunctionCall 等时长不是互斥 CPU 总和。没有真实低配机/网络、现场 p75、长期内存或性能稳定性结论。

## 实际检查结果

- Node：69 项通过。
- Rust：185 项通过（180 + 2 + 2 + 1），cargo fmt --check 通过；包含 8 场景共享契约和 3 个新增趋势测试。
- TypeScript / Vite 生产构建通过；生产预览在本轮独立端口 4174 实际启动，保留原有 4173 实例。
- C 浏览器专项 7 组通过：闰日/边界、全年月桶、极大范围及数据表末页、空结果、真实零值、网页资源隔离，以及主窗/设置/状态岛组件和样式加载。
- 完整网页回归、5 组补录、5 组待补填、5 组 A 专项、7 组 B 专项、5 组布局回归通过；保存失败保留输入、旧响应不覆盖、重复请求去重、并发修改保护、取消删除、状态/范围和缩放等原有检查保持通过。
- B 的 6 个 axe 状态无报告 violations，仍有 incomplete；30 个代表文字像素样本最低 4.67:1，不能替代人工读屏或完整 WCAG 验收。
- 桌面新网页绑定/结束后再绑定/挂起恢复隔离回归通过；状态岛手动展开、草稿保护、区域 IPC、四皮肤和减少动画隔离回归通过。这里模拟 IPC，没有启动或修改真实用户实例，不是原生透明/DPI 验收。

证据在 Git 忽略的 E:\WorkMemo\artifacts\web-phase-c\before\result.json、cold-1/2/3.trace.json 和 after 下同名文件；C UI 结果在 web-phase-c\qa\result.json。可用 Edge DevTools Performance 导入 trace。中途失败的脚本日志只用于排错，最终结论以上述 result.json 和最终退出状态为准。

其余日志在 E:\WorkMemo\artifacts\phase-c-{node,rust,build,web,regression,manual,pending,a,b,feedback,page-task,island,before-performance,after-performance}.log；初始构建日志为 phase-c-before-build.log。A/B 及各既有脚本也输出自己的忽略证据目录。本轮未将截图、trace、构建产物、数据库、凭据或本机配置提交 Git。

## 完整文件路径与源码

| 类型 | 完整路径 | 作用 |
| --- | --- | --- |
| UPDATE | E:\WorkMemo\src-tauri\src\data_center.rs | 按统一趋势计划查询并补零 |
| UPDATE | E:\WorkMemo\src-tauri\src\report_periods.rs | 本地日历桶、月跨度和上限 |
| UPDATE | E:\WorkMemo\src-tauri\src\report_tests.rs | 真实 SQLite 趋势与共享契约 |
| UPDATE | E:\WorkMemo\src\main.tsx | 按入口动态加载 |
| UPDATE | E:\WorkMemo\src\PanelApp.tsx | 设置窗显式加载桌面样式 |
| UPDATE | E:\WorkMemo\src\Dashboard.css | 网页自己的徽标与字体样式 |
| UPDATE | E:\WorkMemo\src\Dashboard.tsx | 显示多月聚合宽度 |
| UPDATE | E:\WorkMemo\src\reportPeriod.ts | 可选步长与聚合说明 |
| UPDATE | E:\WorkMemo\src\dashboard\Charts.tsx | 空趋势提示 |
| UPDATE | E:\WorkMemo\scripts\dashboard-fixture.mjs | 对齐 Rust 趋势契约 |
| UPDATE | E:\WorkMemo\tests\report-period.test.mjs | 步长说明及旧后端兼容 |
| NEW FILE | E:\WorkMemo\tests\dashboard-trend.test.mjs | Node 共享契约 |
| NEW FILE | E:\WorkMemo\tests\fixtures\dashboard-trend-contract.json | 8 场景验收数据，非产品记录 |
| NEW FILE | E:\WorkMemo\scripts\verify-web-phase-c.mjs | 图表/数据表/入口回归 |
| NEW FILE | E:\WorkMemo\scripts\measure-web-phase-c.mjs | 三次冷启 trace、LoAF 与交互测量 |
| NEW FILE | E:\WorkMemo\docs\WEB-PHASE-C.md | 本交付 |
| NEW FILE | E:\WorkMemo\docs\WEB-PHASE-C-SOURCE.md | 上述 15 个实现/测试文件的完整内容，无省略 |
| UPDATE | E:\WorkMemo\docs\BUILDING.md | 新检查入口 |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md | 阶段记录 |

完整代码保存在各项目文件，并另汇集到 WEB-PHASE-C-SOURCE.md。保留未跟踪 E:\WorkMemo\docs\DYNAMIC-ISLAND-PLAN.md，不暂存。数据聚合无数据库迁移，权限和数据路径不变；API 新增步长为加法兼容，旧字段保留。

## PowerShell 命令和复核预期

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

第二个 PowerShell 窗口（填写本机 Playwright 路径）：

```powershell
Set-Location E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT='C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_WEB_URL='http://127.0.0.1:4174'
$env:WORKMEMO_UI_URL='http://127.0.0.1:4174/'
node scripts/verify-web-phase-c.mjs
npm.cmd run test:web
node scripts/verify-manual-entry.mjs
node scripts/verify-v027-web.mjs
node scripts/verify-web-phase-a.mjs
$env:WORKMEMO_AXE='E:\WorkMemo\artifacts\audit-tools\package\axe.min.js'
$env:WORKMEMO_CONTRAST='1'
node scripts/verify-web-phase-b.mjs
node scripts/verify-v027-feedback.mjs
node scripts/verify-page-task-ui.mjs
node scripts/verify-island-manual-expand.mjs
$env:WORKMEMO_MEASUREMENT='after'
node scripts/measure-web-phase-c.mjs
```

axe-core 4.14.0、Python/Pillow 12.3.0 是 B 阶段已有开发工具，准备方法见 WEB-PHASE-B.md；不设置对应环境变量则跳过这些检查，不能报告为通过。其余浏览器脚本不要求这些工具。性能测量不要并行运行构建和其他浏览器验收，硬件波动正常，不以时间阈值做自动通过断言。测量脚本每次覆盖对应 label 的证据；重测 before 必须使用修改前源码和构建，改 label 并不会还原旧版本。本轮已保存真实的前后结果。

预期 Node 69 / Rust 185 全部通过，C passed=7 且 errors 为空；性能输出 3 个样本及 3 个 trace。手动复核请使用隔离记录，检查跨闰日的零值、全年月桶、零时长和无记录的区别；展开数据表，比较实际秒数。极大范围检查应看到明确多月合并说明和可分页数据，不应生成几百万日点。不结束用户当前工作做测试。

实测 Windows / Node 24.18.0 / Edge 157 / Rust MSVC。React.lazy、import() 及当前 Tauri/WebView2 使用已有依赖能力，无新增兼容层。Firefox/Safari、移动真机、真实 Narrator、Windows 原生透明/扩展联动/DPI、200% 浏览器缩放、成品安装卸载仍未由本轮验收；D 阶段另行确认。当前公开 0.2.10 成品尚未包含 A/B/C 的源码修正。

本轮使用 Modern Web Guidance 的 performance（“DO use dynamic imports”）指导入口拆分；identify-heavy-scripts（“DO summarize the key information”）指导本地 LoAF 汇总，并保留 trace 供归因。没有把仅用于实验室的观测代码或遥测放入产品。

```powershell
git fetch origin main
git add -- src-tauri/src/data_center.rs src-tauri/src/report_periods.rs src-tauri/src/report_tests.rs src/main.tsx src/PanelApp.tsx src/Dashboard.css src/Dashboard.tsx src/reportPeriod.ts src/dashboard/Charts.tsx scripts/dashboard-fixture.mjs tests/report-period.test.mjs tests/dashboard-trend.test.mjs tests/fixtures/dashboard-trend-contract.json scripts/verify-web-phase-c.mjs scripts/measure-web-phase-c.mjs docs/WEB-PHASE-C.md docs/WEB-PHASE-C-SOURCE.md docs/BUILDING.md docs/PHASE-8.md
git diff --cached --check
git diff --cached --stat
git commit -m "fix: fill bounded custom trends and isolate desktop entry loading"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

按既有授权提交并推送，不强推；实际同步状态见最终回复。完成后停在 C 阶段，D 阶段等待确认。
