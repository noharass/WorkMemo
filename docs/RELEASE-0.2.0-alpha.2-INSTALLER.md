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

准备中。实际构建、解包核对、上传、公开下载复算结果在完成后补充。此前 102 个测试执行项和 release 构建通过属于上一轮实际检查，本轮复用相同应用字节，不重复声称已重新执行这些业务测试。

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
