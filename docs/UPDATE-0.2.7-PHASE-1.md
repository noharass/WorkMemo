# WorkMemo 0.2.7 第一阶段：源码与隔离验收

日期：2026-11-02（Asia/Shanghai）。用户已确认实施 0.2.7 方案。本阶段完成源码、自动回归和隔离 Windows 构建；版本字段和正式下载仍为 0.2.6。没有制作 0.2.7 安装器、ZIP 或公开 Release，等待用户确认成品阶段。

## 目标、检查与实现

- 初始 HEAD 为 eb3158e；工作区只有原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md，本轮未改动、未暂存该文件。阅读 PRODUCT-SPEC.md、AUTO-TRACKING-SPEC.md、PHASE-8.md 及实际前后端实现后，在现有 Tauri 2 / React / TypeScript / Vite / Rust / SQLite 上做最小迭代。
- 分类待补填原先调用 loadPending 自动打开第一条。现在先打开居中列表，即使只有一条也要求选择。列出记录 ID、起止时间、有效工时及备注；复用当前已应用周期、分类、真实／演示数据范围，沿用后端 50 条分页。选中时读取最新详情，核对状态、分类、数据范围和日期；不存在或发生变化时刷新并提示，不自动选另一条。
- 保存成功返回原分类列表，原页无剩余记录时收敛到有效页；移除该入口的保存并下一条。返回／关闭沿用未保存修改确认。冲突及写入失败保留字段，重复提交受 busyRef 保护。提交后列表刷新失败保留成功结果，只提供读取重试；普通明细编辑继续使用原流程。列表更新后恢复到原记录按钮，记录已消失时选择首个可用按钮或刷新入口。
- 灵动岛基线隔离复现：内容高度 110px，但 set_island_region 调用为 0，原生区域仍为 56px。原因是动画节点首次挂载时，原观察器未绑定实际节点。现在用实际 DOM 节点状态绑定观察器并强制保留挂载，将原生区域写入串行化，过期收起不会释放已重新展开的窗口。箭头增加 aria-expanded 和提示，保留收起草稿保护及主体位置规则。
- 桌面普通控件改为中性半透明背景，主要按钮采用轻着色、文字和边框强调；统一 hover / active / selected / disabled / focus。仅浏览的 hover 不再继承实心强调色，图标窗口控件不出现多余描边。主窗、状态岛、设置、输入、弹窗和网页按钮、卡片、弹层均覆盖。网页仍采用现有 Ant Design token / 官方样式接口，没有引入新依赖或全局 reset。
- 前端与 Rust 接受整数 40–100% 背景不透明度，四皮肤新默认和恢复默认统一 65%；原有合法设置不改写。文字和图标不随背景变淡；局部阅读底色随窗口不透明度计算，在低透明度下保护文字。浏览器的合成层次不等于原生桌面透明验收。
- 新增 fiftysounds 套装，保留 soft / crisp。开始 Notification（sfx-menu1）、暂停 Menu（sfx-menu3）、恢复 Interface（sfx-menu2）、结束 Confirmation（sfx-menu6）、空闲提醒 Alert（sfx-menu5）。均转为 22050Hz、单声道、16-bit PCM、最多 850ms、淡入淡出、统一峰值和响度。运行时直接嵌入 WAV，无网络／解码器依赖。素材文件与摘要、下载来源及许可说明完整保存；原 ZIP / MP3 仅在被忽略的 artifacts 目录，不作为素材库发布。
- 外观 JSON version 保持 1；布局 JSON 新增 sound_library_version=1。无标记旧配置读取校验后一次性切到 FiftySounds、递增 revision 并持久化，保留静音、字体和窗口信息；之后选回旧套装不会再被迁移。前后端 sound_theme 类型增加 fiftysounds；复用原 get_layout_settings / set_layout_options / preview_sound，无新增业务 API。SQLite schema 9、正式标识、计时规则和权限不变。

## 实际验证

| 检查 | 实际结果 |
| --- | --- |
| Node | 53 项通过，包括原有业务和新增原生区域串行／错误重试测试 |
| Rust | 152 项通过：库 147、helper 2、host 2、注册 1；覆盖音效一次性迁移、静音保留、重新选择、重启、15 个 PCM 及 40% 边界 |
| 格式、生产构建 | Cargo fmt --check、TypeScript、Vite build 通过；现有 Dashboard 大分块警告保留，未增加运行依赖 |
| 新增网页 | verify-v027-web：5 组通过；任意选择、单条、空列表、53 条跨页、0、失败／409、重复点击、刷新失败、记录变化／删除、焦点及手机居中 |
| 新增状态岛 | verify-v027-island：首次／重复展开、收起后 56px、原生区域调用跟随高度、减少动画、aria-expanded 通过；另有 Node 竞态测试 |
| 新增外观 | verify-v027-visual：四皮肤 × 40/65/100% × 两种密度，共 24 组；渐变明暗底色、控件 hover alpha、内容 opacity=1、溢出检查；15 个试听绑定通过 |
| 原有 UI | verify-v026 9 组；verify-v025 10 组交互与 24 布局；titlebar 22 组；旧桌面、工作名称、多 URL 隔离回归通过 |
| 完整网页 | 开发与生产资源回归通过；生产轮覆盖六种宽度、125/150% CSS 缩放、嵌套确认、删除取消、过期请求、保存无闪动、焦点及图表稳定；最后一次保存采样 128 帧、动画采样 109 帧 |
| 素材与许可 | 五个 WAV SHA256 和清单一致；收集 346 个依赖版本的许可并追加 FiftySounds 通知；原 Kenney 许可保留 |
| Windows 音频 | 五个 WAV 均通过 SoundPlayer.Load / PlaySync；格式、非静音、边界淡入淡出和峰值另由 Rust 测试核对。不能将 API 成功称为人工听感验收 |
| Windows 程序 | 独立 debug EXE 构建、启动、monitor-probe 和实际可访问性读取成功，标识 com.workmemo.test.v027；读取的是 http://tauri.localhost/ 的真实界面 |
| 隔离数据 | C:\Users\Administrator\AppData\Local\com.workmemo.test.v027\workmemo.sqlite3：schema 9，integrity_check=ok，0 条任务 |

原完整网页脚本曾分别遇到关闭后焦点下一帧恢复、首次 Canvas 动画尚未稳定的采样时序失败；未放宽产品断言，改为等待实际焦点和 Canvas 稳定后再比较，最终生产资源完整回归通过。图表仍按原有动画与轮询规则运行。

### 原生验收限制

使用 computer-use 技能检查独立 EXE。截图先后返回 `FrameArrived timed out: timed out waiting on channel`、`window capture timed out: timed out waiting on channel`；读取原生可访问性成功，但设置按钮输入返回 `coordinate input geometry is unavailable`。因此本轮 **Windows 原生透明、箭头区域真实点击、焦点、不同系统 DPI／多显示器、主观音效听感尚未通过验收**。没有使用 CSS 或 IPC 模拟结果替代这些结论。

只启动和停止了 E:\WorkMemo\artifacts\0.2.7\qa\native\workmemo.exe 隔离进程；没有结束、删除或修改正式工作任务，没有运行安装／卸载、改写正式注册或发布成品。原生测试目录只含主程序，没有浏览器 helper。截图中记录及网址均为浏览器隔离夹具，不进入用户数据库。

## 交付路径与完整代码

- 完整 NEW FILE / UPDATE 绝对路径清单：[UPDATE-0.2.7-PHASE-1-FILES.md](UPDATE-0.2.7-PHASE-1-FILES.md)。
- 完整变更文本源码：[UPDATE-0.2.7-PHASE-1-SOURCE.md](UPDATE-0.2.7-PHASE-1-SOURCE.md)，不使用省略号替代代码；WAV 保存在清单对应文件。
- 网页截图与指标：E:\WorkMemo\artifacts\0.2.7\qa\web；视觉截图：E:\WorkMemo\artifacts\0.2.7\qa\visual；状态岛基线与修正结果：E:\WorkMemo\artifacts\0.2.7\qa\island。
- Windows 程序与限制记录：E:\WorkMemo\artifacts\0.2.7\qa\native\workmemo.exe、同目录 result.json。该程序是独立验收构建，不是正式 0.2.7 发布包。
- 原始素材：E:\WorkMemo\artifacts\0.2.7\audio-source；分发素材：E:\WorkMemo\src-tauri\sounds\fiftysounds。完整许可汇编：E:\WorkMemo\docs\THIRD-PARTY-LICENSES.txt。

## PowerShell 命令

```powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm.cmd run build
node scripts/collect-licenses.mjs
```

另开终端启动开发服务，或用生产预览端口；不要停止其他用途的进程或覆盖其服务：

```powershell
npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort
```

```powershell
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1422/'
$env:WORKMEMO_WEB_URL = 'http://127.0.0.1:1422'
node scripts/verify-v027-web.mjs
node scripts/verify-v027-island.mjs
node scripts/verify-v027-visual.mjs
node scripts/verify-v026.mjs
node scripts/verify-v025.mjs
node scripts/verify-titlebar.mjs
node scripts/verify-web-ui.mjs
node scripts/verify-ui-022.mjs --desktop-only
node scripts/verify-v023-phase1.mjs
node scripts/verify-multi-url.mjs
```

本机已生成在忽略目录中的独立配置仅用于本轮原生验收；需先核对其中 identifier，不能替换为正式配置执行测试：

```powershell
npm.cmd run tauri -- build --debug --no-bundle --config artifacts/0.2.7/qa/tauri-native.json
Copy-Item src-tauri/target/debug/workmemo.exe artifacts/0.2.7/qa/native/workmemo.exe
& 'E:\WorkMemo\artifacts\0.2.7\qa\native\workmemo.exe' --monitor-probe
```

## 人工验收方法、预期与兼容性

1. 在隔离环境的分类待补填列表选择非第一条，核对 ID／时间／备注后填写 0 或小数：仅这条保存并返回列表；其他条保持待补填。翻页、修改分类及取消草稿不改变原筛选范围。
2. 保存时断开隔离连接或制造修订冲突：输入保留；已提交后刷新失败明确写明已保存，点击刷新不再写入。关闭后焦点回到原触发入口。
3. 在独立 Windows 环境产生实际测试工作提醒，首次及反复点击箭头：下方内容应可见可点，主体不跳动；收起后下方不再占用点击区域。快速展开／收起、减少动画及正在填写时均检查。
4. 四皮肤分别设 40／65／100%，放在明暗及图片桌面背景上，检查主窗、设置、结算和弹窗；按钮不出现大块实心绿色，hover 和选中可辨，文字保持不透明。重启保留选择；原设置 88% 不会被强制改成 65%。
5. 旧隔离布局保持静音后升级：套装变为 FiftySounds、静音不变；选回柔和／清脆，保存并重启后仍保持。分别试听五种声音并人工确认听感；五个完整原始音频已裁为短提示，不声称保留原曲全部时长。

兼容目标仍是 Windows x64 / WebView2。本轮未实测其他 Windows 版本、系统 DPI／多屏及完整安装卸载。SQLite 不迁移；外观接受更低数值、布局加入新音效枚举，旧 0.2.6 不能完整理解这些新设置。日后升级前保留配置备份，回退时使用升级前配置，不能假设旧程序能读取 40% 或 fiftysounds；业务数据库与配置分开管理。

## Git 同步与阶段边界

按用户既有授权使用仓库本地身份 noharass，目标 origin/main；fetch 后确认无远程新增提交。显式暂存本轮清单，排除原有规划、依赖、产物、真实数据库、凭据和私密配置；提交后正常推送并核对本地与远程标识，不强推。

```powershell
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: implement v0.2.7 selection, translucent UI and sound defaults"
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

源码同步不代表受限项目已验收。本阶段结束后等待用户确认成品阶段，不自动调整版本号、打包发布或增加功能。
