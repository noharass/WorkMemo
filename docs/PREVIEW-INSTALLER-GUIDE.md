# WorkMemo v0.2.0-alpha.4 EXE 安装版

先从托盘正常退出旧预览程序，再运行 WorkMemo_0.2.0-alpha.4_x64-preview-setup-r1.exe，按中文向导完成。已有相同版本时可重新安装。当前用户安装，不需要管理员权限；请与 Chrome 使用相同的 Windows 用户。缺少 WebView2 时安装器联网补齐。程序尚无代码签名。

安装时与每次启动时均会检查本机主机注册；无需额外运行脚本。默认安装目录包含主程序、workmemo-browser.exe、profile JSON、extension、CMD/PS1 修复入口、使用说明和第三方许可。

1. 安装后打开 WorkMemo Preview，进入监测设置，查看本机连接诊断。
2. 点击“打开配套扩展文件夹”，Chrome 打开 chrome://extensions，开启开发者模式，加载该 extension 文件夹。已有旧扩展应切换到新目录并重新加载。
3. 在软件配置工作网址与类别，保存；扩展连接后同步工作站点授权。
4. 返回前台工作页并进行一次新的输入，预期约 5 秒内自动开始。仅打开页面不开始。

若出现 host not found，启动软件或在监测设置点击“修复本机连接”，也可双击安装目录 Register-Browser.cmd。缺少组件或混用版本会给出具体提示，需要完整更新。ZIP、源码与 EXE 使用相同注册逻辑，移动目录后重启会更新路径；不会依赖安装目录可写。详见 BROWSER-REGISTRATION-FIX.md。

数据仍在 %LOCALAPPDATA%\com.workmemo.test.monitor；外观仍在 %APPDATA%\com.workmemo.test.monitor，与之前预览 ZIP 相同、与正式版独立。数据库版本仍为 3。更新不需要清空历史、待补全、工作 URL 或外观。同一预览数据只运行一个实例。

工作规则见 PREVIEW-GUIDE.md：离页 2 分钟暂停、再保留 10 分钟；5 分钟无输入提醒、7 分钟结束并扣尾段；手动暂停需手动继续。关闭窗口继续后台运行，托盘退出才保存暂停并退出。

卸载前从托盘退出；卸载时保留应用数据。卸载器只清理仍属于本目录的注册，不移除后来 ZIP 或另一安装目录接管的注册。Chrome 扩展由用户手动移除。

本版完成自动测试和隔离安装注册验证；其他电脑实际 Chrome 接入、锁屏/休眠、提醒焦点及四皮肤原生交互不能据此视为全部通过。
