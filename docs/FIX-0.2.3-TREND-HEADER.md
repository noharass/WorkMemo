# v0.2.3 开发期：趋势图右上角文字排版修正

日期：2026-10-29（Asia/Shanghai）。起点 ecedf67。用户反馈趋势图右上角看起来换行，本次针对该处做最小修正。

## 原因和修正

实际检查发现图例「工作量 / 有效工时」未换行，是右侧坐标轴单位「小时」紧贴图例下方，造成换行的错觉。ECharts 绘制在 canvas 中，CSS white-space 无法修正这处布局。

保留图例单行，将绘图区顶部预留由 40px 增至 64px，使「数量 / 小时」在图例下方单独占一行。没有更改统计数据、计时、筛选、编辑、主题或窗口行为。

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\src\Dashboard.tsx |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| NEW FILE | E:\WorkMemo\docs\FIX-0.2.3-TREND-HEADER.md |
| NEW FILE | E:\WorkMemo\docs\FIX-0.2.3-TREND-HEADER-SOURCE.md |

完整代码见 [FIX-0.2.3-TREND-HEADER-SOURCE.md](FIX-0.2.3-TREND-HEADER-SOURCE.md)，保存整个 Dashboard.tsx，不省略代码。以前阶段的源码快照保持。

## 实际检查结果

- 改动前用隔离 HTTP 夹具复现：1440px 下图例文字与「小时」单位的纵向间距仅约 1px。
- 改动后检查 390、800、1024、1440、1920px，每种宽度覆盖有数据和空图；采集 canvas 文字边界，图例与单位纵向间距至少 19px，无相交。实际打开改后截图，确认图例同排、单位左右对齐且有独立间距。
- 已有总览及编辑回归通过：390、800、1024、1280、1440、1600、1920px 布局、125% CSS 缩放、详情进入编辑不自动提交、0 数量保存及失败保留输入。浏览器脚本错误为空。
- TypeScript / Vite 生产构建通过；原有图表分块大于 500kB 的提示保留。此次为绘图区间距修正，没有重跑无关的 Rust 测试，不将历史测试结果列作本轮执行。
- 截图和边界 JSON 位于 E:\WorkMemo\artifacts\0.2.3\qa\trend-header-before.png、trend-header-after.png、trend-header-before.json、trend-header-after.json，均为隔离展示数据，不是用户统计。不向用户数据库添加、结束或删除记录。

## PowerShell 命令与预期

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd run build
```

另一个终端启动浏览器预览后执行已有回归：

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

```powershell
$env:WORKMEMO_PLAYWRIGHT='C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
node .\scripts\verify-ui-022.mjs --dashboard-only
```

预期生产构建成功，脚本打印 Overview layout and editor regressions passed；查看趋势图时两项图例在同一行，数量与小时位于下方独立一行，缩窄页面后也不挤在一起。

## 兼容性和同步

仍使用既有 ECharts 6、React、TypeScript 和 Vite，不新增依赖、权限或数据库迁移。不修改公开 v0.2.2 下载资产，不将源码修正声称为旧运行实例已更新；修正随后续 v0.2.3 成品交付。浏览器 CSS 缩放不是 Windows 原生 DPI 验收。

```powershell
git fetch origin main
git add -- src/Dashboard.tsx docs/PHASE-8.md docs/FIX-0.2.3-TREND-HEADER.md docs/FIX-0.2.3-TREND-HEADER-SOURCE.md
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: separate trend axis units from legend"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

按既有授权提交同步，排除产物和隔离截图，保留未跟踪 DYNAMIC-ISLAND-PLAN.md。此次为已完成阶段的反馈修正，不自动跨入尚待确认的第 2 阶段。
