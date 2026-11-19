# WorkMemo v0.2.13 发布记录

本次 Windows x64 版本包含待办清单。从主窗口「待补全」旁或灵动岛展开区进入。待办可以多次发起计时，完成状态由用户手动更新。工作记录保留开工时的标题和工时。功能和隔离验收详见 [待办源码交付](TODO.md)。

应用与配套扩展统一为 0.2.13。适用于 Windows 10/11 x64，需要 Microsoft Edge WebView2。成品未签名。数据库由 schema 12 升级至 13，完整备份包含待办及其关联。升级前请备份并从托盘退出旧版。使用 ZIP 时请完整解压。如需回到 v0.2.12，请恢复升级前的备份。使用 Chrome 自动记录的用户更新后可重新加载配套扩展。

## Windows 构建

成品目录为 `E:\WorkMemo\artifacts\0.2.13`。GitHub Release 包含安装版、免安装 ZIP、第三方许可和校验文件。配置、锁文件和文档见 [源码清单](RELEASE-0.2.13-SOURCE.md)。

```powershell
Set-Location E:\WorkMemo
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
& .\scripts\package-windows.ps1
& .\scripts\verify-windows-candidate.ps1 -Directory artifacts/0.2.13 -PreserveDirectory artifacts/0.2.12
npm.cmd test
npm.cmd run preview -- --host 127.0.0.1 --port 1423 --strictPort
```

保持预览服务运行，在另一个终端执行下列检查。可通过 `WORKMEMO_PLAYWRIGHT` 指定已安装的 Playwright `index.mjs`。预期待办开工、取消开工、手动完成、键盘操作和灵动岛回归通过，网页数据中心可继续查询记录。

```powershell
$env:WORKMEMO_UI_URL='http://127.0.0.1:1423/'
$env:WORKMEMO_WEB_URL='http://127.0.0.1:1423'
node scripts/verify-todos.mjs
node scripts/verify-island-manual-expand.mjs
node scripts/verify-page-task-ui.mjs
node scripts/verify-web-ui.mjs
```

## GitHub 发布

```powershell
git diff --check
git add -- README.md browser-extension/manifest.json docs/BUILDING.md docs/USER-GUIDE.md docs/RELEASE-0.2.13.md docs/RELEASE-0.2.13-SOURCE.md package.json package-lock.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json
git diff --cached --check
git diff --cached --name-status
git commit -m "release: prepare WorkMemo 0.2.13"
$buildCommit = git rev-parse HEAD
git push origin main
git tag v0.2.13 $buildCommit
git push origin refs/tags/v0.2.13
python scripts/publish-release.py inspect --previous v0.2.12
python scripts/publish-release.py prepare --commit $buildCommit --notes artifacts/0.2.13/RELEASE-NOTES.md --previous v0.2.12
python scripts/publish-release.py publish --commit $buildCommit --previous v0.2.12
python scripts/publish-release.py verify --previous v0.2.12
git ls-remote origin refs/heads/main refs/tags/v0.2.13
git status --short --branch
```

使用既有凭据助手准备草稿，先核对 GitHub 资产摘要，再公开为正式 Latest。发布后匿名下载四项文件并复算 SHA256，同时复核上一版本的资产和标签。

## 复验结果

- 69 项 Node 测试、190 项 Rust 测试、Cargo 格式和 TypeScript/Vite 生产构建通过。
- 生产资源通过待办、灵动岛、页面任务与网页数据中心的自动回归。待办原生窗口、计时和四种皮肤的透明度已在 [源码阶段](TODO.md) 使用独立 Windows 配置验收。本轮采用成品文件核验。正式安装、卸载、Chrome 扩展实机联动及真实微软拼音候选窗未复验。
- Windows x64 正式编译、NSIS 安装器及 ZIP 打包通过。ZIP 的 15 个条目逐一对照构建文件，主程序、扩展版本及浏览器助手配置通过校验。

| 资产 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.13_x64-setup.exe | 3855182 | `319f4c435be03ae33cbfd6603634b1d9bc8ad604be93c5dc1ac61ded6d015c5f` |
| WorkMemo_0.2.13_windows_x64.zip | 5171610 | `e94a6427ef0c1c97554c7b7d91bdf5c750a38fa10aac3a86fc269f4aad028943` |
| THIRD-PARTY-LICENSES.txt | 2570495 | `998efb4d5965b2fd8fe366b023a3b45855adc91dafabda9d20d195a6b8107b2c` |
| SHA256SUMS.txt | 288 | `854a5e336606d675aa404bab517c9b8f09f8f2c3a15077f099a1ac40131246d4` |
