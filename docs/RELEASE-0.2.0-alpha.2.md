# v0.2.0-alpha.2 预发布交付

日期：2026-10-27（Asia/Shanghai）。用户明确要求将本次改造发布到 GitHub Release。

目标是提供第二阶段自动记录代码的可下载 Windows x64 预览包，不跨入第三阶段开发。真实 Chrome 接入、5/7 分钟等待、离页 2+10 分钟、锁屏/休眠、托盘、提醒焦点与四皮肤原生透明仍待实际验收。

用户随后要求的 [EXE 安装包](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/WorkMemo_0.2.0-alpha.2_x64-preview-setup.exe) 已补充到同一 Release；详见 [安装器交付与完整源码](RELEASE-0.2.0-alpha.2-INSTALLER.md)。下文保留最初 4 个资产的检查回执，原有资产字节未替换；目前另有安装器、安装说明、安装器校验文件，共 7 个公开资产。

## 文件与兼容性

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\package.json |
| UPDATE | E:\WorkMemo\package-lock.json |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.toml |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.lock |
| UPDATE | E:\WorkMemo\src-tauri\tauri.conf.json |
| NEW FILE | E:\WorkMemo\src-tauri\tauri.preview.conf.json |
| NEW FILE | E:\WorkMemo\scripts\package-preview.ps1 |
| NEW FILE | E:\WorkMemo\scripts\register-preview-browser.ps1 |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\BROWSER-BRIDGE.md |
| UPDATE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2.md |
| NEW FILE | E:\WorkMemo\docs\PREVIEW-GUIDE.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2-SOURCE.md |

应用版本统一为 0.2.0-alpha.2。完整变更文本代码见 [RELEASE-0.2.0-alpha.2-SOURCE.md](RELEASE-0.2.0-alpha.2-SOURCE.md)，原始代码保存在表中各文件；历史第二阶段源码汇编保持原样。

没有改动业务计时、数据库迁移、历史或换肤代码。预览包使用 com.workmemo.test.monitor，沿用本机独立验收数据标识；正式 com.workmemo.desktop 不变。使用独立窗口标题、release 优化的主程序和配套原生主机；首次发布 ZIP，后来按用户要求补充独立安装器，均不覆盖 v0.1.1 Release。

注册脚本随 ZIP 分发，按解压目录生成绝对主机路径；仅在用户主动运行时注册 HKCU 的测试主机，不修改 Chrome 站点权限。PrepareOnly 仅生成本地清单，Unregister 仅移除仍归本目录所有的注册值。打包 ZIP 使用明确文件清单，不递归收集本地配置、工作数据库或 previous-registration 备份。

## 本轮检查

- Node 测试 26 项、Rust 库测试 72 项、主机单元测试 2 项、主机子进程通信测试 2 项通过，共 102 个执行项（共享协议测试分别运行，不称为全部独立案例）；Rust 格式检查通过。
- 版本号一致性、两个 PowerShell 脚本语法解析通过；TypeScript/Vite 生产构建通过。
- 实际 Tauri Windows release/no-bundle 优化构建通过，用时 3 分 25 秒；主程序 PE 的 FileVersion、ProductVersion 均为 0.2.0-alpha.2，ProductName 为 WorkMemo Preview。实际构建日志中的 WORKMEMO_IDENTIFIER 为 com.workmemo.test.monitor。
- ZIP 恰好 14 个预期文件，CRC、主程序及主机与原始构建字节、独立 profile、测试主机名称、构建提交与全部本地 SHA256 校验通过；没有用户数据、注册备份、凭据或运行时端点文件。
- 从 ZIP 解压到带空格的新目录后，在当前 PowerShell 实际运行 PrepareOnly；生成的主机路径指向新目录，allowed_origins 只有固定扩展，注册表前后不变。
- Windows PowerShell 5.1 直接运行脚本被本机执行策略阻止，没有改写系统策略，也不称为该运行环境已通过。注册/撤销注册未在本轮额外改写用户环境；完整接入仍需用户按使用说明操作。
- GitHub draft 上传的 4 个资产大小及响应摘要与本地一致，随后公开为 prerelease。又从 4 个公开下载地址无认证实际下载，逐项复算大小和 SHA256 均一致；latest 稳定版 API 仍返回 v0.1.1。
- 远程 v0.2.0-alpha.2 标签与实际构建源码提交 556c85e9eeb9a99ec19e7dc205d03314250fa88a 相同；打包源码先提交推送，下载入口与本回执随后补充到 main。不强制推送。

## 下载与校验

[GitHub 预发布页](https://github.com/noharass/WorkMemo/releases/tag/v0.2.0-alpha.2) · [Windows x64 免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/WorkMemo_0.2.0-alpha.2_windows_x64_preview.zip)

本机交付目录 E:\WorkMemo\artifacts\0.2.0-alpha.2，4 个公开资产如下。公开回执与下载复算副本位于此目录，未提交产物。

| 文件 | 字节数 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.0-alpha.2_windows_x64_preview.zip | 3417580 | ec9e0fa7da07655eadf2515eac77ba406f686daf5fa6f7f68a34605e74e1dcc6 |
| PREVIEW-GUIDE.md | 3902 | 6a5b5e13d1b5e1e37499659548fc37da4b2f3e483c554d06f7811f70dda1211b |
| THIRD-PARTY-LICENSES.txt | 2235369 | 209d8cf282922bd772bb7901c77bf97dd3934cc98556050bae41c33dcd027786 |
| SHA256SUMS.txt | 290 | 16420a5183958306dae380358e537c0ff7db846d23eef607b7ed19fa27a89a25 |

## 重现命令与预期

~~~powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
cargo test --locked --offline --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
& .\scripts\package-preview.ps1
Get-Content .\artifacts\0.2.0-alpha.2\SHA256SUMS.txt
~~~

预期自动测试通过；构建为 release 配置，ZIP 同时包含主程序、通信主机、独立 profile、7 个扩展文件、注册脚本、使用说明、许可、构建信息。构建信息记录实际构建源码提交。打包过程不启动 GUI、不操作用户任务、不迁移正式数据库。

## Git 与发布

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "build: prepare isolated automatic tracking preview release"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

发布使用 GitHub Release API，先创建 draft、上传并核对明确的 4 个资产，再设为 prerelease=true、draft=false、make_latest=false。只使用已有 Git 凭据的进程内值，不把凭据写入文件、命令参数、URL 或回执。GitHub API 依据 https://docs.github.com/en/rest/releases/releases 和 https://docs.github.com/en/rest/releases/assets 。
