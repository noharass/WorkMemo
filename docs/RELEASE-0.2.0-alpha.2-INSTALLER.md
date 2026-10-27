# v0.2.0-alpha.2 补充 EXE 安装器

日期：2026-10-27（Asia/Shanghai）。用户明确要求补充 EXE 安装包。继续使用同一预发布 Release，不修改业务功能，不将原生交互尚待验收的项目写为通过。

## 目标与兼容性

从已公开的免安装 ZIP 提取经过 SHA256 核对的原始程序与浏览器主机，使用 Tauri NSIS 打包为当前用户的中文 EXE 安装器。主程序命名 workmemo-preview.exe，产品名称 WorkMemo Preview，数据标识 com.workmemo.test.monitor；不覆盖正式 v0.1.1，也不影响其 workmemo.exe 进程。

安装器包含 Chrome 扩展、通信主机、独立 profile、注册脚本、安装版说明和许可。安装过程不自动注册主机或授予 Chrome 站点权限；安装后按说明接入。打包不运行安装器、不启动 GUI、不操作用户任务或数据库。

原免安装 ZIP 与原有 4 个 Release 资产保持字节不变；补充 EXE、INSTALLER-GUIDE.md、INSTALLER-SHA256SUMS.txt 三个资产。原应用源码标签 556c85e 保留；INSTALLER-BUILD-INFO.json 另记本次打包源码提交及原始 ZIP 摘要。

## 文件与完整代码

| 状态 | 完整路径 |
| --- | --- |
| NEW FILE | E:\WorkMemo\scripts\package-preview-installer.ps1 |
| NEW FILE | E:\WorkMemo\docs\PREVIEW-INSTALLER-GUIDE.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2-INSTALLER.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2-INSTALLER-SOURCE.md |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\PREVIEW-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2.md |

完整变更文本保存在 RELEASE-0.2.0-alpha.2-INSTALLER-SOURCE.md，构建使用各原始文件。历史发布源码汇编保留。

## 检查记录

- 脚本语法解析通过，Tauri tauri bundle --bundles nsis --no-binary-patching 实际执行成功。安装器约 2.33 MiB。打包日志与生成脚本确认 currentUser、WorkMemo Preview、workmemo-preview.exe、com.workmemo.test.monitor。
- 7-Zip 对实际 EXE 执行完整性测试及解包成功；逐项核对主程序、主机、profile、扩展、注册脚本、说明、许可与构建信息，共 15 个应用/资源文件，字节与原始输入完全一致。另有标准 NSIS 插件及卸载器。
- 主程序使用原公开 ZIP 的原始字节，没有因为打包写入 bundle 类型标记。程序与数据逻辑没有变化，本轮没有重新执行此前已通过的 102 个业务测试执行项。
- EXE、安装说明和安装校验文件上传成功，GitHub 返回的大小、SHA256 与本地一致；又从 3 个公开地址无认证下载复算，全部一致。
- 原有 4 个资产的大小、摘要均未改变。Release 正文顶部已加入 EXE 直链，目前共 7 个公开资产；latest 稳定版 API 仍为 v0.1.1。
- 没有实际安装、卸载或启动本安装器中的程序，未为验收改动用户任务、数据库或现有主机注册。原生交互及完整安装流程仍待验收；没有把解包检查称为实际安装通过。

## 下载与校验

[下载 EXE 安装包](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/WorkMemo_0.2.0-alpha.2_x64-preview-setup.exe) · [安装说明](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/INSTALLER-GUIDE.md) · [校验文件](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/INSTALLER-SHA256SUMS.txt)

交付目录 E:\WorkMemo\artifacts\0.2.0-alpha.2\installer，公开回执保存 INSTALLER-RELEASE-RECEIPT.json，公开下载复算副本保存 download-check；这些产物不提交 Git。

| 文件 | 字节数 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.0-alpha.2_x64-preview-setup.exe | 2438793 | 1f9c467a42718e84e7bb300158c545befd83f4c339a8d32095becff26e979057 |
| INSTALLER-GUIDE.md | 3356 | bb9d739eaa9b7eed8276ff3b830fac16bab6f688c156de2be193bcaed0ab352c |
| INSTALLER-SHA256SUMS.txt | 198 | ffdcbf73923de4a999b494c57fce830f7a5f29611a631615e4df8b3ecc7ffe2e |

应用源码标识 556c85e9eeb9a99ec19e7dc205d03314250fa88a；补充安装器打包源码 3cf68e6，随后文档回执另行提交，不移动原标签。

## PowerShell 重现

~~~powershell
Set-Location 'E:\WorkMemo'
& .\scripts\package-preview-installer.ps1 -PortableZip .\artifacts\0.2.0-alpha.2\WorkMemo_0.2.0-alpha.2_windows_x64_preview.zip -ExpectedSha256 ec9e0fa7da07655eadf2515eac77ba406f686daf5fa6f7f68a34605e74e1dcc6
Get-Content .\artifacts\0.2.0-alpha.2\installer\INSTALLER-SHA256SUMS.txt
~~~

需要既有 Windows 源码工具环境与 Tauri NSIS 缓存。脚本仅将验证过的程序复制到 target/release/workmemo-preview.exe，再调用 tauri bundle --no-binary-patching；不重新编译或重写原 ZIP。预期生成带完整接入文件的 EXE，并在安装器解包后逐项核对原始程序字节。

## Git 与发布

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "build: package the automatic tracking preview installer"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

安装器源码与随后的公开发布回执分别提交同步；不强制推送、不移动已有标签、不替换旧资产。上传只使用进程内已有 Git 凭据，回执仅含公开元数据。
