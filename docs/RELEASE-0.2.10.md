# WorkMemo v0.2.10 发布回执

2026-11-12（北京时间）按用户要求公开 [v0.2.10](https://github.com/noharass/WorkMemo/releases/tag/v0.2.10)，Release ID 442923799，非草稿、非预发布，公开 Latest 已核对。构建提交和标签为 `ee76bba664c9361927dcf3ad25116effdb8e209e`。

本版包含北京时间每天零点结束跨日暂停、挂起和待恢复任务，保留已记录工时；网页新增人工补记录，支持工作量、起止时间、休息扣除和备注，重试不会重复新增。数据库升级至 schema 12，升级前须备份，旧版无法直接读取新数据库；回退应恢复升级前备份。Windows x64 安装包未签名，需 WebView2，更新后重新加载配套 Chrome 扩展。

实际执行：前端 59 项、Rust 181 项测试通过，Tauri Windows x64 release、NSIS 安装器与 ZIP 构建通过，扩展与浏览器主机版本检查通过。ZIP 内 15 个文件，主程序哈希与构建输出一致；主程序版本 0.2.10。四项资产的服务器摘要和公开下载后本地复算均一致。此前网页补录 5 组隔离场景和现有网页回归结果见 [WEB-MANUAL-ENTRY.md](WEB-MANUAL-ENTRY.md)。本轮未启动正式应用，也未验收原生透明窗口、真实扩展交互和安装卸载流程。

| 资产 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.10_x64-setup.exe | 3819981 | `a6c4fb3e4658ab3f31d2a290ae63fa69f9915079fa13d0aae8108eb4eb30879c` |
| WorkMemo_0.2.10_windows_x64.zip | 5121800 | `8fe7e09fbb28b19c43525c9c26a1469cbbf4831f5ebb30c6135a34bc1c5e4be1` |
| THIRD-PARTY-LICENSES.txt | 2570495 | `998efb4d5965b2fd8fe366b023a3b45855adc91dafabda9d20d195a6b8107b2c` |
| SHA256SUMS.txt | 288 | `ead67cd2b692a5418aadd41a77977138f444909d49fce1b4eda9c0e4618baa3b` |

本地成品目录 `E:\WorkMemo\artifacts\0.2.10`，构建日志 `E:\WorkMemo\artifacts\release-0210-build.log`，测试日志 `E:\WorkMemo\artifacts\release-0210-node.log` 与 `E:\WorkMemo\artifacts\release-0210-rust.log`。更新文件为 `E:\WorkMemo\package.json`、`package-lock.json`、`src-tauri\Cargo.toml`、`src-tauri\Cargo.lock`、`src-tauri\tauri.conf.json`、`browser-extension\manifest.json`、`README.md` 和 `docs\USER-GUIDE.md`；完整代码保存在对应文件。工作区原有未跟踪的 `docs\DYNAMIC-ISLAND-PLAN.md` 未纳入提交。

PowerShell 复查：`npm.cmd test`、`cargo test --locked --manifest-path src-tauri/Cargo.toml`、`& .\scripts\package-windows.ps1`、`Get-Content .\artifacts\0.2.10\SHA256SUMS.txt`。预期测试和构建成功，下载后按 SHA256SUMS 核对；实际窗口和扩展验收请使用隔离测试数据。Git 同步使用 `git fetch origin main`、`git push origin HEAD:main`，再比较 `git rev-parse HEAD` 与 `git ls-remote origin refs/heads/main`，不强推。
