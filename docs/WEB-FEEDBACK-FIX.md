# 网页三项反馈修正

2026-11-16；源码仍为 0.2.11，未重打或替换公开安装包。

## 目标、原因与修正

- 趋势和工作日历的展开数据表由秒改为小时/分钟，例如 3840000 毫秒显示 1小时4分钟；不足一分钟明确标注。只改变展示，后端毫秒精度和其他计时器不变。
- 日期筛选原来每次渲染创建 dayjs(value)，两秒轮询触发底层 picker 按新对象重置浏览月份。抽出 FilterDateField，用 useMemo 稳定对象，覆盖基准日期及自定义起止日期。
- 详情/补填共用 Drawer 从整卡滑入改为 12px 位移，移除卡片和遮罩背景模糊；共用 Modal 从 0.2 倍缩放改为 8px 淡入淡出，覆盖补记录、删除及未保存确认。保留 Ant Design 生命周期、焦点、滚动锁与减少动态效果。选择器继续沿用库的过渡，没有新增动画依赖。

开发前检查产品规范、阶段记录、React、数据获取链路和 Tauri 配置；未发现运行中的 WorkMemo，不启动正式应用或操作真实任务。实际启动 Vite 开发预览 4174 和生产预览 4175；所有浏览器测试使用隔离 HTTP 数据，不连接真实数据库。

## 完整路径与文件关系

- UPDATE `E:\WorkMemo\src\Dashboard.tsx`：调用新的日期组件。
- NEW FILE `E:\WorkMemo\src\dashboard\FilterDateField.tsx`：稳定所选日期对象。
- UPDATE `E:\WorkMemo\src\dashboard\ChartDataTable.tsx`：两张图表的工时数据表。
- UPDATE `E:\WorkMemo\src\ui\BottomSheet.tsx`：去掉移动弹层的双重模糊。
- UPDATE `E:\WorkMemo\src\ui\UiProvider.tsx`：加载共享弹层样式。
- NEW FILE `E:\WorkMemo\src\ui\overlayMotion.css`：共用 Modal/Drawer 轻量过渡。
- NEW FILE `E:\WorkMemo\scripts\verify-web-feedback.mjs`：反馈专项。
- UPDATE `E:\WorkMemo\scripts\verify-web-phase-b.mjs`：工时显示约定。
- UPDATE `E:\WorkMemo\scripts\verify-web-ui.mjs`：动画位移约定。
- UPDATE `E:\WorkMemo\docs\PHASE-8.md`：当前阶段记录。
- UPDATE `E:\WorkMemo\docs\BUILDING.md`：检查入口。
- NEW FILE `E:\WorkMemo\docs\WEB-FEEDBACK-FIX.md`：交付说明。
- NEW FILE `E:\WorkMemo\docs\WEB-FEEDBACK-FIX-SOURCE.md`：完整应用代码、测试脚本与暂存命令，无省略代码。

## 已执行命令与结果

```powershell
Set-Location E:\WorkMemo
npm.cmd test
npm.cmd run build
# 在独立终端运行预览：
npm.cmd run preview -- --host 127.0.0.1 --port 4175 --strictPort
# 另一个终端：
$env:WORKMEMO_PLAYWRIGHT='C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_WEB_URL='http://127.0.0.1:4175'
node scripts/verify-web-feedback.mjs
node scripts/verify-web-phase-b.mjs
node scripts/verify-web-ui.mjs
git diff --check
```

Node 69/69、TypeScript/Vite 生产构建通过；既有大 chunk 警告保留。反馈专项普通动态/减少动态共 6 组通过：11月切10月并跨两次轮询、翻年、选日应用、自定义起止、小时分钟表格、详情/补填/补记录开关与 Tab 焦点。实际动画关键帧为 Drawer translateY(12px) 到 none、Modal wm-overlay-in，未发送业务写入。

B 阶段 7 组交互检查通过，含错误焦点、嵌套确认、强制颜色及窄屏；此次未启用 axe 或额外对比度测量。完整网页回归通过，含保存与失败恢复、脏表单、筛选/分页/删除、6 档宽度、1.25/1.5 CSS 缩放、减少动态、背景隔离、重复提交及短距离动画。129 个动画采样帧验证位移及背景锁定，不是 FPS 结论。

证据位于 `artifacts/web-feedback/results.json`、`artifacts/web-phase-b/`、`artifacts/web-ui/qa/`，不提交测试产物。已查看 800px 补填截图，内容及保存入口可见。

## 手动测试与兼容性

1. 展开趋势和工作日历数据，预期显示小时/分钟，少于一分钟明确标注。
2. 基准日期从11月切至10月，等待5秒再选日期；预期月份不跳回、应用保留选择。自定义开始/结束日期也相同。
3. 连续开关详情、补填、补记录、删除与未保存确认；预期短距离淡入，输入、Tab 和关闭正常；系统减少动态后不发生空间移动。

兼容当前 Ant Design 6.6.8、Edge/WebView2，无新增依赖、权限或新浏览器特性要求。Rust、SQLite 和版本均不变，未运行 Rust 测试。实际 Windows GPU/显示器上的流畅体感、原生透明、安装卸载没有重验，不据浏览器关键帧承诺所有硬件无掉帧。未重打安装包；公开 0.2.11 成品暂不包含这次源码修正。

## Git

保留用户既有未跟踪的 `docs/DYNAMIC-ISLAND-PLAN.md`，不纳入本次提交。暂存全部明确交付文件的命令见完整源码清单。

```powershell
git -c http.proxy=http://127.0.0.1:7890 fetch origin main
git diff --cached --check
git diff --cached --stat
git commit -m "fix: smooth web overlays and preserve date picker navigation"
git -c http.proxy=http://127.0.0.1:7890 push origin main
git rev-parse HEAD
git -c http.proxy=http://127.0.0.1:7890 ls-remote origin refs/heads/main
git status --short --branch
```

代理仅单次用于本机既有网络配置，不修改全局设置；不强推或移动发布标签。实际同步结果见最终回复。

## Modern Web Guidance

使用 motion 指南“Prefer to animate `opacity` and `transform`”，保留现有库的生命周期与可访问性机制，避免全局极短时长覆盖。
