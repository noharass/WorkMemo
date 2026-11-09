# WorkMemo v0.2.7 同版本修订成品

2026-11-09（Asia/Shanghai）。用户明确要求「直接发布，还是0.2.7」，授权将已修正的新建／网页绑定入口直接打包并更新 v0.2.7 公开发布。版本统一为 0.2.7，现有页面任务、多任务列表等功能保留，数据库仍为 schema 10。

## 状态与源码对应

本地正式成品已构建并校验，四项公开资产已替换并完成匿名下载复核；Latest 查询返回 v0.2.7，draft=false、prerelease=false。本轮主程序、配套主机、扩展和 npm/Cargo/Tauri 版本均为 0.2.7。

本次源码以前一修复提交 `80e8258ee8b815a684f0bf63dec67509b9b5c0f5` 为基础；实际资产构建提交为 [`37a3f08b1ed56118ae9e9881e268fe582ef5ded4`](https://github.com/noharass/WorkMemo/tree/37a3f08b1ed56118ae9e9881e268fe582ef5ded4)。原 v0.2.7 标签保留在 `cb031eb7d048dd26dc18e51a335058d21a60901f`，不移动或强推标签。GitHub 自动附带的该标签源码 ZIP 是原始历史源码；本次成品源码请使用上述构建提交。既有 v0.2.8 Release 和资产保留。

公开入口：[WorkMemo v0.2.7 · 2026-11-09 入口修订](https://github.com/noharass/WorkMemo/releases/tag/v0.2.7)。Release ID `431201874` 保持。新资产先以临时名上传、核对服务端大小和 SHA256 后切换，全部匿名下载核对成功后才移除旧资产；本机原始备份保留。新安装器 Asset ID `725864365`、ZIP `725864635`、许可 `725864945`、SHA256SUMS `725865095`，最终仅四项正式名称资产。

## 本次变化与兼容性

- 修复仅浏览时主窗口同时缺少新建与重新绑定表单的问题，结束绑定直接展示「新建任务／绑定已有任务」。保存绑定不会退出仅浏览或开始计时，失败保留名称输入。
- 灵动岛区分新网页与旧任务结束，操作说明与主窗一致。保留既有多任务列表、页面自动切换、暂停、重启恢复、结算、备份、主题和透明配置。
- 按用户要求从当前源码版本 0.2.8 改为成品版本 0.2.7，不回退数据库和业务实现；依赖图、权限和正式标识 `com.workmemo.desktop` 保持。
- **本次 schema 10，原始 0.2.7 为 schema 9**。同版本号不能用于判断数据兼容性，应按日期、SHA256 和构建提交区分。更新前备份记录和设置，正常退出旧程序即可，无需结束任务；升级后原始 0.2.7 不能直接读取新数据库。此前 0.2.8 的 schema 10 沿用，无反向迁移。
- Chrome 重新加载随包提供的 0.2.7 扩展，并核对新网页识别与站点授权。程序不自动替换旧安装；完整 ZIP 中配套文件须保留。已安装 0.2.8 时安装器可能显示版本降低提示；生成的 NSIS 配置允许版本降低，但本轮未执行实际覆盖安装。
- 目标 Windows 10／11 x64、Edge WebView2，成品未签名。本轮未安装、卸载或启动正式主程序，未修改或结束用户真实任务。原生透明、区域点击、焦点、多屏 DPI、自启和实际扩展往返仍待人工验收；不能用隔离浏览器结果替代。

## 实际检查结果

| 检查 | 结果 |
| --- | --- |
| Node | 57 项通过 |
| Rust | 157 库测试、2 helper、2 主机、1 注册，共 162 项通过 |
| Cargo 格式 | 通过 |
| 正式构建 | npm ci 成功、0 已知审计漏洞；TypeScript/Vite 通过；Windows x64 release 编译 2 分 57 秒；中文 NSIS 和 ZIP 完成 |
| 生产资源 | 新建／重新绑定入口专项、原页面任务回归通过；反馈 5 组、补填选择 5 组、24 组四皮肤／透明度／密度和 15 个试听绑定通过 |
| 内容与版本 | ZIP CRC 和精确 15 文件名单通过，逐项字节与源码及构建资源一致；安装器解包后主程序、helper、profile、扩展、修复脚本及许可与 ZIP 一致；主程序 ProductVersion/FileVersion=0.2.7，helper protocol=1、version=0.2.7、identifier=com.workmemo.desktop、test_overrides=false |
| 保持范围 | 对比 80e8258：npm 锁定依赖图不变，Tauri 除版本外配置不变，扩展固定 key 和全部权限不变；SQLite 实现未改动 |
| 限制 | 上一源码轮 v026 前五组通过，第六组旧「工作 URL」定位超时，未把全脚本报告为通过。本次没有重跑 v026；相关入口由专项和原页面任务脚本检查 |

已有 Dashboard 分块约 1534.78 kB（gzip 498.91 kB）的超过 500 kB 警告保留。包核验脚本首次遇到 Windows Python 默认 GBK 解码错误，使用 `python -X utf8` 重跑后全部通过，该错误不涉及程序数据。没有依赖或功能变更。

## 完整本地路径与摘要

输出目录 `E:\WorkMemo\artifacts\0.2.7`，旧公开四资产备份 `E:\WorkMemo\artifacts\0.2.7-before-20261109`，备份 SHA256 与 GitHub 原摘要均一致。新包核验回执 `E:\WorkMemo\artifacts\0.2.7\qa\refresh-20261109\PACKAGE-VERIFICATION.json`；公开回执位于同目录 `RELEASE-RECEIPT.json`，匿名下载副本在 `public-downloads` 子目录。正式构建日志 `E:\WorkMemo\artifacts\release-027-refresh-build.log`。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.7_x64-setup.exe | 3805768 | `af201c7ff8e67291f06ee6aa8608c95b913ba2c8f4a3a52aa0158da0db651a8e` |
| WorkMemo_0.2.7_windows_x64.zip | 5102201 | `8a2960f6927408b1d03ecccc1651b7c62519e80eec68624d1e0d6ac73a50279b` |
| THIRD-PARTY-LICENSES.txt | 2570495 | `998efb4d5965b2fd8fe366b023a3b45855adc91dafabda9d20d195a6b8107b2c` |
| SHA256SUMS.txt | 286 | `54f8f6d45d2dd20ee38417245937e9968f75a9ca4b75e94f98b55d010d06173b` |

主程序 SHA256：`81331e90d4c68b449151d8dde094ffe74c17be67a1137f97c5812afc2627b598`。打包启用 `--no-binary-patching`，安装器与 ZIP 主程序字节一致。

## 文件清单与完整代码

| 类型 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\package.json |
| UPDATE | E:\WorkMemo\package-lock.json |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.toml |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.lock |
| UPDATE | E:\WorkMemo\src-tauri\tauri.conf.json |
| UPDATE | E:\WorkMemo\browser-extension\manifest.json |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| UPDATE | E:\WorkMemo\docs\RELEASE-0.2.7.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.7-REFRESH.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.7-REFRESH-SOURCE.md |

完整六个版本文件和锁文件见 [RELEASE-0.2.7-REFRESH-SOURCE.md](RELEASE-0.2.7-REFRESH-SOURCE.md)，入口修复完整程序源码见 [FIX-PAGE-BINDING-ENTRY-SOURCE.md](FIX-PAGE-BINDING-ENTRY-SOURCE.md)，其余完整源码在构建提交中保留。没有省略号代替代码。原有未跟踪的 E:\WorkMemo\docs\DYNAMIC-ISLAND-PLAN.md 不提交、不覆盖。artifacts 内的包、临时发布脚本、备份和回执均忽略，不提交凭据、数据库和环境文件；认证仅在进程内使用现有 Git 凭据。

## PowerShell 复查与测试预期

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.7\SHA256SUMS.txt
Get-FileHash .\artifacts\0.2.7\WorkMemo_0.2.7_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.2.7\WorkMemo_0.2.7_windows_x64.zip -Algorithm SHA256
# 独立终端启动生产资源预览，测试终端按下方配置执行：
npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort
```

```powershell
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1422/'
$env:WORKMEMO_WEB_URL = 'http://127.0.0.1:1422'
node scripts/verify-page-binding-entry.mjs
node scripts/verify-page-task-ui.mjs
node scripts/verify-v027-feedback.mjs
node scripts/verify-v027-web.mjs
node scripts/verify-v027-visual.mjs
```

预期：各列出的测试退出 0；仅浏览下新建／已有任务入口可见，保存关系保持停表，失败保留输入；所有包摘要与 SHA256SUMS 一致。再次打包可能因构建时间、ZIP 时间戳产生不同摘要，应生成新的校验文件，不能声称新构建必与本次摘要一致。人工原生流程请用独立标识和测试数据库，不能为验收结束实际工作。

## Git 与发布

先核对并备份公开旧资产，构建与检查后精确暂存上表文件，检查暂存区。提交构建源码、推送 main 并核对远端。新资产先用临时名称上传并校验服务端大小与 SHA256，再切换到正式资产名、更新说明并设 v0.2.7 为 Latest；匿名下载复核全部通过后移除旧资产，旧副本保留在本机备份目录。不移动旧标签、不强推、不删除 v0.2.8 发布。

```powershell
Set-Location E:\WorkMemo
git diff --cached --check
git diff --cached --stat
git commit -m "release: refresh v0.2.7 with page binding entry fix"
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
# 检查无远端新提交或已安全整合后：
git push origin HEAD:main
git rev-parse HEAD
git ls-remote origin refs/heads/main refs/tags/v0.2.7
git status --short
```

发布回执另行提交并推送，原构建提交保持可追溯。本阶段完成后交付，不自动增加新功能。
