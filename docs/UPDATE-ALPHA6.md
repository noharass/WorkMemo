# alpha.6 自动恢复、检测与界面更新

日期：2026-10-28（Asia/Shanghai）。按用户确认方案实施，并根据后续许可增加授权工作页面活动信号。版本 0.2.0-alpha.6，Windows x64。本轮提供本地 EXE 与 ZIP，没有创建公开 Release；README 中已公开的 alpha.5 资产保持原样。

## 业务行为

- 正在进行的手动任务不会被自动监测替换；自动任务点击继续后仍按自动规则管理。手动暂停默认可在可信工作页的新操作后恢复同一记录并转自动管理，设置可关闭。重启待恢复记录必须用户明确处理。
- 切换暂停任务增加明确确认，并在后端校验被确认的记录 ID；旧确认不能误结束新的任务。结束旧记录和创建新记录保持事务执行。
- 检测间隔 1–5 秒，默认 1 秒，同时用于 Chrome 心跳与系统输入采样。已有离页与空闲秒数独立。SQLite schema 5 迁移保留旧记录和原阈值，新增默认自动恢复开关。升级前正常退出并备份，旧版可能不能打开升级后的数据库。
- 页面事件在通信忙时合并并重新读取最新状态；过期查询不发送。新增 scripting 权限，仅在配置且已授权的站点注入活动监听。脚本只发可信操作信号，不读取按键值、文本、坐标或网页内容；后台标签、未授权站点及脚本合成事件不作为活动信号。后端还核对原生输入、前台状态及暂停边界，从确认时刻计时，不回填未知区间。首次安装、未授权或监听尚未就绪时仍可能需要再次操作；没有严格实时保证。顶层页面活动监听不覆盖跨站 iframe。

## 界面与依赖

主窗口、任务卡、历史统计、删除确认、工作量结算、外观/监测设置、状态岛及 Chrome 弹窗统一整理，使用 Ant Design Icons 与 Tailwind Vite。Tailwind v4 样式要求现代 Chromium（111+）WebView2；未在旧运行环境验证。保持四套主题变量与原生透明配置；未导入 Tailwind Preflight。扩展弹窗图标和样式在本地打包，配套文件清单新增 activity.js；源码 extension 需先构建，不直接加载原始 popup.js。依赖许可汇编含 Ant 图标、Tailwind 产出样式及其依赖，缺失的包内许可按版本从上游或包内 README 补齐。

## 实际检查与限制

- npm test：37 项通过；cargo test --locked --offline：86 项库测试、2 项 helper 协议测试、2 项实际主机集成及 1 项注册测试通过，共 91 项。覆盖迁移、1/5 秒、自动恢复、重启保护、切换旧确认、首次输入边界、页面活动与授权范围、事件竞争和原有数据可靠性。
- TypeScript/Vite 构建、Rust 格式检查、bridge:dev 资源准备与扩展弹窗构建通过。桌面产物 JS 约 316.40 kB（gzip 97.03 kB），CSS 31.78 kB（gzip 6.73 kB）。
- 以独立应用标识 com.workmemo.test.qacd3bafcc2cc0 构建过隔离 GUI，并通过只读原生 probe。桌面工具请求启动该路径时实际启动了 C:\Users\Administrator\AppData\Local\WorkMemo\workmemo.exe，进程父级证实来自桌面工具；发现后停止对该窗口操作，没有结束、删除或改写真实任务。启动本身可能读取真实数据库并执行原有连接检查，无法声称真实状态全程未变化。
- 浏览器预览实际打开并检查了新版主界面布局、图标和文本，随后关闭临时页及开发服务；未将浏览器预览计为原生验收。
- 新版实际安装、Chrome 授权后的端到端联调、锁屏休眠、多屏/DPI、四皮肤原生透明、键盘焦点及提醒交互仍未验收。自动测试与构建不代替这些实测；本轮不报告为全面验收通过。

## PowerShell 命令、测试方法与预期

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --offline --manifest-path .\src-tauri\Cargo.toml
npm.cmd run bridge:dev
& .\scripts\package-preview.ps1
$taskZip = 'E:\WorkMemo\artifacts\0.2.0-alpha.6\WorkMemo_0.2.0-alpha.6_windows_x64_preview.zip'
& .\scripts\package-preview-installer.ps1 -PortableZip $taskZip -ExpectedSha256 (Get-FileHash -LiteralPath $taskZip -Algorithm SHA256).Hash
```

验证须使用独立数据：切换间隔1与5秒并重启读取；自动任务暂停继续仍受离页规则管理；手动任务在工作页不被覆盖；开启自动恢复时新操作恢复原 ID，关闭时保持暂停；旧任务确认对新 ID 被拒绝；连接中断及锁屏不累计未知时间。重新加载构建后的扩展，并由用户同步站点权限。仅检查测试任务，不以结束或删除真实工作完成验收。

文件清单（完整路径与 NEW FILE / UPDATE）及完整变更文本在 UPDATE-ALPHA6-SOURCE.md。原先未跟踪的 DYNAMIC-ISLAND-PLAN.md 保留且未纳入提交。第三方完整许可另在原路径 docs/THIRD-PARTY-LICENSES.txt，源码汇编同时保留。

```powershell
git diff --cached --check
git diff --cached --name-status
git commit -m "docs: record alpha.6 local delivery and acceptance limits"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```


## 本地成品

正式 release 与 NSIS 实际构建成功；ZIP 16 项精确清单、CRC、主程序/许可字节及安装器共享文件逐字节核对通过。尚未实际安装。源码提交为 b40179522cc6b48c6557c1cb3c75a002fb9ff727。

- E:\WorkMemo\artifacts\0.2.0-alpha.6\WorkMemo_0.2.0-alpha.6_windows_x64_preview.zip，3520900 字节；SHA256 `bd9bae6ac2cd69984ad59c208c794c42a5e741985ddb1133da31219ca0f28c1a`。
- E:\WorkMemo\artifacts\0.2.0-alpha.6\installer-r1\WorkMemo_0.2.0-alpha.6_x64-preview-setup-r1.exe，2501168 字节；SHA256 `a2f55aade14a9c3707b9379c01d3edeba7cb6fd8e0898423fde77d247d64aa67`。

校验文件：E:\WorkMemo\artifacts\0.2.0-alpha.6\DELIVERY-SHA256SUMS.txt。
