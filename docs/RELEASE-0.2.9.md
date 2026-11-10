# WorkMemo v0.2.9 Windows 发布记录

2026-11-10（Asia/Shanghai）。用户确认当前修正版基于 0.2.8 功能，明确要求「那还是发布成0.2.9把」。本次将主程序、配套主机、Chrome 扩展和 npm/Cargo/Tauri 版本统一为 0.2.9，新建 v0.2.9 标签与发布；既有 0.2.7 同版本修订、0.2.8 及所有历史标签保留。

## 源码关系与范围

实际 Git 检查：v0.2.8 原标签提交 `aac079f294a9a778b70d6c2f7fa9fe2a27861826`、多任务列表构建提交 `9d56dc0f09712ca921972b6c385abc58a2d78126` 都是当前分支祖先。当前并未回退到原始 0.2.7 功能，之前只是按用户要求使用了 0.2.7 版本号。0.2.9 统一采用递增版本，解决这些同版本修订的识别问题。

包含：

- 0.2.8 的网页与具名任务绑定、页面自动切换、主窗与灵动岛多任务列表。
- 仅浏览下仍能新建／重新绑定网页，直接显示「新建任务／绑定已有任务」，保存关系保持停表。
- 灵动岛默认收起，新网页、切页和提醒只更新短文字及静态圆点，点箭头才展开；补填草稿与未保存关闭保护保留。

本次不增加新功能，不修改计时、SQLite、权限或依赖，仅统一版本和发布说明。程序完整功能源码见 [FIX-PAGE-BINDING-ENTRY-SOURCE.md](FIX-PAGE-BINDING-ENTRY-SOURCE.md) 与 [FIX-ISLAND-MANUAL-EXPAND-SOURCE.md](FIX-ISLAND-MANUAL-EXPAND-SOURCE.md)，本次版本文件及锁文件全文见 [RELEASE-0.2.9-SOURCE.md](RELEASE-0.2.9-SOURCE.md)。

## 公开发布回执

已公开 [WorkMemo v0.2.9](https://github.com/noharass/WorkMemo/releases/tag/v0.2.9)，Release ID `439965579`，draft=false、prerelease=false，匿名 Latest 查询返回 v0.2.9。构建提交与新轻量标签 v0.2.9 均为 [`1ea89a1562616aba8fd079694e1502102b03397c`](https://github.com/noharass/WorkMemo/tree/1ea89a1562616aba8fd079694e1502102b03397c)，已核对远端与 API，标签源码与资产一致；回执文档另行提交，不改变构建标签。

四项资产服务端大小和 SHA256、匿名直接下载复算全部通过，公开资产恰为四项：安装器 Asset ID `730176711`、ZIP `730177013`、许可 `730177266`、SHA256SUMS `730177475`。完整回执与下载副本位于下述本地目录。

发布前后比较确认旧 v0.2.7（Release ID 431201874）和 v0.2.8（433413440）的四项资产 ID、文件名、大小、摘要全部保持不变，检查回执 `E:\WorkMemo\artifacts\0.2.9\qa\PRESERVED-RELEASES.json`。未替换旧资产、移动旧标签或删除历史发布。

## 数据与兼容性

正式标识保持 `com.workmemo.desktop`，SQLite 沿用 schema 10，0.2.8 与近期 0.2.7 同版本修订的数据不需反向迁移。原始 0.2.7 使用 schema 9，不能直接读取升级后的数据库；升级前备份，从托盘正常退出旧程序即可，无需结束任务。

目标 Windows 10／11 x64、Microsoft Edge WebView2，成品未签名。完整解压 ZIP 后须保留 helper、profile、扩展、修复脚本；Chrome 重新加载随包 0.2.9 扩展并核对授权。旧程序不会自动替换。

Windows 原生透明、区域实际点击、焦点、真实扩展往返、多屏 DPI、安装卸载与实际登录自启仍待完整人工验收。本轮不启动正式应用、不操作真实数据库或任务，不以浏览器 IPC／编译替代实机验收。

## 实际检查

Node 57 项、Rust 163 项（158 库、2 helper、2 主机、1 注册）和 Cargo 格式检查已实际通过，版本均为 0.2.9。正式 Windows x64 release 编译 2 分 38 秒，中文 NSIS 和完整 ZIP 构建成功。npm ci 成功、审计报告 0 已知漏洞，收集 346 个依赖版本的许可；TypeScript/Vite 生产构建通过，现有 Dashboard 超过 500 kB 的警告保留。

新生产资源的默认收起、岛区域、页面任务及绑定入口四个回归脚本均通过。默认收起专项首次在浏览器 newPage 阶段以 exit 13（unsettled top-level await）退出，未进入应用操作；串行重跑专项及岛区域脚本通过，没有把失败尝试计为通过。旧 v025/v026 脚本的历史自动展开与字段定位假设不适用于当前行为，未把其全脚本报告为通过。

ZIP CRC 和精确 15 文件名单通过，逐项字节与构建资源／源码一致；安装器解包后主程序、helper、profile、扩展、修复脚本与许可和 ZIP 一致。主程序 FileVersion/ProductVersion=0.2.9，helper version=0.2.9、protocol=1、identifier=com.workmemo.desktop、test_overrides=false。npm 锁定依赖图、扩展固定 key 与全部权限、Tauri 除版本外配置保持。

主程序 SHA256：`75430a20df9e2d07e3f05d7178d7d01ee4417c5326c78522e2906f7e3e3b68d6`；启用 `--no-binary-patching`，安装器和 ZIP 主程序一致。本地成品和公开直接下载均已校验。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.9_x64-setup.exe | 3805489 | `d203968c57e59affc736a2690f76bbbb14e9d62b40e2d1116593ffef876250ff` |
| WorkMemo_0.2.9_windows_x64.zip | 5102537 | `7368a3f663c56748851b40477b9bd07fc1c9b46e6929589e17cefcb5ec15b9c1` |
| THIRD-PARTY-LICENSES.txt | 2570495 | `998efb4d5965b2fd8fe366b023a3b45855adc91dafabda9d20d195a6b8107b2c` |
| SHA256SUMS.txt | 286 | `70d8faf93cf07b368b9b24d2b5b820b38850f46f6d94a202c536e7ad4f964aed` |

## 本地路径

- 成品目录：`E:\WorkMemo\artifacts\0.2.9`。
- 构建日志：`E:\WorkMemo\artifacts\release-029-build.log`。
- 包核验回执：`E:\WorkMemo\artifacts\0.2.9\qa\PACKAGE-VERIFICATION.json`。
- 公开回执：`E:\WorkMemo\artifacts\0.2.9\qa\RELEASE-RECEIPT.json`，匿名下载副本位于同目录 `public-downloads`。

## NEW FILE / UPDATE 完整路径与源码

| 类型 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\package.json |
| UPDATE | E:\WorkMemo\package-lock.json |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.toml |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.lock |
| UPDATE | E:\WorkMemo\src-tauri\tauri.conf.json |
| UPDATE | E:\WorkMemo\browser-extension\manifest.json |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.9.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.9-SOURCE.md |

完整代码保存在项目及上述 SOURCE 文档中，无省略号替代。公开源码以新标签的构建提交为准，公开回执另行提交。原有未跟踪 `E:\WorkMemo\docs\DYNAMIC-ISLAND-PLAN.md` 保留、不提交；artifacts、依赖、构建产物、真实数据库、凭据和环境配置不提交。认证仅使用现有 Git 凭据，保留仓库本地身份，不改全局配置。

## PowerShell 复查与测试预期

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.9\SHA256SUMS.txt
Get-FileHash .\artifacts\0.2.9\WorkMemo_0.2.9_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.2.9\WorkMemo_0.2.9_windows_x64.zip -Algorithm SHA256
# 独立终端启动生产资源预览：
npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort
```

```powershell
Set-Location E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1422/'
node scripts/verify-island-manual-expand.mjs
node scripts/verify-v027-island.mjs
node scripts/verify-page-task-ui.mjs
node scripts/verify-page-binding-entry.mjs
```

预期各命令退出 0；提醒变化保持收起，箭头可操作、草稿不丢；仅浏览可新建绑定但不开始计时；包版本均为 0.2.9，SHA256 与校验文件一致。重新构建可能因时间戳改变摘要，应生成新的校验文件。真实 Windows 验收须用独立测试标识与测试数据库，不用真实任务制造验收数据。

## Git 与公开发布

检查暂存区仅含上表文件，适当检查后提交并推送 main。确认远端无新提交或已安全整合，再创建新的 v0.2.9 轻量标签，指向构建提交；不移动旧标签、不强推。创建草稿，上传四资产、核对服务端大小与 SHA256，再公开为正式 Latest，并匿名下载全部复核。0.2.7／0.2.8 发布和资产保持。

```powershell
Set-Location E:\WorkMemo
git diff --cached --check
git diff --cached --stat
git commit -m "release: publish WorkMemo v0.2.9"
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
# 远端无新提交或已安全整合后：
git push origin HEAD:main
git tag v0.2.9 HEAD
git push origin refs/tags/v0.2.9
git rev-parse HEAD
git ls-remote origin refs/heads/main refs/tags/v0.2.9
git status --short
```

公开回执另行提交与推送，不改变构建标签。本阶段交付完成后不自动增加新功能。
