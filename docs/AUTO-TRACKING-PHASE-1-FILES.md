# 自动记录第一阶段完整文件清单

所有文件均位于 E:\WorkMemo。NEW FILE 表示新增，UPDATE 表示更新。构建产物、隔离配置与用户数据库未列入源码交付。

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\README.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1-FILES.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1-SOURCE.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-SPEC.md |
| UPDATE | E:\WorkMemo\docs\PRODUCT-SPEC.md |
| NEW FILE | E:\WorkMemo\src-tauri\migrations\002_settlement.sql |
| UPDATE | E:\WorkMemo\src-tauri\src\appearance_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\database.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\database_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\history.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\history_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\lib.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\reliability_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\service.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\settlement.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\settlement_tests.rs |
| UPDATE | E:\WorkMemo\src\App.css |
| UPDATE | E:\WorkMemo\src\App.tsx |
| UPDATE | E:\WorkMemo\src\HistoryPanel.tsx |
| NEW FILE | E:\WorkMemo\src\SettlementPanel.tsx |
| UPDATE | E:\WorkMemo\src\WorkForm.tsx |
| UPDATE | E:\WorkMemo\src\history.ts |
| UPDATE | E:\WorkMemo\src\types.ts |
| UPDATE | E:\WorkMemo\src\useWorkSession.ts |
| UPDATE | E:\WorkMemo\src\workInput.ts |
| UPDATE | E:\WorkMemo\src\workView.ts |
| UPDATE | E:\WorkMemo\tests\history.test.mjs |
| UPDATE | E:\WorkMemo\tests\workflow.test.mjs |

文件关系：002_settlement.sql 管理兼容迁移；database.rs 管理计时及区间事务；settlement.rs 管理待补全与审计；service.rs/lib.rs 注册命令；types.ts、useWorkSession.ts 与表单/待补全面板连接真实服务；history.rs/HistoryPanel.tsx 使用相同结算统计口径；测试覆盖迁移、事务、恢复和前端校验；规范与阶段文档记录确认边界和实际结果。

完整代码在项目原文件及 AUTO-TRACKING-PHASE-1-SOURCE.md。源码汇编不递归包含自身；本清单明确列出该生成文档。
