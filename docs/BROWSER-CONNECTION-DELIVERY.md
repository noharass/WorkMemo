# 浏览器连接全面修复交付（alpha.4）

目标：覆盖 EXE、ZIP、源码运行与目录迁移；灵动岛继续搁置。统一 Rust 注册逻辑、启动自动修复、连接诊断、扩展已知主机回退。数据可靠性、原有计时、历史和四皮肤功能继续保留。

## 已执行检查

- Node 31/31、Rust 78/78；包含数据库可靠性、单活动任务、5/7 分钟和离页规则、真实 native helper 进程、实际本机 TCP 长连接、扩展断开/超时/旧回调及主机回退。
- npm.cmd run build 和 npm.cmd run bridge:dev 成功；源码配套文件实际生成并通过版本/profile 探测。
- scripts/test-browser-registration.ps1 在隔离注册命名空间与中文、空格、&、! 目录验证正式/预览两配置：NSIS 安装、CMD 接管、ZIP 路径变化、旧卸载保护、所属卸载；真实 Chrome 主机值前后相同，没有打开真实工作数据库。
- Clippy 未运行成功：当前工具链未安装 cargo-clippy，不将其列为通过。
- Windows release EXE/ZIP 构建、资产摘要与发布结果待下方补记；当前记录不代表成品已发布。

## 兼容性与限制

SQLite schema 仍为 3，预览应用标识仍 com.workmemo.test.monitor，工作 URL、历史、待补全、计时与外观路径不变；没有新增云服务、站点全量权限或记录输入内容。正式数据 com.workmemo.desktop 与预览数据独立。默认源码 dev 使用正式目录，请用 preview config 隔离实际工作。

清单改存 LOCALAPPDATA 下，helper 绝对路径由 serde JSON 编码；EXE 安装、程序启动、CMD/PS1、源码准备使用相同实现。版本/profile 不一致不更新注册。所有操作仅当前用户。卸载仅清理仍属于本目录的注册，不删除工作数据。只移动主 EXE 或只换 CMD 不能补齐缺失组件，需完整更新。

用户此前已确认真实 Chrome 自动开始与离页两分钟暂停。本轮其他电脑的实际连接、锁屏/休眠、整段空闲提醒焦点及四皮肤原生透明未重新验收。没有为验收结束/删除用户任务或更改其真实主机注册。历史 alpha.3/R2 资产保留，不覆盖原标签。

## 文件清单

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\browser-extension\background.js |
| UPDATE | E:\WorkMemo\browser-extension\manifest.json |
| UPDATE | E:\WorkMemo\browser-extension\popup.js |
| UPDATE | E:\WorkMemo\docs\BROWSER-BRIDGE.md |
| UPDATE | E:\WorkMemo\docs\BROWSER-REGISTRATION-FIX.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| UPDATE | E:\WorkMemo\docs\PREVIEW-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\PREVIEW-INSTALLER-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md |
| UPDATE | E:\WorkMemo\package-lock.json |
| UPDATE | E:\WorkMemo\package.json |
| UPDATE | E:\WorkMemo\scripts\package-preview-installer.ps1 |
| UPDATE | E:\WorkMemo\scripts\package-preview.ps1 |
| UPDATE | E:\WorkMemo\scripts\package-windows.ps1 |
| UPDATE | E:\WorkMemo\scripts\prepare-browser-bridge.ps1 |
| UPDATE | E:\WorkMemo\scripts\register-preview-browser.cmd |
| UPDATE | E:\WorkMemo\scripts\register-preview-browser.ps1 |
| UPDATE | E:\WorkMemo\scripts\test-browser-registration.ps1 |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.lock |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.toml |
| UPDATE | E:\WorkMemo\src-tauri\build.rs |
| UPDATE | E:\WorkMemo\src-tauri\installer\browser-bridge.nsh |
| UPDATE | E:\WorkMemo\src-tauri\src\bin\workmemo-browser.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\browser_bridge.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\lib.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\service.rs |
| UPDATE | E:\WorkMemo\src-tauri\tauri.conf.json |
| UPDATE | E:\WorkMemo\src\MonitoringSettings.tsx |
| UPDATE | E:\WorkMemo\tests\browser-runtime.test.mjs |
| NEW FILE | E:\WorkMemo\scripts\browser-registration-test.nsi |
| NEW FILE | E:\WorkMemo\scripts\browser-resource-files.json |
| NEW FILE | E:\WorkMemo\scripts\stage-browser-resources.mjs |
| NEW FILE | E:\WorkMemo\src-tauri\src\connection.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\registration.rs |
| NEW FILE | E:\WorkMemo\src-tauri\tests\browser_registration.rs |
| REMOVE | E:\WorkMemo\src-tauri\installer\com.workmemo.browser_bridge_test.json（旧重复清单源） |
| NEW FILE | E:\WorkMemo\docs\BROWSER-CONNECTION-DELIVERY.md |
| NEW FILE | E:\WorkMemo\docs\BROWSER-CONNECTION-SOURCE.md |

完整代码在各原文件及 BROWSER-CONNECTION-SOURCE.md；下列命令可复现检查与打包。暂停的 DYNAMIC-ISLAND-PLAN.md 不混入本轮提交。

## PowerShell 与预期

~~~powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
cargo test --locked --offline --manifest-path src-tauri/Cargo.toml
cargo fmt --check --manifest-path src-tauri/Cargo.toml
& .\scripts\test-browser-registration.ps1
& .\scripts\package-preview.ps1
$taskZip = 'E:\WorkMemo\artifacts\0.2.0-alpha.4\WorkMemo_0.2.0-alpha.4_windows_x64_preview.zip'
& .\scripts\package-preview-installer.ps1 -PortableZip $taskZip -ExpectedSha256 (Get-FileHash -LiteralPath $taskZip -Algorithm SHA256).Hash
~~~

预期：测试全部通过；测试注册仅写 GUID 命名空间；EXE/ZIP 都含 helper、profile、extension、CMD/PS1；启动时可修复当前目录注册，监测设置显示真实诊断。Chrome 授权需用户按工作 URL 操作。

## Git 同步

~~~powershell
git diff --check
git diff --cached --stat
git diff --cached --name-only
git commit -m "fix: unify browser connection setup across distributions"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short
~~~

产物只保存在 artifacts，源码提交不包含依赖、二进制、真实数据库或凭据。发布使用新 alpha.4 预发布标签，稳定 latest 保留 v0.1.1。
