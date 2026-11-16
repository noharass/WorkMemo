# WorkMemo v0.2.11 构建与发布记录

2026-11-16，用户明确选择发布新版本并指定 0.2.11。当前已完成构建与检查，尚待本轮实际公开发布和匿名下载核验；最终回执将在发布后补齐，不以本记录代替发布成功。

本版包含网页 A/B/C 修正：未结束状态筛选、工时精度与跨年标签、连接错误与恢复、表单语义和错误焦点、静默轮询、图表数据表、弹层隔离、自定义趋势连续性及有界聚合、网页/桌面入口分离。应用仍使用 schema 12，从 0.2.10 更新不新增数据库迁移；旧版升级前备份，不支持直接降级读取新数据库。

## 已执行检查

- 应用、package-lock、Cargo、Tauri 与扩展版本统一 0.2.11，扩展固定 key 和权限不变。
- Node 69、Rust 185、cargo fmt --check、TypeScript / Vite 生产构建通过；保留 Dashboard 大分块警告。
- Tauri Windows x64 release、浏览器 helper 版本/profile、NSIS 安装器与完整 15 文件 ZIP 构建通过，未签名。
- ZIP 全部条目与源文件字节一致，主程序版本/x64、profile、扩展 version_name、SHA256 通过；原 0.2.10 本地四项资产保持一致。
- 本次 0.2.11 生产资源下重新执行完整网页、5组补录、5组待补填、A 5组、B 7组、C 7组以及实际 Chromium 125/150/200% 缩放检查，全部通过；B 的6个axe状态无报告违规但仍有 incomplete，30个代表文字样本最低4.67:1。
- 既有 D 阶段桌面任务/状态岛隔离回归和用户对 0.2.10 独立验收窗口的显示/透明/操作“正常”回执保留。当前用户预览不关闭，未为了版本变更重启它，也未把该旧预览记为 0.2.11 正式程序已启动通过。
- 真实 Narrator、Windows 系统 DPI、原生四皮肤逐项、实际扩展联动、安装卸载和实际登录仍未全部复验。未运行正式 0.2.11 程序或安装器去接触真实任务；发布只交付成品，不隐瞒这些限制。

## 本地成品

完整路径：E:\WorkMemo\artifacts\0.2.11。

| 资产 | 字节 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.11_x64-setup.exe | 3834240 | 139b05f4c956e9294b6ab150e5ec13abe86f643c3256d4f5c4c5836d62606c20 |
| WorkMemo_0.2.11_windows_x64.zip | 5135325 | e63f365df02f59a1c1ee9f67b113c975d650ccf4c9cbca84c9281366a9d534cb |
| THIRD-PARTY-LICENSES.txt | 2570495 | 998efb4d5965b2fd8fe366b023a3b45855adc91dafabda9d20d195a6b8107b2c |
| SHA256SUMS.txt | 288 | a6f4fb8a0210dbb7c8d214409fdd3ebc0137d2b40c2f6ef6cfc30c721aacc3b5 |

程序使用 com.workmemo.desktop 正式数据标识，需要 Windows 10/11 x64 和 WebView2。ZIP 保留全部15文件，安装版中文 NSIS；程序暂未签名。旧0.2.10候选、原成品和公开标签均保留，不覆盖。

## 源码、工具与证据

UPDATE：E:\WorkMemo\package.json、package-lock.json、src-tauri\Cargo.toml、src-tauri\Cargo.lock、src-tauri\tauri.conf.json、browser-extension\manifest.json，统一版本；E:\WorkMemo\README.md、docs\USER-GUIDE.md、docs\BUILDING.md、docs\PHASE-8.md，说明新版本、下载入口与验收限制；E:\WorkMemo\scripts\verify-native-dashboard.mjs，默认读取当前包版本；E:\WorkMemo\scripts\verify-windows-candidate.ps1，支持当前版本目录及显式旧版本保留检查；E:\WorkMemo\.gitignore，忽略 Python 字节码缓存。

NEW FILE：E:\WorkMemo\scripts\publish-release.py，固定 noharass/WorkMemo 的分步骤发布工具；E:\WorkMemo\docs\RELEASE-0.2.11.md，本记录；E:\WorkMemo\docs\RELEASE-0.2.11-SOURCE.md，以上实现/配置/说明的完整源码清单与内容。完整代码保存在项目文件，没有以省略号代替。原 docs/DYNAMIC-ISLAND-PLAN.md 未跟踪规划不暂存。

发布工具遵循 [GitHub Release API](https://docs.github.com/en/rest/releases/releases)，先创建草稿、上传并比对四项服务器摘要，再公开为稳定 Latest。既有 Git 凭据助手仅向内存返回凭据，认证仅发送到固定 GitHub API / uploads 主机且不跟随认证重定向；不把 token 写入文件或 URL，不删除资产或标签，不修改全局身份/代理。匿名 API 额度耗尽时元数据 GET 可使用既有认证；公开页面与文件下载始终使用单独的无认证客户端。

本地忽略证据在 E:\WorkMemo\artifacts\0.2.11\package-verification.json、previous-release.json、prepared-release.json、published-release.json、public-receipt.json、public-verified 及 RELEASE-NOTES.md（部分在后续发布步骤生成）。日志在 E:\WorkMemo\artifacts\release-0211-{node,rust,fmt,build,web,manual,pending,a,b,c,zoom,package-check,inspect}.log。D 阶段旧预览和真实 HTTP 证据不冒称为新版本原生启动证据。

## PowerShell 命令与预期

使用 Node24 x64、Rust MSVC、PowerShell7，发布工具额外使用本机 Python 标准库，不新增产品运行依赖。先停止当前项目 Vite 预览，保留用户正在运行的独立原生预览：

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
& .\scripts\package-windows.ps1
& .\scripts\verify-windows-candidate.ps1 -Directory artifacts/0.2.11 -PreserveDirectory artifacts/0.2.10
```

预期69/185项通过，主程序0.2.11/x64，ZIP15条目及旧版本保留校验通过。新版成品输出目录中的同名文件会重建；发布后不得随意重建同版本再替换资产。网页复核命令和开发工具路径见 WEB-PHASE-D.md；本次未修改其业务实现。

```powershell
git fetch origin main
git diff --check
git add -- .gitignore package.json package-lock.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json browser-extension/manifest.json README.md docs/USER-GUIDE.md docs/BUILDING.md docs/PHASE-8.md scripts/verify-native-dashboard.mjs scripts/verify-windows-candidate.ps1 scripts/publish-release.py docs/RELEASE-0.2.11.md docs/RELEASE-0.2.11-SOURCE.md
git diff --cached --check
git diff --cached --stat
git commit -m "release: prepare WorkMemo 0.2.11 web improvements"
git push origin main
$buildCommit=git rev-parse HEAD
git tag v0.2.11 $buildCommit
git push origin refs/tags/v0.2.11
python scripts/publish-release.py inspect --proxy http://127.0.0.1:7890
python scripts/publish-release.py prepare --commit $buildCommit --notes artifacts/0.2.11/RELEASE-NOTES.md --proxy http://127.0.0.1:7890
python scripts/publish-release.py publish --commit $buildCommit --proxy http://127.0.0.1:7890
python scripts/publish-release.py verify --proxy http://127.0.0.1:7890
git rev-parse HEAD
git ls-remote origin refs/heads/main refs/tags/v0.2.11
git status --short --branch
```

127.0.0.1:7890 是此机既有本地代理，仅通过单条命令使用，其他机器按实际网络设置调整或不传。直连 Git 不稳定时使用 git -c http.proxy=http://127.0.0.1:7890 -c http.version=HTTP/1.1 的单次参数，不改全局配置。先确认新标签尚不存在，拒绝修改属于其他构建的既有 Release；网络中断后按工具步骤读取实际状态再恢复，不盲目重复非幂等请求。

公开后预期：Release 非草稿/非预发布且为 Latest，tag 指向已核对构建提交；四项服务器大小/摘要和匿名下载后复算一致，旧0.2.10资产ID/大小/摘要和标签目标保持不变。完成后仅补充发布回执并同步，不自动进入新功能阶段。
