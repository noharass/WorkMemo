# 灵动岛默认收起：源码修订

2026-11-10（Asia/Shanghai）。用户反馈每次切换标签页灵动岛都会展开，希望保留提示、默认不展开。本轮完成源码修正与隔离验证，不自动跨入成品发布；公开版本与安装包仍为 2026-11-09 的 0.2.7 修订。

## 检查、复现与最小修正

开发前阅读 PRODUCT-SPEC.md 和 PHASE-8.md，检查 NotificationApp、IslandExpansion、Rust 窗口显示条件与实际进程。未发现名称以 WorkMemo 开头的运行进程；实际启动 Vite 1423 开发预览，并用隔离 IPC 复现，不启动正式应用或访问真实数据库。

原逻辑在 `bindingKey` 或开工／结束／空闲提醒 key 变化时执行 setExpanded(true)。隔离复现结果：初次新网页展开高度 110；手动收起、换到另一网页后又恢复到 110。记录位于 `E:\WorkMemo\artifacts\island-manual-expand\qa\baseline.json`。

本次修改：

- 去掉提醒变化触发的自动展开；初始和手动收起后均保持收起。用户已手动展开的处理区域不会因为新提醒强制关闭，原任务确认与保存成功后的收起行为保留。
- 收起时显示网页待处理、待确认开工、工作量待填或空闲提醒的短文字，展开箭头旁有静态圆点；不添加闪烁和自动展开设置项。用户点击箭头才展开。
- 顶部开始、暂停／继续和打开主窗口等操作保留。已经打开的补填表单与草稿不会被切页覆盖，放弃未保存内容仍须确认。
- Rust 的窗口可见性补充「仅剩待处理网页」情况；该状态不再依赖展开区 hold 才能显示收起提示。没有活动任务时也保持可见，用户通过托盘隐藏的偏好仍受尊重。不改激活焦点、计时、SQLite、业务数据、权限、依赖或版本。
- 三个现行相关界面脚本改为显式点击展开，符合新行为；新增专项覆盖切页后不重新展开和草稿保护。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| Node | 57 项通过 |
| Rust | 158 库、2 helper、2 主机、1 注册，共 163 项通过；包含新增「无活动任务、不 holding 也显示待绑定提示，并尊重隐藏偏好」用例 |
| 格式 | Cargo fmt --check 和 git diff --check 通过 |
| 前端构建 | TypeScript/Vite 生产构建通过，保留现有 Dashboard 大于 500 kB 的警告 |
| 新增生产资源专项 | 初始收起、3 次不同网页、2 个已结束绑定标识、2 个开工候选、结束和空闲提醒均不自动展开；明确点箭头能展开，收起高度为 0，区域 IPC=56、hold=false；顶栏开工仍只提交一次；补填草稿和未保存关闭保护保持；四皮肤 × 40/100% 八张截图无横向溢出、圆点无动画；减少动态效果下手动展开／收起通过 |
| 相关生产回归 | verify-page-task-ui、verify-page-binding-entry、verify-v027-island 均通过，覆盖原绑定处理、任务切换、区域重复展开和收起竞态 |

人工查看 Cream 40% 和 Dark 100% 的收起截图，短文字、静态圆点和箭头可见。截图与新增专项结果位于 `E:\WorkMemo\artifacts\island-manual-expand\qa`。专项初次尝试遇到首帧 snapshot 尚未完成及 textarea 标签精确匹配不适用，已在测试脚本等待真实快照、使用既有备注标签定位，生产资源重跑通过；不计作产品失败，也不把最初未完成的运行计为通过。

本轮没有运行正式 Windows GUI、安装／卸载或重打包成品。浏览器 IPC 与 Rust 单元测试不能替代真实原生透明、裁剪区域点击、焦点、扩展往返及多屏 DPI 验收。历史 v025/v026 脚本仍有旧自动展开与字段定位假设，本轮未运行、不报告通过。没有结束、删除、解绑或修改真实任务。

## 完整文件清单与代码

| 类型 | 完整路径 | 作用 |
| --- | --- | --- |
| UPDATE | E:\WorkMemo\src\NotificationApp.tsx | 只由用户操作展开，显示收起提醒 |
| UPDATE | E:\WorkMemo\src\App.css | 静态提醒圆点 |
| UPDATE | E:\WorkMemo\src-tauri\src\service.rs | 待绑定网页的原生窗口可见性与测试 |
| UPDATE | E:\WorkMemo\scripts\verify-page-task-ui.mjs | 绑定提醒回归显式展开 |
| UPDATE | E:\WorkMemo\scripts\verify-page-binding-entry.mjs | 新建入口回归显式展开 |
| UPDATE | E:\WorkMemo\scripts\verify-v027-island.mjs | 手动展开、原生区域 IPC 回归 |
| NEW FILE | E:\WorkMemo\scripts\verify-island-manual-expand.mjs | 本轮行为专项 |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md | 默认收起源码说明及现行 schema 口径 |
| UPDATE | E:\WorkMemo\docs\BUILDING.md | 当前与历史测试适用范围 |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md | 阶段进度 |
| NEW FILE | E:\WorkMemo\docs\FIX-ISLAND-MANUAL-EXPAND.md | 本交付记录 |
| NEW FILE | E:\WorkMemo\docs\FIX-ISLAND-MANUAL-EXPAND-SOURCE.md | 上述七个程序／脚本完整内容 |

完整代码保存在项目文件中，并逐项收录于 [FIX-ISLAND-MANUAL-EXPAND-SOURCE.md](FIX-ISLAND-MANUAL-EXPAND-SOURCE.md)，不以省略号替代。原有未跟踪 `E:\WorkMemo\docs\DYNAMIC-ISLAND-PLAN.md` 保留、不提交。artifacts、构建产物、真实数据库、依赖和凭据不提交。

## PowerShell 命令与测试预期

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm.cmd run build
# 独立终端保持生产预览运行：
npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort
```

测试终端执行：

```powershell
Set-Location E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1422/'
node scripts/verify-island-manual-expand.mjs
node scripts/verify-page-task-ui.mjs
node scripts/verify-page-binding-entry.mjs
node scripts/verify-v027-island.mjs
git diff --check
```

预期各命令退出 0，专项输出 manual expansion passed；提醒变化时展开区保持 0 高、区域 IPC 保持 56，无额外开工提交。手动点箭头后才出现处理区，未保存草稿不被新网页替换。

Windows 人工验收需使用独立标识和测试数据库：连续切换新网页及已结束绑定，预期只有圆点和短文字变化、不展开、不抢焦点；点击箭头应能处理任务；补填期间切页不丢输入；托盘隐藏后普通待绑定提示不强制显示。不使用真实未结束任务制造验收数据。这些原生步骤为待验收，并未计作通过。

兼容性保持 Windows 10／11 x64、WebView2、Tauri 2、SQLite schema 10、0.2.7 配套扩展；无需数据迁移或清空外观设置。本次源码尚未进入公开安装包。

## Git 同步

按项目既有授权，检查暂存区、适当测试与记录后提交并推送 origin/main，不改变远程、全局身份或标签，不强推：

```powershell
Set-Location E:\WorkMemo
git diff --cached --check
git diff --cached --stat
git commit -m "fix: keep island reminders collapsed until user opens"
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
# 远端无新提交或已安全整合后：
git push origin HEAD:main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short
```

本源码修订阶段完成后等待确认，不自动重建、替换 Release 或增加新功能。
