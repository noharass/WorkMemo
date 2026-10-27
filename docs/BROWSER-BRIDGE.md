# Chrome 接入与第二阶段验收

当前推荐 v0.2.0-alpha.4，完整 EXE 与 ZIP 均见 GitHub Releases；使用步骤见 PREVIEW-GUIDE.md。EXE 安装、ZIP 首次启动、源码 dev 均使用同一注册逻辑；目录移动后重启会修正路径。连接问题见 BROWSER-REGISTRATION-FIX.md。

## 源码与独立数据

默认 npm.cmd run tauri -- dev 使用 com.workmemo.desktop，与正式数据同目录；不要用它进行需要隔离真实记录的验收。命令会先编译 helper 并在 src-tauri/target/debug 准备 profile、extension 和修复入口。

预览开发使用：

~~~powershell
Set-Location 'E:\WorkMemo'
npm.cmd run tauri -- dev --config src-tauri/tauri.preview.conf.json
~~~

预览的数据库为 %LOCALAPPDATA%\com.workmemo.test.monitor\workmemo.sqlite3，外观在 %APPDATA%\com.workmemo.test.monitor。与已发布预览使用相同数据；同一配置只运行一个实例，不要复制真实数据库做测试。

需要单独准备 debug 配套目录时：

~~~powershell
cargo build --locked --manifest-path src-tauri/Cargo.toml --bin workmemo-browser
& .\scripts\prepare-browser-bridge.ps1 -ProfileId 'com.workmemo.test.monitor'
~~~

这只准备组件；启动匹配的预览程序会自动接入，-Register 参数或同目录 Register-Browser.cmd 可直接接入。脚本不能把生产标识的程序转换成预览程序；主程序与 helper 必须使用相同标识。

## Chrome 操作

用户在 chrome://extensions 开启开发者模式，加载当前程序旁 extension，或在软件监测设置点击“打开配套扩展文件夹”。扩展 ID 固定为 oljcealhccdhaddceacnokihjefloaih。原始 browser-extension 可回退识别预览主机，但推荐加载程序旁的配套目录以明确首选配置。

软件监测设置添加工作 URL 与类别，启用保存；扩展显示实际连接版本/标识后同步工作站点授权。需在前台匹配页面有新输入才会开始。扩展不传 URL、标题、页面内容或输入文本，只传规则标识和状态；仅申请 nativeMessaging、alarms 和用户授予的站点权限。

通信仅用动态 127.0.0.1 端口和每次启动随机 token。端点文件不进入发行包、源码或浏览器回复。Chrome 官方协议说明：https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging 。

## 验收与边界

用户此前已确认真实 Chrome 自动开始、离页两分钟暂停。自动测试覆盖计时、回退重连和注册；本轮隔离安装矩阵见 BROWSER-CONNECTION-DELIVERY.md。真实整段 5/7 分钟等待、锁屏/休眠、提醒不抢焦点、四皮肤原生透明仍须在合适时机验收，不中断实际任务或主动锁屏。

断连/权限不足时暂停自动累计，待新页面状态和输入确认；手动暂停不能自动恢复。结束先持久保存，待补全不妨碍下一项工作。第二阶段验收未全部完成，不自动进入灵动岛或其他新功能阶段。
