# WorkMemo v0.2.4 Windows 成品与发布记录

日期：2026-10-29（Asia/Shanghai）。用户明确确认「打包并发布新版成品」，授权将网页优化与顶部导航精简一起构建、上传并公开。功能基线为 `6586da88d4f0d9a0817427a4c31d9d446da56871`；保留已有阶段与未跟踪规划。

## 目标与状态

版本统一为 0.2.4，提供中文 NSIS 安装器、完整免安装 ZIP、完整第三方许可及 SHA256。旧版 Release 与本机程序不覆盖、不删除，数据格式保持 schema 9。

本地正式构建、包内文件与摘要核对已完成，GitHub Release 已公开为 Latest。四项资产的服务端大小及 SHA256 一致，匿名重新下载后摘要再次全部一致。本地目录：`E:\WorkMemo\artifacts\0.2.4`。

发布入口：[WorkMemo v0.2.4](https://github.com/noharass/WorkMemo/releases/tag/v0.2.4)。完整功能变化见[网页优化](WEB-UI-UPDATE.md)与[顶部空间规划](TITLEBAR-UPDATE.md)，其中「尚未发行」是对应源码阶段的历史状态，本次确认已授权进入成品发布。

## 公开发布回执

- Release ID：`427613324`；服务端发布时间：2026-10-29 16:27:46（Asia/Shanghai）。`draft=false`、`prerelease=false`，匿名 Latest 查询返回 v0.2.4。
- 构建源码与轻量标签 `v0.2.4`：`3796547f8e582120e41cafb913caf9cec8dc1914`；推送后已与远程 main、标签比较一致。发布后文档回执另行提交，构建标签保持在该提交。
- [中文 x64 安装器](https://github.com/noharass/WorkMemo/releases/download/v0.2.4/WorkMemo_0.2.4_x64-setup.exe)、[完整 x64 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.2.4/WorkMemo_0.2.4_windows_x64.zip)、[第三方许可](https://github.com/noharass/WorkMemo/releases/download/v0.2.4/THIRD-PARTY-LICENSES.txt)、[SHA256 校验表](https://github.com/noharass/WorkMemo/releases/download/v0.2.4/SHA256SUMS.txt) 已全部公开；四项公开下载地址均实际匿名读取并核对字节数与 SHA256。
- 本地详细回执：`E:\WorkMemo\artifacts\0.2.4\qa\RELEASE-RECEIPT.json`；匿名下载副本：`E:\WorkMemo\artifacts\0.2.4\qa\public-downloads`。这些内容不加入 Git。

## 本版内容

- 网页标准控件统一 Ant Design，完善筛选、报表、表格、分页和状态反馈。
- 工作详情改为官方底部 Drawer，提供进出动画、逐层背景锁定、未保存保护和减少动态效果。
- 保存与轮询保留已有结果，修复背景闪动；写入成功但读取失败时明确提示，不猜测修订号，不把成功写入误报为失败。
- 主窗口左上角只保留设置，顶部预留拖动区并限制工作量胶囊宽度，保留当天详情、最小化和关闭到后台。
- 延续空闲暂停、四类改名、自然周期报表、音效、网址规则及四皮肤；不修改 Rust 业务、权限或数据库结构。

## 实际检查

- Node 49 项通过；Rust 139 项库测试、2 项 helper 单元、2 项原生主机、1 项注册集成，合计 144 项通过；Cargo 格式检查通过。
- 生产构建通过。网页 JS 分块约 1527.64kB（gzip 497.11kB），构建仍报告大块资源提示；不隐藏告警，完整组件库保留在网页懒加载入口。
- 新版生产资源在匹配本机服务 CSP 的隔离浏览器回归通过：保存过程 147 帧保持内容与滚动位置，官方进出动画 130 帧保持锁定；涵盖 0／科学计数、异常输入、保存失败／冲突、写后读取失败、去重、旧查询竞态、周期筛选、分页、删除、首读与授权错误。
- 390～1920px 六档宽度、短屏、125%／150% CSS 缩放、减少动态效果通过。22 组顶部布局及命令检查通过；桌面四皮肤状态岛、布局、工作名称与多 URL 现有隔离回归通过。
- `package-windows.ps1` 实际完成 npm ci、337 个包版本的许可收集、Tauri release 编译、helper／扩展资源核对、中文 NSIS 与 ZIP。
- 主 EXE ProductVersion／FileVersion 为 0.2.4，ProductName 为 WorkMemo。安装器用 7-Zip 只读解包，主程序、helper、profile、注册脚本及扩展与 ZIP／构建资源逐字节一致。
- ZIP 共 15 个文件，CRC、文件名单、使用说明和许可均与源码／构建输出一致。扩展 version／version_name 为 0.2.4；固定 key、权限及站点授权范围保持。
- 实际执行成品 helper 的 `--bridge-info`，返回正式标识 `com.workmemo.desktop`、protocol 1、version 0.2.4、`test_overrides=false`。未执行注册、安装或卸载。
- 所有业务浏览器测试为隔离 HTTP／IPC 夹具，没有读取或更改真实工作数据库，没有结束、删除或暂停真实任务。

本轮未重新覆盖原生透明、多屏 DPI、实际窗口拖动／焦点、完整安装卸载及长时间真实输入监测。模拟 IPC、静态生产资源与 helper 检查不能替代这些原生验收；程序仍未签名。这些限制随 Release 一并说明。

## 成品摘要

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.4_x64-setup.exe | 3570647 | `1f357b82185cf184c37af9f0a85ead4579c94c077091a321eece5fcf9285061c` |
| WorkMemo_0.2.4_windows_x64.zip | 4813445 | `7762a3e189536f69ceef5b69c0e333f009d7e8b9ff7c58a9237d6492bd4dcd5f` |
| THIRD-PARTY-LICENSES.txt | 2503305 | `7cdb863108a870177bc9b3beaf927dcbf2d8d0c0ef4e523b7697b0412628845a` |
| SHA256SUMS.txt | 286 | `a79f5e7f08c7b67369a3df4231abd6c93bec8b908074e617180dcbe84c31fe7e` |

主程序 SHA256：`e12ab4c4f8120d918ed04012bf4bc683838dfa50c1f5ce108c71f854a2641f71`。本地包回执为 `E:\WorkMemo\artifacts\0.2.4\qa\PACKAGE-VERIFICATION.json`；网页和标题栏回执位于同目录。构建产物、解包副本、发布脚本和认证信息不提交 Git。

## 文件与完整源码

[RELEASE-0.2.4-FILES.md](RELEASE-0.2.4-FILES.md) 提供全部 NEW FILE／UPDATE 完整路径及已跟踪源码清单；[RELEASE-0.2.4-SOURCE.md](RELEASE-0.2.4-SOURCE.md) 保存本轮程序与版本文件的完整文本。此前功能修改的完整代码仍在各阶段源码记录中，整个仓库由构建标签的 GitHub 源码归档提供。

本轮只同步版本、发行说明和资源：Node／Cargo 锁文件不升级依赖，正式应用标识、数据路径和 Chrome 扩展固定标识不变。旧发布、阶段记录及用户已有规划保留。

## PowerShell 复核

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.4\SHA256SUMS.txt
Get-FileHash .\artifacts\0.2.4\WorkMemo_0.2.4_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.2.4\WorkMemo_0.2.4_windows_x64.zip -Algorithm SHA256
```

预期测试、正式构建和 NSIS 成功，生成四项文件。独立重建的时间与压缩元数据可能改变摘要，不能假定二进制可复现到相同字节。

独立终端启动 `npm.cmd run dev -- --host 127.0.0.1` 和 `npm.cmd run preview -- --host 127.0.0.1 --port 1422`，然后：

```powershell
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_WEB_URL = 'http://127.0.0.1:1422'
npm.cmd run test:web
Remove-Item Env:WORKMEMO_WEB_URL
node scripts/verify-titlebar.mjs
node scripts/verify-ui-022.mjs --desktop-only
node scripts/verify-v023-phase1.mjs
node scripts/verify-multi-url.mjs
```

其他电脑使用其本机 Playwright 安装位置。测试应成功退出，错误列表为空；所有业务接口拦截在隔离浏览器中，不需要启动正式计时程序。

## Git 与发布流程

仅暂存本次清单内的源码和文档，检查暂存区后提交构建源码，再推送 main 和新标签。不提交依赖、产物、数据库、凭据或原有未跟踪规划；不改写旧标签，不强制推送。

```powershell
git diff --cached --check
git diff --cached --name-status
git commit -m "release: prepare WorkMemo v0.2.4 Windows delivery"
git fetch origin
git rev-list --left-right --count HEAD...origin/main
git push origin main
git tag v0.2.4
git push origin refs/tags/v0.2.4
git rev-parse HEAD
git ls-remote origin refs/heads/main refs/tags/v0.2.4
git status --short
```

公开回执补齐后，另行执行以下命令同步文档；不移动构建标签：

```powershell
git add -- docs/RELEASE-0.2.4.md docs/PHASE-8.md
git diff --cached --check
git commit -m "docs: record verified v0.2.4 public release"
git push origin main
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
git ls-remote origin refs/heads/main refs/tags/v0.2.4
git status --short
```

发布使用已有 Git 凭据管理器，认证仅在发布进程内存中读取，不写入文件、URL 或日志。先创建草稿，上传四项资产并比较服务端大小及 SHA256，再公开为 Latest，最后匿名重新下载四项并复算摘要。重试按本轮回执 ID 续传，不替换不明来源草稿或旧版资产。

## 兼容与升级

Windows 10／11 x64，WebView2；安装器为当前用户中文 NSIS，普通用户不需要 Node.js、Rust 或 SQLite 服务。升级前自行创建备份并从托盘退出旧程序，完整安装或解压新版，在 Chrome 重新加载 0.2.4 扩展并同步授权。安装版和 ZIP 共用正式数据位置，SQLite schema 9 不变。旧版与旧预览下载继续保留。
