# WorkMemo v0.2.0-alpha.2 EXE 安装版

双击 WorkMemo_0.2.0-alpha.2_x64-preview-setup.exe，按中文安装向导完成。安装完成后从桌面或开始菜单打开 WorkMemo Preview。

这是 Windows x64 预发布版，使用当前用户安装模式，无需手动解压。需要 Microsoft Edge WebView2 Runtime；缺少时安装器联网下载微软运行环境。程序尚无代码签名。真实 Chrome 接入、5/7 分钟等待、锁屏/休眠、托盘、提醒焦点和四皮肤原生透明仍待验收。

安装目录可在向导中选择，默认在当前用户的本地应用目录。安装器随程序放置 workmemo-browser.exe、Register-Browser.ps1、workmemo-browser.profile.json、extension 文件夹、使用说明与第三方许可。右键程序快捷方式并选择“打开文件所在的位置”，可找到这些文件。

## 首次接入 Chrome

1. 在安装目录打开 PowerShell，运行：

~~~powershell
& .\Register-Browser.ps1
~~~

脚本只注册当前用户的 com.workmemo.browser_bridge_test，不需要管理员权限。若被本机脚本执行策略阻止，先核对发布包与脚本内容，按本机管理要求运行；安装器和脚本均不修改执行策略。原有测试主机若指向其他目录，会在当前目录保存旧值备份。此备份是本地环境信息，不应公开上传。

2. 用户在 Chrome 打开 chrome://extensions，开启开发者模式，选择“加载已解压的扩展程序”，选安装目录里的 extension 文件夹。已加载旧测试扩展时，改用新目录并重新加载。
3. 在 WorkMemo 的“监测设置”添加自己选定的工作网址与类别，启用并保存。打开 Chrome 的 WorkMemo 扩展，点击“同步工作站点授权”，由用户确认站点权限。
4. 回到匹配工作页，保持 Chrome 前台并进行一次新的点击或键盘输入，约 5 秒内预期自动开始。仅打开工作页面不开始。

## 日常使用

- 最后输入后 5 分钟提醒，7 分钟结束；最后输入后的尾段不计入有效工时。阅读、思考等低输入工作可能少记，完整时间修正界面尚不在本阶段。
- 连续离页 2 分钟暂停，再保留 10 分钟；期间返回工作页并有新输入，恢复原记录。规则先到期者生效，同刻优先空闲。
- 结束后填写工作量，也可稍后到待补全列表填写。手动暂停需要手动继续。
- 关闭窗口继续在托盘运行；从托盘选择“退出 WorkMemo”才会保存暂停并退出。

工作数据在 %LOCALAPPDATA%\com.workmemo.test.monitor，外观在 %APPDATA%\com.workmemo.test.monitor。安装版与之前的独立验收/免安装预览版使用相同测试数据；同一时间只运行一个预览实例。正式版 com.workmemo.desktop 使用另一数据目录。不要复制真实数据库到测试目录，版本 3 不能由旧版程序读取。

## 卸载

先从托盘退出预览程序；若此前运行过注册脚本，在安装目录执行以下命令，再从 Windows 的已安装应用中卸载 WorkMemo Preview：

~~~powershell
& .\Register-Browser.ps1 -Unregister
~~~

脚本只移除仍指向本安装目录的测试注册值。Chrome 扩展由用户手动停用或移除。卸载时保留工作记录；不要选择安装器中清除应用数据的选项，除非确认需要删除测试记录。
