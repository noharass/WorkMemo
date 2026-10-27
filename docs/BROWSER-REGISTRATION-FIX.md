# Chrome 本机连接全面修复（alpha.4）

适用 Windows x64 + Google Chrome，包含 EXE 安装、ZIP 免安装、源码运行和目录迁移。请完整更新到 v0.2.0-alpha.4，并重新加载新版本 extension。只下载新 CMD 配旧版 helper 不能升级组件。

“Specified native messaging host not found”表示 Chrome 尚未找到有效主机注册，站点授权不能解决该错误。依据：https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging#debug-native-messaging 。

## 用户操作

1. 从托盘正常退出旧 WorkMemo，完整安装 EXE 或解压 ZIP；保留配套组件。不要删除数据目录。
2. 启动新软件。它在数据库与本机服务正常初始化后自动检查并修复注册。ZIP 移动目录后重新启动也会更新路径。
3. 打开监测设置查看连接诊断；必要时点击“修复本机连接”，或双击同目录 Register-Browser.cmd。无需管理员权限、PowerShell 或执行策略修改。
4. 点击“打开配套扩展文件夹”，在 Chrome 加载该文件夹的 extension（源码 dev 的配套目录在 src-tauri/target/debug/extension）。已有扩展须重新加载新版本。
5. 扩展显示“已连接本机 WorkMemo”及版本、数据配置后，再同步工作站点授权。

## 情况区分

| 情况 | 处理 |
| --- | --- |
| host not found / 路径失效 | 启动完整新版软件自动修复，或使用监测设置修复 |
| 缺少 workmemo-browser.exe | 重新完整安装或解压，不能只复制主 EXE |
| 组件版本或数据配置不匹配 | 使用同一包的主程序、helper、profile；不要拼接不同版本 |
| 主机可运行但软件未启动 | 启动软件；扩展会在两个已知主机间有间隔重试 |
| 已连接但未授权工作站点 | 保存工作 URL 后在扩展同步站点授权 |
| 组织策略阻止本机通信 | 软件报告注册失败；由该电脑管理者处理策略，不自动绕过 |
| 正式版与预览版同时存在 | 各注册自己的主机；扩展优先使用配套配置，连通后保持该主机，并显示实际数据标识 |
| 移动/删除已加载扩展目录 | 重新加载新目录；移动程序不能让 Chrome 自动改变扩展目录 |

## 实现边界

所有入口调用同一 Rust 注册逻辑。清单保存在 %LOCALAPPDATA%\应用标识\browser-host.json，使用 UTF-8 与 helper 的绝对路径；安装目录不需可写。注册仅为 HKCU\Software\Google\Chrome\NativeMessagingHosts 下的 WorkMemo 主机，兼顾 32/64 注册视图，不改变 HKLM、浏览器站点权限或工作数据。

正式配置 com.workmemo.desktop 对应 com.workmemo.browser_bridge；com.workmemo.test.* 对应 com.workmemo.browser_bridge_test。清单只允许固定扩展 origin chrome-extension://oljcealhccdhaddceacnokihjefloaih/。新扩展尝试这两个已知名称，退避避免循环启动；健康连接不会跳转。

启动时先探测组件版本、协议和 profile，不匹配就不改注册。数据库被另一实例占用或本机服务未就绪时，不进行启动自动注册。手动修复可重新接管当前用户的对应 WorkMemo 主机；同一主机只能指向一个目录。不同 Windows 用户需分别启动软件完成该用户注册。

安装器卸载、CLI --unregister 只移除仍属于自己的注册；旧目录不能清掉较新目录的注册。工作数据库、外观、待补全和工作 URL 不参与修复。本轮无数据库迁移、无计时规则更改、无灵动岛开发。完整检查和源码见 BROWSER-CONNECTION-DELIVERY.md。
