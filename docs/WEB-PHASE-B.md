# 网页阶段 B：可访问性与错误可见性

2026-11-16，用户“继续下一阶段”授权执行 WEB-AUDIT-PLAN-2026-11-15.md 的 B 阶段，范围为 F06–F09、R01。保留 Ant Design、ECharts、现有布局和业务写入保护。版本仍为 0.2.10，数据库 schema 12 不变；本轮未重建、上传或替换公开安装包，也未操作用户真实任务。阶段 C、D 等待确认。

## 修改结果

- 补录、工作量编辑和报表筛选关联可见标签与控件 ID；必填字段有 required / aria-required，说明和实际错误通过 aria-describedby 关联。初始不显示错误；修改对应字段后清除该字段错误。必填星号对读屏隐藏，避免改变控件名称。
- 验证失败后聚焦第一个无效字段，浏览器将它滚入弹层可见区；跨字段时间错误聚焦摘要，并提供返回起止时间的按钮。服务端失败仍保留输入、请求身份及重试能力。备注按现有前后端 Unicode 字符规则校验 2000 字符，不再用 UTF-16 maxLength 提前截断 emoji。
- 加深辅助文字、占位符、详情标签、表头、图表坐标文字、状态标签等颜色。键盘焦点使用 outline；强制颜色模式使用 Canvas / CanvasText / Highlight，包含折叠数据表的 role=button 控件。
- 后台更新时间不再设置 aria-live；独立 status 区仅播报主动刷新成功或连接恢复，弹层打开时清空播报，避免不可达背景持续发声。错误继续使用原有 Alert；真实读屏体验尚未验证。
- 趋势和工作日历新增可键盘展开的语义数据表，直接使用与图表相同的服务端毫秒聚合，按秒显示、最多三位小数，12 行分页；不另算统计，不改变空周期规则。类别占比按钮名称按可见文字顺序排列，并保留工时及筛选用途。
- 待补填选择、详情、补录和确认框使用一致的背景 inert。补录放弃确认同时隔离下层表单，关闭后恢复触发点。复用原 Drawer 的 Edge Tab 边界补偿到 Modal，保留组件库的焦点管理和动画。

## 实际检查

| 检查 | 结果与范围 |
| --- | --- |
| npm.cmd test | 67 项通过；新增错误字段分类及 Unicode 场景 |
| cargo test --locked --manifest-path src-tauri/Cargo.toml | 182 项通过（177 + 2 + 2 + 1），Rust 源码未改 |
| npm.cmd run build | TypeScript 与生产构建通过；Dashboard 约 1,571.17 kB 的分块警告保留，性能优化属于 C |
| npm.cmd run test:web | 完整网页回归通过：保存/读取失败、并发/重复提交、草稿、旧响应、分页/范围、短屏、六种宽度、125/150% CSS 缩放、减少动画 |
| verify-manual-entry.mjs | 5 组补录回归通过，包含丢失响应原样重试只写一条、错误保留输入、旧后端与演示范围隔离 |
| verify-v027-web.mjs | 5 组待补填回归通过 |
| verify-v027-feedback.mjs | 5 组导航、饼图、筛选、空值与响应布局回归通过 |
| verify-web-phase-a.mjs | 5 组 A 阶段回归通过：状态、精度、错误分类、刷新有界、旧请求取消 |
| verify-web-phase-b.mjs | 7 组通过：错误关联/焦点/可见性、Unicode、时间摘要、嵌套确认、待补填隔离、图表数据表、静默轮询、320×568 短屏（相关检查合并在各组） |
| axe-core 4.14.0 | 总览、详情、补录错误、补录确认、图表数据表、窄屏补录 6 个稳定状态，报告的 violations 均为空；仍有 incomplete，不能据此声称整体 WCAG 合规 |
| 实际合成背景文字对比度 | 30 个可见、未被遮挡、非 inert 的代表样本通过 4.5:1；总览 17 个最低 5.304，详情 3 个最低 4.670，补录 10 个最低 4.838 |

对比度工具先记录计算文字颜色，临时设为透明以保留布局，截图读取其中心背景像素，复算颜色混合和相对亮度，再立即恢复样式。使用真实 Edge 合成背景，不把半透明背景当纯白；只覆盖记录的样本，不代表所有悬停、禁用、图形和用户自定义颜色。隔离 fixture 数据仅供自动化，不进入产品或用户数据库。强制颜色截图已检查，键盘 outline 可见；canvas 图表仍使用自身颜色，其数值可由系统颜色数据表读取。

本地证据均在 Git 忽略范围：E:\WorkMemo\artifacts\web-phase-b\result.json、axe-*.json、contrast-*.json/png、mobile-error.png、forced-colors.png；日志在 E:\WorkMemo\artifacts\phase-b-{node,rust,build,web,regression,manual,pending,a-regression,feedback}.log。早期 failure 文件仅作排错，最终结果以 result.json、最终日志和退出状态为准。

## 完整路径及代码

| 类型 | 完整路径 | 用途 |
| --- | --- | --- |
| UPDATE | E:\WorkMemo\src\Dashboard.tsx | 表单错误、筛选语义、播报和弹层隔离 |
| UPDATE | E:\WorkMemo\src\Dashboard.css | 文字、焦点、强制颜色和数据表样式 |
| UPDATE | E:\WorkMemo\src\dashboard\ManualEntryModal.tsx | 补录字段语义、错误焦点及嵌套确认 |
| UPDATE | E:\WorkMemo\src\dashboard\manualEntry.ts | 校验结果附带错误字段，业务规则不变 |
| UPDATE | E:\WorkMemo\src\dashboard\Charts.tsx | 图表说明、同源数据表、可见名称及坐标文字 |
| NEW FILE | E:\WorkMemo\src\dashboard\ChartDataTable.tsx | 语义表格与分页 |
| UPDATE | E:\WorkMemo\src\ui\UiProvider.tsx | 官方主题 token、隐藏装饰必填星号 |
| UPDATE | E:\WorkMemo\src\ui\BottomSheet.tsx | 允许内容滚动、复用键盘边界处理 |
| NEW FILE | E:\WorkMemo\src\ui\loopTabWithin.ts | 共享 Edge Tab 边界补偿 |
| UPDATE | E:\WorkMemo\tests\manual-entry.test.mjs | 错误字段及字符规则回归 |
| UPDATE | E:\WorkMemo\scripts\verify-v027-feedback.mjs | 适配可见文字顺序的新按钮名称 |
| NEW FILE | E:\WorkMemo\scripts\verify-web-phase-b.mjs | 生产资源、模拟生产 CSP、隔离浏览器专项 |
| NEW FILE | E:\WorkMemo\scripts\web-contrast.mjs | 开发用实际背景像素对比度测量 |
| NEW FILE | E:\WorkMemo\docs\WEB-PHASE-B.md | 本交付记录 |
| NEW FILE | E:\WorkMemo\docs\WEB-PHASE-B-SOURCE.md | 上述 13 个实现/测试文件的完整源码，无省略 |
| UPDATE | E:\WorkMemo\docs\BUILDING.md | 检查入口 |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md | 阶段记录 |

完整代码保存在上述项目文件，并汇集到 WEB-PHASE-B-SOURCE.md。保留原有未跟踪 E:\WorkMemo\docs\DYNAMIC-ISLAND-PLAN.md，不纳入提交。不新增产品运行依赖、外部请求或权限。

## PowerShell 复核与预期

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

第二个 PowerShell 窗口，填写本机已有 Playwright 路径；axe 和 Pillow 仅用于开发检查：

```powershell
Set-Location E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT='C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_WEB_URL='http://127.0.0.1:4174'
$env:WORKMEMO_UI_URL='http://127.0.0.1:4174/'
npm.cmd run test:web
node scripts/verify-manual-entry.mjs
node scripts/verify-v027-web.mjs
node scripts/verify-v027-feedback.mjs
node scripts/verify-web-phase-a.mjs
npm.cmd pack axe-core@4.14.0 --pack-destination artifacts --silent
New-Item -ItemType Directory -Force -Path artifacts\audit-tools | Out-Null
tar -xf artifacts\axe-core-4.14.0.tgz -C artifacts\audit-tools
$env:WORKMEMO_AXE='E:\WorkMemo\artifacts\audit-tools\package\axe.min.js'
python -c "from PIL import Image; print(Image.__version__)"
$env:WORKMEMO_CONTRAST='1'
node scripts/verify-web-phase-b.mjs
```

本机已有 Pillow 12.3.0；其他电脑测像素对比度前需自行准备 Python/Pillow。未设置 WORKMEMO_AXE 或 WORKMEMO_CONTRAST 会分别跳过相应工具检查，不能将跳过报告为通过。预期 B 的 passed 为 7 组、errors 为空、6 个 axe 状态无 violations、contrast 三组样本的最低值均至少 4.5。自动化只连接拦截后的内存 API；生产资源/CSP 验证不等同于真实 Tauri 验收。

手动复核可在隔离环境输入负数量、2001 个 emoji 和倒置时间，保存后检查焦点/关联错误，修改为 0 或 2000 个 emoji 后再保存；用 Tab / Shift+Tab 操作二次确认并取消，核对焦点恢复；展开趋势/日历表按秒读取数值。不要为验收结束用户正在进行的任务。

## 兼容性与保留项

实测 Windows、Node 24.18.0、Edge 157、Rust MSVC；新增 inert、React useId 和官方 Ant Design 配置适用于当前 Chromium/WebView2 技术栈，不添加 polyfill。未实测 Firefox/Safari、移动真机、真实 Narrator、200% 浏览器缩放、Windows 高 DPI、原生透明/扩展联动、安装卸载。axe 的 incomplete（包括对比度、bypass、aria-prohibited-attr）仍需人工判断，30 个像素样本不能替代整体验收。阶段 C 的自定义趋势连续性、冷启动与交互性能未执行，D 的原生与读屏验收仍待完成。

本轮使用 Modern Web Guidance 的 accessible-error-announcement、forms、accessibility、color；分别落实“move focus to the first invalid field”、“always associate `<label>` with its input using `for` and `id`”、“Provide semantic data tables as alternatives”和“Maintain 4.5:1 for normal text”，并按强制颜色指南保留系统颜色 outline。保留框架弹层，按 custom overlays 指南添加 inert，未改为原生 dialog。

```powershell
git fetch origin main
git add -- src/Dashboard.tsx src/Dashboard.css src/dashboard/ManualEntryModal.tsx src/dashboard/manualEntry.ts src/dashboard/Charts.tsx src/dashboard/ChartDataTable.tsx src/ui/UiProvider.tsx src/ui/BottomSheet.tsx src/ui/loopTabWithin.ts tests/manual-entry.test.mjs scripts/verify-v027-feedback.mjs scripts/verify-web-phase-b.mjs scripts/web-contrast.mjs docs/WEB-PHASE-B.md docs/WEB-PHASE-B-SOURCE.md docs/BUILDING.md docs/PHASE-8.md
git diff --cached --check
git diff --cached --stat
git commit -m "fix: improve dashboard accessibility and validation focus"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

按既有授权提交推送，不强推。实际检查和同步结果以最终回复为准。
