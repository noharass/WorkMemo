# WorkMemo v0.2.0-alpha.4 自动记录预览版

Windows x64 预发布版，修复 EXE、ZIP 和源码接入路径不一致的问题。保留自动开始、5/7 分钟空闲规则、离页 2 分钟暂停、托盘、提醒及待补全。用户此前已确认实际自动开始和两分钟离页暂停；锁屏/休眠、完整提醒焦点与四皮肤原生交互仍需验收。

## ZIP 使用

1. 从同一 Release 下载 ZIP，完整解压，启动 workmemo-preview.exe。保留旁边的 workmemo-browser.exe、profile JSON、extension 和修复脚本。需要 Windows x64 与 WebView2。程序没有代码签名。
2. 启动时软件自动检查并修复当前 Windows 用户的 Chrome 本机主机注册，不用先运行脚本。移动整个目录后重新启动即可更新路径。不要只复制主 EXE。
3. Chrome 打开 chrome://extensions，开启开发者模式，加载解压目录的 extension 文件夹；旧扩展改为新目录并重新加载。扩展 ID 为 oljcealhccdhaddceacnokihjefloaih。
4. 在软件“监测设置”添加工作 URL 和类别并保存；打开扩展同步工作站点授权。扩展会显示实际连接的软件版本与数据配置。保持 Chrome 工作页前台并进行一次新输入，约一个检查周期自动开始。

仅打开页面不会开始。授权仅针对所配置的工作站点；不采集网页内容、具体按键、文本或鼠标轨迹。连接失败与站点未授权分开处理。

## EXE 与更新

EXE 安装版步骤见 PREVIEW-INSTALLER-GUIDE.md。更新前从托盘正常退出旧程序，再安装或解压新版本；扩展也重新加载新版本。安装和 ZIP 使用相同独立预览数据：%LOCALAPPDATA%\com.workmemo.test.monitor；外观在 %APPDATA%\com.workmemo.test.monitor。数据库仍为版本 3；历史、待补全、工作 URL 和外观不需删除。正式 com.workmemo.desktop 数据仍独立。同一数据配置只运行一个实例。

## 日常规则

- 5 分钟无输入提醒；7 分钟无输入结束，结束时间暂取最后输入，尾段扣除。阅读、思考可能少计，完整时间修正界面尚不在本阶段。
- 连续离页 2 分钟暂停，再保留 10 分钟；返回并有新输入可恢复原记录。先到期规则生效，同刻优先空闲，不重复结算。
- 手动暂停只能手动继续。计时结果先保存，工作量可稍后到待补全填写，明确填写 0 也可保存。
- 关闭主窗口继续后台运行，从托盘“退出 WorkMemo”保存暂停并退出。

## 连接修复

监测设置中查看连接诊断，点击“修复本机连接”；“打开配套扩展文件夹”可定位应加载的扩展。也可双击同目录 Register-Browser.cmd，不依赖 PowerShell、不修改执行策略。缺文件或组件版本不匹配时须完整更新；详细见 BROWSER-REGISTRATION-FIX.md。

停用时先从托盘退出，再执行 Register-Browser.cmd /unregister 或 Register-Browser.ps1 -Unregister。仅移除仍属于本目录的主机注册，不删除工作数据。Chrome 扩展由用户手动停用或移除。源码与成品：https://github.com/noharass/WorkMemo 。
