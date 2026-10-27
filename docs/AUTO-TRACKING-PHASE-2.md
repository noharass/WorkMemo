# 自动记录第二阶段进度：本机监测、浏览器通信与后台提醒

日期：2026-10-27（Asia/Shanghai）。用户明确确认进入第二阶段。起点提交 1fbc8e5，工作区干净。

**状态：代码与自动检查已完成一个开发步骤，实际 Chrome 接入及原生交互验收尚未完成。本阶段仍在进行，不自动进入第三阶段，也不把保存代码进度视为功能全部验收通过。**

## 本次目标与检查

阅读 AGENTS.md、PRODUCT-SPEC.md、AUTO-TRACKING-SPEC.md 和实际计时、SQLite、前后端通信、主题及窗口代码。保留第一阶段计时区间与待补全模型，新增真实 Windows 状态与浏览器输入通道，业务判定仍由 Rust 执行。

开发前启动核对仅看见已安装程序路径，未获得独立构建的新主界面证据。电脑控制工具随后多次返回用户物理 Escape 停止信号；收到用户允许继续验收后，工具仍返回相同停止信号，之后没有继续界面输入或通过其他 UI 自动化绕过。

最近一次只读检查未发现独立验收进程或 com.workmemo.test.monitor 数据库，不能因用户选择“已完成”就声称已连通。正式数据库只读核对仍为版本 1、4 条记录、0 条活动任务，integrity_check=ok；本轮没有迁移真实库，也没有为验收结束或删除真实任务。

## 实现内容与文件关系

1. **数据库版本 3**：003_monitoring.sql 新增工作 URL、开关与配置修订号、计时控制模式、当前运行的单调时间锚点、持久结束提醒。版本 1/2 顺序迁移，旧记录、基数、区间和待补全保留；旧待补全不在升级时集中弹窗。
2. **Windows 元数据**：GetLastInputInfo 仅读最后输入时间，GetTickCount64 提供同源单调时间；处理 32 位输入计数回绕与异常值。查询只限当前会话状态和前台是否 Chrome，不保存其他进程路径、输入文本、按键或坐标。
3. **系统事件**：隐藏的原生顶层监听窗口订阅当前会话锁屏/连接变化及电源广播。锁屏、休眠、监测不可用或后台调度中断时暂停，并截断不可确认区间。没有主动锁屏、休眠或操作 Windows 安全设置。
4. **浏览器通信**：Manifest V3 Chrome 扩展、独立 workmemo-browser.exe、长度前缀 JSON 和本机回环连接。仅传配置版本、规则 ID、前台及授权状态等元数据，不传网页 URL、标题、内容或输入文本。原生主机只接受固定扩展 origin；应用端用启动时随机值校验本机连接，并拒绝重放序号。
5. **自动开始**：启用、连接可信、配置已授权、Chrome 前台活动页匹配、有进入工作环境后的新输入、没有未结束记录时创建。开始时间使用合格输入的真实时间，不以轮询时刻代替；单独打开页面不开始。后台 Chrome 配置文件不能覆盖前台配置文件的页面状态。
6. **时间规则**：5 分钟提醒、7 分钟结束均以最后输入为准。离页满 2 分钟暂停，再保留 10 分钟；先到的结束期限生效，同刻优先空闲。空闲结束回退尾段到最后输入，暂停不计时，结束先提交数据库再生成提醒。
7. **人工保护**：手动暂停与重启待恢复任务不被自动结束、恢复或绕过。手动继续开启 MANUAL 控制区间并保留原始来源；不要求 URL，仍受空闲与系统状态保护。Native 状态不可确认时拒绝开始/继续，避免先累计一段未知时间。
8. **手动命令顺序**：开始、暂停、继续、结束、结算及监测配置保存前，先用新的原生状态处理已经到期的生命周期，避免命令抢在后台轮询前执行而把应扣除的尾段保存为工时。只读快照不额外触发每秒输入采样；常规采样仍为 5 秒，到期边界会重新读取。
9. **失联处理**：心跳超过 15 秒、站点未授权、权限撤销或配置版本不同，自动计时回到最后可信边界暂停。异常暂停保留 10 分钟，期间空闲规则可更早结束；仍有其他应用输入也不能无限占用旧记录。该异常保留策略与正常离页 2+10 分钟区分。
10. **托盘与提醒**：主窗口关闭到后台；托盘打开主界面、待补全或保存退出。结束提醒为独立非模态原生透明窗口，可直接填写工作量或稍后填写；提醒状态写 SQLite。输入恢复取消空闲提醒。后台保存故障会显示主窗口错误，重复相同错误不反复激活窗口。
11. **不抢焦点**：检查实际 Tao 源码发现 focused(false) 标记只在创建阶段生效，因此后续显示没有仅依赖通用 show()，而使用 Windows SW_SHOWNOACTIVATE；显示、隐藏均走一致的原生路径。此为实现及源码核对结果，真实焦点行为仍待验收。API 依据 [ShowWindowAsync](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-showwindowasync)。
12. **界面接入**：实际监测状态、URL 与类别配置、非模态提醒与结算表单、退出入口均接真实命令。原生透明和四皮肤继续使用既有配置/令牌，外观与业务库仍分开。

完整文件绝对路径、NEW FILE / UPDATE 见 AUTO-TRACKING-PHASE-2-FILES.md；完整文本源码见 AUTO-TRACKING-PHASE-2-SOURCE.md。没有省略代码，也没有提交编译产物、数据库或端点校验值。

## 实际执行结果

- 前端 Node 测试 26 项通过；TypeScript/Vite 生产构建通过。
- Rust 库测试 72 项通过，主机单元测试 2 项、实际子进程通信测试 2 项通过，共 76 个 Rust 执行项；与前端合计 102 个测试执行项。共享协议的两项测试分别在库和独立主机中执行，不称为 102 个互不重复的测试案例。
- 原有数据库、历史、主题、随机长流程、真实子进程退出恢复与 1 万条记录测试继续通过。
- 新增测试覆盖自动开始条件、5/7 分钟、轮询晚发现、离页保留与恢复、规则同刻到期、输入恰在截止时间恢复、手动暂停、失联及撤权、不同 Chrome 配置文件、时钟变化、版本 2 升级、自动结束保存失败、主机来源/字段/长度校验、真实回环认证与重放拒绝。
- 检查发现自动结束保存失败后仍可能留下旧空闲提醒，已修正状态并补充后台错误通知；原失败用例继续保留，通过后重跑。
- Windows 拒绝连接可能返回 EOF，也可能返回 ConnectionReset/ConnectionAborted。认证测试调整为验证这些真实拒绝结果，同时仍要求无成功回复、页面状态不变；没有放宽认证或跳过重放测试。
- Rust 格式检查与 cargo check --bins 通过。Tauri Windows debug/no-bundle 实际构建成功，已复制到稳定验收目录并与源 EXE 复算摘要一致；该结果不等于新界面正常启动已通过。
- debug 只读探针实际读取 Windows 状态，native_available=true、unlocked=true；隔离程序实际配置标识为 com.workmemo.test.monitor。探针不创建窗口或打开数据库。
- 准备脚本实际执行成功，已生成独立扩展目录、主机清单及配置。发现测试主机此前未注册后，已实际写入并读回 HKCU 的 com.workmemo.browser_bridge_test；allowed_origins 仅为 chrome-extension://oljcealhccdhaddceacnokihjefloaih/。本轮未修改正式主机注册，也未代操作 Chrome 站点授权。
- PowerShell 脚本保存为 UTF-8 BOM，语法解析通过；本轮运行于当前 PowerShell。未将解析检查称为 Windows PowerShell 5.1 的完整注册实测。

## 尚未通过的验收

真实 Chrome 扩展安装/授权后的页面信号、独立程序新主界面、实际连续等待 5/7 分钟、真实离页 2+10 分钟、锁屏/休眠恢复、托盘交互、提醒不抢焦点和四皮肤原生透明可读性，均尚未完成实际验收。实现、单元测试、只读原生探针和模拟协议进程不能替代这些证据。

浏览器加载及站点权限需要用户手动操作。依据 computer-use 技能引用的 guidance.md："Do not act on security or privacy permission requests." 工具报告用户停止时，依该规则停止界面输入。后续先完成本阶段实际验收，不自动进入第三阶段。

## PowerShell 命令与测试预期

~~~powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd run build
npm.cmd test
cargo test --locked --offline --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
~~~

本机已缓存依赖，实际使用 --offline；全新源码环境应先按 BUILDING.md 安装锁定依赖。隔离配置构建、复制与接入命令完整见 BROWSER-BRIDGE.md。验收程序使用独立目录，避免修改正式数据。

建议先手动启动：

~~~powershell
& 'E:\WorkMemo\artifacts\browser-bridge\com.workmemo.test.monitor\workmemo-test.exe'
~~~

本轮稳定验收 EXE 的 SHA256：f23996f42b2ca48498079de491436cc7e402f4bd1f193becfa9036b58ad77702。仅该独立副本作为本轮验收入口；后续构建变更应重新生成并核对。

随后按 BROWSER-BRIDGE.md 检查 Chrome 前台工作页加新输入自动开始；手动暂停不自动恢复；空闲/离页结束只结算一次；关闭提醒保留待补全；恢复原记录排除暂停段。用户实际工作优先，不为验收强制结束或删除真实任务。

## 兼容性与范围

- 当前自动页面识别仅以 chrome.exe 和配套 Chrome 扩展为目标；未声明 Edge、Firefox、其他系统或 Windows 11 原生实测通过。
- 工作 URL 的真实切换时刻并非总能从快照恢复，采用可信观测边界；不伪造毫秒精度。输入状态也不保存全部事件历史；无法确认的边界采用保守分段，时间修正仍属于第三阶段。
- 锁定依赖版本未升级；新增直接依赖声明复用已有 url 2.5.8、windows-sys 0.61.2，开启 Tauri tray-icon；没有切换技术栈或增加通用 SQL/文件权限。
- 数据库版本 3 与旧版程序不兼容；迁移可回滚且已有隔离测试，真实库未迁移。正式程序、安装器与已发布 v0.1.1 均未覆盖。
- 安装包分发、完整人工补录/时间修正、重叠处理及最终交付仍属于第三阶段，未放置对应的未实现按钮。

## Git

本轮保存经检查的第二阶段代码进度；原生验收受限如实保留。暂存区排除依赖、产物、真实数据库、私密配置及校验端点文件，使用已有仓库身份，不修改全局身份。

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "feat: add local browser monitoring and idle-aware work sessions"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

实际同步标识以交付回复及 Git 结果为准，不强制推送。仍等待真实接入和界面验收，不将整个目标标为完成。
