# WorkMemo v0.2.7：灵动岛默认收起成品

2026-11-10（Asia/Shanghai）。用户明确要求「还是发成0.2.7谢谢」，授权将灵动岛默认收起修正打包并更新现有 v0.2.7 公开资产。版本不增加，保留此前的新建／网页绑定修正、页面任务、多任务列表和 SQLite schema 10。

## 目标与源码

灵动岛默认收起，切换标签或收到提醒只更新短文字与箭头旁的静态圆点，点击箭头才展开。手动收起后不会因下一网页或候选变化重新展开；已打开的补填表单与未保存关闭保护保留。Rust 显示条件确保无活动任务时仍能显示收起的待绑定提示，并尊重托盘隐藏偏好。

功能源码基线为 `b8c238867cc926ad994284589c6f9753bf1a5ff3`，完整程序与测试源码见 [FIX-ISLAND-MANUAL-EXPAND-SOURCE.md](FIX-ISLAND-MANUAL-EXPAND-SOURCE.md)。本次不修改程序代码、版本、依赖、权限或数据库结构，仅更新使用说明、发布记录并构建成品。本地成品已完成构建与校验，公开资产替换及构建提交回执在完成后补记。

原 `v0.2.7` 标签保留历史提交 `cb031eb7d048dd26dc18e51a335058d21a60901f`，不移动、不强推；GitHub 自动标签 Source code 下载对应原始历史代码，本次资产源码须使用最终构建提交。既有 v0.2.8 发布保留。上一次 2026-11-09 成品记录和旧摘要见 [RELEASE-0.2.7-REFRESH.md](RELEASE-0.2.7-REFRESH.md)。

## 本地文件与备份

- 成品目录：`E:\WorkMemo\artifacts\0.2.7`。
- 本次核验与公开回执目录：`E:\WorkMemo\artifacts\0.2.7\qa\island-20261110`。
- 正式构建日志：`E:\WorkMemo\artifacts\release-027-island-build.log`。
- 替换前公开资产备份：`E:\WorkMemo\artifacts\0.2.7-before-20261110`，含四项旧文件、原 Release 元数据和校验回执，四项摘要与 GitHub 原摘要均一致。旧 11-09 前的原始备份另行保留。

## 实际检查与限制

源码修订阶段已实际通过 Node 57 项、Rust 163 项（158 库、2 helper、2 主机、1 注册）、Cargo 格式、前端生产构建，以及默认收起专项、页面任务、绑定入口、岛区域回归。本次功能代码不变，沿用这些结果，不重复声称再次运行。

本次实际执行与通过：

| 检查 | 结果 |
| --- | --- |
| 正式构建 | npm ci 成功、0 已知审计漏洞，346 个依赖版本许可已收集；TypeScript/Vite 通过；Windows x64 release 编译 2 分 30 秒，中文 NSIS 和完整 ZIP 构建成功 |
| 新生产资源回归 | verify-island-manual-expand、verify-v027-island、verify-page-task-ui、verify-page-binding-entry 全部通过 |
| 成品内容 | ZIP CRC 与精确 15 文件名单通过，逐项字节与源码／资源一致；安装器解包的主程序、helper、profile、扩展、修复脚本和许可与 ZIP 一致 |
| 版本及保持范围 | 主程序 FileVersion/ProductVersion=0.2.7；helper version=0.2.7、protocol=1、identifier=com.workmemo.desktop、test_overrides=false；npm 依赖图、扩展 key 和全部权限、Tauri 除版本外配置保持 |

安装器和 ZIP 主程序 SHA256 均为 `7dbaea6ce9ec17c76b45656821ba7ce07b52a29dc30b8faa7e3829b65adc1419`，使用 `--no-binary-patching` 保证字节一致。本地成品核验回执为 `E:\WorkMemo\artifacts\0.2.7\qa\island-20261110\PACKAGE-VERIFICATION.json`。

| 成品文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.7_x64-setup.exe | 3806805 | `74f927888c6aead2058adfbae82fdf3b9eb4a1cfeaf1bc056ddbda21b7858ee0` |
| WorkMemo_0.2.7_windows_x64.zip | 5102578 | `fafcfc84b92881b5bcc02b60d89fc9e9a3dda415e22cb9de6d7e246cd9b87fc4` |
| THIRD-PARTY-LICENSES.txt | 2570495 | `998efb4d5965b2fd8fe366b023a3b45855adc91dafabda9d20d195a6b8107b2c` |
| SHA256SUMS.txt | 286 | `98e9f94c05a40d915d794e87175e4540b1ec33bf1fe8766670afeb4d6bec6c48` |

历史 v025/v026 脚本有旧自动展开和字段定位假设，未报告为通过。现有 Dashboard 大于 500 kB 的构建警告保留。本轮未运行正式主程序、安装／卸载或操作真实任务；原生透明、裁剪区域实际点击、焦点、真实扩展往返和多屏 DPI 仍待实机验收，不能以浏览器 IPC 或编译代替。

## 兼容性与使用

目标 Windows 10／11 x64、Microsoft Edge WebView2。应用、helper 和配套扩展均为 0.2.7，正式标识 `com.workmemo.desktop`。本次沿用 schema 10；原始 0.2.7 为 schema 9，同版本号不表示数据格式相同，须按日期、构建提交与 SHA256 区分。更新前备份数据并从托盘正常退出旧程序，无需结束任务；原始 schema 9 程序不能直接读取升级后的数据库。

运行安装器或完整解压 ZIP，并在 Chrome 重新加载随包扩展、核对授权。程序未签名，不会自行替换旧安装。此前安装 0.2.8 时可能出现版本降低提示；本次保留现有功能。请保留 ZIP 中 helper、扩展、profile 和修复脚本。

## NEW FILE / UPDATE 完整清单

| 类型 | 完整路径 | 作用 |
| --- | --- | --- |
| UPDATE | E:\WorkMemo\README.md | 最新行为与发布记录入口 |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md | 随包同版本修订说明 |
| UPDATE | E:\WorkMemo\docs\BUILDING.md | 本次构建说明 |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md | 阶段进度与回执 |
| UPDATE | E:\WorkMemo\docs\RELEASE-0.2.7.md | 历史入口指向最新记录 |
| UPDATE | E:\WorkMemo\docs\RELEASE-0.2.7-REFRESH.md | 明确 11-09 摘要为历史 |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.7-ISLAND.md | 本次交付记录 |

没有新增程序代码。功能代码完整内容保存在 `E:\WorkMemo\docs\FIX-ISLAND-MANUAL-EXPAND-SOURCE.md` 与项目源文件中；版本文件和锁文件完整内容保存在 `E:\WorkMemo\docs\RELEASE-0.2.7-REFRESH-SOURCE.md`。构建提交保留完整源码，无省略。原有未跟踪 `E:\WorkMemo\docs\DYNAMIC-ISLAND-PLAN.md` 不修改、不提交；artifacts、依赖、数据库和凭据不提交，认证仅通过现有 Git 凭据在进程内使用。

## PowerShell 命令、测试与预期

```powershell
Set-Location E:\WorkMemo
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.7\SHA256SUMS.txt
Get-FileHash .\artifacts\0.2.7\WorkMemo_0.2.7_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.2.7\WorkMemo_0.2.7_windows_x64.zip -Algorithm SHA256
# 独立终端保持生产预览运行：
npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort
```

```powershell
Set-Location E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1422/'
node scripts/verify-island-manual-expand.mjs
node scripts/verify-page-task-ui.mjs
node scripts/verify-page-binding-entry.mjs
node scripts/verify-v027-island.mjs
```

预期退出 0；连续切页保持收起，有圆点和短文字；点箭头才展开，补填草稿不丢失；包摘要与本次 SHA256SUMS 一致。独立测试程序的 Windows 人工验收还应核对无焦点抢占、原生区域点击、显示／隐藏偏好，不用真实任务制造验收记录。

若需复跑源码校验，可用 `npm.cmd test`、`cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check`、`cargo test --locked --manifest-path src-tauri/Cargo.toml`。新构建可能受时间戳影响产生不同摘要，应生成并核对新校验文件。

## Git 与公开发布

旧公开资产已完整备份。构建、检查和记录后精确暂存上表文档，检查暂存区，提交并推送 origin/main、比较本地与远端标识。新资产先以临时名上传，确认服务端大小与摘要，再切换正式名称和发布说明；匿名下载全部复算通过后才移除旧资产。保留原标签、原始备份及 v0.2.8，不强推，不修改仓库可见范围。

```powershell
Set-Location E:\WorkMemo
git diff --cached --check
git diff --cached --stat
git commit -m "release: refresh v0.2.7 with collapsed island reminders"
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
# 远端无新提交或已安全整合后：
git push origin HEAD:main
git rev-parse HEAD
git ls-remote origin refs/heads/main refs/tags/v0.2.7
git status --short
```

公开回执另行提交并同步，完成后不自动增加新功能。
