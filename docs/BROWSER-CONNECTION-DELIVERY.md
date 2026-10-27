# 浏览器连接全面修复交付（alpha.4）

目标：覆盖 EXE、ZIP、源码运行与目录迁移；灵动岛继续搁置。统一 Rust 注册逻辑、启动自动修复、连接诊断、扩展已知主机回退。数据可靠性、原有计时、历史和四皮肤功能继续保留。

## 已执行检查

- Node 31/31、Rust 78/78；包含数据库可靠性、单活动任务、5/7 分钟和离页规则、真实 native helper 进程、实际本机 TCP 长连接、扩展断开/超时/旧回调及主机回退。
- npm.cmd run build 和 npm.cmd run bridge:dev 成功；源码配套文件实际生成并通过版本/profile 探测。
- scripts/test-browser-registration.ps1 在隔离注册命名空间与中文、空格、&、! 目录验证正式/预览两配置：NSIS 安装、CMD 接管、ZIP 路径变化、旧卸载保护、所属卸载；真实 Chrome 主机值前后相同，没有打开真实工作数据库。
- Clippy 未运行成功：当前工具链未安装 cargo-clippy，不将其列为通过。
- 预览 release ZIP 和 NSIS EXE 已构建成功；ZIP 15 项精确清单、CRC、原始应用/组件字节、标识及摘要通过；7-Zip 解包验证安装器内主程序、helper、profile、扩展和修复脚本与 ZIP 一致。
- 默认源码配置的 Windows release/NSIS 构建也实际成功，beforeBundleCommand 实际执行；解包核对全部配套资源、com.workmemo.desktop 标识与 app 字节。该正式标识构建仅用于封装检查，未安装、未启动、未发布。标准稳定版 ZIP 脚本已补齐资源，其稳定版本号保护使本轮未执行整套稳定版脚本；本轮实际发布 ZIP 为独立预览配置。
- Windows PowerShell 5 备用脚本被本机默认执行策略阻止，未将它列为通过，也未修改执行策略；启动自动修复和已经通过隔离验证的 CMD 入口均不依赖 PowerShell。

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


## 已发布成品与同步结果

Release：[WorkMemo v0.2.0-alpha.4](https://github.com/noharass/WorkMemo/releases/tag/v0.2.0-alpha.4)，ID 425142958；非草稿、预发布，稳定 Latest 仍为 v0.1.1。全部 9 个资产上传大小/摘要核对通过，并使用无认证下载再次核对。旧 Release 标签和原资产未覆盖。

构建/打包源码提交：a3e5aaaf3874b72287507d4ae49d01e0a2e5dbe0，已推送并核对 origin/main；alpha.4 标签指向该源码。后续文档提交记录实际发布结果。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| [INSTALLER-GUIDE.md](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.4/INSTALLER-GUIDE.md) | 2371 | 4aa3384515bf3b639545a03f27cc33969aeb6a3859bca364471ac9c254c9b38e |
| [PREVIEW-GUIDE.md](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.4/PREVIEW-GUIDE.md) | 3138 | 6adbc9604d9b11587948b96659b052cb37d2729985901c7c49d7410b51fc392c |
| [Register-Browser.cmd](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.4/Register-Browser.cmd) | 518 | f5d0c6a7c7b24542e3caa1b41cc67ca3bcf18e085c58278e317da17ca2064acd |
| [REGISTRATION-FIX-GUIDE.md](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.4/REGISTRATION-FIX-GUIDE.md) | 3594 | 548849ad4cae00751671678c35f0bb4e0c54a5a3931562abee504d9955d36085 |
| [REGISTRATION-FIX-SHA256SUMS.txt](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.4/REGISTRATION-FIX-SHA256SUMS.txt) | 296 | 70600023e15aa77e0cbc2e8f9fc5597d0a50a9694b69f1126cf0d3587963b148 |
| [SHA256SUMS.txt](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.4/SHA256SUMS.txt) | 290 | 6c8ae05ff88b1253cec051b5d12b388b9d913d1371a1e4c159166bf217763f97 |
| [THIRD-PARTY-LICENSES.txt](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.4/THIRD-PARTY-LICENSES.txt) | 2235369 | 209d8cf282922bd772bb7901c77bf97dd3934cc98556050bae41c33dcd027786 |
| [WorkMemo_0.2.0-alpha.4_windows_x64_preview.zip](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.4/WorkMemo_0.2.0-alpha.4_windows_x64_preview.zip) | 3482207 | de7e717df892aa01ea5ab1f48c12c4da129b5d114f7e2a5d096f73ffdf98b32b |
| [WorkMemo_0.2.0-alpha.4_x64-preview-setup-r1.exe](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.4/WorkMemo_0.2.0-alpha.4_x64-preview-setup-r1.exe) | 2472721 | 31639c5f64757f1d25b894993ea2430f36fc935e035367a1045850cfa11c4816 |

本地完整成品：E:\WorkMemo\artifacts\0.2.0-alpha.4\WorkMemo_0.2.0-alpha.4_windows_x64_preview.zip；E:\WorkMemo\artifacts\0.2.0-alpha.4\installer-r1\WorkMemo_0.2.0-alpha.4_x64-preview-setup-r1.exe。发布回执在忽略目录 E:\WorkMemo\artifacts\0.2.0-alpha.4\RELEASE-RECEIPT.json。

源码与交付提交不包含仍暂停的灵动岛草稿。工作区若仅显示 docs/DYNAMIC-ISLAND-PLAN.md，表示该草稿被有意保留，不能声称工作区完全干净。
