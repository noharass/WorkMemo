# 北京时间每日零点结束暂停任务

2026-11-12。用户先提出 24 小时未继续自动结束，随后明确覆盖手动暂停、挂起、重启待恢复，并最终选择「北京时间每天 00:00 结束这些未结束任务」。实现以最终口径为准，不是滚动 24 小时。另按用户明确顺序，完成本项再处理网页直接补记录。

## 实现与实际检查

原自动结束仅围绕当前 WORKING 任务，SUSPENDED 多任务可能长期保留，手动暂停和恢复待确认也有保护。新增 Rust 跨日检查，以固定 UTC+8 计算今日零点，处理 paused_at 早于零点的未结束非计时任务，不依赖 Windows 所选时区。正常后台轮询、状态读取和桌面命令访问前处理，期限已到的任务不能继续或重新选回；软件关闭时不运行，重启首次检查补处理。

新增 schema 11 的 nullable paused_at 字段和部分索引，不重建业务表、不改变已有记录 API。停表与区间／记录更新在同一事务写入；重复暂停、仅浏览和已暂停后再切走保留原时间；继续时清除，下一次暂停重新记录。旧库升级或异常恢复缺少该值时，从最新已确认区间 checkpoint、last_input_time、start_time 依序回填；不虚构离线工时。迁移与关联校验保持原事务。

跨日结束在一个事务内更新整批记录、写结束提醒；原毫秒工时、数量、备注和区间保留，状态转 FINISHED/PENDING。有效结束时间沿用真实区间末尾，确认时间为实际处理时间，自动结束原因复用既有 IDLE。失败整批回滚，下次重试不重复提醒。正在计时的任务不变；旧挂起结束不会清除另一任务的计时区间。结束的旧网页绑定沿用现有重新选择／新建流程。

- 实际启动 Vite 1423 隔离预览成功，未启动正式应用或访问真实工作库。
- Rust 169 库测试、2 helper、2 主机、1 注册，共 174 项通过；Node 57 项通过；Cargo fmt --check 与 git diff --check 通过。
- 新增 10 组专项：精确 UTC 16:00／北京时间零点与非滚动 24 小时、所有暂停原因／仅浏览／挂起、正在计时与当天暂停保护、多个任务相互隔离、重复暂停及继续后重置、到期禁止恢复、批次失败回滚及幂等重试、正常退出／进程中止重开、schema 10 迁移与高水位／关联、迁移失败回滚。另新增完整备份恢复保留停表日期及工时用例。
- 原测试中跨整日后继续恢复的旧预期改为同日 30 秒停机，跨日行为由新专项覆盖；手工降级 schema 7 的夹具移除新增列／索引，schema 断言改为 11。首次回归因此失败及新增备份测试临时 Path 借用编译错误均已修正，最终完整运行通过。未将失败尝试报告为通过。

本轮未重建 Windows 成品，未验证原生窗口／真实扩展跨日联动；现有公开 0.2.9 安装包仍是 schema 10。新源码需要 schema 11，旧程序不能直接读取，应先备份；未操作、结束或删除真实任务。

## 完整路径与代码

| 类型 | 完整路径 |
| --- | --- |
| NEW FILE | E:\WorkMemo\src-tauri\migrations\011_pause_day.sql |
| NEW FILE | E:\WorkMemo\src-tauri\src\day_rollover.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\day_rollover_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\database.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\tracking.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\service.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\data_tools.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\database_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\settlement_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\reliability_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\tracking_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\history_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\categories.rs |
| UPDATE | E:\WorkMemo\docs\AUTO-TRACKING-SPEC.md |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| NEW FILE | E:\WorkMemo\docs\DAY-ROLLOVER.md |
| NEW FILE | E:\WorkMemo\docs\DAY-ROLLOVER-SOURCE.md |

完整 13 个程序／迁移／测试文件逐一收录于 [DAY-ROLLOVER-SOURCE.md](DAY-ROLLOVER-SOURCE.md)，没有省略号代替代码。日志 `E:\WorkMemo\artifacts\day-rollover-rust.log`。原有未跟踪 `E:\WorkMemo\docs\DYNAMIC-ISLAND-PLAN.md` 保留，不纳入提交；产物、依赖、数据库和凭据不提交。

## PowerShell 复查与预期

```powershell
Set-Location E:\WorkMemo
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml day_rollover --lib
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm.cmd test
git diff --check
```

预期全部退出 0；零点前保留，固定北京时间零点后跨日暂停／挂起／待恢复直接结束，同日新暂停不结束，工时不增加，提醒只一条；失败时本批没有部分保存。Windows 原生人工验收须用独立测试标识与测试数据库，不拿真实未结束任务做测试。本次没有新增依赖、权限或外观设置，按已授权新规则覆盖旧手动暂停的跨日保留口径。

## Git 同步

按既有授权，精确暂存上表文件并检查后提交、推送 origin/main，不改标签，不强推；比较本地与远端标识。远端有新提交时先安全整合。

```powershell
Set-Location E:\WorkMemo
git diff --cached --check
git diff --cached --stat
git commit -m "feat: finish paused work at Beijing midnight"
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
git push origin HEAD:main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short
```

本步骤完成后依用户明确要求继续网页补记录，不自动发布或改变产品版本号。
