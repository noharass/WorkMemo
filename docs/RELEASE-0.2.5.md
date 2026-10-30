# WorkMemo v0.2.5 Windows 成品与发布记录

日期：2026-10-30（Asia/Shanghai）。用户明确要求「发版吧」，授权完成 Windows 成品和 GitHub 正式发布。功能源码基线为 `16742a0667af25497f02abdbb4807164af7329cb`；此前源码阶段中「暂不发布」的历史记录保留，本次授权进入发布收尾。

## 目标与状态

沿用原有布局、透明悬浮及 Glass／Cream／Dark／Neon 四皮肤，发布 0.2.5 中文 NSIS 安装器、完整免安装 ZIP、第三方许可与 SHA256。正式标识、数据目录、扩展固定 key、权限和 SQLite schema 9 保持；不为检查结束、删除或暂停真实任务。

本地正式构建与成品核对已完成；等待推送本次构建提交和标签，随后按已授权流程公开 Release 并记录公开下载回执。

发布入口：[WorkMemo v0.2.5](https://github.com/noharass/WorkMemo/releases/tag/v0.2.5)。本地目录：`E:\WorkMemo\artifacts\0.2.5`。

## 本版变化

- 顶部保留 Logo、设置与窗口控制，把眼睛图标「仅浏览」纳入工具栏，开启时使用主题色。
- 当前任务继续显示名称、真实计时和原操作；暂停后通过双箭头进入独立新建页。类别融入面板，取消切换返回原任务，保持原有任务切换确认规则。
- 主窗口按内容拟合高度、保持宽度，收紧新建和工作状态下的底部空白；短屏按工作区限高并允许滚动。
- 底部统计保持横向文字，只在实际溢出时平滑循环，不增加统计卡片。
- 状态岛主体尺寸和顶部位置固定；扩展区使用组件动画与 height／opacity／translateY，保持同一材质。原生固定画布按区域裁剪，不让展开重新挤动主体。结束后可直接补填工作量，保存成功收起，失败保留输入。
- 网页分类待补填数量可直接打开对应范围的编辑面板，支持「保存并下一条」，保留分类、日期、统计范围及未保存保护；详情、补填及确认面板统一居中。
- 新增默认开启的当前用户开机自启、后台登录启动与单实例；布局设置可关闭。自启注册先确保当前用户 Run 项存在，兼容新 Windows 用户配置，不访问全用户启动项。

详细实现、参考图及完整源码保留在 [第一阶段](UPDATE-0.2.5-PHASE-1.md)、[反馈修正](FIX-0.2.5-FEEDBACK.md) 和对应 SOURCE／FILES 文档。

## 实际检查

- Node 49 项通过；Rust 142 项库测试、2 项 helper、2 项原生主机、1 项注册集成，共 147 项通过；Cargo 格式检查通过。自启 Run 项修正后 Rust 测试已重新运行。
- 正式生产构建及 Windows x64 编译通过，生成中文 NSIS 与完整 ZIP；346 个包版本的许可收集完成。网页懒加载 JS 1510.41kB（gzip 490.25kB），仍有大块资源提示；构建也提示显式跳过二进制补丁，保留既有 --no-binary-patching 路径，不隐藏告警。新增 tauri-plugin 2.7.2 的 MIT 原文来自其 crate 所指官方源码提交，并按精确包名版本补充，未绕过许可收集检查。
- 生产资源完整网页回归通过：保存 138 帧保持内容、官方动画 114 帧保持锁定；覆盖失败、冲突、写后读取失败、重复提交、旧查询竞态、筛选、分页、删除、授权错误。390～1920px 六档宽度、短屏、125%／150% CSS 缩放及减少动态效果通过。
- 生产资源新增网页 4 组通过，含 53 条连续补填；桌面／状态岛 10 组交互及 24 组四皮肤／密度／宽度布局通过，含未保存保护、保存失败与窄屏。
- 生产资源 22 组顶部布局、工作名称设置及多 URL 原有隔离回归通过。旧 verify-ui-022.mjs 会直接导入 /src/themes.ts，因此在生产预览中失败；改用该脚本要求的 Vite 开发服务器后通过。当前桌面生产覆盖由 verify-v025.mjs 完成，保留这次工具限制记录。
- 主 EXE 的 ProductVersion／FileVersion 均为 0.2.5；ZIP 共 15 文件，CRC、完整名单、每个文件字节与源码／构建输出一致。7-Zip 解包 NSIS 后的主程序、helper、profile、注册脚本和扩展一致。成品 helper 实际执行 --bridge-info，返回 com.workmemo.desktop、protocol 1、version 0.2.5、test_overrides=false；扩展固定 key 与权限保持。
- 版本同步检查通过；本次发版步骤仅调整 npm／Cargo 锁文件的应用版本，不升级依赖。扩展除版本外的字段和 Tauri 除版本外的配置与功能基线一致。
- 所有浏览器业务检查均使用隔离 HTTP／IPC 夹具，不读取或修改真实工作数据库。没有运行安装器、注册正式 helper、重置用户工作状态或终止用户程序。

本轮未全部重新覆盖原生透明、裁剪区域点击与焦点、多屏 DPI、实际 Windows 登录自启、完整安装卸载及长期真实输入监测。此前原生截图工具超时，用户 Esc 后停止后续窗口操作；浏览器夹具、隔离预览及 helper 自述不能替代这些原生验收。程序仍未签名，限制随 Release 公开说明。

## 成品摘要

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.5_x64-setup.exe | 3601804 | `e88ae3a42228e825fb2290905cff87c4093b063711eda2410519208d60d20b56` |
| WorkMemo_0.2.5_windows_x64.zip | 4860047 | `b55dab710f4c56cca41d1ae1f1d7df5ccb72b4322f5426e17f107b71bd121045` |
| THIRD-PARTY-LICENSES.txt | 2568244 | `b560b767b993a7fc0e5d0422802d06195a7d588aeeed0e080caee90fe3b68965` |
| SHA256SUMS.txt | 286 | `f7490ef68f35a3328deee4d3685ecf6e0fe0525b2b9cd98871bfa56bee1cc5ce` |

主 EXE SHA256：`b733c77ecbc3c90294f079e1d311bf2f2be22a5d29beebf4f82764f29f4f99be`。成品核对回执：`E:\WorkMemo\artifacts\0.2.5\qa\PACKAGE-VERIFICATION.json`。

## 升级与兼容

Windows 10／11 x64，需要 WebView2；普通用户无需 Node.js、Rust 或 SQLite 服务。安装前备份数据，从托盘正常退出旧程序后完整安装或解压；重启按已有恢复流程处理未完成任务，不要求先结束工作。Chrome 重新加载新版配套扩展并同步工作站点授权。

ZIP 应保留主程序、helper、profile、extension 和注册修复脚本。默认自启在正式版首次运行时为当前用户启用，登录时在后台运行，可在布局设置关闭；开发／隔离预览不替用户注册启动项。系统任务管理器的禁用选择不会被常规启动强制覆盖。无内置自动更新；旧 Release 和成品保留。

## 文件与完整代码

[RELEASE-0.2.5-FILES.md](RELEASE-0.2.5-FILES.md) 提供全部 NEW FILE／UPDATE 完整路径和已跟踪源码清单；[RELEASE-0.2.5-SOURCE.md](RELEASE-0.2.5-SOURCE.md) 保存本次发行修改的程序、锁文件及使用文档完整文本。功能阶段的完整代码保留在各自 SOURCE 中，完整仓库由 v0.2.5 标签源码归档提供，不以省略号替代代码。

## PowerShell 复核与预期

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.5\SHA256SUMS.txt
Get-FileHash .\artifacts\0.2.5\WorkMemo_0.2.5_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.2.5\WorkMemo_0.2.5_windows_x64.zip -Algorithm SHA256
```

预期 Node 49、Rust 147 项通过，格式、生产构建、中文 NSIS 与 ZIP 成功。重新构建的时间及压缩元数据可能改变摘要，不声称二进制逐字节可复现。完整源码构建环境见 BUILDING.md。

在独立终端启动 `npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort`；旧桌面脚本另需 `npm.cmd run dev -- --host 127.0.0.1 --port 1420 --strictPort`。检查命令：

```powershell
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_WEB_URL = 'http://127.0.0.1:1422'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1422/'
node scripts/verify-web-ui.mjs
node scripts/verify-v025-followup.mjs
node scripts/verify-v025.mjs
node scripts/verify-titlebar.mjs
node scripts/verify-v023-phase1.mjs
node scripts/verify-multi-url.mjs
node scripts/verify-ui-022.mjs --desktop-only
Remove-Item Env:WORKMEMO_WEB_URL
Remove-Item Env:WORKMEMO_UI_URL
```

其他电脑替换 Playwright 路径。预期全部成功退出，4 组连续补填、10 组桌面／24 布局、22 组导航检查通过，页面错误为空。实际本次后三项原有回归使用生产预览 1420，唯直接导入 TS 模块的旧桌面脚本使用开发 1420。夹具不连接正式数据。

## Git 与公开发布

仅暂存本版文件；不提交 artifacts、target、node_modules、数据库、凭据或原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md。先 fetch 检查远程进展，安全提交并推送 main；创建不覆盖历史的轻量标签 v0.2.5 并推送，比较本地与远程标识。认证由现有 Git 凭据助手在内存提供，不写入文件或 URL。创建草稿、上传四项资产，核对服务端 SHA256 后公开为正式 Latest，再匿名重下载逐项复算；发布回执另行提交，构建标签不移动。

```powershell
git fetch origin
git diff --cached --check
git diff --cached --name-status
git commit -m "release: package WorkMemo v0.2.5 for Windows"
git push origin main
git tag v0.2.5
git push origin refs/tags/v0.2.5
git rev-parse HEAD
git rev-parse v0.2.5
git ls-remote origin refs/heads/main refs/tags/v0.2.5
git status --short
```

本次发版完成后总结交付，不自动进入下一版本。
