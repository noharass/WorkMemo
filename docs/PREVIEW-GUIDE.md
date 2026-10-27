# WorkMemo v0.2.0-alpha.2 自动记录预览版

这是第二阶段的 Windows x64 预发布版，包含自动开始、5/7 分钟空闲规则、离页暂停、后台托盘、结束提醒及待补全工作量。实际 Chrome 接入、连续等待、锁屏/休眠、提醒焦点和四皮肤原生透明仍待验收。发布下载包不代表第二阶段全部验收通过。

## 解压与启动

完整解压 ZIP 到一个固定目录，再双击 workmemo-preview.exe。保留旁边的 workmemo-browser.exe、profile JSON 和 extension 文件夹。需要 Windows x64 与 Microsoft Edge WebView2 Runtime；本预览 ZIP 不安装运行环境。程序没有代码签名，下载后可用随附 SHA256SUMS.txt 核对 ZIP。

本版没有安装器，不替换正式 v0.1.1。工作数据使用 %LOCALAPPDATA%\com.workmemo.test.monitor，外观使用 %APPDATA%\com.workmemo.test.monitor；与正式 com.workmemo.desktop 分开。此前独立验收程序使用相同测试标识，因此已有测试记录会保留。不要将真实数据库复制到测试目录；数据库版本 3 不支持旧程序读取。

同一测试数据目录只运行一个实例。关闭主窗口后程序继续在托盘运行；从托盘选择“退出 WorkMemo”才会保存暂停并退出。

## 接入 Chrome

1. 在解压后的 WorkMemo-Preview 目录打开 PowerShell，执行：

~~~powershell
& .\Register-Browser.ps1
~~~

脚本只注册当前用户的 com.workmemo.browser_bridge_test，不需要管理员权限。若系统执行策略阻止脚本，先检查脚本内容和包校验值，再按本机管理要求运行；脚本不修改执行策略。注册生成的主机清单引用当前绝对目录，移动目录后需要重新运行脚本。旧测试主机路径会备份到本目录 previous-registration-*.json；正式主机名称不变。

2. 用户在 Chrome 打开 chrome://extensions，开启开发者模式，加载解压目录中的 extension 文件夹。扩展 ID 应为 oljcealhccdhaddceacnokihjefloaih。若已加载旧测试扩展，改用新目录并重新加载；相同 ID 的扩展无需并存。
3. 启动程序，在“监测设置”中添加自己选定的工作 URL 与类别，启用并保存。打开 Chrome 的 WorkMemo 扩展，点击“同步工作站点授权”，由用户确认站点权限。
4. 回到已配置工作页，保持 Chrome 前台并进行一次新的鼠标/键盘操作。预期约 5 秒内自动开始；仅打开页面且没有新输入不开始。

扩展不采集网页内容、具体按键、文本或鼠标轨迹。页面匹配只限用户配置的 URL；工作记录仅存本地 SQLite。站点权限不足、浏览器断连或锁屏/休眠时，不会把无法确认的时间直接算成有效工时。

## 计时与补填

- 连续 5 分钟无输入：显示非阻塞提醒；7 分钟无输入：结束计时。结束时间暂取最后输入，后续 7 分钟扣除；阅读、思考等低输入工作可能少记，需要人工处理，完整时间修正界面尚不在本阶段。
- 连续离页 2 分钟暂停，再保留 10 分钟；期间返回工作页并有新输入则恢复原记录。空闲和离页规则先到期者生效，同刻优先空闲，不重复结算。
- 手动暂停后自动监测不能恢复；需要手动继续。结束先保存计时结果，工作量可稍后补填；明确填写 0 可保存。关闭提醒后可在待补全列表继续填写。
- 使用者优先保护实际工作，不为测试强制结束或删除自己的任务。

## 停用接入

先从托盘退出预览程序。若需要移除本目录注册的测试主机：

~~~powershell
& .\Register-Browser.ps1 -Unregister
~~~

脚本只移除仍指向本目录的测试注册值，不删除工作记录。Chrome 扩展由用户手动停用或移除。详细阶段记录与完整源码见 https://github.com/noharass/WorkMemo ，稳定版仍见 v0.1.1 Release。
