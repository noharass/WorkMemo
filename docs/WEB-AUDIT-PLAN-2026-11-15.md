# 网页端全面审查与修改计划（2026-11-15）

## 结论与范围

审查基线为 main 71a1e8f258f85aabdbaa3c4dfd55658e953a0aa7，应用版本0.2.10。继续检查原网页、请求封装、报表SQL、Rust写入与授权边界，新增异常请求、状态、数值精度、跨年图表、自动可访问性与加载性能取证。本轮没有修改应用功能、版本号、数据库或发布资产。

在已覆盖场景中没有确认P0/P1级的数据损坏或越权问题；不能据此宣称不存在其他严重问题。已有事务、请求去重、版本校验和隔离统计应保留。需要优先修复状态和图表表达、请求错误恢复，以及表单和文字的可访问性。本报告将已复现问题与待验证风险分开。

## 检查方法和实际结果

先读取PRODUCT-SPEC.md、PHASE-8.md、上轮报告和相关源码。使用Modern Web Guidance检索并读取performance、deprioritize-background-fetches、color，复用上轮完整读取的accessibility、forms、responsive-table；没有运行legacy-scan。指南用于审查与计划，不代表已经实施现代化改造。

| 范围 | 实际执行与结论 |
| --- | --- |
| 前端基础 | npm.cmd test，59项通过 |
| Rust | cargo test --locked --manifest-path src-tauri/Cargo.toml，176库测试+2 helper+2 host+1注册，共181项通过 |
| 生产资源 | npm.cmd run build通过；保留Dashboard大分块警告 |
| 网页既有回归 | npm.cmd run test:web在4174生产预览、模拟Rust CSP和内存HTTP下通过 |
| 补记录 | verify-manual-entry.mjs的5组场景通过，无pageErrors |
| 上轮专项复核 | audit-web-accessibility.mjs完成，字段语义、轮询live region、图表替代问题仍存在 |
| 扩展专项 | audit-web-comprehensive.mjs完成；跨年、精度、503、刷新并发、编辑错误、挂起状态、短屏及性能取证 |
| 可访问性 | axe-core 4.14.0检查总览、待补填、补录放弃确认、编辑、320px补录；存在明确对比度违规及不能自动判定的节点 |
| 数据查询状态 | 从实际data_center.rs提取筛选表达式，在独立SQLite内存表执行，确认all包含SUSPENDED、working只包含WORKING |
| 加载性能 | Edge、禁用缓存、CPU倍率4，独立context取3次样本；采集长任务、实验室LCP/CLS和实际JS资源大小 |

所有HTTP业务请求使用现有dashboard-fixture.mjs内存拦截；没有连接正式数据库或启动/关闭用户桌面程序。4173原有效果预览保持不动，专项另用4174。axe通过npm pack下载到忽略目录，不改变package.json或锁文件。实际查看编辑弹层截图，没有把截图视作原生验收。

专项脚本早期误等待保留在DOM中的Drawer根节点隐藏，改为等待真实section隐藏；另将颜色检查安排在动画结束后，避免把进入动画的淡入颜色当作正式对比度。读取图表时改为获取实际ECharts实例的getOption，避免React交替Fiber上旧props导致误判。上述都是审查工具修正，没有改应用。

## 已复现问题

### F01 / P2：挂起记录与“进行中”筛选语义不一致

位置：E:\WorkMemo\src\Dashboard.tsx:61、73、527；E:\WorkMemo\src-tauri\src\data_center.rs:61。

SUSPENDED是当前真实业务支持的状态。总览明细把所有非FINISHED记录显示为“进行中”，工作量列同样显示“进行中”；后端working筛选却只接受status='WORKING'。因此一条在全部状态下显示“进行中”的挂起记录，切换“进行中”后反而消失。

取证：浏览器注入合法SUSPENDED DTO，明细行确实显示“进行中”；独立SQLite执行实际筛选表达式，all返回WORKING/SUSPENDED/FINISHED，working只返回WORKING。现有浏览器fixture的working逻辑使用非FINISHED，恰好掩盖了该差异。

计划：明确展示计时、暂停、挂起、已结束状态。保留“进行中”或改为“未结束”必须在前后端统一；建议提供“未结束”筛选覆盖WORKING/SUSPENDED，同时用行标签区分是否正在计时。补充Rust与fixture一致性用例，不改数据库结构。

### F02 / P2：工作分布把短时真实工时提前舍入成0

位置：E:\WorkMemo\src\dashboard\Charts.tsx:185。

送入柱图series之前执行toFixed(2)。将评测五条隔离记录各设1秒，总计5000ms，实际ECharts值为0，尽管分类表仍显示00:00:05。非零工时与零工时视觉上相同。

计划：series始终使用原始毫秒换算的小时值，只在轴标签/tooltip展示层格式化；小于显示精度时提示秒数或“小于0.01小时”。验收覆盖1ms、1秒、5秒、18秒附近、正常小时及真正的0，分类表/柱图/饼图保持同源。

### F03 / P2：跨年按月趋势丢失年份

位置：E:\WorkMemo\src\dashboard\Charts.tsx:119。

所有非小时标签都用slice(5)。向图表提供后端支持的按月DTO，实际ECharts的2024-01、2025-01、2026-01标签均为01。问题存在于展示层，不是SQLite丢失年份。

计划：按trend_unit分别格式化小时、日期和年月；跨年保持年份辨识。覆盖同年、跨年、月份重名及长范围，tooltip继续保留完整周期。

### F04 / P2：服务繁忙被误报成授权失效

位置：E:\WorkMemo\src\dashboard\api.ts:114；E:\WorkMemo\src-tauri\src\dashboard.rs:66。

Rust达到并发上限时确实返回503纯文本busy。注入同样响应后，页面却提示“连接授权已失效，请从WorkMemo重新打开数据中心”。原因是所有JSON解析失败都被解释成授权问题。503时补记录仍启用，显示与连接提示也不一致。

计划：根据HTTP状态和内容类型区分401/403、繁忙503、业务400、超时/断网、响应格式异常。保留草稿；已提交写入但响应未知时明确提示核对或原样重试，不能因为状态错误提示就创建新request_id。不要自动重试非幂等操作。

### F05 / P2：快速刷新产生多条仍在执行的旧请求

位置：E:\WorkMemo\src\dashboard\useDashboardData.ts:43、89；E:\WorkMemo\src\Dashboard.tsx:693。

reading只约束同一次effect，点击刷新会创建新effect。旧effect cleanup仅设置stopped，能防止旧数据覆盖，却没有取消旧请求。2.4秒延迟下以100ms间隔点击8次，实际出现8条并发query，全部完成。这会增加本机锁和连接压力，可能与F04形成“繁忙→授权错误”的连锁反馈。

计划：可取消的只读meta/query请求使用effect级AbortController，并与原8秒超时组合；合并/限制刷新中的重复触发。取消只读查询不等于撤销服务器已经执行的写入，保存/删除/补录继续保持独立保护和去重。验收要求过期结果不回写、重复刷新有界、取消不显示断线错误。

### F06 / P2：字段语义不足，保存失败后错误也可能在滚动区域之外

位置：E:\WorkMemo\src\dashboard\ManualEntryModal.tsx:66、84；E:\WorkMemo\src\Dashboard.tsx:1365、1422。

补录必填和提示缺少required/aria-required、htmlFor/id、aria-describedby；已有编辑页负工作量校验后同样没有aria-invalid或错误关联。编辑页错误放在整个表单之后，失败不将焦点移向错误字段或摘要。1440×1000实测错误框顶部约814px，滚动body底部809px，错误完全处于body可视区之外，visibleInBody=false。Alert存在，不能误报为没有错误消息。

计划：复用Ant Design字段错误能力，补齐现有编辑、补录、筛选日期的一致标签/说明/错误关系。提交失败聚焦首个错误字段，跨字段时间错误聚焦摘要并可跳回字段；修正时清除对应错误。保持Rust最终校验，统一2000个Unicode字符规则，不以UTF-16截断破坏合法文字。

### F07 / P2：部分文字对比度不达标

位置：E:\WorkMemo\src\Dashboard.tsx:61；E:\WorkMemo\src\Dashboard.css:163、273、310；E:\WorkMemo\src\ui\UiProvider.tsx:31。

动画结束后的axe总览检查确认4个节点：自定义周期文字约4.30:1，三条待补全标签约2.75:1；编辑摘要“有效工时”约3.24:1。对应普通字号要求至少4.5:1。透明/渐变背景导致很多节点只能列为incomplete，不能宣称其他节点全部通过。早期补录动画产生的低对比度结果已剔除，稳定短屏补录未报告同类明确违规，但仍有待人工判定项。

计划：通过官方主题token和少量网页专用变量调整警告色、次级文字与标签，保留当前绿色半透明风格和布局；复验常态/hover/focus/禁用、弹层背景和Windows强制颜色。禁用控件豁免不要机械当成普通文字违规。

### F08 / P2：轮询时间反复进入live region

位置：E:\WorkMemo\src\Dashboard.tsx:681；E:\WorkMemo\src\dashboard\useDashboardData.ts:68。

上轮发现已再次复核，无操作6.5秒仍出现3次时间更新。实际DOM更新已确认，尚未运行真实读屏器，不能宣称已测得具体朗读次数。

计划：时间保留为普通文本，对连接变化、用户主动刷新和保存结果提供适量播报；表格后台同步不反复朗读。

### F09 / P2：趋势与工作日历没有可访问数值替代

位置：E:\WorkMemo\src\dashboard\Charts.tsx:89、143、320。

可访问树仍只给出图表名称，不能读取小时/日期聚合值。分类表与饼图按钮图例已有等效信息，应该保留。

计划：趋势、日历各提供可展开的真实数据列表/语义表，与Canvas共用相同源数据、单位与空状态。通过键盘可取得所有具体值，不要求用户逐条工作记录自行心算聚合。

## 已确认实现、仍需验证影响的项目

### R01 / P3：弹层背景隔离存在分支差异

位置：E:\WorkMemo\src\Dashboard.tsx:608、675、1225；E:\WorkMemo\src\dashboard\ManualEntryModal.tsx:49。

待补填选择列表打开时detail=null，现有背景inert表达式为false；Drawer虽有aria-modal和焦点管理，DOM背景并未像详情打开时那样隔离。补录放弃确认也没有给下层补录显式添加inert。不能将此直接等同于“已能穿透点击”或真实读屏泄漏，axe亦未把它报告为违规。

计划：按实际可见弹层维护一致的背景隔离和焦点恢复，再用键盘及Narrator验证嵌套选择/确认；不要因为指南推荐原生dialog就替换现有Ant Design组件。

### R02 / P3：自定义趋势省略无记录周期，分类轴会等距连接

位置：E:\WorkMemo\src-tauri\src\data_center.rs:84、85；E:\WorkMemo\src\dashboard\Charts.tsx:108。

静态检查确认自然日/周/月补零，而custom只返回GROUP BY命中的周期，前端使用category轴。跨度不同的点可能等距连接，也不会直接显示中间的零工作周期。没有在真实数据库上复测长历史，本项应在修图阶段用Rust内存样本确认产品期望后处理。

计划：明确无记录代表0还是缺测，建议本地完整历史按实际日历补0；长期范围按月分桶并设置合理上限，防止补出几百万日点。后端执行聚合，前端不另算一套统计。

### R03 / P3：首屏加载成本有优化空间，尚不能称为真实INP问题

Dashboard分块1,563,026字节，初始index分块376,777字节、runtime726字节，初始JS合计1,940,529字节（解码大小）。入口仍静态导入桌面组件，网页图表整体随Dashboard加载，辅助分析默认折叠也不能减少下载。

最终3次冷缓存、4倍CPU模拟的实验室样本中，最大长任务分别400/421/392ms，LCP分别1176/1144/1124ms，CLS均约0.0814。原值见result.json；目前LCP/CLS不构成“已经很慢”的证据，但数百毫秒长任务值得定位。这里只是本机、内存API、短观察窗口下的测量，没有真实网络/低配机/交互INP结论，也没有把每条长任务归因于某个库。

计划：先用trace确认解析/React渲染/图表初始化占比，再评估网页与桌面入口隔离、图表延迟加载、哈希静态资源缓存。API和私密数据仍no-store，不引入Service Worker、遥测或新运行依赖。保留现有reconcile避免轮询反复重建图表；不能机械地给可见查询加低优先级，或用scheduler.yield掩盖未定位的成本。

## 应保留的可靠实现及不建议的改动

- Rust复核类别、数量、备注、时间和修订版本，SQLite事务写入；补录request_id与记录原子提交，丢失响应原样重试可去重，删除留墓碑。
- 保存成功后的读取失败不会把写入误判成失败；过期刷新不覆盖新查询，草稿/确认/焦点已有完整回归。
- 统计只计已结束工作；未补填不算0；真实/演示范围隔离；分页不改变汇总总额。
- 服务只绑定127.0.0.1，校验Host、写入Origin及Bearer，64KiB请求限制、CSP和不含token的URL已存在。未发现需要扩大权限或增加远端服务的理由。
- 既有报表按电脑本地日历，补录输入明确按UTC+8；这是WEB-MANUAL-ENTRY.md已约定的行为，不当作本轮时区缺陷。零点结束是另一条固定北京时间业务规则，不擅自统一或迁移历史数据。
- 继续使用Ant Design、ECharts和现有外观，不重写整个1600行页面，不换组件库，不顺便新增主题、导出、云同步或批量删除。

## 分阶段修改计划（待确认执行）

| 阶段 | 具体范围与文件 | 验收门槛 |
| --- | --- | --- |
| A：数据表达与请求恢复 | F01–F05；Dashboard.tsx、dashboard/api.ts、useDashboardData.ts、Charts.tsx、src-tauri/src/data_center.rs、对应测试和fixture | 挂起/计时状态筛选一致；非零工时不变0；年月可区分；503/403/超时有正确提示；快速刷新请求有界；既有写入去重/版本/草稿测试全部保持通过 |
| B：可访问性与错误可见性 | F06–F09、R01；ManualEntryModal.tsx、Dashboard.tsx、Charts.tsx、UiProvider.tsx、BottomSheet.tsx、Dashboard.css | 字段有正确标签/必填/错误关联，失败焦点及错误可见；常用文字对比度达标；后台更新不噪声播报；图表数值可键盘/读屏读取；多层弹窗焦点与背景隔离一致 |
| C：趋势连续性与加载性能 | 先复现R02，测量R03；data_center.rs、Charts.tsx、main.tsx，确有需要才改vite.config.ts及少量组件拆分 | 空白周期策略有测试；大范围不生成无界点数；保留正确空状态；对比同条件3次冷启trace/长任务/JS体积和交互表现；不以分块警告消失作为性能验收 |
| D：整体验收与交付 | 前三阶段确认后执行；既有测试、构建脚本、说明文档 | Node/Rust/网页与补录全量回归，窄/短屏、125/150/200%浏览器缩放、强制颜色、真实Narrator；Windows成品另测原生功能；版本及发布目标另行确认，不因本计划覆盖0.2.10资产 |

每阶段完成后记录实际结果、提交同步并等待用户确认，再进入下一阶段。A阶段建议先做：修改范围集中、优先修复误导数据与错误恢复，且不需要数据库迁移。B阶段保留视觉结构，只修正可用性；C阶段以测量结果决定改动量。不得在A阶段顺带实施B/C/D。

每阶段的共同回归：保存失败输入不丢、慢请求旧响应不覆盖、补录响应丢失只产生一条记录、并发修改不覆盖、取消删除不写入、当前计时不受网页操作影响、0/未补填/无记录区分、真实和演示数据隔离。另需让fixture与Rust共享场景契约，避免F01再次被模拟实现差异掩盖。

## 文件、证据与完整代码

- NEW FILE：E:\WorkMemo\scripts\audit-web-comprehensive.mjs，完整专项和测量代码；仅开发审查用途，读取React内部引用只为核对ECharts实际输入，不能移入产品实现。
- NEW FILE：E:\WorkMemo\docs\WEB-AUDIT-PLAN-2026-11-15.md，本报告与修改计划。
- UPDATE：E:\WorkMemo\docs\PHASE-8.md，仅追加本轮审查入口。
- 本地忽略证据：E:\WorkMemo\artifacts\web-comprehensive\result.json、axe-*.json、editor.png、pending.png、monthly-axis.png、mobile.png、sql-status.json。
- 本地日志：E:\WorkMemo\artifacts\audit-20261115-build.log、audit-20261115-node.log、audit-20261115-rust.log、audit-20261115-web.log、audit-20261115-manual.log、audit-20261115-accessibility.log、audit-20261115-comprehensive.log。
- 全量网页结果仍输出E:\WorkMemo\artifacts\web-ui\qa\production-result.json，补录结果在E:\WorkMemo\artifacts\manual-entry\qa\result.json。
- 保留未跟踪E:\WorkMemo\docs\DYNAMIC-ISLAND-PLAN.md，不暂存。应用完整代码保存在原文件，本轮没有需要另附的应用实现。

## PowerShell复核命令、预期及边界

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

另一个PowerShell窗口：

```powershell
Set-Location E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT='C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_WEB_URL='http://127.0.0.1:4174'
npm.cmd run test:web
node scripts/verify-manual-entry.mjs
node scripts/audit-web-accessibility.mjs
npm.cmd pack axe-core@4.14.0 --pack-destination artifacts --silent
New-Item -ItemType Directory -Force -Path artifacts\audit-tools | Out-Null
tar -xf artifacts\axe-core-4.14.0.tgz -C artifacts\audit-tools
$env:WORKMEMO_AXE='E:\WorkMemo\artifacts\audit-tools\package\axe.min.js'
node scripts/audit-web-comprehensive.mjs
```

预期：现有功能测试通过；专项当前应记录跨年标签重复、5000ms柱值0、503误提示、8次并发、字段关联缺失及对比度问题。专项退出0表示取证完成，不是所有检查通过；未设置WORKMEMO_AXE则跳过axe部分。其他电脑需填写自己的Playwright路径并安装Edge；axe只作为审查工具，不作为产品运行依赖。性能数值会随环境波动，不写死为自动测试断言。

兼容性限制：本轮使用Windows/Node24.18.0/Edge157；生产预览与模拟CSP不是Tauri原生验收。没有实际运行Narrator、Firefox/Safari、移动设备、Windows高DPI/透明/扩展联动、安装卸载，亦没有生产大数据库压力或完整安全渗透。尚待执行的项目保留在D阶段，不报通过。

```powershell
git fetch origin main
git add -- scripts/audit-web-comprehensive.mjs docs/WEB-AUDIT-PLAN-2026-11-15.md docs/PHASE-8.md
git diff --cached --check
git diff --cached --stat
git commit -m "docs: complete web audit and phased remediation plan"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

按既有授权提交并尝试同步本轮审查成果，不强推；最终同步状态以回复中的实际结果为准。
