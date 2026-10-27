# 第二阶段完整文件清单

状态为 NEW FILE 或 UPDATE。所有路径为绝对路径；没有包含依赖、产物、测试配置、数据库或运行时端点校验文件。

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\README.md |
| NEW FILE | E:\WorkMemo\browser-extension\background.js |
| NEW FILE | E:\WorkMemo\browser-extension\bridge-config.js |
| NEW FILE | E:\WorkMemo\browser-extension\manifest.json |
| NEW FILE | E:\WorkMemo\browser-extension\matching.js |
| NEW FILE | E:\WorkMemo\browser-extension\popup.css |
| NEW FILE | E:\WorkMemo\browser-extension\popup.html |
| NEW FILE | E:\WorkMemo\browser-extension\popup.js |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2-FILES.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2-SOURCE.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2.md |
| UPDATE | E:\WorkMemo\docs\AUTO-TRACKING-SPEC.md |
| NEW FILE | E:\WorkMemo\docs\BROWSER-BRIDGE.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| NEW FILE | E:\WorkMemo\scripts\prepare-browser-bridge.ps1 |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.lock |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.toml |
| UPDATE | E:\WorkMemo\src-tauri\build.rs |
| UPDATE | E:\WorkMemo\src-tauri\capabilities\default.json |
| NEW FILE | E:\WorkMemo\src-tauri\migrations\003_monitoring.sql |
| NEW FILE | E:\WorkMemo\src-tauri\src\bin\workmemo-browser.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\browser_bridge.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\browser_protocol.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\clock.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\database.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\database_tests.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\desktop.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\history_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\lib.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\main.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\monitor.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\native_activity.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\service.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\settlement.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\tracking.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\tracking_tests.rs |
| NEW FILE | E:\WorkMemo\src-tauri\tests\browser_host.rs |
| UPDATE | E:\WorkMemo\src\App.css |
| UPDATE | E:\WorkMemo\src\App.tsx |
| UPDATE | E:\WorkMemo\src\DesktopWindow.tsx |
| NEW FILE | E:\WorkMemo\src\MonitoringSettings.tsx |
| NEW FILE | E:\WorkMemo\src\NotificationApp.tsx |
| UPDATE | E:\WorkMemo\src\SettlementPanel.tsx |
| UPDATE | E:\WorkMemo\src\main.tsx |
| UPDATE | E:\WorkMemo\src\types.ts |
| UPDATE | E:\WorkMemo\src\useWorkSession.ts |
| UPDATE | E:\WorkMemo\src\workView.ts |
| NEW FILE | E:\WorkMemo\tests\browser-extension.test.mjs |

文件关系：003_monitoring.sql 管理兼容迁移；monitor.rs/tracking.rs 负责纯业务时限与状态；native_activity.rs 提供 Windows 元数据；browser_protocol.rs/browser_bridge.rs 与独立原生主机构成本机通信；desktop.rs/service.rs/lib.rs 接窗口、托盘与命令；browser-extension 为配套 Chrome 扩展；React 设置与提醒界面连接实际后端；测试在隔离数据和独立进程中执行；prepare-browser-bridge.ps1 准备和注册指定配置；阶段文档记录结果与限制。

完整代码在项目原文件及 AUTO-TRACKING-PHASE-2-SOURCE.md。汇编不递归收录自身，其余本清单文本完整收录。
