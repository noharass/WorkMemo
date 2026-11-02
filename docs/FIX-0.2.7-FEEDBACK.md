# 0.2.7 反馈修订：导航提示、工时饼图、文案与圆角

日期：2026-11-02（Asia/Shanghai）。基于 25ae87b 的源码阶段继续修订，正式版本字段与下载仍为 0.2.6；没有制作新安装器或公开 Release。

## 目标、检查与改动

- 阅读 PRODUCT-SPEC.md、PHASE-8.md 及实际源码；初始工作区只有原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md，未修改、暂存该文件。实际启动 Vite 开发服务，使用隔离 HTTP / IPC 夹具验证，不接入正式工作记录。
- 网页侧栏原来同时有原生 title 与折叠 Menu 内置提示，点击后直接启动平滑滚动。内置提示还会保留旧悬浮状态，受控隐藏后恢复可能出现两个标签。现在移除原生 title，关闭 Menu 内置提示，使用独立受控 Ant Design Tooltip，挂载在固定侧栏内。鼠标点击立即隐藏，离开后再允许悬浮；键盘进入保留正常提示资格。先提交关闭提示的状态，再在下一帧执行滚动，并取消过期滚动请求和上一次平滑滚动，快速切换以最后一次导航为准。保留 Menu 的键盘操作、栏目选中与减少动画模式。
- 辅助分析新增工时占比饼图，条形图和日历保留。只注册现有 ECharts 的 PieChart，不增加依赖。复用当前已应用筛选后的 categories.duration_ms，包含已结束待补填工时、排除活动记录；以原始毫秒计算比例，零值不生成扇区，全零／空数据不伪造均分图。沿用类别名称与颜色，扇区提示显示名称、有效工时及百分比，点击扇区或图下可键盘操作的图例应用类别筛选。极小非零比例显示“不足 0.01%”。
- 辅助分析 ≥1200px 三列；760–1199px 两列、日历占整行；<760px 单列。图下图例的名称支持截断、完整名称提示和无障碍说明，百分比列保持对齐。
- 主窗保留一个状态标题，通用长说明收起到“监测详情”，删除底部重复监测说明。连接异常仍直接显示；错误、恢复、未保存、删除确认等关键提示保留。设置中的识别／恢复、计时规则、网址匹配、透明度、图片要求及界面模式说明改为键盘可展开的 details；结算常驻信息缩为有效工时和开始时间，其他时间放入详情。灵动岛移除与状态重复的结束说明；网页删去复述标题的描述与装饰性标签，保留周期、统计口径及错误说明。
- 待补全和今日工作量两条使用主题圆角、边框及内边距，移除 today-strip 的 border-radius:0。检查并统一开始提示、切换、监测状态和字体预览等独立卡片圆角；表格分隔线与窗口内部连接边保持原语义。轮播、透明度与文字对比度规则保留。
- 公共 HTTP / Tauri API、SQLite schema 9、计时和结算规则、音效、权限、依赖及正式应用标识均不变。新增 durationSlices 为内部图表计算辅助函数，没有数据迁移。

## 实际检查结果

| 项目 | 本轮结果 |
| --- | --- |
| Node / TypeScript | 56 项 Node 测试通过，包括新增 3 项饼图比例测试；TypeScript 通过 |
| 新增反馈回归 | verify-v027-feedback 5 组在开发及生产资源通过：导航提示关闭／固定位置、快速切换、键盘、减少动画、饼图扇区及图例筛选、空值／极小工时、改名／颜色、六种宽度、文案／圆角、错误及恢复 |
| 外观 | verify-v027-visual：四皮肤 × 40/65/100% × 两密度，共 24 组，通过圆角／内边距、hover、溢出与内容不透明度检查；15 个音效试听绑定通过 |
| 既有界面 | verify-v026 9 组、verify-v025 10 组交互及 24 布局、titlebar 22 组、原补填选择 5 组、工作名称与多 URL 回归通过；岛区域首次／重复展开和减少动画回归通过 |
| 完整网页 | 生产资源完整回归通过：六种宽度、CSS 缩放、表单错误／冲突、保存后读取失败、焦点、删除取消、过期请求、图表轮询稳定及动画检查；实际结果保存在 artifacts/web-ui/qa/result.json |
| 构建 | 前端生产构建与 Cargo fmt --check 通过；独立标识 com.workmemo.test.v027 的 Windows debug / no-bundle 构建通过。现有 Dashboard 大分块警告保留 |
| Rust 测试 | 本轮没有修改 Rust 源码，未重新执行 Rust 测试；上轮 152 项通过属于上轮记录，不冒充本轮结果 |

导航验证使用真实 Menu 方向键／Home／Enter 操作。系统减少动画设置改变后，主题会更新，测试重新进入菜单再检查新模式；正常导航后的焦点另有断言。饼图取点击坐标前会等待 Canvas 真实动画稳定，避免在扇区仍旋转时把命中其他类别误判为计算错误。浏览器夹具补齐了清空记录后的演示模板来源，避免空数据测试自身生成无效日期；这些修改不影响运行时数据。

### 原生限制与数据边界

本轮独立 EXE 启动及 --monitor-probe 成功，确认标识 com.workmemo.test.v027。原生截图返回 `FrameArrived timed out: timed out waiting on channel`；刷新目标后的重试由用户按物理 Esc 停止，之后未再调用 Computer Use 或发送原生输入。因此本轮 **原生截图、透明、点击／焦点及系统 DPI／多屏未验收通过**；所有交付图片是明确的隔离浏览器预览。

只读检查现有隔离库 C:\Users\Administrator\AppData\Local\com.workmemo.test.v027\workmemo.sqlite3：schema 9、integrity_check=ok、193 条已结束记录，其中 192 条演示、1 条普通，未结束记录为 0。没有为本轮验收生成、删除或结束这些记录，没有操作正式数据库、覆盖正式程序或安装浏览器组件。该现状与上一阶段的 0 条记录是不同时间的读取结果，不将上一阶段结果套用到本轮。

## 完整路径、代码与截图

- [FIX-0.2.7-FEEDBACK-FILES.md](FIX-0.2.7-FEEDBACK-FILES.md)：完整绝对路径及 NEW FILE / UPDATE 清单。
- [FIX-0.2.7-FEEDBACK-SOURCE.md](FIX-0.2.7-FEEDBACK-SOURCE.md)：全部变更源码与测试全文，无省略段。
- E:\WorkMemo\artifacts\0.2.7\qa\feedback\result.json：新增 5 组回归的实际结果；native-result.json 为原生限制记录。
- 同目录 analysis-1440.png、analysis-1200.png、analysis-1000.png、analysis-760.png、analysis-640.png、analysis-390.png：图表排版；desktop-rounded.png：按前端自然高度请求呈现的首页预览，不等于实际 Windows 窗口测量。
- E:\WorkMemo\artifacts\0.2.7\qa\visual：四皮肤／透明度／密度预览；E:\WorkMemo\artifacts\0.2.7\qa\native\workmemo.exe：隔离 debug 程序，不是正式成品。

## PowerShell 命令与复测方法

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
```

另开终端启动生产预览（已有服务占用端口时选另一个空闲端口，不停止无关服务）：

```powershell
npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort
```

```powershell
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1422/'
$env:WORKMEMO_WEB_URL = 'http://127.0.0.1:1422'
node scripts/verify-v027-feedback.mjs
node scripts/verify-v027-visual.mjs
node scripts/verify-v027-island.mjs
node scripts/verify-v027-web.mjs
node scripts/verify-v026.mjs
node scripts/verify-v025.mjs
node scripts/verify-titlebar.mjs
node scripts/verify-web-ui.mjs
node scripts/verify-v023-phase1.mjs
node scripts/verify-multi-url.mjs
```

本机隔离配置保存在忽略目录，执行前必须核对标识为 com.workmemo.test.v027，不能换成正式配置启动验收：

```powershell
npm.cmd run tauri -- build --debug --no-bundle --config artifacts/0.2.7/qa/tauri-native.json
Copy-Item src-tauri/target/debug/workmemo.exe artifacts/0.2.7/qa/native/workmemo.exe
```

人工复测及预期：

1. 悬浮导航后点击：标签立即隐藏，导航固定不晃；移出再悬浮才能重新显示。快速切换以最后一次为准，键盘方向键／Home／Enter 和减少动画模式均可定位栏目。
2. 展开辅助分析：饼图与当前周期、分类、范围一致，待补填工时包含在内，活动任务不计入。点击扇区／图例筛选同一类别；全零时不显示假饼图。
3. 查看四皮肤和宽窄屏：图例不挤压饼图；桌面首页只有一个监测说明入口，待补全／今日工作量均有圆角，长文本与动画不越过卡片边缘。
4. 打开说明可读取完整规则；断线、恢复、未保存与删除确认仍直接可见，原有补填选择与音效选择不受影响。

兼容目标保持 Windows x64 / WebView2，浏览器回归使用本机 Edge。没有将 CSS 缩放当作系统 DPI 实测。安装卸载、其他 Windows 环境和原生效果不在本轮已通过结论内。

## Git 与阶段边界

按既有授权显式暂存本轮文件，排除原有规划、artifacts、target、依赖、数据库及私密配置；正常提交并推送 origin/main，比较本地与远程提交标识，不强推。

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: refine v0.2.7 navigation, analysis and compact surfaces"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

源码修订结束后等待用户确认，不自动打包、公开发布或增加下一版本功能。
