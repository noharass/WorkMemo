# WorkMemo v0.2.2 本地交付记录

后续紧凑布局修订及当前成品摘要见 [UPDATE-0.2.2-COMPACT.md](UPDATE-0.2.2-COMPACT.md)。本文末尾摘要是 0ddb32e 的原始交付记录；当前 artifacts/0.2.2 已更新。

日期：2026-10-28（Asia/Shanghai）。起点：3f9b994，main 与 origin/main 一致；原有未跟踪的 docs/DYNAMIC-ISLAND-PLAN.md 保留，不纳入本次提交。遵循已确认方案完成本轮九项需求，不自动公开 Release 或扩展功能。

## 目标与实现

1. 状态岛原为 420×92，确认时 420×140；改为 320×56、确认时 320×88 逻辑像素。图标、短状态、时长与按钮同一行，浏览时开始入口移至右侧。暂停／继续使用原有 pause_task/resume_task，同一记录累计；仅浏览与开工候选继续使用原有确认流程。结束与空闲提醒保留独立可读的展开尺寸。
2. 布局设置表单最大宽度 650px，表单、标题和保存操作居中，窄窗自适应。
3. WorkUrl/RuleInput 增加 match_mode：path_prefix/origin/domain_suffix。保留 url_prefix 输入字段。Rust 校验并规范化，SQLite schema 7→8 保留规则 ID、序列及原有业务记录；唯一键为模式＋规则值。
4. 站点规则限定协议、主机和端口；域名后缀只匹配域名边界，覆盖域名及子域名，不匹配查询参数文字。路径规则、站点规则、后缀规则依次优先，同类优先更具体规则，再按 ID。旧规则缺省 path_prefix。
5. 配套扩展增加 match_modes 能力协商，仅向声明支持的软件发送能力字段；本机主机在 false 时不序列化新字段以兼容旧协议。旧扩展遇到新规则时自动识别保持暂停，主界面显示更新提示；只申请配置站点或域名通配权限。
6. 五个内嵌 PCM WAV 为轻提示音，80～250ms。Rust 在服务操作及后台监测后观察已提交状态，开始、暂停、继续、结束、空闲警告各提示一次；首次读取和恢复快照静音。默认开启，在布局页保存开关及试听，复用 window-layout.json 的原子持久化与备份恢复。Windows PlaySoundW 异步播放，失败不影响业务。
7. 总览使用紧凑白色卡片、浅灰底、64px 图标侧栏、细边框。减少标题、统计、筛选和表格留白。四皮肤维持身份色，悬浮使用轻微背景变化；补齐图标、轮播、危险按钮的独立悬浮规则。
8. 已复现 v0.2.1 详情编辑按钮问题：React 复用同一个按钮节点，点击后节点变成提交按钮，浏览器默认动作立即提交一次并返回查看态。改为独立 key，查看按钮显式 type=button，编辑后聚焦并滚动到数量输入框。保持原有 Rust 数量校验、版本冲突与审计。
9. 工作节奏使用灰色零值和四档绿色，按范围最大有效工时分档，保留本地日期和真实工时悬浮信息，并增加少—多图例。日历格改为方格。趋势为横轴与缩放条各留独立空间，缩放条关闭边缘详情文字，日期标签避免重叠。

设计依据：用户第三张参考图的紧凑卡片结构，以及 [GitHub Primer 颜色与按钮规范](https://primer.style/product/primitives/color/)。没有添加虚构生产记录、装饰性按钮或新的 UI 框架；自动化浏览器中的记录均为隔离 HTTP/IPC 测试夹具。

## 检查结果

- Node：46 项通过；Rust：114 项库测试＋2 项主机单元测试＋2 项主机集成测试＋1 项注册集成测试，共 119 项通过。记录保存失败、计时、单活动任务、恢复及历史一致性原有测试继续通过。
- 新增规则规范化、优先级、授权范围、域名伪造／查询误匹配、能力协商、schema 7 迁移、新规则保存、模式共存、旧备份恢复与提示音状态去重覆盖。
- Rust 格式检查、TypeScript 和 Vite 生产构建通过。Vite 保留数据中心单个图表分块超过 500kB 的提示，不将此提示称为构建失败。
- 浏览器回归：进入编辑不会提交，数量 0 保存，失败及 409 冲突保留输入，1024/1280/1440px 宽度和 CSS 125% 缩放无页面横向溢出；90 天日期序列用于图表截图。
- 浏览器 IPC 夹具：四主题胶囊截图、暂停／继续／浏览后开始、候选确认展开；320×56 常态操作位于窗口内。设置布局在 1024px、600px 的居中与窄窗适应单独检查。最终检查发现 range 控件默认外边距造成 2px 溢出，归零后重新通过。
- 音频文件实际读取验证：单声道、16bit PCM、22050Hz，时长 0.09～0.23 秒。声音是否悦耳、设备实际发声及后台听感未由此检查证明。
- Windows 独立 QA 标识 com.workmemo.test.qa022 的中间构建已构建并实际启动，进程来自本项目 debug/workmemo.exe，可访问性树读取到 tauri.localhost 主界面、布局和工作入口。QA 使用新数据目录与测试注册表分支，没有操作正式或既有预览记录。
- Windows 截图两次超时，点击工具返回 coordinate input geometry is unavailable；没有据此声称原生透明、不抢焦点、真实按钮交互、多屏或 Windows 100%/125%/150% DPI 已通过。结束本轮创建的空 QA 进程以释放构建文件；没有结束或删除用户工作。
- 首次打包 npm ci 因本轮 Vite 进程占用 Tailwind 原生模块而 EPERM；关闭本轮开发服务后重新执行。补充检查发现旧表的 URL 单列唯一约束不允许模式共存，最终迁移改为复合唯一键并验证高水位序列保留。一次无必要的独立 target 编译已取消，产物移至被忽略的 artifacts/0.2.2/qa/cancelled-build，不提交。

最终包摘要见本文末尾追加记录；推送后本地与远程提交比较回执保存在 artifacts/0.2.2/qa/git-sync.txt。验收受限不等于已验收通过。

## 完整文件与代码

完整路径及 NEW FILE / UPDATE 见 [UPDATE-0.2.2-FILES.md](UPDATE-0.2.2-FILES.md)，完整文本源码见 [UPDATE-0.2.2-SOURCE.md](UPDATE-0.2.2-SOURCE.md)。音频二进制保存在 src-tauri/sounds，清单给出摘要。没有用省略号替代文件代码。

## PowerShell 与测试方法

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd ci
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.2\SHA256SUMS.txt
Get-FileHash .\artifacts\0.2.2\WorkMemo_0.2.2_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.2.2\WorkMemo_0.2.2_windows_x64.zip -Algorithm SHA256
```

浏览器回归脚本是可选的开发检查，不新增项目依赖。需本机 Edge 与可用 Playwright；先在另一个终端启动 npm run dev，再指定已有 Playwright 包入口：

```powershell
$env:WORKMEMO_PLAYWRIGHT='C:/path/to/playwright/index.mjs'
node .\scripts\verify-ui-022.mjs
```

预期打印 Dashboard UI regression passed，截图与 JSON 保存到 artifacts/0.2.2/qa。该脚本从不连接真实数据中心，HTTP/IPC 均为测试夹具。

手动验收：
1. 升级前备份并退出旧程序；核对 SHA256 后安装或完整解压 ZIP，主程序、浏览器组件和扩展不可拆散。
2. 在 Chrome 重新加载 0.2.2 扩展并同步授权。分别配置 moonshot 站点及 .cn-beijing-vpc.fcapp.run 后缀；打开对应工作页面并操作，确认后才计时；其他域名查询里出现相同文字不能匹配。
3. 灵动岛工作态点击暂停，应冻结工时；点击继续沿用原记录。仅浏览状态右侧开始入口就绪后可开工。切主题与拖动不应修改任务。
4. 打开布局，检查水平居中与窄窗滚动，试听并关闭提示音后保存；重启后保持关闭。开启后开始、暂停、恢复、结束各一次提示，刷新不重复。
5. 总览的详情进入编辑并保持输入，数量填 0 保存后列表和统计更新；断连或冲突时保留输入。检查热力图色阶与日期缩放条文字。
6. 在 Windows 不同 DPI、桌面背景和多屏环境观察真实透明、按钮范围及焦点；本轮工具未完成这些验收，需要实机补验，不对真实任务制造状态。

## 兼容性和同步命令

Windows 10/11 x64、WebView2；未做签名，未在干净 Windows 11、缺 WebView2 或所有 DPI 实机测试。SQLite schema 8 不可由 0.2.1 直接打开；回退需升级前备份。扩展和主机须完整更新。四主题、原有数据库路径及记录格式保留，提示音不增加音频框架。

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: deliver compact WorkMemo 0.2.2 with URL matching and sound cues"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

提交排除 artifacts、依赖、真实数据库、个人配置及原有未跟踪文档。推送后核对提交标识。本轮不创建公开 Release。

## 最终本地成品

最终 Windows x64 打包脚本完整执行通过；最终 release 与中文 NSIS 构建成功，ZIP 中主程序逐字节等于 release 程序，全部浏览器资源逐字节等于本轮 staging，扩展版本为 0.2.2、profile 为 com.workmemo.desktop；ZIP 共 15 个条目，不包含用户记录或设置。三个 SHA256 均已重新计算比对。未运行最终安装器安装／卸载，也未把中间 QA 启动称为最终正式包的原生验收。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.2_x64-setup.exe | 3214107 | `6bf22c6eeed9742715257f67846647da52ca5da9a949d5a4053b053e2b5c7467` |
| WorkMemo_0.2.2_windows_x64.zip | 4428837 | `b38d12fc0e000fdd5c3c98a6727018e33e75b94336370dfa7071bb222e72a64c` |
| THIRD-PARTY-LICENSES.txt | 2413135 | `e777d5ab332cfc49e972c31557a53981845dfb8ab75dcfd0d9ac03ec48d5b620` |

目录：`E:\WorkMemo\artifacts\0.2.2`。完整核对回执与浏览器测试截图保存在 qa 子目录，不属于分发包。公开 Release 未创建。
