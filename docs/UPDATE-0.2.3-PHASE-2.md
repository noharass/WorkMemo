# v0.2.3 第 2 阶段：分类报表与两套提示音

日期：2026-10-29（Asia/Shanghai）。实际起点 cfb4734（包含此前图例修正和另行提交的图标候选，候选文件原样保留）。用户确认继续第 2 阶段；本轮实现日／周／月分类工作量、报表界面与两套音效。Windows 正式安装包、版本号统一及公开发布不在本阶段。

## 检查与实现

已阅读长期产品规范及前阶段记录，检查 React、Rust、SQLite 查询、音频观察器、窗口偏好、现有许可和运行状态。原报表跨类型相加数量，活动任务计入记录总数，日期只有滚动范围；提示音只有一套及一个开始试听按钮。保留真实任务、网址规则、四皮肤和之前图例与坐标轴单位分行的修正；原有未跟踪 DYNAMIC-ISLAND-PLAN.md 不修改、不提交。

- 默认自然日，支持日／周／月、前后周期、本日／本周／本月，以及自定义日期和全部日期。Rust 按本机时区解析自然周期，周一至周日为一周，月按日历处理闰年。日期边界限制在 1970～9999 年。
- 数量仍汇总用户已确认的值，不从工时推测产出。分类表分别显示数量、有效工时、已结束记录和待补填；明确 0 显示 0，只有待补填时显示「待补填」，没有记录显示「—」。默认显示四类，筛选某类后只显示该类；名称继续使用第 1 阶段的稳定身份映射。
- 报表只统计已结束记录，待补填工时计入、未确认数量不计入；活动任务单独提示。明细仍可按状态查看当前任务，分页使用独立 record_count，不用已结束记录数冒充全部明细数量。
- 日期归属沿用开始日。日趋势按记录开始小时，周／月按开始日期，均合计整条记录的有效工时；不是把一条记录伪拆成逐小时区间。自然周期补齐无记录时间桶为 0，自定义长范围继续按月汇总。
- 页面顺序为周期与筛选、三项概览、分类表、工时趋势、可展开的类别分布和工作日历、完整明细。去掉跨类别数量总计及混合单位趋势，使用白色卡片、浅灰绿背景和绿色强调。桌面表格与窄屏分类卡片共用真实结果；长名称可换行。辅助图表仅在展开时创建，避免隐藏容器尺寸警告。查询失败不显示新范围的虚假成功数字。
- 保留详情、0 数量编辑、失败保留输入、修正历史、删除确认、筛选与分页。改名、计时、监测、窗口透明和主题配置的业务不重写。

## 音效与许可

设置 → 布局中提供「柔和轻提示」「清脆短提示」，默认柔和，保留旧提示音开关。开始、暂停、恢复、结束和空闲提醒分别试听；明确试听不受开关限制，保存后日常状态提示采用所选套装。

使用 [Kenney Interface Sounds 1.0](https://kenney.nl/assets/interface-sounds) 的 CC0 素材，另核对[作者在 OpenGameArt 的发布页](https://opengameart.org/content/interface-sounds)。原始 OGG、许可、十条 WAV 的对应关系及 SHA256 全部留存；没有把素材称为原创。统一采样、峰值与淡入淡出，柔和套装加低通，离线内嵌播放，不增加运行依赖、权限或联网要求。素材生成使用已有 Playwright／Edge 离线解码；普通构建只使用已保存的 PCM，不需要额外音频工具。

后端统一观察状态，每次最多播放一个提示，结束／暂停等状态变化优先于提醒；旧任务结束与新任务同时切换时优先结束提示。静音期间仍更新观察器，重新启用不会补播旧事件。试听参数由 Rust 枚举校验。

原始许可保存在 E:\WorkMemo\src-tauri\sounds\source\LICENSE.txt，完整映射见 sounds/manifest.json；说明见 [sounds/README.md](../src-tauri/sounds/README.md)。第三方许可汇编实际收集了 278 个依赖包版本及本次音效来源，原依赖锁文件未升级。原始许可采用窄范围 Git 属性保留上游字节，正常项目源码仍检查空白。

## 接口与兼容性

- /api/query 增加 period（day/week/month/custom）、anchor_date；省略 period 的旧调用保留自定义起止日期语义。自然周期由后端计算起止日期，忽略客户端起止值，返回 range 含规范范围及 trend_unit。quantity 为兼容保留，但界面不再把它作为跨类型数量总计。
- categories 增加 complete、pending，totals.records 现在专指已结束记录；record_count 提供全部筛选明细数。所有聚合与分页仍在同一个 SQLite 读事务中完成。
- window-layout.json 新增 sound_theme：soft/crisp。旧配置缺少该字段时默认 soft，原 sound_enabled=false 保留；切换密度保留套装。未知套装不悄悄采用错误配置。
- preview_sound 增加可选 theme、cue，保留旧的无参数开始试听语义。未新增应用命令权限或浏览器扩展权限。
- SQLite 仍为第 1 阶段的 schema 9，没有新增迁移。正式应用标识、数据路径、依赖及已发布 v0.2.2 资产保持。开发版本号仍为 0.2.2，待第 3 阶段统一为 0.2.3；旧网页需从新程序重新打开以取得配套资源。

## 实际测试结果

- Node：49 项通过，含新增周期导航、闰月和日期边界。
- Rust：139 项主库、2 + 2 + 1 项其他套件，共 144 项通过；包含日界、跨年自然周、闰月、0／待补填／小数、演示隔离、活动记录排除、全部分页汇总、补填编辑删除后的重新计算、音效格式、优先级及设置兼容。
- 一次完整 Rust 测试暴露原有回放拒绝测试的时序假设：连接清理可能先清空页面，旧断言却强制页面仍存在。仅调整该测试允许已断线清空状态，同时禁止接受回放的 focused=false；未修改浏览器鉴权或连接清理实现。修正后定向及完整测试通过，不把失败尝试计作通过。
- TypeScript / Vite 生产构建、Rust fmt 检查通过。原有大于 500kB 的图表分块提示保留。开发服务监听隔离 EXE 时曾报告 EBUSY 文件占用，后续浏览器回归通过；服务已关闭，未把该监听提示称为成品运行错误。
- 新报表／音效设置浏览器回归通过：周期和闰月、自定义／全部日期、分类筛选、0 与待填、失败后恢复、详情进入编辑不自动保存、焦点、0 保存、500/409 保留输入、辅助图表展开关闭、十次试听参数、静音保留、套装保存重载及窄屏长名称。
- 390、800、1024、1280、1440、1600、1920px 和 125% CSS 缩放检查通过，无整页横向溢出，分类表在趋势图之前。已实际打开桌面、手机和设置截图，确认表格／卡片、数字及图例可读。旧总览编辑、阶段 1 名称及多 URL 三组回归均通过；夹具已更新到新接口和布局，不沿用旧网格断言。
- 实际使用 Windows WinMM SND_MEMORY 同步播放全部十条 PCM，API 均返回 1；静态格式检查及播放受理不等同于听感验收。两套试听合辑位于 artifacts/0.2.3/qa/sound-preview-soft.wav 和 sound-preview-crisp.wav，依次为开始、暂停、恢复、结束、提醒，保留间隔且按完整 PCM 样本对齐。
- 独立标识 com.workmemo.test.v023phase2 的 debug/custom-protocol 主程序与配套组件实际构建、staging、标识核对、启动通过。真实本机鉴权接口分别验证日、跨年周和闰月范围及 24/7/29 时间桶；SQLite schema 9、integrity_check=ok、外键检查无错误。独立库始终 0 条记录、无活动任务，不制造任务替代验收。
- 原生主窗口可访问性读取成功，确认页面来自 tauri.localhost 及真实控件；尝试打开设置时工具返回 coordinate input geometry is unavailable，重新激活后截图返回 window capture timed out: timed out waiting on channel。按 [computer-use SKILL.md](C:/Users/Administrator/.codex/plugins/cache/openai-bundled/computer-use/26.1023.51421/skills/computer-use/SKILL.md) 引用的 [guidance.md](C:/Users/Administrator/.codex/plugins/cache/openai-bundled/computer-use/26.1023.51421/docs/guidance.md) 要求 “report the exact error if recovery fails” 停止窗口输入。因此不声称原生设置点击、真实透明效果、不同 Windows DPI 或长时间键鼠验收通过。确认隔离库无任务后，仅关闭本轮创建的隔离进程。

截图、API／音频结果和解码原包均在 E:\WorkMemo\artifacts\0.2.3\qa，明确使用隔离演示数据／独立空库，不上传到 Git，不作为用户真实统计。当前成品包和用户库未被覆盖。Windows 11、其他声卡、音频设备切换和听感留待实际验收。

## 文件、完整代码和 PowerShell

- [完整路径及 NEW FILE / UPDATE](UPDATE-0.2.3-PHASE-2-FILES.md)
- [本阶段完整变更源码](UPDATE-0.2.3-PHASE-2-SOURCE.md)

音频为实际二进制文件，原始素材、许可全文及 manifest 哈希保留在原路径；不以省略号替代代码。

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
node .\scripts\collect-licenses.mjs
```

另一个终端启动开发预览；浏览器回归只拦截隔离接口，不操作真实库：

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

```powershell
$env:WORKMEMO_PLAYWRIGHT='C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
node .\scripts\verify-v023-phase2.mjs
node .\scripts\verify-ui-022.mjs --dashboard-only
node .\scripts\verify-v023-phase1.mjs
node .\scripts\verify-multi-url.mjs
```

预期各脚本打印通过消息并生成隔离结果，无页面脚本错误。手动验收时，从匹配版本程序打开总览，核对今天／本周／本月的各类已确认数量与明细；已确认 0 必须是 0，未补填不能冒充 0。修改／补填／删除后报表同步重算；当前任务不计入结束报表。在布局设置选择两套音效，分别试听五项，保存并重启后应保留套装与静音状态。试听听感及原生保存交互仍需用户实际确认。

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "feat: add calendar workload reports and selectable sound themes"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

按既有授权检查暂存区、提交推送并比较远程标识。第 2 阶段实现结束，待用户确认页面与音效后进入第 3 阶段；本轮不生成正式 v0.2.3 安装器、ZIP 或公开 Release。
