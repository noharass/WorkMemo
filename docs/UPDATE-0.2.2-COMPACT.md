# WorkMemo v0.2.2 总览紧凑布局修订

后续增加同工作多 URL 设置，当前成品摘要见 [UPDATE-0.2.2-MULTI-URL.md](UPDATE-0.2.2-MULTI-URL.md)；本文保留紧凑修订时的交付记录。

日期：2026-10-28（Asia/Shanghai）。起点 0ddb32e。本次目标仅为解决用户新截图中的两处左右空白，以及删除工作趋势底部灰色缩放条；版本仍为 0.2.2，不发布公开 Release。

## 实际检查与修改

- 筛选按钮原有 margin-left:auto 导致按钮被推到卡片最右侧。改为 0，按钮与状态选项间距 12px；筛选卡片按内容宽度收拢，窄屏保留换行。
- 日历卡片原来铺满整行，图例又右对齐。卡片改为按内容收拢，日历图表宽 300px、高 156px，保留最大可用宽度限制。图例移到日历下方靠左，移除该卡片的英文角标。
- 工作趋势底部灰条是 ECharts dataZoom slider。删除 slider 与 inside 缩放配置及对应组件注册，并把原先预留的底部 76px 收到 28px，保留横轴日期完整可读。日期范围继续用现有筛选器选择。
- 打包脚本原先阻止任何 workmemo 进程运行，但用户此时正在 Downloads 目录使用旧包。检查改为仅阻止正在覆盖的 src-tauri/target/release/workmemo.exe，进程路径无法确认时仍阻止打包；其他安装或 ZIP 实例无需结束。打包不读写这些实例的数据库。

## 文件清单与完整代码

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\src\Dashboard.tsx |
| UPDATE | E:\WorkMemo\src\Dashboard.css |
| UPDATE | E:\WorkMemo\scripts\verify-ui-022.mjs |
| UPDATE | E:\WorkMemo\scripts\package-windows.ps1 |
| UPDATE | E:\WorkMemo\docs\UPDATE-0.2.2.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| NEW FILE | E:\WorkMemo\docs\UPDATE-0.2.2-COMPACT.md |
| NEW FILE | E:\WorkMemo\docs\UPDATE-0.2.2-COMPACT-SOURCE.md |

完整变更代码见 [UPDATE-0.2.2-COMPACT-SOURCE.md](UPDATE-0.2.2-COMPACT-SOURCE.md)。原始 v0.2.2 源码快照与阶段记录保留，未用省略号替代实现代码。原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md 保留原样，不纳入提交。

## 已执行验证

- npm run build：TypeScript 与 Vite 生产构建通过；原有图表分块体积提示继续保留。
- npm test：46 项通过。本轮没有修改 Rust 计时／数据库逻辑，不重复运行无关业务测试。
- 浏览器隔离回归通过：1024、1280、1440、1600px 宽度无页面横向溢出；筛选按钮与状态选项实际间距不超过 14px；日历卡片宽度小于 500px，图例不再跨至页面右端。四皮肤胶囊与详情编辑原有检查继续通过，页面错误为空。
- 实际打开检查 1600px 测试截图：筛选按钮紧邻状态选项、日历小卡片与图例紧凑排列、趋势底部无灰条。截图使用明确的 HTTP 测试夹具，不是真实工作数据。
- 本轮没有操作正在运行的 WorkMemo、结束任务、修改其数据库或替换其 EXE。现有程序需要用户稍后退出并换用新包才能加载新界面。
- 原生透明、不同 Windows DPI 与真实安装／卸载不因本轮浏览器检查而宣称通过。

## PowerShell 命令与手动验收

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.2\SHA256SUMS.txt
```

开发浏览器回归需先运行 npm run dev；在另一终端执行：

```powershell
$env:WORKMEMO_PLAYWRIGHT='C:/path/to/playwright/index.mjs'
node .\scripts\verify-ui-022.mjs
```

预期筛选按钮靠近状态选项，工作节奏为小卡片，图例紧挨日历下方；趋势底部灰条消失，日期标签仍可读。窄屏时筛选控件可换行，无整页横向滚动。打包前关闭本轮开发服务以释放 Windows 原生构建模块。

兼容性：技术栈、依赖、SQLite schema 8 和数据目录不变。移除趋势内的滚轮缩放后，用原有日期筛选控制范围。当前使用中的旧实例未被强制退出；新旧包同为 0.2.2，以本文下方摘要识别本次修订。

## Git 命令

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: tighten dashboard controls and remove trend zoom bar"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

按既有授权提交推送，不提交成品、依赖、数据库、个人配置或原有未跟踪文档。

## 最终成品与校验

打包脚本完整执行成功，Windows release 编译 3 分钟，中文 NSIS 成功生成。ZIP 共 15 项，主程序与 release EXE 逐字节一致，其余浏览器资源与 staging 逐字节一致；三项 SHA256 已重算比对。没有运行安装／卸载。旧交付保存在被忽略的 artifacts/0.2.2/qa/original-delivery-0ddb32e，以下为当前修订包摘要。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.2_x64-setup.exe | 3204103 | `6b8124ca473fc0bdfffe6f32db5d5e668b995a208f6edf9d99b6619f430c6544` |
| WorkMemo_0.2.2_windows_x64.zip | 4420162 | `1f426e756c6511a0fb82d2ebcfa67c1f05850750ae57b194930007e6d1f83b42` |
| THIRD-PARTY-LICENSES.txt | 2413135 | `e777d5ab332cfc49e972c31557a53981845dfb8ab75dcfd0d9ac03ec48d5b620` |

完整路径：`E:\WorkMemo\artifacts\0.2.2`。当前运行中的 Downloads 目录进程在打包前后 PID 与启动时间一致，未被停止或替换。Git 同步回执保存至 artifacts/0.2.2/qa/git-sync-compact.txt。
