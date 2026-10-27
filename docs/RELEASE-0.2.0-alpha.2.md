# v0.2.0-alpha.2 预发布交付

日期：2026-10-27（Asia/Shanghai）。用户明确要求将本次改造发布到 GitHub Release。

目标是提供第二阶段自动记录代码的可下载 Windows x64 预览包，不跨入第三阶段开发。真实 Chrome 接入、5/7 分钟等待、离页 2+10 分钟、锁屏/休眠、托盘、提醒焦点与四皮肤原生透明仍待实际验收。

## 文件与兼容性

UPDATE：E:\WorkMemo\package.json、package-lock.json、src-tauri\Cargo.toml、src-tauri\Cargo.lock、src-tauri\tauri.conf.json，统一应用版本为 0.2.0-alpha.2；E:\WorkMemo\docs\BUILDING.md 补充预览包入口。

NEW FILE：E:\WorkMemo\src-tauri\tauri.preview.conf.json、scripts\package-preview.ps1、scripts\register-preview-browser.ps1、docs\PREVIEW-GUIDE.md、本交付记录。完整文本源码随后另存 RELEASE-0.2.0-alpha.2-SOURCE.md，历史第二阶段源码汇编保持原样。

没有改动业务计时、数据库迁移、历史或换肤代码。预览包使用 com.workmemo.test.monitor，沿用本机独立验收数据标识；正式 com.workmemo.desktop 不变。使用独立窗口标题、release 优化的主程序和配套原生主机，不发布安装器，不覆盖 v0.1.1 Release。

注册脚本随 ZIP 分发，按解压目录生成绝对主机路径；仅在用户主动运行时注册 HKCU 的测试主机，不修改 Chrome 站点权限。PrepareOnly 仅生成本地清单，Unregister 仅移除仍归本目录所有的注册值。打包 ZIP 使用明确文件清单，不递归收集本地配置、工作数据库或 previous-registration 备份。

## 本轮检查

发布准备检查已实际完成：Node 测试 26 项、Rust 库测试 72 项、主机单元测试 2 项、主机子进程通信测试 2 项通过，共 102 个执行项（共享协议测试分别运行，不称为全部独立案例）；Rust 格式检查通过。版本号一致性与两个 PowerShell 脚本语法解析通过。构建、ZIP 校验、上传、公开下载复算和同步结果在实际完成后补充；本段不将计划写作通过。

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
