# Chrome 提示 native messaging host not found

适用：Windows x64、Google Chrome、WorkMemo v0.2.0-alpha.3 预览包。报错为“Specified native messaging host not found”。

它表示 Chrome 没找到可用的本机主机注册/清单，尚未进入软件通信，更不是站点授权未生效。可能是未注册、路径已失效，或混用了源码扩展与预览包。Chrome 的[官方排查说明](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging#debug-native-messaging)要求检查主机名、注册表默认值、清单和主机文件。

## 推荐：使用修复安装器

从同一 GitHub v0.2.0-alpha.3 Release 下载文件名以 x64-preview-setup-r2.exe 结尾的安装包。先从托盘正常退出旧 WorkMemo，再运行安装器；已安装同版本时选择重新安装。R2 会自动在当前 Windows 用户下注册 Chrome 本机主机，无需运行 PowerShell 脚本或更改执行策略。

打开 WorkMemo，并在 Chrome 扩展管理页重新加载包内 extension。连接成功后再同步工作站点授权。原有记录、待补全、工作网址与外观保持在原数据目录；不要删除这些目录。

## 已有完整预览包的一键修复

将随修复版提供的 Register-Browser.cmd 放到 workmemo-browser.exe 所在的文件夹，再双击运行。它会验证配套 extension、预览数据标识及主机文件，生成本机清单并写入当前用户的 Chrome 主机注册。成功后启动 WorkMemo，重新加载 Chrome 的 WorkMemo 扩展。

该文件不能放在任意下载目录直接运行，必须与 workmemo-browser.exe、workmemo-browser.profile.json 和 extension 文件夹放在一起。若提示缺文件，重新完整安装或解压；若提示配置不匹配，使用安装包内的 extension，不要使用 GitHub 源码目录 browser-extension 来连接预览版。

一键修复不依赖 PowerShell，不修改脚本执行策略或 Chrome 站点权限，不清空数据库。若组织策略禁止注册，修复程序会报告失败；不把失败当作连接成功。

## 范围与核对

- 主机名：com.workmemo.browser_bridge_test。
- 注册位置：HKCU\Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test；默认值为本机清单的完整路径。
- 清单只允许 chrome-extension://oljcealhccdhaddceacnokihjefloaih/。
- 清单 path 使用 Windows 支持的相对路径 workmemo-browser.exe，以清单所在目录解析，兼容空格与中文安装目录。
- 主机 profile 为 com.workmemo.test.monitor，与当前预览程序一致。

安装器卸载时只清除仍指向本安装目录的注册；旧目录的卸载器不得删除较新目录的注册。工作数据仍按已有卸载选项处理，默认保留。

仍报错时，提供扩展面板错误文字、所用浏览器名称、下载的包文件名及修复窗口报错即可；不要发送工作数据库、网页内容或认证值。alpha.2 还有已修复的心跳问题，应升级到 alpha.3 R2。
