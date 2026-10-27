# Chrome 接入与第二阶段独立验收

当前是开发验收版本，尚未发布到 Chrome 商店。第二阶段代码与自动测试已准备，真实浏览器、托盘、提醒窗口和锁屏/休眠交互仍待验收；不能把编译或模拟时钟测试当成这些场景已通过。

用户要求后已发布独立数据的 release 优化预览 ZIP：[v0.2.0-alpha.2](https://github.com/noharass/WorkMemo/releases/tag/v0.2.0-alpha.2)。从 GitHub 下载后按 PREVIEW-GUIDE.md 接入；下文保留本机 debug 验收包路径与源码准备步骤，两种程序使用相同测试数据标识，不能同时运行。

## 本机已准备的独立验收包

- 程序：E:\WorkMemo\artifacts\browser-bridge\com.workmemo.test.monitor\workmemo-test.exe
- 扩展目录：E:\WorkMemo\artifacts\browser-bridge\com.workmemo.test.monitor\extension
- 原生主机：同目录 workmemo-browser.exe。
- 原生主机清单：同目录 com.workmemo.browser_bridge_test.json。
- 扩展 ID：oljcealhccdhaddceacnokihjefloaih。
- 程序标题：WorkMemo 第二阶段验收（独立数据）。

只读探针已实际确认程序的 Tauri 应用标识为 com.workmemo.test.monitor。其数据库位于 %LOCALAPPDATA%\com.workmemo.test.monitor，外观位于 %APPDATA%\com.workmemo.test.monitor，与正式 com.workmemo.desktop 分开。默认没有工作 URL，也不启用自动页面识别。

独立 EXE 已复制出 target/debug，后续源码编译不会覆盖这份验收程序。不要将默认构建的 target/debug/workmemo.exe 直接当作独立验收包运行；普通构建仍使用正式应用标识。

## 手动接入步骤

1. 在 PowerShell 执行下面两条命令。第一条注册当前用户的独立测试主机，第二条启动独立程序。

~~~powershell
& 'E:\WorkMemo\scripts\prepare-browser-bridge.ps1' -ProfileId 'com.workmemo.test.monitor' -Register
& 'E:\WorkMemo\artifacts\browser-bridge\com.workmemo.test.monitor\workmemo-test.exe'
~~~

注册只写 HKCU\Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test，不需要管理员权限，不修改正式主机名称。脚本未加 -Register 时只准备文件；本轮已实际执行独立测试主机注册并只读核对该值。

2. 在 Chrome 打开 chrome://extensions。由用户开启开发者模式并选择“加载已解压的扩展程序”，选择上面的 extension 目录。首次安装或站点授权应由用户操作；没有自动修改 Chrome 的权限设置。
3. 在独立 WorkMemo 中打开“监测设置”，添加自己明确选择的工作 URL 和类别，勾选启用后保存。URL 只支持 http/https，不含用户名或密码；查询参数和片段会去除。
4. 打开 Chrome 工具栏中的 WorkMemo 扩展，点击“同步工作站点授权”，由用户确认只授权已配置站点。扩展会显示当前连接和授权状态。
5. 切换到该工作页面并保持 Chrome 前台，再进行一次新的鼠标或键盘操作，等待约一个检查周期。预期自动出现一条记录，来源为自动监测，工作量未填；仅打开页面或后台保留标签页不开始。

请在完成后回复“已接入，可以继续验收”，或描述实际错误。安装与授权本身不代表已验证所有计时场景。

## 建议验收顺序

1. 先验证自动开始、手动暂停保护、手动继续不要求 URL、结束后填写 0、稍后填写及新任务不受旧待补全阻碍。
2. 离开匹配页面并在其他应用持续操作：约 2 分钟自动暂停；再保留 10 分钟后结束。返回工作页面后需要新输入，保留期内应恢复同 ID，暂停段不计时。
3. 有合适空档时才验证整段空闲：5 分钟非阻塞提醒，7 分钟结束，最后输入后的尾段扣除。不要为验收中断实际工作；模拟时钟覆盖与真实等待结果分别记录。
4. 关闭主窗口后从托盘重新打开，确认记录仍在后台运行；托盘“退出 WorkMemo”与布局设置里的退出入口会保存暂停并退出。
5. 核对提醒不抢走其他应用的键盘焦点；关闭提醒后待补全保留。再检查四种皮肤、透明、缩放、滚动和重启恢复。
6. 锁屏/休眠需要用户在适当时机操作，不自动锁定电脑。期间不可确认的时间不得计入工时。

## 通信与权限

扩展只使用 nativeMessaging、用于重连的 alarms，以及用户按需授予的工作站点权限；不申请全量 tabs 权限，不注入内容脚本，不采集文本或鼠标轨迹。Chrome 站点权限的路径行为见 [Chrome 匹配模式](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns)；业务匹配另校验精确来源、端口与路径边界。

扩展发给本机的帧只含协议版本、消息序号、配置版本、窗口是否前台、授权是否齐备、匹配规则 ID。网页 URL、标题、内容和输入文本均不在帧中。配套主机仅允许固定扩展 origin，使用 Windows 的长度前缀 JSON 协议；依据 [Chrome Native Messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging)。

桌面与原生主机之间只监听动态 127.0.0.1 端口，使用每次启动重新生成的随机校验值。端点文件位于当前用户应用数据目录，不进入源码、交付包或浏览器回复；没有云服务器。原生端口保持扩展 worker 活跃的行为依据 [Chrome worker 生命周期](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)。

页面心跳失联超过 15 秒、权限不足或配置版本不匹配时，自动记录暂停，并回退至最后可信页面边界；不会把发现断连前的整段等待直接计入工时。异常暂停保留 10 分钟，期间仍受更早的 7 分钟空闲结束约束，超时结束为待补全，避免永久占用活动记录。手动暂停及重启待恢复记录不被自动处理。

Windows 仅读取当前会话最后输入、前台程序身份及锁屏/电源状态。GetLastInputInfo 的会话与时间特性见 [Microsoft 文档](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getlastinputinfo)。不会记录按键、输入内容或鼠标坐标。

## 从源码重新准备

先完成 npm build 和 Rust 检查。Tauri 隔离构建应在其他测试之后运行，再立即复制，避免后续普通 Cargo 构建覆盖 target/debug 中的同名程序。

~~~powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd run build
New-Item -ItemType Directory -Force .\src-tauri\target | Out-Null
$taskConfig = Get-Content -Raw .\src-tauri\tauri.conf.json | ConvertFrom-Json
$taskConfig.identifier = 'com.workmemo.test.monitor'
$taskConfig.productName = 'WorkMemo Monitor Test'
$taskConfig.app.windows[0].title = 'WorkMemo 第二阶段验收（独立数据）'
[IO.File]::WriteAllText((Join-Path (Get-Location) 'src-tauri\target\monitor-test.conf.json'), ($taskConfig | ConvertTo-Json -Depth 20), (New-Object Text.UTF8Encoding($false)))
npm.cmd run tauri -- build --debug --no-bundle --config src-tauri/target/monitor-test.conf.json
& .\scripts\prepare-browser-bridge.ps1 -ProfileId com.workmemo.test.monitor -AppBinaryPath .\src-tauri\target\debug\workmemo.exe
& .\artifacts\browser-bridge\com.workmemo.test.monitor\workmemo-test.exe --monitor-probe
~~~

最后一条是 debug 专用只读探针，不创建窗口或打开数据库。预期 application_id 为 com.workmemo.test.monitor；只有 native_available=true 且 unlocked=true 时，当前会话的监测状态才可用。
