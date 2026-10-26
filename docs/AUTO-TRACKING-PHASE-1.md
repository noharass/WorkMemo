# 自动记录改造第一阶段：数据与手动结算基础

日期：2026-10-26（Asia/Shanghai）。用户已确认按 AUTO-TRACKING-SPEC.md 的建议开始开发。本阶段不代表自动监测功能完成。

## 目标与实际检查

- 起点 main / origin/main 为 ecc82be，工作区干净。阅读 PRODUCT-SPEC.md、AGENTS.md、PHASE-8.md、BUILDING.md 和实际前后端源码。
- 旧数据库版本 1，工作量非空且必须大于 0；计时累计使用单调时钟、每秒保存检查点，暂停与重启已有保护。前端通过 Tauri 命令读取快照，没有浏览器监测连接。
- 开发前实际启动已安装的旧版，读取真实主界面，显示准备开始；没有创建、结束或删除任务。该检查不等于修改后源码的启动验收。
- 修改前当前源码通过前端及 Tauri Windows 调试构建。验收使用临时配置 identifier=com.workmemo.test.settlement，避免测试程序读写真实数据目录。
- 电脑控制中一次控件点击返回 coordinate input geometry is unavailable，随后截图返回 FrameArrived timed out: timed out waiting on channel。正常关闭快捷键后，后续进程检查已无旧版运行。准备启动源码隔离构建时，工具报告用户按物理 Escape 停止电脑控制；此后没有继续电脑控制，也未用其他 UI 自动化方式绕过。
- 本轮末仅用 SQLite 只读连接核对真实库：仍为版本 1、4 条记录、0 条活动任务，integrity_check=ok。未对真实库执行新迁移；这些计数不是产品演示数据。

## 本阶段实现

1. 增加 002_settlement.sql，将数量改为可空及非负数，增加填写状态、来源、暂停原因、确认结束时间、最后输入时间、结束原因、历史时长基数和修订号。
2. 迁移在原数据库事务中完成，保留记录 ID、原字段值和 AUTOINCREMENT 高水位。旧已结束记录保留为已结算；旧时长保留为 legacy_duration_ms，不伪造历史工作区间。旧版未保存暂停原因，因此旧暂停记录保守按人工暂停保护。
3. 新增 work_segments。开始、继续、检查点、暂停、结束同步维护累计时长和区间；区间与记录同事务保存。重启将未闭合区间截断到最后成功检查点，不补算关闭时间。单调时钟回归保持通过，系统回拨时保持区间顺序。
4. 开始前可以不填工作量，也可预填 0 或正数。所有新结束记录先进入 PENDING；预填值不等于已结算。工作量在单独保存后才成为 COMPLETE。
5. 新增 get_pending_records 和 settle_record 命令，沿用 Rust 服务锁、SQLite 连接和 Tauri 通信；没有开放通用 SQL、文件系统或新增窗口权限，没有引入依赖。
6. 结算允许确认 0、修改类别与备注。record_revisions 保存修改前后完整记录 JSON；保存和审计同事务，重复请求不产生重复审计，旧修订号的冲突修改被拒绝。
7. 主界面提供真实待补全数量和非模态内嵌列表，手动结束成功后展开入口，可稍后填写。列表包含所有待补全记录，不限最近 5 条；旧记录补全时不影响正在进行的新任务。
8. 历史保留已结束记录，时间包含待补全，数量只汇总已结算值，并显示待补全数量。数量未填显示“待填写”，明确的 0 显示为 0。成功修改及删除会更新刷新版本，避免旧记录操作后分类统计不刷新。
9. 新界面复用现有主题变量。未修改四种皮肤配置、原生透明窗口配置、应用正式标识或外观存储。

最后输入时间、自动来源和自动暂停/结束原因目前只是后续监测所需字段；本阶段尚未生成真实输入监测数据，不能据此宣称自动记录可用。

## 实际执行与结果

- npm test：24 项通过。覆盖 0、空值与结算必填区别、下溢和非法数字、待补全状态及已有主题/历史辅助行为。
- cargo test --locked：47 项通过，含新增 10 项结算与迁移测试；已有真实子进程退出恢复、64 项随机工作序列、1 万条隔离历史、主题独立保存等继续通过。
- 新增测试覆盖：结束结果重启可读且不阻止新任务、结算审计与冲突、审计失败整体回滚、区间与记录检查点原子性、旧字段与 ID 序列迁移、待补全工时和数量口径、结束写入失败、迁移中途失败回滚、35 条待补全及关联数据删除、非法结算保护。
- 首轮 Rust 检查发现测试时钟回拨至 Unix 纪元之前，确认结束时间违反非负约束。已在结束写入边界按已有时钟约定归零处理；没有减小或跳过该测试，后续 47 项全部通过。
- cargo fmt -- --check：通过。
- TypeScript / Vite 生产构建：通过。
- Tauri Windows debug / no-bundle 实际构建：通过，产物 E:\WorkMemo\src-tauri\target\debug\workmemo.exe，使用隔离应用标识。未生成本次 NSIS 安装器或公开发布新版本。
- 改造后原生界面操作、实际重开、四种皮肤下待补全界面的可读性与透明效果：尚未验收，不能用上述测试或编译替代。

## PowerShell 复现命令

在 E:\WorkMemo 执行；源码依赖沿用 BUILDING.md。不要在验收时结束或删除真实任务。

~~~powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd test
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm.cmd run build
~~~

以下命令构建与真实库分离的验收程序。临时配置位于已忽略的 target 目录，不修改正式应用标识。

~~~powershell
Set-Content -LiteralPath .\src-tauri\target\settlement-test.conf.json -Value '{"identifier":"com.workmemo.test.settlement"}' -Encoding utf8
npm.cmd run tauri -- build --debug --no-bundle --config src-tauri/target/settlement-test.conf.json
& .\src-tauri\target\debug\workmemo.exe
~~~

最后一条启动命令是后续人工验收方法，本轮没有成功执行并确认其界面。隔离库目录为 %LOCALAPPDATA%\com.workmemo.test.settlement，外观目录为 %APPDATA%\com.workmemo.test.settlement；正式数据目录仍为 com.workmemo.desktop。正常源码运行与正式构建不加测试配置。

## 后续原生验收步骤与预期

1. 在隔离程序中选择类别，工作量留空开始：创建一条任务，显示待填写；手动暂停和继续保持同 ID，暂停不增加工时。
2. 结束计时：结果进入待补全，页面显示有效结束时间、系统确认时间及有效工时。选择稍后填写后仍可立即开始下一项。
3. 在新任务运行时打开待补全列表，给旧记录填写 0 并保存：旧记录完成结算，新任务不中断，工作量统计为真实的 0。
4. 对另一条待补全记录填入正小数、调整类别与备注后保存：列表及统计刷新，数据库保留前后审计；空值、负数及超长备注不能保存成功。
5. 保留待补全记录，正常关闭并重新打开：待补全记录仍在；活动任务保持暂停，不补算关闭时间。
6. 切换四皮肤和透明度：界面可读，待补全和活动记录不改变；核对真实桌面透明、滚动和小尺寸窗口可用性。

这些步骤尚待实际执行。自动监测相关验收仍按 AUTO-TRACKING-SPEC.md 后续阶段实施。

## 兼容性与未完成范围

- 数据库升级至版本 2 后，旧版程序会拒绝读取。迁移本身已在隔离数据库验证；本轮没有升级用户真实数据库，也没有安装新程序。
- 旧记录只保留其原本可知的累计时长，无法恢复过去未存储的暂停边界。旧暂停任务没有可追溯区间时，不能凭起止时间声称恢复了有效结束边界。
- 本阶段尚无浏览器扩展/连接、URL 配置、Windows 输入采样、5/7 分钟状态机、离页 2+10 分钟规则、锁屏/休眠监测或托盘后台运行。现有关闭窗口行为继续保存暂停并退出。
- 完整人工时间修正、补录、重叠处理、审计查询界面和结束时间编辑属于后续阶段；本阶段只有类别、工作量、备注的结算与后端审计基础，没有放置这些未实现功能的装饰按钮。
- 不把本机编译、单元测试或旧版启动核对当成修改后原生功能全部验收。

## 文件与完整代码

完整绝对路径、NEW FILE / UPDATE 及文件关系见 AUTO-TRACKING-PHASE-1-FILES.md。所有完整代码保存在项目对应文件；AUTO-TRACKING-PHASE-1-SOURCE.md 逐文件收录本阶段完整文本，不使用省略号代替代码。

## Git 同步

按已有授权完成暂存检查后提交推送 main，不包含依赖、构建产物、测试配置或真实数据库。原生验收受限仍如实记录；保存代码进度不代表全部功能验收通过。

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "feat: persist work intervals and deferred quantity settlement"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

实际推送结果以本轮交付回复及 Git 提交为准。本阶段结束后等待用户确认，不自动进入第二阶段。
