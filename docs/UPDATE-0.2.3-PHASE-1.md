# v0.2.3 第 1 阶段：空闲暂停与工作名称

日期：2026-10-29（Asia/Shanghai）。起点：7b400b4。按用户确认的 v0.2.3 方案实施第 1 阶段；报表重排、日周月计算、两套音效及正式打包留在后续阶段，等待确认后继续。

## 目标与实际检查

检查 PRODUCT-SPEC、自动记录补充规范、PHASE-8、源码及运行进程。原版本已有 Windows 最后输入采样、空闲提醒和结束、离页与连接保护；缺少独立的空闲暂停状态。四个类别直接用固定中文值作为身份，并由多处界面显示。

本阶段复用现有 Rust 状态机、SQLite、React 和窗口设置，没有新增运行依赖、权限或另一套工作数据库。开始时的 Downloads 用户程序未被本轮停止、替换、操作或写入测试记录。原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md 保留，不提交。

## 已实现行为

- 默认最后一次键鼠操作后 120 秒进入 IDLE_PAUSE，截断最后输入后的空闲尾段。暂停保留同一记录；暂停期间不累计时间。设置允许 1～86400 整数秒，暂停阈值必须早于空闲结束。
- 自动任务须回到可信匹配工作页并产生新操作后恢复；纯手动任务可由任意新键鼠操作恢复，保持 MANUAL 模式。点击暂停、仅浏览、重启恢复和系统状态不可信仍受既有保护。系统采样长间断后，需要重新确认后的新输入，不回填间断时间。
- 空闲、离页、连接中断的结束期限先于恢复处理；同刻沿用空闲优先。延迟样本结合此前观察到的空闲处理，不把每两个输入时间戳的差都误判为空闲；增加 1 秒阈值下连续输入不被错误暂停的回归。
- 键鼠活动仍仅采样 Windows 最后输入时间，不采集按键值、输入文本或轨迹。系统忙碌及低阈值下无法逐个观察采样之间的输入，不能承诺毫秒级活动识别；没有引入键盘或鼠标钩子。
- 设置 → 工作名称与外观可分别编辑四类名称，Rust 去首尾空白，校验 1～20 个 Unicode 字符、重名及控制字符；支持两类名称互换。名称设置与图标颜色各自有保存入口，未保存草稿纳入原有关闭保护。
- 历史、主页、状态岛、结算、网址分组、数据中心筛选、图表和修正详情统一映射名称。底层类别值保留原有身份，改名不重写记录，不改变数量、时长、网址和颜色归属。
- 名称以 revision 校验，多窗口冲突不会覆盖已保存配置，也不丢弃本窗口输入；可显式重新读取并放弃草稿。配套扩展通过独立显示元数据获得名称，原匹配协议和类别身份保持。

## 数据迁移与完整源码

SQLite schema 8 → 9：新增 idle_pause_seconds 和 category_names，扩展暂停原因约束。旧阈值默认迁移为 min(120, idle_end_seconds−1)，保留其他参数。

迁移重建 work_records 前在事务外暂时关闭外键执行，复制完整字段并保留 AUTOINCREMENT 高水位，重建原有索引，提交前执行 foreign_key_check，提交后恢复外键执行。失败回滚表结构、版本和数据；不使用 writable_schema，不删除真实记录。测试覆盖区间、修正、提醒的保留及后续级联删除。

备份完整保存名称和暂停阈值；旧备份经临时副本升级后恢复。预览数据仅导入记录时保留本地名称和配置，显式包含配置时一并迁移名称和暂停参数。

- [完整路径及 NEW FILE / UPDATE](UPDATE-0.2.3-PHASE-1-FILES.md)
- [本阶段完整变更源码](UPDATE-0.2.3-PHASE-1-SOURCE.md)

## 实际执行结果

- npm test：47 项通过。
- cargo test --locked：各套件 132 + 2 + 2 + 1，共 137 项通过；其余空套件及 doc tests 无失败。
- Rust 格式检查、TypeScript 和 Vite 生产构建通过。原数据中心分块大于 500 kB 的构建提示保留。
- 隔离浏览器 UI 回归通过：名称保存、保存失败保留输入、跨窗口草稿保留与版本冲突、显式重新读取、主页选择框与网址分组的稳定类别值、120 秒参数显示、390/780px 无整页横向溢出，以及数据中心改名显示、筛选和详情编辑的稳定类别值。
- 原有总览布局与编辑回归通过，覆盖 390、800、1024、1280、1440、1600、1920px；多 URL 增删、移组、保存失败及重载回归通过。浏览器夹具不是原生计时验收，也没有写入真实数据库。
- 独立标识 com.workmemo.test.v023phase1 的 Windows debug/custom-protocol 程序与通信组件实际构建、配套扩展 staging 和标识核对通过。最终程序实际启动，鉴权 /api/meta、/api/query 返回正常；隔离库 schema 9、integrity_check=ok、foreign_key_check 无错误，记录数 0、活动任务为空。仅关闭本轮创建且确认没有任务的隔离进程。
- 原生截图初次返回 FrameArrived timed out: timed out waiting on channel；重新定位时没有可操作验收窗口。按 [computer-use guidance](C:/Users/Administrator/.codex/plugins/cache/openai-bundled/computer-use/26.1023.51421/docs/guidance.md) 的要求 “report the exact error if recovery fails” 停止使用旧窗口状态。因此本阶段不声称原生键鼠暂停交互、真实透明效果或各 Windows DPI 已验收。自动状态机测试及浏览器截图不能替代这些项目。

隔离截图及结果位于 E:\WorkMemo\artifacts\0.2.3\qa：phase1-category-settings.png、phase1-monitor-settings.png、phase1-ui-result.json、phase1-native-result.json；全部为明确标记的隔离夹具或无记录的独立启动环境，不提交 Git。Debug 隔离程序仅供验收，不是 v0.2.3 正式分发包。

## PowerShell 命令与测试预期

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
```

浏览器回归需另一个终端启动隔离预览服务，WORKMEMO_PLAYWRIGHT 指向本机已有 Playwright 的 index.mjs；不增加项目运行依赖：

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

```powershell
$env:WORKMEMO_PLAYWRIGHT='C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
node .\scripts\verify-v023-phase1.mjs
node .\scripts\verify-ui-022.mjs --dashboard-only
node .\scripts\verify-multi-url.mjs
```

预期打印各脚本通过消息，生成隔离回归结果，页面无脚本错误。

后续原生验收使用独立应用标识，避免 tauri dev 默认打开正式数据库。设置较短阈值后，应先观察有效工作，再停止输入直到空闲暂停；工时回退到最后输入并冻结。手动任务新输入应恢复同一 ID；自动任务在其他软件输入不恢复，回到工作页新输入才恢复。手动点暂停、仅浏览、重启恢复不得被本功能绕过。空闲达到结束阈值后仅生成一次待补全，不复活旧记录。改名后旧记录、URL 分组和统计应显示同一新名，重启应保留；冲突窗口须提示并保留草稿。这些步骤仍需实际原生验收，不能因列出预期而计为通过。

## 兼容性与 Git

固定技术栈与四皮肤保持，正式应用标识、数据路径和扩展权限保持；旧版程序不支持 schema 9，升级后的库应使用本阶段及之后源码。验收机为当前 Windows x64 环境；未完成 Windows 11、其他 DPI、长时间真实键鼠和锁屏休眠的本轮原生回归。

应用与扩展分发版本号仍为 0.2.2，按方案在第 3 阶段统一升为 0.2.3。现有正式 v0.2.2 下载资产不变；本阶段不发布 Release、不提供正式安装包。

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "feat: add idle pause and persistent category names"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

按既有授权在检查暂存区后提交推送，排除依赖、产物、截图、用户数据库和凭据；推送结果以实际返回及提交标识比较为准。完成本阶段后等待用户确认，再进入第 2 阶段。
