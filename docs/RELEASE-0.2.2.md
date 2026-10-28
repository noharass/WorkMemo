# WorkMemo v0.2.2 正式发布与版本结束

日期：2026-10-28（Asia/Shanghai）。用户明确要求完成其余上传动作并结束该版本。

## 结果与下载

[WorkMemo v0.2.2 正式 Release](https://github.com/noharass/WorkMemo/releases/tag/v0.2.2) 已公开，draft=false、prerelease=false，并设为 Latest。应用与浏览器组件的最终构建源码为 `20758c6830d002939303aeab00f9c8a679a0ff0e`，公开 tag v0.2.2 指向此提交，旧 tag 和资产保持原样。源码归档由 GitHub 根据该 tag 提供；随后入口文档更新单独提交到 main，不移动构建 tag。

- [Windows x64 安装版](https://github.com/noharass/WorkMemo/releases/download/v0.2.2/WorkMemo_0.2.2_x64-setup.exe)
- [完整免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.2.2/WorkMemo_0.2.2_windows_x64.zip)
- [SHA256SUMS](https://github.com/noharass/WorkMemo/releases/download/v0.2.2/SHA256SUMS.txt)
- [第三方许可](https://github.com/noharass/WorkMemo/releases/download/v0.2.2/THIRD-PARTY-LICENSES.txt)

配套扩展在安装版／ZIP 中，勿只拿出主 EXE。升级前备份并自行从托盘退出旧实例，升级后重新加载配套扩展，为新增站点同步授权。

## 发布前检查与实际上传

- 起点工作区除原有未跟踪 docs/DYNAMIC-ISLAND-PLAN.md 外无未保存实现；应用代码不再修改。GitHub 原 Latest 为 v0.2.1，v0.2.2 的 tag 和 Release 均不存在。
- 复核安装器、ZIP、许可及旧 SHA256SUMS 与本轮最终交付记录一致。将 ZIP 内使用说明的本地交付提示替换为正式 Release 地址后重新打包、重算 SHA256SUMS；逐项验证只有使用说明的解压内容改变，主程序、浏览器资源及安装器不变。压缩器的重新编码可能改变其他条目的压缩字节，解压内容已逐字节核对。
- 先创建 draft，上传四项资产，核对服务器返回的大小及 SHA256 摘要，再公开并设置 Latest；核对 GitHub tag 对应提交。
- 发布后四项均用不带认证头的公开下载 URL 重新下载，并复算本地与远程摘要完全一致。下载的是普通用户可用的公开链接，不以认证下载冒充公开可访问。
- 认证仅通过已有 Git 凭据管理器读取到当前进程内存，未在文件、命令输出、URL 或仓库中写入凭据。回执只保存公开元数据到被忽略的 artifacts/0.2.2/qa/RELEASE-RECEIPT.json；公开下载副本保存在同目录 public-downloads。
- README 安装版、ZIP 和更新说明入口已改为 v0.2.2，使用说明与当前发布保持一致。没有安装新版本、结束用户任务或操作真实数据库。

## 当前公开资产摘要

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| SHA256SUMS.txt | 286 | `0e9f56887914e4771609465f7d9eb236256d399d22ca3b8517f9737e3cfc9a0f` |
| THIRD-PARTY-LICENSES.txt | 2413135 | `e777d5ab332cfc49e972c31557a53981845dfb8ab75dcfd0d9ac03ec48d5b620` |
| WorkMemo_0.2.2_windows_x64.zip | 4223201 | `be96e2dfc66c1f8d0b5d1196ee922a7eb5423b7a182dfafa53ea43f53667629f` |
| WorkMemo_0.2.2_x64-setup.exe | 3204484 | `2307a2e1b4edcba15b29db1ef846ead5f1192da609a4fb3073fc67f3d9c5c4fd` |

当前交付目录为 `E:\WorkMemo\artifacts\0.2.2`，已与公开下载逐项核对。发布前 ZIP 保留于 qa/pre-publication-20758c6，历史阶段报告中的旧 ZIP 摘要不代表本次公开说明更新后的 ZIP。

## 检查范围与兼容性

应用功能与构建检查见 UPDATE-0.2.2.md、UPDATE-0.2.2-MULTI-URL.md、UPDATE-0.2.2-LAYOUT.md。执行过最终 TypeScript/Vite、Windows release/NSIS 构建、46 项 Node 测试、七种浏览器宽度及编辑流程；开发期间执行过 119 项 Rust 测试，之后单独执行过多站点连续计时测试，不把这些分轮结果声称为最终源码全部 120 项重跑。

Windows x64／WebView2，数据库 schema 8；回退旧版需升级前备份。程序未签名。原生透明、所有 DPI／多屏、焦点、提示音听感及最终安装／卸载仍有未实机覆盖项目；正式发布不将它们改写为验收通过。没有新增依赖、权限、数据结构或功能。

## 完整文件路径与代码

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| UPDATE | E:\WorkMemo\docs\UPDATE-0.2.2.md |
| UPDATE | E:\WorkMemo\docs\UPDATE-0.2.2-LAYOUT.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.2.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.2-SOURCE.md |

发布入口及使用说明完整内容见 [RELEASE-0.2.2-SOURCE.md](RELEASE-0.2.2-SOURCE.md)。本轮没有实现代码变更，原始各轮完整实现源码仍保存在对应 SOURCE 文档及项目文件中。原有未跟踪 DYNAMIC-ISLAND-PLAN.md 保持原样，不提交；成品、QA 记录、依赖、用户配置与数据库不提交。

## PowerShell 核对与 Git 命令

```powershell
Set-Location 'E:\WorkMemo'
$release = Invoke-RestMethod 'https://api.github.com/repos/noharass/WorkMemo/releases/tags/v0.2.2'
$release | Select-Object tag_name,draft,prerelease,html_url
$release.assets | Select-Object name,size,browser_download_url
Get-Content .\artifacts\0.2.2\SHA256SUMS.txt
Get-FileHash .\artifacts\0.2.2\WorkMemo_0.2.2_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.2.2\WorkMemo_0.2.2_windows_x64.zip -Algorithm SHA256
git ls-remote origin refs/tags/v0.2.2
```

预期 Release 公开、非预发布，四个资产可下载；文件摘要与本页及 SHA256SUMS 一致，tag 对应 20758c6。公开 API 可能有访问频率限制，不能把频率限制误报为 Release 不存在；四项普通下载已实际验证。

```powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "docs: publish WorkMemo v0.2.2 downloads and close release"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

推送后比较本地与远程 main 提交，回执保存至 artifacts/0.2.2/qa/git-sync-release.txt。用户已结束本版本，完成发布和文档同步后停止，不自动进入下一版本。
