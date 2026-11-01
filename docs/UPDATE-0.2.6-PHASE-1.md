# WorkMemo 0.2.6 第一阶段：连续开工流程与设置保存修正

日期：2026-11-01（Asia/Shanghai）。状态：源码修正与隔离自动检查完成；Windows 程序启动成功，原生视觉验收受限。当前发行版本及下载仍为 0.2.5，未进入安装包／公开发布阶段。

## 目标与实际检查

依据用户确认的方案，先阅读 AGENTS.md、PRODUCT-SPEC.md、自动记录补充和 PHASE-8.md，检查 React、Rust、SQLite、窗口及现有回归。起点 main 为 21f48c6；已有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md 原样保留，不随本阶段提交。

初次规划时检测到用户从 Downloads 目录运行的 0.2.5；本阶段未启动、关闭或操作该正式实例，也未创建、暂停、结束、删除真实任务。后续进程检查未见正式实例，仅启动了本阶段独立标识和路径的验收程序。

两项缺陷有隔离复现证据：

- 旧结束提醒和新开工候选同时存在时，旧代码只显示结束提醒，候选入口不可见。
- 一次监测设置保存对应 1 次写入、4 次配置读取，并观察到原表单卸载。保存回调通过 key 重建表单，全局 data-changed 事件再次触发重建；不能把这一复现直接等同 GIF 的全部原生重绘原因。

原始指标保存在 E:\WorkMemo\artifacts\0.2.6\qa\baseline.json。该目录为隔离测试产物，不提交 Git，不包含真实用户记录或认证文件。

## 实现与接口

- 主窗口默认展示后端监测状态；点击「新建任务」进入手动表单，返回时保存当前内存草稿。候选到达、快照刷新和命令失败不清空输入；其他入口开工后禁用旧提交，返回可查看当前任务。后端继续用 expectedActiveId 检查及原子切换，保持先暂停再切换。
- WorkForm 改为受控草稿，增加 WorkFormDraft／draft／onDraftChange；业务提交成功后才清空草稿。草稿仅用于本次运行中的界面保留，不声称退出或重启后持久恢复。
- 新增纯展示选择函数 islandView；当前活动任务优先，无任务时新候选优先，旧结束提醒转为待补全入口。后台展示 key 采用同样优先级，避免旧提醒阻止新候选出现。岛内明确显示识别类别、「开始记录」「仅浏览」，确认前不创建记录。
- 正在编辑的旧结算保持原记录、版本号和输入，新候选通过顶部开始按钮确认；新任务可开始并显示在顶部，旧结算仍写回原记录。保存失败保留输入；成功后收起。旧记录不会自动标记为已填写，活动任务下仍可展开待补全入口。
- 复用既有真实时间、活动输入、页面规则和 SQLite 事务。新增后端用例显式停留在未确认候选状态，验证手动／自动结束后继续识别、旧待补全不阻挡、失败回滚和重复确认拒绝；未重写可靠的计时状态机。
- MonitoringSettings 移除保存后的父组件重建回调，增加 refreshVersion；直接采用保存返回的配置和修订号。干净状态的外部刷新保留节点，异步读取不能覆盖期间开始编辑的草稿；保存使先前读取失效。
- 保存加入同步重入保护。data-changed 的可选 payload 增加 source: monitor-settings，同一设置窗口忽略自身通知，其他既有监听者保持兼容。没有新增 Tauri 命令或业务协议字段。
- 设置确认框保存期间保持打开，Escape、叉号、重复保存及重复关闭请求不替换待执行操作；失败保留页面与草稿，成功只导航一次。UiDialog 新增可选 closeDisabled。Ctrl+S 忽略按键自动重复，干净表单不进入无意义的保存状态。

技术栈、依赖、浏览器权限、正式应用标识、数据路径、原生透明和四皮肤继续保留。SQLite 仍为 schema 9，无数据迁移。版本号留到成品阶段统一为 0.2.6。

## 实际检查与验收边界

已执行并通过：

| 检查 | 结果 |
| --- | --- |
| Node 单元测试 | 51 项通过，含 2 项新增展示优先级测试 |
| Rust 测试 | 146 库测试、2 helper、2 原生主机、1 注册集成，共 151 项通过 |
| Cargo 格式／TypeScript／Vite | 格式检查与生产构建通过 |
| 新增 verify-v026 | 开发与生产资源均 9 组；包含四皮肤×两密度的主窗口／岛布局、减少动态效果、草稿、候选失效、结算失败、重复提交及慢速保存 |
| 既有 verify-v025 | 10 组交互、24 组布局通过；显式手动页自然请求高度 495，当前任务 423，宽度 780；浏览器夹具结果不能代替原生尺寸验收 |
| 既有其他 UI | 顶部 22 组、网页完整回归、桌面四皮肤、工作名称／冲突、多 URL 回归通过 |

修正后单次保存为 1 次写入，生产资源的配置读取保持首次加载的 1 次；开发资源在 React StrictMode 下首次读取 2 次，保存也不增加读取。原表单和背景为同一 DOM 节点；慢速保存禁用输入后，在重新启用的 React 提交完成后恢复原输入焦点，不覆盖用户已切换的焦点。慢速确认保存逐帧检查弹窗位置、尺寸、打开状态及表单连接状态；保存过程中保持稳定，重复快捷键／关闭请求不增加写入。指标与帧记录位于 settings-after.json、settings-modal-frames.json，开发／生产回执分别保存。浏览器结果不证明 Windows 原生绘制无闪动。

本次同时调整旧回归的预期：空闲时需点击新建后才有类别选项；取消后重开保留工作量 0；旧结束提醒场景先使用无活动任务夹具。初次脚本中的精确备注标签匹配错误已修正；显式返回按钮使手动页自然高度由旧 443 增为 495，按实际内容校验，仍检查底部无大块空白。早期失败证据保留在 artifacts，最终通过以结果 JSON 为准。

原生检查：

- 使用临时合并配置构建独立 Windows debug 程序，标识 com.workmemo.test.v026，路径 E:\WorkMemo\artifacts\0.2.6\qa\native\workmemo.exe。仅复制主程序到隔离目录，未放入浏览器 helper，启动不会改写正式浏览器主机注册；debug 非正式标识不注册自启。
- --monitor-probe 实际返回独立标识、native_available=true、unlocked=true。Windows 工具读取到 http://tauri.localhost/ 的真实监测首页、待补全 0 和「新建任务」入口；隔离库只读检查 schema 9、quick_check=ok、记录 0、活动任务 0。
- 截图首次报告 FrameArrived timed out: timed out waiting on channel；重新选择窗口后可读取可访问性树，但点击报告 coordinate input geometry is unavailable。激活并重选后的截图重试报告 window capture timed out: timed out waiting on channel。此后停止原生输入，未尝试猜测坐标。
- 使用的技能为 C:\Users\Administrator\.codex\plugins\cache\openai-bundled\computer-use\26.1027.30824\skills\computer-use\SKILL.md；其 guidance.md 对捕获失败要求重新选择后重试，恢复失败则报告错误。因此原生透明、设置真实操作、GIF 所示闪动、焦点、DPI／多屏以及完整浏览器连续开工仍待成品阶段实测，不能称为已通过。

Vite 仍提示现有图表懒加载块大于 500kB，本轮约 1510.41kB／gzip 490.25kB；未升级依赖或隐藏告警。目标仍为 Windows 10／11 x64 与 WebView2；本次不是干净 Windows 11 或不同显卡环境的验收。

## 完整文件、代码与 PowerShell

完整 UPDATE／NEW FILE 路径及本阶段源码清单见 [UPDATE-0.2.6-PHASE-1-FILES.md](UPDATE-0.2.6-PHASE-1-FILES.md)。全部改动程序和测试的完整文本见 [UPDATE-0.2.6-PHASE-1-SOURCE.md](UPDATE-0.2.6-PHASE-1-SOURCE.md)，原始代码也完整保存在项目中；没有以省略号替代内容。

```powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

在独立终端运行开发服务或生产预览，再执行隔离 UI；Playwright 路径应替换为本机实际位置。

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 1420 --strictPort
```

```powershell
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
node scripts/verify-v026.mjs
node scripts/verify-v025.mjs
node scripts/verify-titlebar.mjs
node scripts/verify-web-ui.mjs
node scripts/verify-ui-022.mjs --desktop-only
node scripts/verify-v023-phase1.mjs
node scripts/verify-multi-url.mjs
```

```powershell
npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort
```

```powershell
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1422/'
node scripts/verify-v026.mjs
Remove-Item Env:WORKMEMO_UI_URL
```

预期：新增 9 组成功，settings-after.json 中 writes=1、reads=initialReads、sameForm=true、sameBackground=true；旧回归成功退出。截图中任务、数量、网址均为明确隔离夹具，与用户数据无关。

原生构建命令使用本阶段实际生成在被忽略产物目录的独立配置；它不能替换为默认正式配置运行测试：

```powershell
npm.cmd run tauri -- build --debug --no-bundle --config artifacts/0.2.6/qa/tauri-native.json
& 'E:\WorkMemo\artifacts\0.2.6\qa\native\workmemo.exe' --monitor-probe
```

后续 Windows 验收步骤：使用独立标识和数据库，从监测设置添加测试网址并保存；修改后切换栏目，依次验证保存并继续、失败重试、放弃和继续编辑；检查背景、弹窗、输入焦点和逐帧录像。再连接隔离浏览器组件，完成结束→新操作→新候选→确认→新记录，以及编辑旧结算期间开工。所有动作都应保持原记录，确认前不计时，不操作真实工作库。

## Git 与阶段交付

沿用仓库本地已配置身份及 origin/main，按既有授权提交推送；不修改全局身份。暂存使用本阶段明确路径，排除原有未跟踪规划、artifacts、target、依赖、真实数据库和凭据。远程有新增提交时先安全整合，不强推。

```powershell
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: prepare v0.2.6 continuous work and stable settings saves"
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

源码同步完成后等待用户确认，再进入版本号、Windows 成品和完整原生验收阶段。公开 Release 仍需明确发版指令；本阶段不改旧下载、标签或安装包。
