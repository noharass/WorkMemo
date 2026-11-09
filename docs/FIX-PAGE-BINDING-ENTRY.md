# 主窗口缺少新建任务入口：源码修正

2026-11-09（Asia/Shanghai）。本轮目标是修正网页任务结束后的重新绑定入口，不增加新的任务或计时机制。安装包和公开 Release 未更新，版本保持 0.2.8。

## 检查、原因与修正

用户确认「打开主窗口处理」后也没有新建选项。检查当前文件、产品规范、第八阶段记录、运行进程和启动说明后，在 Vite 1423 端口实际启动隔离前端。没有发现名称包含 WorkMemo 的运行进程，没有打开正式原生应用或用户数据库。

隔离复现已确认一种缺陷：`browsing_only=true` 时，App 隐藏 PageBindingPrompt 和 FinishedPagePrompt；普通监测卡片又因为存在 unknown_page_url 或 finished_page_rule 而不显示。因此两个表单均消失，普通新建按钮也消失。修复前隔离日志：新网页、已结束绑定两种状态的 createButtons=0、prompts=0，主内容仅余待补全和今日工作量。这证明代码存在该缺陷，不能证明用户当时必然启用了仅浏览；真实用户现场状态仍未读取。

修正内容：

- App 在仅浏览下仍显示绑定处理表单，允许用户保存网页与任务关系。
- 已结束任务表单直接显示「新建任务／绑定已有任务」单选选项，默认新建；已有任务未选择时不能提交。保存期间禁用输入，保存失败保留输入。
- 两个表单在仅浏览下说明保存不会开始计时。
- 灵动岛将结束绑定标题改为「网页任务待处理」，说明主窗可新建或选择其他任务；不再给已结束绑定显示不存在的忽略选项。原新网页仍保留忽略提示。
- 继续使用原 rebind_finished_page、bind_page 和 Rust 校验；没有改动 Rust、SQLite schema、权限、依赖、版本、应用标识或用户数据。保存关系不调用开始／恢复计时接口，仍由原监测和人工操作规则控制开表。

## 文件与完整代码

| 类型 | 完整路径 | 作用 |
| --- | --- | --- |
| UPDATE | E:\WorkMemo\src\App.tsx | 主窗口显示条件 |
| UPDATE | E:\WorkMemo\src\FinishedPagePrompt.tsx | 明确的新建和已有任务入口 |
| UPDATE | E:\WorkMemo\src\PageBindingPrompt.tsx | 仅浏览停表说明 |
| UPDATE | E:\WorkMemo\src\NotificationApp.tsx | 灵动岛标题及操作指引 |
| UPDATE | E:\WorkMemo\scripts\desktop-fixture.mjs | 隔离仅浏览状态 |
| UPDATE | E:\WorkMemo\scripts\verify-v026.mjs | 将旧「展开工作提醒」选择器对齐既有「展开任务与提醒」名称 |
| NEW FILE | E:\WorkMemo\scripts\verify-page-binding-entry.mjs | 本次缺陷回归 |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md | 源码修订与操作说明 |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md | 阶段进度 |
| NEW FILE | E:\WorkMemo\docs\FIX-PAGE-BINDING-ENTRY.md | 本交付记录 |
| NEW FILE | E:\WorkMemo\docs\FIX-PAGE-BINDING-ENTRY-SOURCE.md | 上述七个程序／脚本文件的完整源码，无省略 |

原有未跟踪的 E:\WorkMemo\docs\DYNAMIC-ISLAND-PLAN.md 保留，不纳入本次提交。artifacts 下的复现脚本、截图和结果为本机验收材料，不提交。

## PowerShell 复查

```powershell
Set-Location E:\WorkMemo
npm.cmd test
npm.cmd run build
# 独立终端启动生产资源预览，保持运行：
npm.cmd run preview -- --host 127.0.0.1 --port 1420 --strictPort
```

另一个 PowerShell：

```powershell
Set-Location E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1420/'
$env:WORKMEMO_WEB_URL = 'http://127.0.0.1:1420'
node scripts/verify-page-binding-entry.mjs
node scripts/verify-page-task-ui.mjs
node scripts/verify-v026.mjs
node scripts/verify-v027-feedback.mjs
git diff --check
```

## 实际结果与限制

- Node 57 项通过；TypeScript 与 Vite 生产构建通过，保留 Dashboard 大于 500 kB 的现有构建警告。
- 新增入口回归在开发资源和生产资源均通过：普通／仅浏览两种模式、结束绑定新建／已有任务、新网页新建、失败保留草稿、320／420／780 宽度无横向溢出、灵动岛入口与文案；保存绑定不调用开工或恢复接口，隔离 active 保持空，browsing 状态不变。截图和结果位于 E:\WorkMemo\artifacts\page-binding-entry\qa，已人工查看 320 宽截图。
- 原页面任务回归在开发资源和生产资源均通过，覆盖绑定、重新绑定、暂停任务继续、八任务列表及窄屏。
- 旧 v026 回归第一次因历史按钮名「展开工作提醒」超时；已将脚本选择器对齐现有「展开任务与提醒」。生产资源重跑时前五组（主窗新建和草稿、暂停切换、连续开工、结算草稿、新候选失效和仅浏览）通过，第六组在 scripts/verify-v026.mjs:200 等待旧「工作 URL」字段超时，因此全脚本未通过，不将后续设置和四皮肤项目计为已验收。本轮不扩大修改监测设置与历史脚本。
- v027 feedback 首次因其网页端单独读取 WORKMEMO_WEB_URL，默认 1420 未监听而连接失败；启动生产预览并设置两个 URL 后重跑，五组全部通过。
- Rust 没有修改，本轮没有重跑 Cargo 测试。没有对正式数据库制造、结束、解绑或删除任务。
- 本轮未构建 Windows 安装包，未更新公开下载。浏览器隔离截图不能作为原生透明、焦点、扩展授权或 Windows 实机验收。用户使用修复仍需要后续成品更新。

## 人工测试方法与预期

使用独立测试标识和测试数据库，不用真实工作记录验收：

1. 准备已绑定且任务已结束的测试网页，启用仅浏览，从灵动岛打开主窗；预期直接看到「新建任务／绑定已有任务」。
2. 新建并确认绑定；预期提示关闭，仍为仅浏览，不创建计时段，旧记录的工时及待补全保持。
3. 再次准备结束绑定，选择另一项未结束任务；未选择时确认禁用，选择后可保存。
4. 未绑定网页在仅浏览下也能选择新建或记住忽略；保存绑定仍不开始计时。
5. 模拟后端拒绝保存；预期错误可见、名称不丢失，可以重试。普通模式下重复相同步骤，并核对原有暂停与重启保护。

上述真实 Windows 步骤为待验收项目，不计作通过。兼容性沿用 Windows x64、Edge WebView2、schema 10 与配套 0.2.8 扩展。

## Git 同步命令

提交前精确暂存上表文件，检查暂存区不含 artifacts、数据库、依赖或凭据：

```powershell
Set-Location E:\WorkMemo
git diff --cached --check
git diff --cached --stat
git commit -m "fix: keep page task creation available while browsing"
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
# 远端无新提交或已安全整合后：
git push origin HEAD:main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short
```

源码修正阶段结束后等待确认，不自动修改版本或发布资产。
