# 从 GitHub 源码运行和构建

下面针对 Windows x64。普通用户使用已构建成品见 USER-GUIDE.md，不需要安装整套开发工具。

## 需要安装什么

| 工具 | 本项目要求 | 用途 |
| --- | --- | --- |
| Git | 使用 git clone 时需要；下载源码 ZIP 可省略 | 拉取仓库 |
| Node.js + npm | Node 24 x64，npm 随 Node 安装 | 前端依赖、构建及内置测试 |
| Rust + Cargo | rustup 安装 stable，默认 host 为 x86_64-pc-windows-msvc | Tauri/Rust 编译 |
| Visual Studio 2022 Build Tools | 勾选“使用 C++ 的桌面开发”，包含 MSVC x64 与 Windows SDK | Windows 原生编译和链接 |
| Microsoft Edge WebView2 Runtime | 已安装可复用；没有则安装 Evergreen Runtime | 桌面界面运行 |

无需单独安装 React、TypeScript、Vite、Tauri CLI，它们由 npm ci 安装到项目；Rust crates 在首次编译时按 Cargo.lock 下载。SQLite 使用 bundled 模式编入程序，不需要数据库服务器或独立 SQLite 安装。Python 不属于本项目构建依赖。

官方安装说明：https://v2.tauri.app/start/prerequisites/
Node：https://nodejs.org/
Rust：https://rustup.rs/
C++ Build Tools：https://visualstudio.microsoft.com/visual-cpp-build-tools/
WebView2：https://developer.microsoft.com/microsoft-edge/webview2/

安装后重新打开 PowerShell，确认 node、npm、rustc、cargo、git 可用。不要为运行脚本更改系统安全设置；如果 PowerShell 阻止 npm.ps1，可直接使用 npm.cmd。

## 拉取并启动

```powershell
git clone https://github.com/noharass/WorkMemo.git
Set-Location WorkMemo
npm.cmd ci
npm.cmd run tauri dev
```

第一次需要联网下载 npm 和 Cargo 依赖，耗时取决于网络及机器。npm run dev 仅为浏览器预览，没有本地任务保存能力；使用桌面命令 tauri dev。

## 测试与前端构建

```powershell
npm.cmd run build
npm.cmd test
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
npm.cmd run build
```

## 正式交付包

自动记录开发版本增加一个独立的 workmemo-browser 原生通信程序；Cargo 默认运行目标仍为 workmemo。Chrome 接入、独立应用标识的验收构建与当前限制见 BROWSER-BRIDGE.md 和 AUTO-TRACKING-PHASE-2.md。普通源码构建会使用正式数据目录；独立验收程序应按说明单独构建和复制。

当前源码版本 0.2.0-alpha.3，自动记录预览包请运行 scripts/package-preview.ps1。脚本执行许可证收集、Tauri release/no-bundle 构建，使用 src-tauri/tauri.preview.conf.json 将标识设为 com.workmemo.test.monitor，输出 artifacts/0.2.0-alpha.3 下的免安装 ZIP、说明、许可和校验文件。ZIP 包含主程序、原生通信主机、扩展及可在解压目录运行的注册脚本，不包含工作数据库、运行时端点或凭据。此脚本不会启动程序或注册主机。使用步骤见 PREVIEW-GUIDE.md；实际发布结果另见 RELEASE-0.2.0-alpha.3.md。

~~~powershell
Set-Location 'E:\WorkMemo'
& .\scripts\package-preview.ps1
~~~

用户要求补充的 EXE 安装器使用已经公开且校验一致的预览 ZIP 字节，不重新编译业务程序：

~~~powershell
& .\scripts\package-preview-installer.ps1 -PortableZip .\artifacts\0.2.0-alpha.3\WorkMemo_0.2.0-alpha.3_windows_x64_preview.zip -ExpectedSha256 15a6dd85dca26eb589fd7a2675f9d4cd21c67b3cbf5a2fb19563b7baa6f527a3
~~~

当前打包脚本默认生成 R2，输出到 artifacts/0.2.0-alpha.3/installer-r2。NSIS 当前用户安装器使用 WorkMemo Preview 名称及 workmemo-preview.exe 进程，包含主机与扩展，沿用独立测试数据，并自动注册 HKCU 的 Chrome 本机主机。主机清单是相对 EXE 路径的固定资源，安装后写注册，卸载成功后只清除所属目录的注册。成品字节核对、隔离安装/卸载测试及公开下载复算见 BROWSER-REGISTRATION-DELIVERY.md。

~~~powershell
& .\scripts\test-browser-registration.ps1
~~~

测试只使用 artifacts 内的随机目录与 HKCU\Software\WorkMemo\RegistrationTests 隔离键；真实 Chrome 注册前后须相同。R2 另包含不依赖 PowerShell 的 Register-Browser.cmd。客户机不需要运行源码测试或修改执行策略；接入步骤见 BROWSER-REGISTRATION-FIX.md。

下面正式安装器打包记录对应已发布的稳定版源码；预览阶段使用上面的独立数据打包入口。

先保存关闭全部 WorkMemo 窗口，然后在 Windows PowerShell 中执行：

```powershell
& .\scripts\package-windows.ps1
```

脚本会执行 npm ci、Tauri release/NSIS 构建，收集本地依赖包附带的许可文本，生成免安装 ZIP 和 SHA256SUMS.txt。输出到 artifacts/版本号，产物不提交 Git。相同版本重建会覆盖该目录中的同名交付文件。

如当前脚本执行策略阻止本地脚本，不需要修改策略；可分别执行以下构建命令生成官方安装器和原始程序：

```powershell
npm.cmd ci
npm.cmd run tauri -- build --ci --no-binary-patching
```

原始程序：src-tauri/target/release/workmemo.exe。
中文安装器：src-tauri/target/release/bundle/nsis/WorkMemo_0.1.1_x64-setup.exe。

安装器使用 NSIS，缺 WebView2 时联网下载官方 bootstrapper；不构建 MSI，不要求启用额外的 VBSCRIPT 功能。首次打包需要下载 NSIS 构建工具。安装模式为 currentUser，应用标识保持 com.workmemo.desktop。

本项目未启用自动更新插件。打包时使用 --no-binary-patching，保留安装版与免安装版相同的程序字节，便于核对 SHA256；不写入仅自动更新分发需要的 bundle 类型标记。依赖许可文本不变时不重复改写，避免无意义的重新编译。

版本在 package.json、package-lock.json、src-tauri/Cargo.toml、src-tauri/Cargo.lock、src-tauri/tauri.conf.json 中保持一致。用户选定的原始 C 图标为 src/assets/workmemo-icon.png；需要重新生成图标时执行 npm.cmd run icons。脚本保持原图标记，在后方添加黑色圆角底板，使用现有 Tauri CLI 生成原生尺寸及 public/workmemo.png；没有新增构建依赖。临时画布和额外平台产物保留在被忽略的 target 目录。完整源码与阶段记录保存在 docs 中。


## alpha.4 统一浏览器组件

npm.cmd run tauri -- dev 会先构建 helper，再用 scripts/stage-browser-resources.mjs 准备 target/debug 的配套文件；preview config 自动使用预览标识。bundle 前同一脚本校验版本/标识并准备 target/browser-resources，标准 NSIS 与标准 ZIP 也包含完整组件。scripts/browser-resource-files.json 是扩展文件清单。

~~~powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
cargo test --locked --offline --manifest-path src-tauri/Cargo.toml
& .\scripts\test-browser-registration.ps1
& .\scripts\package-preview.ps1
$taskZip = 'E:\WorkMemo\artifacts\0.2.0-alpha.4\WorkMemo_0.2.0-alpha.4_windows_x64_preview.zip'
& .\scripts\package-preview-installer.ps1 -PortableZip $taskZip -ExpectedSha256 (Get-FileHash -LiteralPath $taskZip -Algorithm SHA256).Hash
~~~

注册测试只接受支持隔离开关的 debug helper，在 Software\WorkMemo\RegistrationTests\GUID 及 artifacts 测试目录运行，不修改真实 Chrome 主机或工作数据库。release helper 忽略这些测试环境变量。预览安装器消费校验过的 ZIP，禁止混入不同版本二进制。标准 package-windows.ps1 仍只接受稳定版本号，避免把预览配置当稳定版发布。


## alpha.5 状态岛与计时参数预览

当前源码版本 0.2.0-alpha.5。仍使用上方预览构建命令，ZIP 路径更新为 `E:\WorkMemo\artifacts\0.2.0-alpha.5\WorkMemo_0.2.0-alpha.5_windows_x64_preview.zip`。安装器仍由校验后的同一 ZIP 构建；发布结果与未验收项目见 RELEASE-0.2.0-alpha.5.md。预览数据库升级到 schema 4，运行前正常退出并备份旧预览数据，旧版本可能无法打开升级后的数据库。
