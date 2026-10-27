# v0.2.0-alpha.3：修复 Windows 浏览器心跳连接

日期：2026-10-27（Asia/Shanghai）。用户实际使用后反馈反复显示“等待 Chrome 扩展连接”，重新加载扩展及更新注册路径仍无效。此次只修复第二阶段通信问题，不自动进入第三阶段。

## 根因与修正

实际 Chrome 调用的主机能收到请求，并成功取得软件配置；下一条约 5 秒后的请求失败，随后重连。对旧软件直接发送一次请求后，TCP 连接立即 EOF。已排除仅因注册路径陈旧或未点击站点授权造成的解释。

Windows 接受的新 TCP socket 继承监听器的非阻塞状态。服务端使用非阻塞 listener 轮询接受连接，但没有把每个客户端切回阻塞模式，第一条请求回复后下一次 read 返回 WouldBlock，工作线程结束并关闭连接。修正为在客户端工作线程内显式 set_nonblocking(false)，再应用读写超时；监听线程仍为非阻塞。Windows socket 继承属性依据 [Microsoft accept 文档](https://learn.microsoft.com/en-us/windows/win32/api/winsock2/nf-winsock2-accept)，实际复现及失败测试也已保留。

新增真实回环连接回归用例，间隔发送多条心跳。第一次带 --exact 的筛选命令没有选中用例，不计为测试通过；改用正确筛选后，旧代码实际失败（Windows 10053），修正后通过。此前只验证单次请求的测试不能覆盖这类连接维持问题。

扩展现在区分本机连接中断、主机注册错误和工作站点未授权，显示 Chrome 的实际连接错误。原生主机增加可选、有限大小的本地诊断事件码，默认不启用；只记录连接阶段及系统 I/O 类型，不记录消息、URL、按键文本或认证值。一次性诊断文件位于被忽略的 artifacts，未提交用户工作配置或本地数据库。

## 兼容性

应用版本 0.2.0-alpha.3；扩展版本 0.1.1，version_name 为 0.2.0-alpha.3，固定扩展 ID、权限及通信帧字段不变。继续使用 com.workmemo.test.monitor、SQLite 版本 3；待补全、历史、监测配置、外观保留。正式 com.workmemo.desktop 不作迁移。

旧程序仍需正常退出并换用修复版；只更新通信主机、重复授权或重新加载旧扩展不能修复服务端 socket 模式。不会为验收强制结束或删除用户任务。

## 实际检查与交付

- Node 29 项、Rust 库 73 项、主机单元 2 项、子进程通信 2 项通过，共 106 个执行项，包含重复运行的共享协议测试；Rust 格式、TypeScript/Vite 生产构建通过。
- 新增的 Windows 真实长连接测试在旧代码上失败，在修复后通过；现有认证与重放拒绝测试继续通过。
- 原生诊断已实际显示“第一条成功、下一条失败”的循环；更新注册路径并不能解决该服务端错误。没有把前一次注册路径更新称为已修复根因。

构建、真实新版连接、Release 上传和公开下载复算在实际完成后补记。准备 ZIP 与 EXE，沿用预览发布流程，原 alpha.2 资产与标签不覆盖。完整文件清单和完整源码另存 RELEASE-0.2.0-alpha.3-SOURCE.md，长文件不使用省略号代替代码。

## 重现命令

~~~powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
cargo test --locked --offline --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
& .\scripts\package-preview.ps1
$taskPreviewZip = '.\artifacts\0.2.0-alpha.3\WorkMemo_0.2.0-alpha.3_windows_x64_preview.zip'
$taskPreviewHash = (Get-FileHash -LiteralPath $taskPreviewZip -Algorithm SHA256).Hash
& .\scripts\package-preview-installer.ps1 -PortableZip $taskPreviewZip -ExpectedSha256 $taskPreviewHash
~~~

预期同一 TCP 连接可跨越心跳间隔继续收发，Chrome 重连错误不再反复遮盖配置。完整自动开始、空闲等待、锁屏/休眠及原生透明的既有验收范围不因这次网络修复而自动标为完成。

## Git 命令

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: keep Windows browser bridge connections alive between heartbeats"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

按授权提交推送，发布使用进程内已有 Git 凭据，不写入 URL 或源码；不强制推送、不移动旧标签，随后补充公开回执。
