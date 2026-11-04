# 未结束任务列表调整

2026-11-04。按反馈在主窗口与灵动岛展开区显示所有已有记录且未结束的任务，包括当前计时、暂停及待恢复任务。结束任务及尚未开工的默认绑定不显示；名称和类别相同时只展示一次。任务多时在列表内滚动，保留键盘焦点。点击继续复用 Rust 原子切换接口，通过现有命令队列禁止重复提交；灵动岛填写工作量期间隐藏列表以保护草稿。列表随快照更新，读取失败显示错误并保留上次结果。

## 文件与完整源码

完整代码保存在以下项目文件，无另存或省略实现。

NEW FILE：
- `E:\WorkMemo\src\TaskList.tsx`
- `E:\WorkMemo\docs\TASK-LIST-UPDATE.md`

UPDATE：
- `E:\WorkMemo\src\App.tsx`
- `E:\WorkMemo\src\NotificationApp.tsx`
- `E:\WorkMemo\src\App.css`
- `E:\WorkMemo\src\useWorkSession.ts`
- `E:\WorkMemo\scripts\desktop-fixture.mjs`
- `E:\WorkMemo\scripts\verify-page-task-ui.mjs`
- `E:\WorkMemo\docs\PHASE-8.md`

DELETE：`E:\WorkMemo\src\SuspendedTasks.tsx`，由共享 TaskList 替代。

## 检查与复查

Node 57 项与 TypeScript / Vite 生产构建通过。隔离浏览器回归覆盖新页面、结束任务重绑、暂停任务继续，以及主窗/岛内八任务展示和切换、360px 窄屏无横向溢出。截图为 `E:\WorkMemo\artifacts\page-tasks\qa\main-tasks.png` 与 `island-tasks.png`。本阶段未执行新的 Windows 原生验证；浏览器夹具不代表原生区域点击验收。

PowerShell（在 `E:\WorkMemo`）：

```powershell
npm test
npm run build
# 另一个终端启动：npx vite preview --host 127.0.0.1 --port 1423 --strictPort
$env:WORKMEMO_PLAYWRIGHT='C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_UI_URL='http://127.0.0.1:1423/'
node scripts/verify-page-task-ui.mjs
git diff --check
git diff --cached --stat
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

预期测试通过，展开任务列表后可继续指定任务，原任务变为暂停。数据库 schema、权限、运行依赖及版本号无变化，沿用 0.2.8 后端。本次为源码阶段，完成后等待确认再打包发布。
