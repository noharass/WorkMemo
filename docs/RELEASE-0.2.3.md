# WorkMemo v0.2.3 正式版交付与发布记录

日期：2026-10-29（Asia/Shanghai）。用户明确指示「发版吧」，授权第 3 阶段成品构建及公开 GitHub Release。功能基线为 bfc2b7f12aba3e48468a600ad9d16c2d2e0b9545；前两阶段与趋势修正记录保留。

## 目标与结果

统一应用、Cargo、Tauri、Chrome 扩展版本为 0.2.3，更新中文说明、构建中文 NSIS 安装器和完整免安装 ZIP，提供第三方许可、SHA256、完整源码清单及公开下载。

当前成品构建、包内容和校验检查完成；本轮继续执行上传及公开下载复核，完成后将实际结果写回本页。v0.2.3 标签应指向最终构建源码，后续发布回执文档独立提交，不移动构建标签。

- [Windows x64 安装版](https://github.com/noharass/WorkMemo/releases/download/v0.2.3/WorkMemo_0.2.3_x64-setup.exe)
- [完整免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.2.3/WorkMemo_0.2.3_windows_x64.zip)
- [SHA256SUMS](https://github.com/noharass/WorkMemo/releases/download/v0.2.3/SHA256SUMS.txt)
- [第三方许可](https://github.com/noharass/WorkMemo/releases/download/v0.2.3/THIRD-PARTY-LICENSES.txt)
- [完整源码 ZIP（按构建标签）](https://github.com/noharass/WorkMemo/archive/refs/tags/v0.2.3.zip)

新增功能的具体实现与测试边界见 [第 1 阶段](UPDATE-0.2.3-PHASE-1.md)、[第 2 阶段](UPDATE-0.2.3-PHASE-2.md)及[趋势修正](FIX-0.2.3-TREND-HEADER.md)。这次只统一发行版本、更新扩展升级提示并完成交付，不扩大功能范围，不应用平行讨论中的图标候选。

## 本轮实际检查

- 最终 0.2.3 源码：Node 49 项，Rust 139 项库测试及 2＋2＋1 项其余测试（合计 144），全部通过；cargo fmt、TypeScript 和 Vite 生产构建通过。
- 四组浏览器回归通过：verify-v023-phase2、verify-v023-phase1、verify-ui-022 --dashboard-only、verify-multi-url。使用隔离 HTTP／IPC 数据，无真实数据库；覆盖七种宽度、缩放、分类名称、周期、补填与编辑失败保护、过滤、十项试听参数及静音保存。
- package-windows.ps1 完成 npm ci（锁定依赖）、278 项依赖版本与音效许可收集、内嵌前端 release 构建、浏览器组件版本与正式标识核对、中文 NSIS、ZIP 与校验文件。
- 主 EXE 的 ProductVersion 与 FileVersion 均为 0.2.3，ProductName 为 WorkMemo。安装器通过 7-Zip 解包，只读比较主 EXE 和浏览器资源；与 ZIP／构建输出字节一致。
- ZIP 共 15 个文件，CRC、完整文件名单、主 EXE、说明、许可、helper、profile、注册脚本与八个扩展资源逐项通过。扩展 version／version_name 均为 0.2.3，固定 key 与权限保留；helper 返回正式标识 com.workmemo.desktop、protocol 1、version 0.2.3、test_overrides=false。
- 首次 ZIP 核对发现使用说明少了一次换行格式整理，已仅重新封装该说明并重算校验；随后所有包内容重新逐字节通过。安装器与主程序未因此改变。
- Vite 仍提示约 618 kB 的图表分块超 500 kB；这是体积提示，构建通过，未为本次发行新增依赖或改动图表拆包。
- 保留原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md；未结束、删除或生成用户真实任务，未读取或替换真实工作数据库，也未执行安装或替换 Downloads 中旧程序。

前两阶段的独立 Windows 启动、schema 9 空库接口、十条 WinMM 播放检查不冒充本轮成品 GUI 验收。原生设置窗口点击及截图曾受自动化工具限制；原生透明／多屏 DPI／焦点、完整安装卸载、长时间真实键鼠空闲和听感仍未全部实机覆盖。发布不改变这些验收状态。

## 成品与摘要

目录：E:\WorkMemo\artifacts\0.2.3。成品、QA 回执、解包副本及数据库均不提交 Git。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| SHA256SUMS.txt | 286 | `5f62e46a83571b1b3283d4a930c44a9970c265992b752e0a7e22d1707cd70559` |
| THIRD-PARTY-LICENSES.txt | 2414467 | `c433ebd157ee3b51aca04c8e70e3bce72c9d7a85cacc3138db9e1236a075a55d` |
| WorkMemo_0.2.3_windows_x64.zip | 4359910 | `f74e1f20c04e2b57f876e46102c3a250e313b34dce83d0dd78dd3bb48697c744` |
| WorkMemo_0.2.3_x64-setup.exe | 3314056 | `a6734b2fdac07749b86dc686fe32c1a3619a23a9a7f7ee118bae814c13970f18` |

主程序 SHA256：`b457cc9e96d885321ea9fac568a52558272e4c3748ed60695d0d4ca2e7d04af3`。本地包检查回执：E:\WorkMemo\artifacts\0.2.3\qa\PACKAGE-VERIFICATION.json。

## 完整路径、源码与文件关系

[RELEASE-0.2.3-FILES.md](RELEASE-0.2.3-FILES.md) 列明本轮 NEW FILE／UPDATE、成品和全部已跟踪源码清单；[RELEASE-0.2.3-SOURCE.md](RELEASE-0.2.3-SOURCE.md) 保存本轮修改的完整文本，不以省略号替代代码。完整仓库代码和原始二进制音源在 GitHub 标签源码归档中；历史阶段的完整源码快照继续保留。

package 与 Cargo 锁文件只更新本项目版本，依赖版本不变；Tauri 标识和数据位置不变。Chrome 继续使用相同固定扩展标识。README、使用说明和 BUILDING 对应当前发行，PHASE-8 保留历史并追加发布进度。

## PowerShell 命令与预期

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.3\SHA256SUMS.txt
Get-FileHash .\artifacts\0.2.3\WorkMemo_0.2.3_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.2.3\WorkMemo_0.2.3_windows_x64.zip -Algorithm SHA256
```

预期 49 项 Node 与 144 项 Rust 通过，生产构建及 NSIS 完成，产生四项交付文件；新构建的压缩时间等可能影响摘要，不应假定独立重建与本次已发布二进制可复现到相同字节。

浏览器检查在独立终端运行 npm.cmd run dev -- --host 127.0.0.1，再使用本机 Playwright 路径执行以下命令；结束后只关闭该测试服务器。

```powershell
$env:WORKMEMO_PLAYWRIGHT='C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
node scripts/verify-v023-phase2.mjs
node scripts/verify-v023-phase1.mjs
node scripts/verify-ui-022.mjs --dashboard-only
node scripts/verify-multi-url.mjs
```

预期输出全部通过，测试仅用隔离数据。不要对实际任务模拟空闲、补填、删除或恢复。

## 发布与 Git 核对

使用仓库既有凭据管理器，只在发布进程内存读取认证。先上传 draft 并比对资产大小与摘要，再公开设置 Latest；随后不带认证头下载四项普通公开 URL 并复算 SHA256。不写入或输出令牌，不提交 QA 发布脚本或回执。

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "release: prepare WorkMemo v0.2.3 Windows delivery"
git push origin main
git tag v0.2.3
git push origin refs/tags/v0.2.3
git rev-parse HEAD
git ls-remote origin refs/heads/main refs/tags/v0.2.3
git status --short --branch
```

发布后另行提交本页回执及完整源码记录，比较本地与 origin/main 提交；无需移动已发布的 v0.2.3 标签。

## 兼容性与使用

Windows 10／11 x64，需要 WebView2，普通用户无需 Node.js／Rust；安装器为当前用户中文 NSIS，程序未签名。本版 SQLite schema 9，升级保留记录 ID、有效区间、修正历史、索引、网址归属；回退旧版须用升级前备份。升级请自行从托盘正常退出旧版，完整安装／解压，随后在 Chrome 重新加载 0.2.3 扩展并同步授权。安装版与 ZIP 沿用正式数据路径，不同时运行多份程序。
