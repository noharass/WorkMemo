# Chrome 本机主机注册修复交付

日期：2026-10-27（Asia/Shanghai）。用户确认其他用户使用 Google Chrome 且已安装完整 EXE，但扩展报 Specified native messaging host not found。灵动岛更新按用户要求暂缓，草稿保留，不混入本次修复。

## 原因、范围与兼容性

已检查实际打包脚本、NSIS 配置、注册脚本、扩展主机名及 Chrome 官方 Native Messaging 说明。原安装器只复制文件，需要另行运行 Register-Browser.ps1；首次安装遗漏注册或执行策略阻止脚本时，Chrome 找不到主机。本错误发生在连接软件之前，不能通过重复站点授权解决。

补充 alpha.3 R2 安装器，在当前用户安装成功后自动生成主机清单并注册 HKCU；另提供无需 PowerShell 的 Register-Browser.cmd 一键修复。主机名及固定扩展 origin 不变，不扩大站点权限。清单使用 Windows 支持的相对主机路径，避免中文目录写入 JSON 的编码问题。卸载只移除仍属于本目录的注册。

业务程序与主机复用已发布 alpha.3 ZIP 中的原始字节，应用版本仍为 0.2.0-alpha.3，R2 表示安装器打包修订。SQLite、计时、历史、外观与 UI 代码均不修改。原有 Release 资产与标签不覆盖；新增资产另用 R2 名称和单独校验文件。暂缓的灵动岛草稿不提交到本次修复。

## 文件与完整源码

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\.gitattributes |
| NEW FILE | E:\WorkMemo\scripts\register-preview-browser.cmd |
| NEW FILE | E:\WorkMemo\scripts\test-browser-registration.ps1 |
| NEW FILE | E:\WorkMemo\src-tauri\installer\browser-bridge.nsh |
| NEW FILE | E:\WorkMemo\src-tauri\installer\com.workmemo.browser_bridge_test.json |
| UPDATE | E:\WorkMemo\scripts\package-preview-installer.ps1 |
| NEW FILE | E:\WorkMemo\docs\BROWSER-REGISTRATION-FIX.md |
| NEW FILE | E:\WorkMemo\docs\BROWSER-REGISTRATION-DELIVERY.md |
| NEW FILE | E:\WorkMemo\docs\BROWSER-REGISTRATION-SOURCE.md |
| UPDATE | E:\WorkMemo\docs\PREVIEW-INSTALLER-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\BROWSER-BRIDGE.md |
| UPDATE | E:\WorkMemo\README.md |

完整代码另保存在 BROWSER-REGISTRATION-SOURCE.md，不使用省略号代替代码；构建使用各原始文件。

## 已实际执行的检查

- 隔离 NSIS 测试安装器在 artifacts 下的中文、空格、&、! 目录完成静默安装及卸载。注册只写随机的 HKCU\Software\WorkMemo\RegistrationTests 测试键，不修改真实 Chrome 主机键。
- 核对主机清单字段、固定 origin、相对 EXE 路径、注册表完整路径；所属目录卸载会清除注册，旧目录卸载不会删除模拟较新目录的注册。
- 核对 Tauri 实际卸载模板顺序后，将注册清理放到 POSTUNINSTALL；清单作为普通资源打包，取消运行中程序的卸载不会在检查前删掉注册或清单。
- CMD 的 prepare-only 模式实际验证缺少文件会失败、正确预览包可生成清单、混用源码扩展会失败，且真实 Chrome 主机注册前后保持不变。首次测试工具的 CMD 引号传参失败，改为 ProcessStartInfo 原始参数后重跑通过。
- CMD 使用 ASCII 内容和 CRLF 换行，Git 属性显式保留 Windows 换行，避免后续检出改变修复文件格式。
- 不依赖客户机 PowerShell 执行策略；测试工具使用 PowerShell 只是源码环境的检查方式。没有为测试修改系统策略、停止用户任务或操作真实工作数据库。

- R2 实际 NSIS 打包通过，7-Zip 完整性测试、解包与 17 项应用/资源字节核对通过；原始主程序及主机字节与 alpha.3 ZIP 一致，CMD 为 ASCII/CRLF。
- 安装包、修复 CMD、说明、校验文件共 4 个新资产上传成功；从正式公开地址无认证下载后逐项复算大小与 SHA256，全部一致。原 7 个资产字节不变，当前预发布共 11 个资产，latest 稳定版仍为 v0.1.1。
- 本次未修改业务代码，不将先前的 106 个测试执行项称为本轮重新执行。其他用户机器的真实 Chrome 重连需要用户反馈，不以隔离测试替代；没有在当前真实安装目录运行成品安装器或卸载器。

## 下载与校验

[R2 EXE 安装修复版](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.3/WorkMemo_0.2.0-alpha.3_x64-preview-setup-r2.exe) · [一键修复 CMD](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.3/Register-Browser.cmd) · [使用说明](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.3/REGISTRATION-FIX-GUIDE.md)

本机交付目录 E:\WorkMemo\artifacts\0.2.0-alpha.3\installer-r2；公开回执 RELEASE-RECEIPT.json 与下载复算副本 download-check 位于该忽略目录，不提交产物或私密配置。

| 文件 | 字节数 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.0-alpha.3_x64-preview-setup-r2.exe | 2441209 | b5e3b9cfc3811fc2af7ec28d6d51e78ba31c1e1c9eda9d455187efe984379c7d |
| Register-Browser.cmd | 2500 | c67408890124940fedd9cfb100a01b8aae0cc3b80967ff247e90cb52e01c2cc6 |
| REGISTRATION-FIX-GUIDE.md | 3025 | f9811efd308fd2f04103041e2d8ea05ddcbec3913334f618d7849e6ff614edc4 |
| REGISTRATION-FIX-SHA256SUMS.txt | 296 | 7ab31fd7560744aec0585bd7d31dc687956b529e9c9e80d8a8ba53587ebb0b16 |

原应用源码提交 fb615040ab95448cecb3236f67e08e44cee77e66，R2 打包源码 b52fae6；随后文档回执另行提交。原应用标签不移动。

## PowerShell 重现与预期

~~~powershell
Set-Location 'E:\WorkMemo'
& .\scripts\test-browser-registration.ps1
& .\scripts\package-preview-installer.ps1 -PortableZip .\artifacts\0.2.0-alpha.3\WorkMemo_0.2.0-alpha.3_windows_x64_preview.zip -ExpectedSha256 15a6dd85dca26eb589fd7a2675f9d4cd21c67b3cbf5a2fb19563b7baa6f527a3 -InstallerRevision r2
~~~

预期测试仅影响随机隔离键和 artifacts 内测试目录，真实 Chrome 注册不变；R2 成品包含已测试的安装/卸载钩子和一键修复文件，复用原始应用字节。用户无需运行源码测试；使用步骤见 BROWSER-REGISTRATION-FIX.md。

## Git 与发布

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: register the Chrome native host during preview installation"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

只提交注册修复相关文件，排除依赖、产物、数据库、凭据与暂缓草稿；随后补充公开回执。不强制推送、不移动原应用标签。GitHub 凭据仅在上传进程内使用，回执仅保存公开元数据。
