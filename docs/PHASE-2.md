# WorkMemo 第二阶段：持久化与可靠计时

日期：2026-10-26（Asia/Shanghai）。本阶段已获用户确认；不自动进入第三阶段。

## 1. 目标与现有工程检查

开始时 main 与 origin/main 一致，工作区干净，提交为 22cfacc。检查了 React、Rust、Tauri 配置、权限与第一阶段验收记录；前端基线生产构建通过。原工程只有 app_info 连接检查，没有数据库、任务或计时实现，没有需要迁移的已发现业务数据。

最小改动是新增 SQLite 状态机、单调时钟与 Tauri 服务，接入基础表单和任务操作。不改窗口透明或无边框配置，不新增前端依赖，保留 app_info 与重新检查功能。

## 2. 业务规则与实现

- 类别固定为评测、质检、开发、文档；数量支持正小数，最大 10 亿。前后端分别校验，后端还拒绝非有限数值。备注最多 2000 个 Unicode 码点，保存时去除两端空白。
- 保留 id、category、quantity、remark、start_time、end_time、duration_seconds、status；新增 duration_ms、is_paused、recovery_pending。时间戳用 Unix 毫秒，界面按本机时区显示；毫秒累计，秒数向下取整。
- WORKING + is_paused=false 表示工作中，WORKING + is_paused=true 表示暂停。无活动记录时界面显示准备开始，对应 NOT_STARTED；不提前保存空白记录。
- SQLite 唯一部分索引确保只有一个 WORKING 记录。Mutex 串行化同一进程命令，Windows 文件独占锁阻止第二个进程恢复或覆盖首个进程的任务。
- 工作中禁止开始新任务；暂停后开始新任务，将旧任务结束和新任务插入放在一个 IMMEDIATE 事务中。任何一步失败都会回滚。
- 暂停/继续保留同一个 id 与累计毫秒；重复命令不重复累计。操作携带任务 id，旧页面的操作不能误改新任务。
- Rust 使用 Instant 的单调时间计算有效时长，不靠前端逐秒累加。前端每秒读取后端快照，失焦不停止后端计时，重新聚焦立即刷新。旧的读取响应不能覆盖较新的操作结果。
- 后台线程每秒尝试落盘，与窗口是否可见无关。正常关闭先保存并暂停；保存失败时阻止关闭并反馈错误。此关闭路径已接入代码，真实窗口关闭场景仍须人工验收。
- 启动时把未完成任务恢复为暂停，保留原记录和最后检查点，并显示恢复提示。停机时间不算工作；异常退出至最后成功检查点之间的时长可能丢失，受调度和磁盘影响，不能保证严格小于一秒。
- 系统日期时间跳变不改变有效时长。结束时间在时钟回退时取当前时间与开始时间的较大值，避免结束时间早于开始时间；有效时长仍以单调时间为准。
- 结束后显示最近 5 条真实记录，数据来自 SQLite。完整历史查询、删除、统计仍在后续阶段。

## 3. 存储与依赖

仅新增 Rust 直接依赖 rusqlite 0.41（bundled），由已安装的 MSVC 编译内置 SQLite；无需用户另装 SQLite。Cargo.lock 固定依赖。事务与错误处理遵循 [rusqlite Connection 文档](https://docs.rs/rusqlite/0.41.0/rusqlite/struct.Connection.html)。

通过 [Tauri PathResolver](https://docs.rs/tauri/latest/tauri/path/struct.PathResolver.html#method.app_local_data_dir) 定位本地应用数据目录。默认 Windows 路径为 `%LOCALAPPDATA%\com.workmemo.desktop\workmemo.sqlite3`，不把数据库放到仓库或安装目录。

使用 WAL、synchronous=FULL、2 秒 busy timeout。SQL 约束校验数量、类别、备注长度、状态、时长一致性和结束时间。迁移文件 001_initial.sql 在事务中创建结构并设置 user_version=1；遇到更高版本拒绝打开，不重建或清空原有表。

备份必须考虑 WAL 一致性。第一版尚无导出入口，运行时不要单独拷贝或删除 -wal/-shm。外观设置尚未实现，不与业务记录混存。

仅增加 core:event:allow-listen 与 core:event:allow-unlisten，用于接收保存失败通知。没有向前端开放通用文件系统、SQL、Shell 或任意网络访问权限。

## 4. 文件与完整代码

完整绝对路径与 NEW FILE / UPDATE 标记见 PHASE-2-FILES.md；所有变更源码与配置的完整内容见 PHASE-2-SOURCE.md，依赖锁文件保存在原路径。第一阶段源码文档保留为历史快照，不再表示当前实现。

关系：clock.rs 提供时钟，database.rs 负责业务和存储，service.rs 管理 Tauri 调用、后台检查点和关闭事件，lib.rs 注册服务。React 的 useWorkSession.ts 管理服务快照与操作，WorkForm.tsx 处理输入，App.tsx 组合界面，ConnectionPanel.tsx 保留原连接检查。

## 5. 实际验证结果

- 基线与变更后的 npm run build：通过 TypeScript 检查和 Vite 生产构建。
- cargo fmt 检查：通过（最终交付前再次核验）。
- cargo test --locked：15 项业务测试全部通过，0 失败。使用可控时钟和独立临时 SQLite 文件，不向用户业务数据库插入测试记录。
- 覆盖：非法输入；暂停不计时及小数秒；时钟前跳/回退与无前端刷新间隔；单活动任务；暂停切换；切换失败回滚；重复操作；旧任务 id 防误操作；检查点恢复；正常关闭业务保存逻辑；写入失败重试；新版本数据库及已有数据保护；重复检查点；非法切换；Windows 第二实例锁。
- 这些恢复测试是真实 SQLite 文件的关闭/重开和业务关闭逻辑测试，未做实际断电、磁盘故障或系统时间修改实验。
- 原生开发构建启动通过；读取原生窗口可访问性文字，确认任务表单已加载、开始按钮可用，未显示数据库初始化错误。
- 原生截图接口仍报告 FrameArrived timed out；因此视觉布局、鼠标点击、拖动、缩放与完整窗口关闭流程尚未标记为通过。
- 最终文案修改后的 Release 构建通过，命令为 npm run tauri build -- --no-bundle。原生开发版本启动、读取数据库已验证；正式版独立启动尚未验收。
- Release 文件为 E:\WorkMemo\src-tauri\target\release\workmemo.exe，6,036,992 字节（约 5.76 MiB），SHA256 为 0441EEB4546CFD8F098FB71BDBAA8A58A9DC8398419DB10D251D299B2EC362C4。
- 关闭空闲开发窗口前，工具检测到用户正在操作该窗口，停止了自动输入。没有强制结束用户窗口，因此没有为独立启动测试关闭开发版或释放其数据库锁。

## 6. PowerShell 命令与人工测试

```powershell
Set-Location 'E:\WorkMemo'
npm ci
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm run build
npm run tauri dev
```

构建并启动正式可执行文件：

```powershell
npm run tauri build -- --no-bundle
& 'E:\WorkMemo\src-tauri\target\release\workmemo.exe'
```

不要同时打开开发版与正式版操作同一数据库。已经打开一个窗口时，后打开的窗口应显示数据锁错误，不能改变原任务；关闭后打开的窗口，使用原窗口。

人工测试步骤与预期（未执行部分不视为通过）：

1. 不选类别或数量为 0，点击开始，显示简短错误且不创建记录。
2. 选择开发，数量 2.5，填写备注，开始后时间增长，数量与备注保留。
3. 工作约 5 秒后暂停，等待约 10 秒，计时不增长；继续约 5 秒后结束，累计应约 10 秒，最近记录出现该项。
4. 暂停一项任务，展开「开始另一项工作」并填写有效输入；旧记录结束保存，新任务从零开始。无效输入不得结束旧项。
5. 有未完成任务时正常关闭，再打开，原任务恢复为暂停，数量、备注、id 与累计时长保留；确认后继续。
6. 重新打开后展开最近记录，已完成记录仍在。没有记录时显示空状态，不显示虚构统计。
7. 运行期间移动、缩放、失焦后返回，按钮应可用，重新读取的计时应与后端一致。
8. 若出现保存错误，显示失败信息，不能显示虚假的保存成功；关闭失败提示应使窗口保持打开。

## 7. 兼容性与边界

面向 Windows 10 x64；多实例独占锁仅在 Windows 启用，其他系统未纳入本阶段支持范围。睡眠/唤醒、多屏、高 DPI、实际强制终止和断电仍需专门验收。应用关闭期间选择不补计工作，避免将停机时间误算。数据库初始化错误需排查后重新打开；暂时读写错误可刷新重试。

当前没有修改原生透明配置，也没有实现换肤、完整历史删除与统计。启动、业务单元测试和构建结果不代替完整第一版验收。

## 8. Git 与下一阶段

按用户授权，在检查通过后提交并推送 origin/main，不强制推送。提交与推送命令：

```powershell
git add .
git diff --cached --check
git commit -m "feat: add persistent work sessions and reliable timing"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

推送后比较本地与远程提交标识并检查工作区。本阶段结束后等待用户确认，下一阶段建议实现原生透明窗口、无边框与拖动区域。
