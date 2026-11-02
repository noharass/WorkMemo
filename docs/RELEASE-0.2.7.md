# WorkMemo v0.2.7 Windows 成品与发布记录

日期：2026-11-02（Asia/Shanghai）。用户明确要求「传release吧」，授权从源码及反馈修订进入 Windows 成品打包与公开发布。功能源码基线为 ffac9284ac69511fa7bd2fc5ea2743d3e71cb0d2，前序阶段记录保留。

## 目标与状态

本地正式构建、自动检查、安装器解包及 ZIP 内容核对完成；GitHub Release 已公开为正式 Latest。版本 0.2.7，中文 NSIS 安装器、完整 ZIP、第三方许可和 SHA256SUMS 四项资产的服务端大小／摘要及匿名下载复算全部一致。构建标签保持不动。

发布入口：[WorkMemo v0.2.7](https://github.com/noharass/WorkMemo/releases/tag/v0.2.7)。本地目录：`E:\WorkMemo\artifacts\0.2.7`。构建标签中的本记录是发布前核对结果，最终公开回执见 [main 分支本记录](https://github.com/noharass/WorkMemo/blob/main/docs/RELEASE-0.2.7.md)。

## 公开发布回执

- Release ID：`431201874`；发布时间：2026-11-02 16:06:44（Asia/Shanghai）。draft=false、prerelease=false，匿名 Latest 查询返回 v0.2.7。
- 构建源码与轻量标签 v0.2.7：`cb031eb7d048dd26dc18e51a335058d21a60901f`；公开前本地构建提交、远程 main 和远程标签已核对一致。回执文档另行提交，标签不移动。
- [WorkMemo_0.2.7_x64-setup.exe](https://github.com/noharass/WorkMemo/releases/download/v0.2.7/WorkMemo_0.2.7_x64-setup.exe)：服务端大小及 SHA256 与本地一致，实际匿名下载复核通过。
- [WorkMemo_0.2.7_windows_x64.zip](https://github.com/noharass/WorkMemo/releases/download/v0.2.7/WorkMemo_0.2.7_windows_x64.zip)：服务端大小及 SHA256 与本地一致，实际匿名下载复核通过。
- [THIRD-PARTY-LICENSES.txt](https://github.com/noharass/WorkMemo/releases/download/v0.2.7/THIRD-PARTY-LICENSES.txt)：服务端大小及 SHA256 与本地一致，实际匿名下载复核通过。
- [SHA256SUMS.txt](https://github.com/noharass/WorkMemo/releases/download/v0.2.7/SHA256SUMS.txt)：服务端大小及 SHA256 与本地一致，实际匿名下载复核通过。
- 完整公开回执：`E:\WorkMemo\artifacts\0.2.7\qa\RELEASE-RECEIPT.json`；匿名下载副本在同目录 public-downloads。仅保存公开元数据，不含认证凭据。

## 本版变化

- 分类待补填先列出当前已应用周期、分类和范围内的记录，选定一条后编辑；保存返回列表，写入失败和冲突保留输入，已保存但刷新失败可只重试读取。
- 辅助分析增加真实类别有效工时占比饼图，可点击扇区或图例筛选；包含已结束待补填工时、排除活动记录，零值不生成假扇区，适配宽窄屏。
- 桌面与网页统一轻透明控件，四皮肤新默认 65%、范围 40–100%，已有设置保留；精简重复说明、补齐底部和独立卡片圆角，保留关键错误、恢复及保存提示。
- 修复灵动岛首次展开时原生区域观察器未绑定，以及快速收起／重开竞态；网页导航采用固定侧栏内的受控提示，关闭提示后再执行最新滚动请求。
- 默认提示音改为 FiftySounds 五种离线 WAV；首次升级切换套装，保留静音、字体和窗口信息，之后选回柔和／清脆不会被重启覆盖。完整来源、处理及许可保留。

完整实现和源码见 [第一阶段](UPDATE-0.2.7-PHASE-1.md)、[反馈修订](FIX-0.2.7-FEEDBACK.md)及对应 SOURCE 文件。本次发行只统一版本、更新使用／构建／下载说明，没有增加新业务功能或运行依赖。

## 本轮实际检查与兼容限制

| 检查 | 结果 |
| --- | --- |
| Node | 56 项通过 |
| Rust | 库 147、helper 2、原生主机 2、注册 1，共 152 项通过 |
| 格式与构建 | Cargo fmt --check、TypeScript/Vite、Windows x64 release 编译、中文 NSIS 及 ZIP 完成；release 编译约 3 分 15 秒 |
| 生产资源回归 | 新反馈 5 组、记录选择 5 组、岛区域、24 组四皮肤／透明度／密度和 15 个试听绑定、旧 v026 9 组、旧 v025 10 组交互及 24 布局、完整网页回归通过 |
| 依赖与权限 | npm ci 成功，本次 npm 审计报告 0 项已知漏洞；许可收集 346 个依赖版本。锁定依赖图、扩展固定 key／权限、Tauri 除版本外的配置与 SQLite schema 9 保持 |
| 成品内容 | ZIP 15 文件，CRC、精确名单及与源码／构建输出逐项字节核对通过；安装器解包后主程序、helper、profile、扩展、修复脚本及许可与 ZIP 一致 |
| 版本 | 主程序 ProductVersion / FileVersion 0.2.7；helper --bridge-info：com.workmemo.desktop、protocol 1、version 0.2.7、test_overrides=false |

本轮没有安装、卸载或启动正式主程序，没有结束、删除或修改用户实际任务，也没有再次发出原生 GUI 输入。前序阶段原生截图超时且重试被用户 Esc 停止；Windows 原生透明、裁剪区域真实点击、焦点、多屏 DPI、实际登录自启及完整安装卸载仍未全部实测，主观音效听感仍待人工确认。不能以浏览器截图／IPC 或编译成功替代这些验收。

目标 Windows 10／11 x64 和 WebView2；未签名。已有 Dashboard 分块约 1534.67kB（gzip 498.87kB）的超 500kB 警告保留。构建使用 --no-binary-patching，使安装器和 ZIP 主程序字节一致。更新前备份记录与设置、正常退出旧版，无需强制结束当前任务；更新后在 Chrome 重新加载 0.2.7 配套扩展并同步站点授权。SQLite 仍为 schema 9，旧版可能无法读取 40% 或 fiftysounds 等新设置，回退时使用升级前配置备份。

## 成品摘要

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.7_x64-setup.exe | 3770450 | `c4cf102952cf3263f7aac1781ed2ecefabfb734fe57292d09eb9aa000f5e3f2a` |
| WorkMemo_0.2.7_windows_x64.zip | 5039962 | `2809d80b3296105bbc12b1ae80bd4fd76dfd5490a597fe432bc708dc00eb5b7f` |
| THIRD-PARTY-LICENSES.txt | 2570495 | `998efb4d5965b2fd8fe366b023a3b45855adc91dafabda9d20d195a6b8107b2c` |
| SHA256SUMS.txt | 286 | `aadea1a123593bc4fb51648310f8005af1d06c0fa0d3925471ef625fc26a412a` |

主程序 SHA256：`6cafc0e16e9f3e0abd93293ed62cf2e2e8967eb6b9dc0ac72cbc3ad56de2d415`。完整成品核对回执：`E:\WorkMemo\artifacts\0.2.7\qa\PACKAGE-VERIFICATION.json`；版本／依赖／权限核对：同目录 VERSION-VERIFICATION.json。

## 完整路径、源码及复测

全部 NEW FILE / UPDATE 绝对路径见 [RELEASE-0.2.7-FILES.md](RELEASE-0.2.7-FILES.md)。本次完整版本文件、锁文件和说明见 [RELEASE-0.2.7-SOURCE.md](RELEASE-0.2.7-SOURCE.md)，功能源码在前序 SOURCE 及构建标签源码归档中完整保留，不用省略号代替代码。构建产物、日志和公开回执仅在忽略的 artifacts 目录，不提交数据库、凭据或私密设置。

```powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.7\SHA256SUMS.txt
Get-FileHash .\artifacts\0.2.7\WorkMemo_0.2.7_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.2.7\WorkMemo_0.2.7_windows_x64.zip -Algorithm SHA256
```

预期 Node 56、Rust 152 全部通过，输出四项资产，SHA256SUMS 与实际文件一致。同版本重建会替换同名本地产物，时间与压缩元数据可能改变摘要，不声称二进制完全可复现。

另开终端运行 `npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort`，再执行：

```powershell
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1422/'
$env:WORKMEMO_WEB_URL = 'http://127.0.0.1:1422'
node scripts/verify-v027-feedback.mjs
node scripts/verify-v027-web.mjs
node scripts/verify-v027-island.mjs
node scripts/verify-v027-visual.mjs
node scripts/verify-v026.mjs
node scripts/verify-v025.mjs
node scripts/verify-web-ui.mjs
```

其他机器替换 Playwright 路径。预期各脚本成功退出；数据均为隔离夹具，不是用户任务，不代表原生 DPI 验收。Windows 后续验收应核对新旧记录、补填选择、四皮肤、岛展开区域、暂停计时、重启恢复及音效，不能为了测试强制结束实际任务。

## Git 与公开发布流程

沿用本仓库本地 Git 身份、origin/main，不改全局身份，不更改远程或公开范围。显式暂存本次文件，检查排除原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md、依赖、产物、数据库、凭据和私密配置。提交构建源码、推送 main 和新标签 v0.2.7 后核对标识；创建草稿、上传四项资产并校验服务端大小／SHA256，再公开为正式 Latest，匿名下载全部资产复算。公开回执另行提交，构建标签不移动，不覆盖旧版本。

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "release: package WorkMemo v0.2.7 for Windows"
git push origin main
git tag v0.2.7
git push origin refs/tags/v0.2.7
git rev-parse HEAD
git rev-parse v0.2.7
git ls-remote origin refs/heads/main refs/tags/v0.2.7
git status --short --branch
```

认证仅通过现有 Git 凭据助手在内存读取；不将令牌写入文件、日志或远程 URL。发布完成后结束本版本，不自动增加功能或进入下一版本。
