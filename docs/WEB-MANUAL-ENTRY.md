# 网页直接补记录：源码交付

2026-11-12，按用户「做完上面的再做这个」依次完成。本步骤接在北京时间零点结束提交 `d951862` 之后，不更改既有发布标签或安装包。

## 目标与现有实现

网页原先只能对已有记录补填类别、数量和备注，不能直接新建历史记录。本次在数据中心右上角增加「补记录」，复用现有类别名称、统计、详情和修正记录，不重写计时器。后端仍由 Rust 校验并使用同一 SQLite 保存。

表单包含类别、必填工作量（可为 0）、北京时间起止时间、休息分钟数、备注。有效工时为起止跨度减休息；结束必须晚于开始、不能在未来，休息不能超过跨度。保存为真实、已结束、已确认的 MANUAL_ENTRY 记录；页面显示「人工补录」，定位到开始日并刷新统计。跨日归属仍按现有开始日规则；现有报表日期显示沿用电脑本地时区，补录输入明确按固定 UTC+8 解释。

人工补录不会创建虚构计时区间、改变当前正在计时的任务或补计原任务的暂停时间；有效工时保存为记录基线。已有记录仍通过原编辑入口修改类别、数量和备注并保留修正历史，本步骤没有开放已有起止时间编辑或自动重叠消解。请核对历史明细，避免独立补录相同工作造成重复统计。

## 数据可靠性与兼容

- schema 12 新增 manual_entry_requests 请求表，不重建工作记录。每个新草稿使用独立请求 ID，记录与请求在同一事务提交；原样重试返回已保存记录，内容变更时不覆盖原记录。重启、时钟回拨、保存成功但响应丢失仍可去重。
- 删除记录保留请求墓碑，旧请求不能复活已删除记录。完整备份恢复同时恢复请求表和墓碑；仅记录导入保留补录的来源与工时，沿用已有导入去重机制。
- 前后端都校验类别、数量、备注和时间；Rust 是最终校验方。无产出与未填数量有区别，Unicode 备注限制为 2000 字符。
- 沿用本机 HTTP 的 Host、Origin、令牌与请求大小限制，不新增权限、依赖、远程接口或 Tauri 能力。meta 能力字段让旧后端保持入口禁用；演示范围不创建真实补录。
- 保存失败保留输入；保存期间禁用关闭与重复提交；取消草稿需明确放弃。支持 Ctrl+S，未保存或正在保存时关闭网页有浏览器保护。补录表单和日历支持窄屏；桌面旧按钮样式的影响只在新增控件范围修正。

当前公开 v0.2.9 安装包仍为 schema 10；零点结束步骤为 schema 11，本次后续源码为 schema 12。启动源码会升级数据库，旧版不能直接读新库，应先完整备份；回退须恢复升级前数据。本轮没有启动正式 WorkMemo，也没有结束、删除或修改真实工作任务。

## 实际检查结果

- `npm test`：59 通过；新增数量、时间、休息、未来时间、Unicode 边界校验。
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`：181 通过（176 库、2 helper、2 host、1 注册）；新增 7 组补录／完整恢复用例。加入时钟回拨断言后，7 组专项再次通过。
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` 与 `git diff --check` 通过。
- `npm run build` 通过，随后在 `127.0.0.1:1422` 启动生产资源预览。构建保留已有大分块提示，未将提示伪装为错误或通过原生验收。
- `verify-manual-entry.mjs`：5 组生产资源场景通过，pageErrors 为空；涵盖必填及休息校验、单次保存、当前计时保留、开始日定位、来源标签、失败草稿、放弃确认、响应丢失重试、纽约电脑时区与夏令时、360px 表单／日历、Ctrl+S、网页关闭保护、旧后端与演示范围。
- `verify-web-ui.mjs` 完整网页回归通过，涵盖现有补填、修改、删除、自然周期、分页、断线、未保存保护、焦点、缩放与多宽度。`verify-v027-web.mjs` 既有待补填流程 5 组通过。

早期专项发现旧桌面按钮宽度影响日期清除／日历按钮及窄屏弹出面板溢出，已作局部修正；保存按钮使用固定可访问名称，避免加载动画影响识别。测试等待官方弹层动画结束再操作；历史失败截图保留在隔离产物目录，与最终 `result.json` 区分。最终测试不连接真实工作数据库。

结果日志：`E:\WorkMemo\artifacts\manual-entry-rust.log`、`E:\WorkMemo\artifacts\manual-entry-web-regression.log`、`E:\WorkMemo\artifacts\manual-entry-pending-regression.log`。专项回执与截图：`E:\WorkMemo\artifacts\manual-entry\qa\result.json`、`filled-desktop.png`、`saved-record.png`、`mobile-calendar.png`、`mobile-form.png`。

本轮未打包新 Windows 成品，未声称原生透明窗口、真实扩展联动或新安装包已经验收。现有发布版本及版本文件保持 0.2.9；当前工作止于已授权的两项源码需求。

## 完整路径清单

| 状态 | 完整路径 |
| --- | --- |
| NEW FILE | E:\WorkMemo\src-tauri\migrations\012_manual_entries.sql |
| NEW FILE | E:\WorkMemo\src-tauri\src\manual_entry.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\manual_entry_tests.rs |
| NEW FILE | E:\WorkMemo\src\dashboard\ManualEntryModal.tsx |
| NEW FILE | E:\WorkMemo\src\dashboard\manualEntry.ts |
| NEW FILE | E:\WorkMemo\tests\manual-entry.test.mjs |
| NEW FILE | E:\WorkMemo\scripts\verify-manual-entry.mjs |
| UPDATE | E:\WorkMemo\src-tauri\src\database.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\dashboard.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\data_tools.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\categories.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\history_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\tracking_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\day_rollover_tests.rs |
| UPDATE | E:\WorkMemo\src\Dashboard.tsx |
| UPDATE | E:\WorkMemo\src\Dashboard.css |
| UPDATE | E:\WorkMemo\src\dashboard\api.ts |
| UPDATE | E:\WorkMemo\scripts\dashboard-fixture.mjs |
| UPDATE | E:\WorkMemo\docs\AUTO-TRACKING-SPEC.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| NEW FILE | E:\WorkMemo\docs\WEB-MANUAL-ENTRY.md |
| NEW FILE | E:\WorkMemo\docs\WEB-MANUAL-ENTRY-SOURCE.md |

完整 18 个程序／迁移／测试文件见 [WEB-MANUAL-ENTRY-SOURCE.md](WEB-MANUAL-ENTRY-SOURCE.md)，没有省略号代替代码。原有未跟踪 `E:\WorkMemo\docs\DYNAMIC-ISLAND-PLAN.md` 保留，不纳入本步骤提交。构建产物、依赖、数据库、凭据和本机配置均不提交。

## PowerShell 复查与预期

```powershell
Set-Location E:\WorkMemo
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort
```

另一个 PowerShell 窗口（Playwright 路径按本机安装调整）：

```powershell
Set-Location E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_WEB_URL = 'http://127.0.0.1:1422'
node scripts/verify-manual-entry.mjs
node scripts/verify-web-ui.mjs
node scripts/verify-v027-web.mjs
git diff --check
```

预期全部退出 0。仅在隔离数据中手工复查：打开补记录，先尝试留空工作量、倒置／未来时间、过长休息，须拒绝写入；再填过去两小时、扣除休息 30 分钟、工作量 0，保存后得到 01:30:00 的人工补录，原计时任务仍保持运行。模拟写入失败后输入保留；原样重试不会新增两条；详情计时区间为空但工时真实来自手工填写。最后使用隔离备份验证恢复后请求去重仍有效。

## Git 同步

精确暂存上表文件，审查后提交和推送；不移动标签、不强推、不覆盖远端新增历史。

```powershell
Set-Location E:\WorkMemo
git diff --cached --check
git diff --cached --stat
git commit -m "feat: add manual records in web dashboard"
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
git push origin HEAD:main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short
```
