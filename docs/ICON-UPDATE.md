# 原始 C 图标更新 · WorkMemo 0.1.1

## 目标与选择

用户最终选择最初黑白方案 C，其余候选与后续 C 衍生方案不采用。保留原始圆环与完成标记，不重绘符号。原始 PNG 实际为透明背景的白色标记，使用黑色圆角底板让浅色桌面也能清楚显示。此轮只更新品牌素材、标题栏/页面图标、原生程序/安装器图标及版本号，保留现有计时、数据库、权限和应用标识。

原图完整保存于 E:\WorkMemo\src\assets\workmemo-icon.png，1254×1254，SHA256 b6371d18743a8e80885ac656ec60727340069282fcf44c74bb3ff8aeed8f33bf。与用户选定的 E:\WorkMemo\artifacts\icon-options\C-time.png 字节一致。其余候选保留在被忽略的本地产物目录，不进入应用或 Git。

## 实现与完整文件

- NEW FILE E:\WorkMemo\src\assets\workmemo-icon.png：原始 C 主素材。
- NEW FILE E:\WorkMemo\scripts\prepare-icon.mjs：使用已有 Tauri CLI 转换，黑色底板在原图后方，临时嵌入式 SVG 和额外平台输出位于被忽略的 target。
- NEW FILE E:\WorkMemo\public\workmemo.png：256px 标题栏及页面图标。
- UPDATE E:\WorkMemo\src-tauri\icons：已有原生 PNG、ICO、ICNS 全部替换为同一方案。
- UPDATE E:\WorkMemo\src\DesktopWindow.tsx、E:\WorkMemo\src\App.css、E:\WorkMemo\index.html：标题栏使用图像并禁用拖图；保留现有窗口拖动处理。
- DELETE E:\WorkMemo\public\workmemo.svg：移除旧的绿色 w. 素材。
- UPDATE package.json、package-lock.json、Cargo.toml、Cargo.lock、tauri.conf.json：统一 0.1.1，仅更新根项目版本，锁定依赖版本保持不变。

完整绝对路径及 NEW FILE / UPDATE / DELETE 清单见 ICON-UPDATE-FILES.md；完整变更文本源码见 ICON-UPDATE-SOURCE.md。二进制素材完整保存在清单所列路径，不用文本近似替代。

## 生成来源与复现

原始 C 使用 imagegen 技能的内置图像生成工具生成，工具模式为 built-in image_gen；最终采用当时的原图，本轮没有再生成新方案。最终原始提示词如下：

```text
Use case: logo-brand. Create ONE polished, commercially credible logo used as a Windows productivity app icon for WorkMemo. Single large icon, square composition, true transparency only outside a centered black rounded-square tile. White emblem centered inside, about 60% of tile width. STRICTLY BLACK AND WHITE. Flat vector-style brand design with precise geometry, bold silhouette, optically balanced negative space and excellent legibility at 24–32px. Premium Swiss / contemporary corporate identity sensibility. No gradients, no shadows, no bevel, no 3D, no shine, no textures, no mockup, no background scene, no decorative frame, no watermark, no caption or app name. This is graphic design, not a rendered physical object. Direction C: a refined abstract time-recording mark. A bold almost-complete white circular ring with one deliberate gap, integrated with a single crisp angular hand/tick so the whole silhouette is an elegant proprietary symbol. Minimal two-form construction, asymmetry balanced by negative space. No numbers, no many small clock ticks, no stopwatch buttons, no letters, no notebook.
```

本轮资产编译使用 npm run icons：PNG 原图在圆角黑色底板上合成，由已有 Tauri CLI 输出各平台格式。没有增加 npm/Rust 依赖。

## 实际检查

- 原图 SHA256 与选定 C 一致；128px 成品已打开目检，圆环、完成标记与黑白配色清楚。
- 32px PNG 尺寸正确，角落 alpha=0，黑色底板采样 alpha=255、RGB=0，透明外缘与黑色背景分离。
- Node 内置测试 22/22 通过；Rust 测试 37/37 通过，包含事务、恢复、暂停计时、删除保护、统计与外观配置。
- TypeScript/Vite 正式前端构建通过，Rust 格式检查通过。
- Windows release、中文 NSIS 安装器及免安装 ZIP 构建通过；打包脚本完成，依赖许可共 253 个锁定包版本，许可文本与 0.1.0 相同。
- 本机静默升级退出码 0，卸载注册信息版本为 0.1.1；安装后的程序与 release 原程序、ZIP 中程序 SHA256 一致，安装许可与源码汇编一致。ZIP 恰含程序、使用说明、许可 3 项，没有业务数据或个人配置。
- 已通过桌面工具实际启动 C:\Users\Administrator\AppData\Local\WorkMemo\workmemo.exe；唯一正式版窗口可访问，原生页面包含 WorkMemo、准备开始、开始工作、外观与历史入口。进程正常响应。
- 更新前后以只读连接核对完整记录内容摘要一致，SQLite integrity_check=ok；外观配置 SHA256 一致，没有创建、结束或删除真实任务。
- 图标素材的目检已执行；正式版窗口截图首次返回 FrameArrived timed out，刷新窗口后重试收到物理 Escape 停止信号，随后停止桌面操作。因此本轮不声称完成原生窗口截图目检；此前透明/窗口控制交互的用户验收保留在历史阶段记录中。

## 本地交付

| 文件（E:\WorkMemo\artifacts\0.1.1） | 字节数 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.1.1_x64-setup.exe | 2,281,708 | c30f86c670eed900803ef75ea8b5ffa83815ba3322feccb54c5023fa23f93839 |
| WorkMemo_0.1.1_windows_x64.zip | 3,067,512 | d8c8ee4dbccd260d0ccdb46c37aa7daeecb8f5cb3ea59ac9c64091b1978fff0e |
| THIRD-PARTY-LICENSES.txt | 2,235,369 | 209d8cf282922bd772bb7901c77bf97dd3934cc98556050bae41c33dcd027786 |
| SHA256SUMS.txt | 286 | af095604c98cd17e3492c2625717e5a74172400b538e2747b1382dcddbd4fab9 |

程序本体 6,196,224 字节，SHA256 56b7c2beb526c9f26dda00504e01ab3d44e10e64405af2a4e673bc0c7541e074。安装版、ZIP 和 release 原程序三者一致。正式版已经打开，交付文件保存在上述本地目录。

## PowerShell 命令

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd ci
npm.cmd run icons
npm.cmd test
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
npm.cmd run build
& .\scripts\package-windows.ps1
Get-Content .\artifacts\0.1.1\SHA256SUMS.txt
Get-FileHash .\artifacts\0.1.1\WorkMemo_0.1.1_x64-setup.exe
```

预期：同一原图生成所有图标；22 项 Node 测试及 37 项 Rust 测试成功；构建生成当前版本安装包、ZIP、许可和校验文件。需要先保存关闭 WorkMemo 再打包。完整工具依赖见 BUILDING.md。普通用户只需已安装 WebView2 或由安装器补齐，无需开发环境。

## 兼容性与分发

目标为 Windows 10 / 11 x64，本机为 Windows 10 22H2 x64；新机器、Windows 11、不同 DPI/多显示器未在本轮实测。程序仍未签名。图标变更不构成对其他兼容性项目的重新验收。

0.1.1 成品保存在 E:\WorkMemo\artifacts\0.1.1；不提交 Git。用户随后明确要求更新下载页，已公开发布 [WorkMemo v0.1.1](https://github.com/noharass/WorkMemo/releases/tag/v0.1.1) 并设为最新版，既有 v0.1.0 保留。源码推送按既有授权执行。

## 公开发布检查（2026-10-26）

tag v0.1.1 指向构建源码提交 c52733d7b7050822ef303dc4f6b6a6fc1a80a87f。通过既有 GitHub 凭据在内存中授权，先建草稿、上传并核对 4 个资产的大小与摘要，再公开发布。凭据没有写入文件或 URL；本地 RELEASE-RECEIPT.json 仅含公开发布元数据，位于被忽略的 artifacts 目录。

公开 API 确认非草稿、非预发布，releases/latest 返回 v0.1.1；远程 tag 与构建源码提交一致。另以无认证方式实际下载安装器、ZIP、第三方许可和校验文件，逐项 SHA256 与本地交付表一致。README 的 3 个下载入口及文件名已更新，完整源码汇编中的 README 同步更新。本次只修改文档并发布此前已检查的成品，没有重新构建或更改业务代码。

本次 UPDATE 路径：E:\WorkMemo\README.md、E:\WorkMemo\docs\ICON-UPDATE.md、E:\WorkMemo\docs\ICON-UPDATE-SOURCE.md；完整文件清单仍见 ICON-UPDATE-FILES.md。兼容性与原生截图验收限制沿用上文，不因发布成功而扩充。

以下为不需要凭据的下载复核方法，预期文件哈希与上表及 SHA256SUMS.txt 一致：

```powershell
Set-Location 'E:\WorkMemo'
Invoke-RestMethod 'https://api.github.com/repos/noharass/WorkMemo/releases/latest' | Select-Object tag_name, html_url
[void](New-Item -ItemType Directory -Path '.\artifacts\0.1.1\download-check' -Force)
Invoke-WebRequest 'https://github.com/noharass/WorkMemo/releases/download/v0.1.1/WorkMemo_0.1.1_x64-setup.exe' -OutFile '.\artifacts\0.1.1\download-check\WorkMemo_0.1.1_x64-setup.exe'
Get-FileHash '.\artifacts\0.1.1\download-check\WorkMemo_0.1.1_x64-setup.exe'
git ls-remote origin refs/tags/v0.1.1
```

下载文档同步使用以下命令；先核对远程和暂存内容，随后检查本地与远程提交标识相同、工作区干净：

```powershell
git fetch origin main
git add README.md docs/ICON-UPDATE.md docs/ICON-UPDATE-SOURCE.md
git diff --cached --check
git commit -m "docs: publish v0.1.1 download links and release verification"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

## Git 命令与同步

```powershell
git fetch origin main
git diff --check
git add README.md docs/BUILDING.md docs/USER-GUIDE.md docs/ICON-UPDATE.md docs/ICON-UPDATE-FILES.md docs/ICON-UPDATE-SOURCE.md index.html package.json package-lock.json public/workmemo.png public/workmemo.svg scripts/prepare-icon.mjs src/assets/workmemo-icon.png src/DesktopWindow.tsx src/App.css src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json src-tauri/icons
git diff --cached --check
git commit -m "feat: apply selected monochrome C app icon"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

暂存区需排除依赖、构建产物、真实记录及个人配置。推送前检查远程无冲突，推送后比较本地和远程提交并检查工作区。同步完成情况以实际工具结果为准。
