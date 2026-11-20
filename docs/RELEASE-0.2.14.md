# WorkMemo v0.2.14 发布记录

本版增加「今天要做」、待办累计工时和计时明细。再次开工预选上次类别，列表收紧，未完成重名项受到校验。旧同名待办显示各自编号，工时关联随原记录保留。[待办增强](TODO-DAILY-WORK.md) · [同名修复](TODO-DUPLICATES.md)

应用和配套 Chrome 扩展统一为 0.2.14。适用于 Windows 10/11 x64，需要 WebView2。成品未签名。数据库由 schema 13 升级到 14，完整备份包含今日安排、待办及计时关联。升级前请备份并从托盘退出旧版，回退到 v0.2.13 时请使用升级前备份。免安装 ZIP 请完整解压，使用 Chrome 自动记录的用户更新后可重新加载配套扩展。

## Windows 构建与验收

成品输出到 `E:\WorkMemo\artifacts\0.2.14`，包含安装版、免安装 ZIP、第三方许可和 SHA256 文件。[完整文件清单](RELEASE-0.2.14-SOURCE.md)

```powershell
Set-Location E:\WorkMemo
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
& .\scripts\package-windows.ps1
& .\scripts\verify-windows-candidate.ps1 -Directory artifacts/0.2.14 -PreserveDirectory artifacts/0.2.13
npm.cmd test
npm.cmd run preview -- --host 127.0.0.1 --port 1423 --strictPort
```

在另一个终端运行下列脚本。可通过 `WORKMEMO_PLAYWRIGHT` 指向已安装的 Playwright `index.mjs`。预期今日分组、重名提示、工时明细、再次开工预选和窄窗口检查通过，原有灵动岛、页面任务和网页数据查询继续可用。

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
git add -- README.md browser-extension/manifest.json docs/BUILDING.md docs/USER-GUIDE.md docs/RELEASE-0.2.14.md docs/RELEASE-0.2.14-SOURCE.md package.json package-lock.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json
git diff --cached --check
git diff --cached --name-status
git commit -m "release: prepare WorkMemo 0.2.14"
$buildCommit = git rev-parse HEAD
git push origin main
git tag v0.2.14 $buildCommit
git push origin refs/tags/v0.2.14
python scripts/publish-release.py inspect --previous v0.2.13
python scripts/publish-release.py prepare --commit $buildCommit --notes artifacts/0.2.14/RELEASE-NOTES.md --previous v0.2.13
python scripts/publish-release.py publish --commit $buildCommit --previous v0.2.13
python scripts/publish-release.py verify --previous v0.2.13
git ls-remote origin refs/heads/main refs/tags/v0.2.14
git status --short --branch
```

使用既有 Git 凭据助手上传草稿。服务端摘要通过后公开为正式 Latest，再匿名下载四项文件复算 SHA256，并复核上一版本的发布资产及标签。

## 实际验收

- 69 项 Node 测试、195 项 Rust 测试、Cargo 格式、TypeScript 和 Vite 生产构建通过。数据库测试覆盖跨天及重启、工时汇总、类别预选的数据来源和旧备份恢复。
- v0.2.14 生产资源通过待办、灵动岛、页面任务和网页数据中心的隔离自动回归。正式安装与卸载、Windows 原生界面和 Chrome 扩展实机联动未在本轮复验。
- Windows x64 正式编译及 NSIS、ZIP 构建通过。ZIP 15 个条目逐一与构建输出核对，主程序与扩展版本、浏览器助手配置和本地摘要核验通过。

| 资产 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.14_x64-setup.exe | 3865202 | `cdd730e31c9fc9515a0dce5d15f3aec37d6c912c20d65ed3895afcfb72513a18` |
| WorkMemo_0.2.14_windows_x64.zip | 5186305 | `f38b99f495aebebd7b72227856e3b1f1c61a2d1f821138553c14afbae5625636` |
| THIRD-PARTY-LICENSES.txt | 2570495 | `998efb4d5965b2fd8fe366b023a3b45855adc91dafabda9d20d195a6b8107b2c` |
| SHA256SUMS.txt | 288 | `f09c435b404b877aef2e8719d73f85d82003e1c5e0338c389cc3dcfa55731b7d` |
