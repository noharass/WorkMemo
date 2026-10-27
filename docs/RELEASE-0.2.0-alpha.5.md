# WorkMemo v0.2.0-alpha.5 预览发布

日期：2026-10-27（Asia/Shanghai）。用户要求发布包含状态岛首阶段与计时参数的新版本。构建源码提交 e6b26ceb7aa8460ca9f66a9cd452ae2150969333；[预发布 Release](https://github.com/noharass/WorkMemo/releases/tag/v0.2.0-alpha.5)，稳定 Latest 仍为 v0.1.1。

## 下载

- [Windows x64 中文 EXE 安装版](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.5/WorkMemo_0.2.0-alpha.5_x64-preview-setup-r1.exe)，2,485,063 字节，SHA256 `25ee99cee0f64b826a4cb14cfb75df1c02f417f6987f3426d6c402141081bad8`。
- [Windows x64 免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.5/WorkMemo_0.2.0-alpha.5_windows_x64_preview.zip)，3,497,894 字节，SHA256 `5e075a8a533bab3c27c125656d3fbb2b8b536ed975aa33b5a6336b218077e8ea`。
- [安装说明](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.5/INSTALLER-GUIDE.md)、[ZIP 使用说明](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.5/PREVIEW-GUIDE.md)、[全部 SHA256](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.5/ALL-SHA256SUMS.txt)、[第三方许可](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.5/THIRD-PARTY-LICENSES.txt)。

本地文件为 E:\WorkMemo\artifacts\0.2.0-alpha.5\installer-r1\WorkMemo_0.2.0-alpha.5_x64-preview-setup-r1.exe 和 E:\WorkMemo\artifacts\0.2.0-alpha.5\WorkMemo_0.2.0-alpha.5_windows_x64_preview.zip；产物不提交 Git。

## 功能与兼容性

状态岛首阶段显示后端活动任务、计时、状态和可信离页倒计时，允许拖动和托盘切换，沿用现有提醒结算。监测设置新增四个时间参数，默认离页 120 秒暂停、保留 600 秒、空闲 300 秒提醒和 420 秒结束；保存监测设置会暂停当前自动记录，重新确认工作页面并有新输入后恢复。连接不可信时不累计未知时间。

更新前从托盘正常退出旧预览版，备份整个 `%LOCALAPPDATA%\com.workmemo.test.monitor`，安装或完整解压新版并重新加载配套 Chrome 扩展。预览数据升级到 SQLite schema 4，旧版可能无法打开升级后的数据；正式版数据独立。软件未签名。

## 实际检查

- Node 测试 31 项、Rust 测试 82 项通过；Rust 格式检查通过。打包时 TypeScript/Vite 构建与 Tauri release 构建通过。
- ZIP 的 15 项条目及 CRC、程序字节、扩展版本、应用标识和源码提交核对通过；NSIS 实际生成并用 7-Zip 解包，14 个共享文件与 ZIP 逐字节一致。安装器未执行实际安装。
- 六个 Release 资产上传大小与 SHA256 核对通过，发布后以未认证方式逐个下载并复算一致。旧版本资产未覆盖；Release 为预发布。
- 状态岛 Windows 原生透明、焦点、多显示器、实际浏览器关闭端到端场景尚未验收；开始/恢复一次性提示和完整展开操作尚未实现。上轮隔离 GUI 检查被物理 Escape 中断，不将其记为通过。

## 构建与验证命令

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --offline --manifest-path .\src-tauri\Cargo.toml
& .\scripts\package-preview.ps1
$taskZip = 'E:\WorkMemo\artifacts\0.2.0-alpha.5\WorkMemo_0.2.0-alpha.5_windows_x64_preview.zip'
& .\scripts\package-preview-installer.ps1 -PortableZip $taskZip -ExpectedSha256 (Get-FileHash -LiteralPath $taskZip -Algorithm SHA256).Hash
Get-Content .\artifacts\0.2.0-alpha.5\ALL-SHA256SUMS.txt
```

预期下载文件散列与校验清单一致；备份后升级，打开监测设置修改参数并保存，确认页面有新输入后继续。仅在隔离记录上检查离页停表、空闲先到和待补全，不为验收结束或删除用户真实任务。完整文件路径及变更文本见 RELEASE-0.2.0-alpha.5-SOURCE.md；历史草稿 DYNAMIC-ISLAND-PLAN.md 继续保留。

```powershell
git diff --cached --check
git diff --cached --name-status
git commit -m "docs: record alpha.5 preview release"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```
