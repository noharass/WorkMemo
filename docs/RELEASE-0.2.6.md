# WorkMemo v0.2.6 Windows 成品与发布记录

日期：2026-11-01（Asia/Shanghai）。用户明确要求「传release」，授权从第一阶段源码进入 Windows 成品打包及公开发布。功能源码基线为 214d05b62b4fa411d6c75aad3c65059396cf0a16；旧阶段中的等待确认记录保留，本次授权完成发行收尾。

## 目标与状态

本地正式构建、自动检查和成品核对完成。公开发布完成后补充服务端及匿名下载回执。版本 0.2.6；中文 NSIS 安装器、完整 ZIP、第三方许可和 SHA256 共四项资产。

构建标签保留构建时记录，最终公开下载回执另行提交至 [main 分支的本记录](https://github.com/noharass/WorkMemo/blob/main/docs/RELEASE-0.2.6.md)，不移动已发布构建标签。

发布入口：[WorkMemo v0.2.6](https://github.com/noharass/WorkMemo/releases/tag/v0.2.6)。本地成品目录：`E:\WorkMemo\artifacts\0.2.6`。

## 本版变化

- 结束后继续监测，新的可信工作页操作产生下一次候选；灵动岛优先展示识别类别及开工入口，确认后才计时。旧待补全记录不阻挡下一项。
- 主窗口默认显示真实监测状态，点击新建后打开手动表单；取消、刷新、候选到达及命令失败保留本次运行中的草稿。当前任务继续保留，切换仍需先暂停并确认。
- 岛顶部显示当前任务或新候选，编辑旧结算固定原记录与输入，新开工不覆盖旧草稿；旧记录仍从待补全处理。
- 设置保存直接使用返回结果，修正保存回调和全局事件造成的重复重建；保存中阻止重复提交与离开，失败保留输入，成功只执行一次目标操作。慢速保存禁用输入后在 React 提交完成后恢复原输入焦点。

详细实现、完整代码及缺陷复现保留在 [第一阶段记录](UPDATE-0.2.6-PHASE-1.md)、[完整源码](UPDATE-0.2.6-PHASE-1-SOURCE.md)。本次只提升应用、helper 与扩展版本并更新交付文档，没有新增依赖、功能或权限。

## 实际检查及兼容限制

- Node 51 项通过；Rust 146 库测试、2 helper、2 原生主机、1 注册集成，共 151 项通过；Cargo 格式检查、TypeScript/Vite 生产构建通过。
- package-windows.ps1 实际执行 npm ci、许可收集、Windows x64 release 编译、中文 NSIS 及完整 ZIP；旧版本目录和下载保持。依赖版本、扩展固定 key 和权限、Tauri 除版本外的配置及 SQLite schema 9 均与功能基线一致。
- 本次生产资源 verify-v026 的 9 组、verify-v025 的 10 组／24 布局、连续补填 4 组和网页完整隔离回归通过。未读取或修改真实任务。上一阶段的开发资源、顶部、名称及多网址回归记录继续保留，不把历史结果说成本轮重新执行。
- 安装器解包后与 ZIP 的主程序、helper、profile、扩展和注册修复脚本逐项字节一致；ZIP 15 文件的完整名单、CRC 及与源码／构建输出的字节核对通过。ProductVersion／FileVersion 均为 0.2.6，成品 helper --bridge-info 返回正式标识、protocol 1、version 0.2.6、test_overrides=false。
- 原生 GUI 限制延续：上阶段独立标识程序启动和可访问性读取成功，但截图及重试超时，点击缺少坐标信息。本轮未重复原生窗口输入，也未运行安装器或正式主程序。Windows 原生闪动、透明、裁剪区域点击、焦点、多屏 DPI、实际登录自启和完整安装卸载未全部实测，不宣称 GIF 闪动已在所有硬件上消失。
- 目标 Windows 10／11 x64 与 WebView2；未签名。Vite 现有图表块约 1510.41kB（gzip 490.25kB）的超 500kB 提示保留；构建显式跳过二进制补丁以保持安装器和 ZIP 主程序字节一致。

## 成品摘要

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.6_x64-setup.exe | 3604476 | `7a5bc34412458c9a079818e5cfd9e3a206e6d312ff76258a76653fd64ee8c28b` |
| WorkMemo_0.2.6_windows_x64.zip | 4861337 | `5d7f55f0510eddd4a7960a830381878c32f79742b3a41bb2769a1d220c5f60d6` |
| THIRD-PARTY-LICENSES.txt | 2568244 | `b560b767b993a7fc0e5d0422802d06195a7d588aeeed0e080caee90fe3b68965` |
| SHA256SUMS.txt | 286 | `508bca62e89f0dfdc10c992cdf86e273b6963506d91d282f71ecb334e5a03f03` |

主 EXE SHA256：`1718ff1e876d6e5d073c92f1ea570b1255ad6a4dc791b50944a0c0d089693cf3`。本地核对回执：`E:\WorkMemo\artifacts\0.2.6\qa\PACKAGE-VERIFICATION.json`。

## 文件、完整源码与测试方法

全部 UPDATE／NEW FILE 完整路径见 [RELEASE-0.2.6-FILES.md](RELEASE-0.2.6-FILES.md)；本次版本及说明全文见 [RELEASE-0.2.6-SOURCE.md](RELEASE-0.2.6-SOURCE.md)。功能程序全文保存在第一阶段 SOURCE；完整项目由构建标签源码归档提供，不以省略号代替代码。

```powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.2.6\SHA256SUMS.txt
Get-FileHash .\artifacts\0.2.6\WorkMemo_0.2.6_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.2.6\WorkMemo_0.2.6_windows_x64.zip -Algorithm SHA256
```

预期 Node 51、Rust 151 全部通过，构建生成四项资产，按 SHA256SUMS 校验一致。重建可能因时间和压缩元数据改变摘要，不声称二进制完全可复现。

独立终端运行 `npm.cmd run preview -- --host 127.0.0.1 --port 1422 --strictPort` 后：

```powershell
$env:WORKMEMO_PLAYWRIGHT = 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL = 'http://127.0.0.1:1422/'
$env:WORKMEMO_WEB_URL = 'http://127.0.0.1:1422'
node scripts/verify-v026.mjs
node scripts/verify-v025.mjs
node scripts/verify-v025-followup.mjs
node scripts/verify-web-ui.mjs
```

其他电脑替换 Playwright 实际路径。预期新增 9 组、旧桌面 10 组／24 布局及连续补填 4 组成功，网页回归成功；均使用隔离 IPC／HTTP，不能替代原生透明或系统 DPI 验收。

升级前备份、从托盘正常退出旧版，无需结束当前任务；完整安装或解压后重新加载 0.2.6 扩展并同步工作站点授权。重启仍处理未结束任务，不补计停机时间。没有内置自动更新，默认当前用户自启与已关闭选择保持。

## Git 和公开发布

仅暂存本版路径，排除 artifacts、target、依赖、真实数据库、凭据和原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md；沿用仓库本地身份，不改全局配置。构建提交和 v0.2.6 标签推送后核对标识；创建草稿、上传四资产并核对服务端 SHA256 后公开为正式 Latest，再匿名重新下载并复算。发布回执另行提交，构建标签不移动，不覆盖旧资产。

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "release: package WorkMemo v0.2.6 for Windows"
git push origin main
git tag v0.2.6
git push origin refs/tags/v0.2.6
git rev-parse HEAD
git rev-parse v0.2.6
git ls-remote origin refs/heads/main refs/tags/v0.2.6
git status --short --branch
```

认证仅通过既有 Git 凭据助手在内存获取，不写文件或远程 URL。发布完成后总结交付，不自动进入新版本。
