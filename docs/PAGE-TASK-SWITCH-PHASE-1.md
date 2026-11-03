# 页面任务自动切换：源码阶段记录

2026-11-03。此阶段在已发布的 0.2.7 源码上开发；正式版本号、安装包和 GitHub Release 仍是 0.2.7。没有打开或修改用户正式数据库，也没有改变正式应用标识。用户保留的 `docs/DYNAMIC-ISLAND-PLAN.md` 未纳入本次提交。

## 目标与实现

- 可信浏览器页面现在可以绑定到具名任务；同类别可有多个任务，多页面可指向同一任务。旧网址规则在 SQLite 10 迁移时按类别绑定到四个默认任务。
- SQLite 保留多个 `SUSPENDED` 未结束记录，仍以唯一索引保证同时只有一个 `WORKING`。Rust 在单个事务里关闭旧计时段、保存毫秒时长、暂停旧记录、恢复或创建目标记录并开启新计时段。同任务的两个已绑定页面切换也分段记录。失败回滚，不留下两个开放区间。返回旧页面继续原记录。
- 未绑定网页首先暂停当前任务，灵动岛显示可展开提醒并提供主窗处理入口。用户在桌面端明确选择已有任务、新建任务或记住忽略，并亲自选择路径前缀、整个站点或域名后缀范围。规则修订与当前页面核对，页面或配置已变化时拒绝过期提交。已结束任务再次出现时须重新选择或新建任务。
- 手动暂停、仅浏览和重启待恢复任务不会被页面自动恢复；暂停任务可从主窗明确选择继续。离线、空闲、锁屏保护沿用已有逻辑。未知或不可信时间不会回填。
- 扩展新增可选 `tabs` 权限，用户在扩展面板主动授权。仅向支持新协议能力的本机程序发送去除查询参数、片段的 http/https 地址；不读取标题、页面内容或键入文本。工作站点脚本仍需单独授权。旧后端不接收新字段。
- 完整备份恢复包含任务及忽略规则；预览记录导入遇到悬置任务会明确跳过，避免导入无法操作的孤立记录。

## 实际检查与边界

- Rust `cargo test`：157 项库测试、2 项主机测试、2 项协议测试及 1 项注册测试通过；Node：57 项通过；`cargo fmt --check`、TypeScript 与 Vite 生产构建通过。
- 隔离浏览器：新网页绑定、已结束任务重新绑定、悬置任务继续和灵动岛提醒入口通过；宽窄布局截图保存至 `E:\WorkMemo\artifacts\page-tasks\qa`；既有 0.2.7 反馈回归 5 组、四皮肤 × 透明度 × 密度 24 种组合及 15 个试听调用通过。
- 浏览器切页与系统键鼠输入存在采样延迟。返回已绑定页面后，只有新输入能与可信页面对应时才开新计时段；开表从后端确认时刻开始。没有可归属的新输入时保持暂停，不伪造切页前的时长。
- Windows 原生透明、扩展真实授权、鼠标焦点及实际多窗口切换仍需人工隔离验收。不得把浏览器截图当作原生验收。
- Windows x64 隔离 release 构建通过；复制后的配套主机 `--bridge-info` 返回 `com.workmemo.test.page_tasks`、协议 1、`test_overrides=false`，主程序二进制也包含该隔离标识，产品版本为 0.2.7。隔离主程序 SHA256 为 `BCD2D8C67D492D16FF8192AD7E759A326D33B7DDEDAFD283D15A3A145A50FE0B`。此项只验证构建和身份，不等于 GUI 实测。

## 复查方法

在 `E:\WorkMemo` 的 PowerShell 中执行：

```powershell
npm test
npm run build
cd E:\WorkMemo\src-tauri
cargo test
cargo fmt --all -- --check
cd E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1423/'
# 另开终端先执行 npx vite preview --host 127.0.0.1 --port 1423 --strictPort
node scripts/verify-page-task-ui.mjs
node scripts/verify-v027-feedback.mjs
node scripts/verify-v027-visual.mjs
```

预期：Rust/Node 全通过，生产构建成功；隔离界面无错误，保存后提示消失；真实扩展未授权 `tabs` 时不暴露未绑定网页地址。通过隔离程序标识 `com.workmemo.test.page_tasks` 启动 Windows GUI 后，需手工验证不同网页往返、手动暂停、重启待恢复、断线、锁屏与透明窗口点击。隔离标识不能替换正式应用配置或数据库。

## 兼容与交付

数据库从 schema 9 原子迁移到 10；旧记录、有效时长、类别、数量、备注和已配置网址保留。旧版程序不能直接读取较新数据库，回退应先用升级前的可靠备份。配套 Chrome 扩展升级后需重新加载，并在面板分别授权新网页识别和工作站点脚本。

完整源码保存在项目文件中，逐项绝对路径和 NEW FILE／UPDATE 清单见 [PAGE-TASK-SWITCH-FILES.md](PAGE-TASK-SWITCH-FILES.md)。提交前检查 `git diff --check`、暂存区和敏感文件；提交后以 `git rev-parse HEAD` 与 `git ls-remote origin refs/heads/main` 比较。此阶段结束等待用户确认，不自动改变版本或公开发布。
