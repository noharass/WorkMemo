# WorkMemo v0.2.2 总览网格重新排版

后续已按用户授权完成正式发布。当前公开 ZIP 更新了使用说明中的下载地址，其余解压条目与本次构建一致；最终公开摘要见 [RELEASE-0.2.2.md](RELEASE-0.2.2.md)。

日期：2026-10-28（Asia/Shanghai）。起点 fc01db7。目标：解决上一轮只收窄筛选和节奏卡片、却仍保留整行位置而造成的大块空白。保留紧凑控件、已移除的趋势灰条、同工作多个 URL 及全部既有业务。

## 实际检查与布局

- 原实现：筛选为内容宽度却独占一行；趋势与类别并排后，节奏小卡另占整行，明细被推到更下方。读到现有运行程序来自 Downloads，本轮未退出、重启或覆盖用户实例。
- 顶部改为简短「工作总览」标题。日期快捷范围、起止日期、类别、状态、数据范围和应用按钮集中在同一个工具栏；卡片与统计、图表、明细使用相同的可用宽度。
- 四个统计卡占满下一行，继续使用真实统计结果，无新增数字或装饰控件。
- 桌面 >=1000px：图表两列，左侧趋势跨两行，右侧固定 320px 上下排列类别分布与工作节奏；两侧顶部和底部对齐。明细表在整个图表区结束后 14px 直接接续。
- 平板 641～999px：趋势占第一行，类别与节奏在第二行并排。手机 <=640px：三个图表单列；明细表仅在自己的容器内横向滚动。
- 主内容最大宽度为 1440px，取消旧的 1700px 以上额外放大留白规则。日历保留 16px 方格并居中，图例贴近下方，趋势无 dataZoom slider。
- 新弹性布局暴露原同步 ResizeObserver 重绘警告：改为 requestAnimationFrame 合并到下一帧，仅在实际尺寸变化时 resize；卸载时取消待执行帧。趋势图的 flex-basis 固定为 0，避免画布固有高度反过来撑大宿主。没有屏蔽浏览器错误。

## 完整文件与代码

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\src\Dashboard.tsx |
| UPDATE | E:\WorkMemo\src\Dashboard.css |
| UPDATE | E:\WorkMemo\scripts\verify-ui-022.mjs |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| UPDATE | E:\WorkMemo\docs\UPDATE-0.2.2.md |
| UPDATE | E:\WorkMemo\docs\UPDATE-0.2.2-MULTI-URL.md |
| NEW FILE | E:\WorkMemo\docs\UPDATE-0.2.2-LAYOUT.md |
| NEW FILE | E:\WorkMemo\docs\UPDATE-0.2.2-LAYOUT-SOURCE.md |

完整实现及验证代码见 [UPDATE-0.2.2-LAYOUT-SOURCE.md](UPDATE-0.2.2-LAYOUT-SOURCE.md)。历史源码快照和阶段记录保留；原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md 不修改、不提交。没有使用省略号替代代码。

## 已执行检查

- TypeScript 与 Vite 生产构建通过；原有图表分块大于 500kB 的提示保留。
- Node 46 项测试通过；本轮没有改 Rust 业务和数据库，不重复运行无关的后端测试。
- 浏览器回归在 390、800、1024、1280、1440、1600、1920px 全部通过：无整页横向溢出，筛选／统计／图表宽度一致；桌面左趋势和右两卡上下边界对齐、间距 12px；平板两卡同一行、手机单列，明细与图表只隔 14px，没有单独节奏行留下的大块空位。
- 保留并通过详情进入编辑不会自动提交、数量为 0 保存、失败和版本冲突保留输入、CSS 125% 缩放检查。浏览器 pageerror 与 window error（含 ResizeObserver 警告）均断言为空。
- 实际打开检查桌面、平板及手机截图，确认灰色缩放条未恢复，横轴标签可读。截图和边界测量 JSON 是明确标识的隔离 HTTP 测试夹具，位于 artifacts/0.2.2/qa/dashboard-*.png 与 overview-layout-result.json。
- 一次中间构建发现 ResizeObserver 同步重绘警告后已取消；修正并重新验证后再生成最终成品，不将中间构建作为交付包。
- 用户当前运行实例不由本轮停止或替换；未操作真实任务或数据库。原生窗口透明、不同 Windows DPI 和安装／卸载不因浏览器检查而称为通过。

## PowerShell 命令与验收

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.2\SHA256SUMS.txt
```

开发检查：另一个终端运行 npm run dev，使用本机 Edge 及已有 Playwright，不新增项目运行依赖：

```powershell
$env:WORKMEMO_PLAYWRIGHT='C:/path/to/playwright/index.mjs'
node .\scripts\verify-ui-022.mjs --dashboard-only
```

预期打印 Overview layout and editor regressions passed，七种宽度的边界与错误检查通过。打包前关闭本轮开发服务，释放 Windows 原生模块。

用户换用新包后，从软件打开总览：宽屏应看到左趋势、右上类别、右下节奏；缩窄窗口后卡片自动换排，明细紧接图表。日期／类别／状态／数据范围继续正常筛选，详情编辑保存正常。旧实例仍使用旧资源，需用户自行退出并换新包才能加载本次排版。

## 兼容性与 Git

仍为 v0.2.2，Windows x64／WebView2；技术栈、依赖、接口、SQLite schema 8、数据目录、计时及扩展权限均不变。本轮不公开 Release。当前成品摘要见末尾；前一多 URL 包保存在 artifacts/0.2.2/qa/multi-url-delivery-fc01db7。

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: reflow overview into a responsive dashboard grid"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

按既有授权提交推送，排除成品、依赖、真实数据库、凭据和个人配置。

## 最终本地成品

Windows 打包脚本完整执行通过，release 与中文 NSIS 构建成功；ZIP 共 15 个条目，主程序与 release EXE 逐字节一致，配套资源与 staging 一致，使用说明包含新总览排版。三个 SHA256 已重新计算比对，分发包不含用户数据库或个人设置。未运行安装／卸载。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.2_x64-setup.exe | 3204484 | `2307a2e1b4edcba15b29db1ef846ead5f1192da609a4fb3073fc67f3d9c5c4fd` |
| WorkMemo_0.2.2_windows_x64.zip | 4420574 | `2b8a461b4c89f304ca5af095937620a39958cef73bf719b0e7615cd85075077a` |
| THIRD-PARTY-LICENSES.txt | 2413135 | `e777d5ab332cfc49e972c31557a53981845dfb8ab75dcfd0d9ac03ec48d5b620` |

交付目录 `E:\WorkMemo\artifacts\0.2.2`。Git 同步核对回执保存于 qa/git-sync-overview-layout.txt，包核对回执为 qa/package-verification-overview-layout.json。
