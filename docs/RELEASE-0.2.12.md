# WorkMemo v0.2.12 发布记录

2026-11-16，用户明确要求“上传成0.2.12”。目标为新增正式 GitHub Release，保留 v0.2.11 及历史资产。最终公开回执将在发布并验证后追加，准备记录不代表已经公开。

## 更新与兼容性

包含提交 08dd58a 的三项修正：趋势/工作日历数据表显示小时分钟；详情、补填及共用 Modal 改为短距离过渡，取消详情卡片与遮罩的背景模糊；稳定日期对象，避免后台轮询重置浏览月份。完整修复实现见 WEB-FEEDBACK-FIX.md 及其完整源码清单。

应用、npm 锁文件、Rust、Tauri 与配套扩展统一 0.2.12，扩展 key、权限和数据库 schema 12 保持不变。Windows 10/11 x64，需要 WebView2，成品未签名；从 0.2.10/0.2.11 更新无需新增迁移，升级前备份，从托盘退出旧版，更新后重新加载配套扩展。ZIP 需要完整解压。

## 检查范围

Node 69项、Cargo格式检查、Rust库180项及helper2项已通过，doc-test为0项。默认 cargo test 因用户正在查看的 debug/workmemo.exe 被占用失败，因此改为 --lib、--bin workmemo-browser 和 --doc，不强制关闭用户预览；两个 integration 测试目标未在本轮重跑，不宣称完整 cargo test 通过。正式 release 编译在独立输出目录执行，不覆盖正在运行的 debug 预览。

修复阶段已通过生产网页完整回归、反馈专项6组、B阶段7组。本轮版本化之后的构建、成品核验和网页专项结果在末尾补充。真实 Narrator、Windows系统DPI、原生四皮肤逐项、扩展联动、安装卸载、登录场景和所有硬件上的动画体感尚未全部复验。用户正在查看的独立 0.2.11 预览保持运行，不冒称为 0.2.12 正式程序启动通过，不触碰正式工作数据库。

## 路径与完整源码

- UPDATE `E:\WorkMemo\package.json`、`E:\WorkMemo\package-lock.json`：npm版本。
- UPDATE `E:\WorkMemo\src-tauri\Cargo.toml`、`E:\WorkMemo\src-tauri\Cargo.lock`：Rust版本。
- UPDATE `E:\WorkMemo\src-tauri\tauri.conf.json`：Tauri版本。
- UPDATE `E:\WorkMemo\browser-extension\manifest.json`：扩展version/version_name。
- UPDATE `E:\WorkMemo\README.md`、`E:\WorkMemo\docs\USER-GUIDE.md`、`E:\WorkMemo\docs\BUILDING.md`、`E:\WorkMemo\docs\PHASE-8.md`：下载入口、更新说明与验收边界。
- NEW FILE `E:\WorkMemo\docs\RELEASE-0.2.12.md`：本发布记录。
- NEW FILE `E:\WorkMemo\docs\RELEASE-0.2.12-SOURCE.md`：以上配置/说明的完整源码与锁文件路径清单。完整锁文件保存在项目中，没有省略号替代代码。

本地成品目录 `E:\WorkMemo\artifacts\0.2.12`，四项资产为 `WorkMemo_0.2.12_x64-setup.exe`、`WorkMemo_0.2.12_windows_x64.zip`、`THIRD-PARTY-LICENSES.txt`、`SHA256SUMS.txt`。测试产物和发布证据不暂存，用户已有未跟踪 `docs/DYNAMIC-ISLAND-PLAN.md` 保留。

## PowerShell 命令与预期

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml --lib
cargo test --locked --manifest-path src-tauri/Cargo.toml --bin workmemo-browser
cargo test --locked --manifest-path src-tauri/Cargo.toml --doc
& .\scripts\package-windows.ps1
& .\scripts\verify-windows-candidate.ps1 -Directory artifacts/0.2.12 -PreserveDirectory artifacts/0.2.11
npm.cmd run preview -- --host 127.0.0.1 --port 4175 --strictPort
# 在另一个终端运行生产网页回归：
$env:WORKMEMO_PLAYWRIGHT='C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_WEB_URL='http://127.0.0.1:4175'
node scripts/verify-web-feedback.mjs
node scripts/verify-web-ui.mjs
```

预期：Node69、Rust180+2通过，x64主程序0.2.12，helper及扩展版本匹配，ZIP15条目逐文件一致，摘要一致且旧0.2.11本地资产保留。网页中11月切10月并停留5秒不跳回；详情、补填、补记录和减少动态焦点正常。实际结果仅按末尾回执判定。

```powershell
git -c http.proxy=http://127.0.0.1:7890 fetch origin main
git diff --check
git add -- package.json package-lock.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json browser-extension/manifest.json README.md docs/USER-GUIDE.md docs/BUILDING.md docs/PHASE-8.md docs/RELEASE-0.2.12.md docs/RELEASE-0.2.12-SOURCE.md
git diff --cached --check
git diff --cached --stat
git commit -m "release: prepare WorkMemo 0.2.12 web fixes"
git -c http.proxy=http://127.0.0.1:7890 push origin main
$buildCommit=git rev-parse HEAD
git tag v0.2.12 $buildCommit
git -c http.proxy=http://127.0.0.1:7890 push origin refs/tags/v0.2.12
python scripts/publish-release.py inspect --previous v0.2.11 --proxy http://127.0.0.1:7890
python scripts/publish-release.py prepare --commit $buildCommit --notes artifacts/0.2.12/RELEASE-NOTES.md --previous v0.2.11 --proxy http://127.0.0.1:7890
python scripts/publish-release.py publish --commit $buildCommit --previous v0.2.11 --proxy http://127.0.0.1:7890
python scripts/publish-release.py verify --previous v0.2.11 --proxy http://127.0.0.1:7890
git rev-parse HEAD
git -c http.proxy=http://127.0.0.1:7890 ls-remote origin refs/heads/main refs/tags/v0.2.12
git status --short --branch
```

代理为本机已有配置，仅用于单条命令，不修改全局配置；认证只经既有Git凭据助手在内存传给固定GitHub API主机，不写凭据到文件/URL，不强推、不移动旧标签。先上传草稿并核对服务器摘要，再公开为稳定Latest，最后无认证下载复算四项资产并核对旧发布不变。

## 本轮构建与网页复核结果

TypeScript/Vite生产构建、Tauri Windows x64 release、浏览器helper版本/profile校验、中文NSIS及完整ZIP打包通过。成品校验确认主程序0.2.12/x64、扩展version_name一致、ZIP15条目逐文件与构建源一致、全部SHA256有效；旧0.2.11本地资产保持一致。原有Dashboard大chunk警告仍存在。

0.2.12生产资源下反馈专项6组、完整网页回归全部通过，含11月切10月跨实际轮询、起止日期、补填/详情/补记录、减少动态、焦点与错误恢复、6档宽度和1.25/1.5 CSS缩放。逐帧130个样本验证短位移及背景锁定，未冒称FPS结论。未运行正式安装器或程序，不改变用户当前预览与任务。

| 资产 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.12_x64-setup.exe | 3835196 | 9b9944046356c775f04dbf4ea746564afb8f69f8826c76c67036271f3ce526ee |
| WorkMemo_0.2.12_windows_x64.zip | 5135964 | b5200f568ee0a7d4dd8b1659c748bc35bfac90467a470e636580d46d0ca55623 |
| THIRD-PARTY-LICENSES.txt | 2570495 | 998efb4d5965b2fd8fe366b023a3b45855adc91dafabda9d20d195a6b8107b2c |
| SHA256SUMS.txt | 288 | c6da10df6d4a8a944b779950be23c8eea9a0731de02cdc2b6d4fd0720bec4329 |

本地发布工具的旧版本检查已完成，Latest当前为v0.2.11，尚无v0.2.12 Release。公开发布及匿名下载核验将在最后追加回执。证据见 artifacts/0.2.12/package-verification.json、previous-release.json 和 artifacts/release-0212-{build,feedback,web}.log。
