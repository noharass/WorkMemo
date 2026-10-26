# WorkMemo 第三阶段：原生透明与窗口操作

日期：2026-10-26（Asia/Shanghai）。本阶段已获用户确认；四种皮肤和透明度设置不在本阶段范围内。

## 1. 本次目标与检查

起点为 839cf7c，main 与 origin/main 一致，工作区干净。阅读了实际 React、Rust、SQLite 服务、Tauri 窗口配置、权限和第二阶段验收记录；基线前端构建通过。

原窗口使用系统标题栏和不透明背景，根节点背景也是实色；只有通过 CSS 改色无法满足原生透明要求。当前有用户的暂停任务，本阶段不结束、不替换该任务，也不修改数据库、迁移、计时或恢复代码。

最小改动是调整原生窗口配置，增加 DesktopWindow 视觉容器与窗口控件，清除根层不透明背景，补充 4 项必要窗口权限；不新增依赖。

## 2. 原生配置与透明层次

- transparent=true，backgroundColor=#00000000，decorations=false；透明是原生窗口及 WebView 的配置，不是只改 CSS。
- shadow=false：避免 Windows 无边框原生阴影带来的 1px 白边；圆角面板使用克制的 CSS 阴影。
- noRedirectionBitmap=true：使用当前 Tauri 支持的 Windows 选项，缓解透明窗口内容绘制前的白闪；未将这一配置当作所有启动场景均无白闪的证明。
- resizable=true，maximizable=false；保留 440×620 初始尺寸、360×500 下限。面向桌面小工具，不提供全屏最大化按钮。
- alwaysOnTop=false，skipTaskbar=false；窗口不会强制置顶，最小化后可通过任务栏恢复，没有启用点击穿透。
- index.html 在样式加载前就为 html/body/#root 设置透明底色，CSS 同样清除这些层及外围容器底色。
- 外围 8px 透明区域保留圆角外桌面，app-shell 使用 88% 不透明度的暖色背景；高可读性卡片使用 94% 背景。文字与可用按钮不使用整体 opacity 降低透明度。
- 内容在 window-content 内滚动，滚动条轨道透明，外层圆角裁切不会因长内容变回矩形白块。新增背景、边框、圆角令牌，为下一阶段主题系统准备。

配置依据：[Tauri 窗口定制](https://v2.tauri.app/learn/window-customization/)、[Windows WebviewWindowBuilder](https://docs.rs/tauri/latest/x86_64-pc-windows-msvc/tauri/webview/struct.WebviewWindowBuilder.html)。Windows 的 WebView 背景要求透明 alpha=0，因此没有将半透明 alpha 放在原生 backgroundColor 中。

## 3. 操作、权限与数据保护

- 标题栏左侧（标志、应用名及空白处）调用 startDragging；标题栏右侧按钮与该区域是兄弟元素，不参与拖动。
- 四边和四角的 8/12px 区域调用 startResizeDragging，范围在外围边缘，不盖住表单和标题栏按钮。
- 最小化调用 minimize，关闭调用 close，不调用 destroy，也不隐藏窗口冒充关闭。沿用第二阶段的 CloseRequested/ExitRequested 保存与失败阻止关闭机制。
- 原生调用失败显示可读错误；浏览器预览中窗口按钮禁用并说明仅桌面可用，避免伪成功。
- 新增权限仅为 core:window:allow-minimize、allow-close、allow-start-dragging、allow-start-resize-dragging，保留原来的事件订阅权限。没有授予通用窗口默认权限、Shell、文件系统或任意 SQL。
- 调整窗口不会创建新的任务或清空 React 业务状态。开发配置更新触发原生重启后，已有暂停任务由 SQLite 原记录恢复，实际读取确认累计时长、数量与备注保留。

## 4. 文件清单与完整代码

完整绝对路径及 NEW FILE / UPDATE 标记见 PHASE-3-FILES.md；本阶段全部变更源码、配置与开发说明的完整内容见 PHASE-3-SOURCE.md。

关系：tauri.conf.json 决定原生透明和边框；capabilities/default.json 为 DesktopWindow.tsx 的 4 类窗口操作授权；index.html 和 App.css 清除各层底色并实现可读圆角面板；App.tsx 只接入容器和刷新工具栏，原业务服务不变。README 与 AGENTS 记录用法和阶段边界。

## 5. 实际验证结果

- TypeScript + Vite 生产构建通过。发现当前 API 声明中的 ResizeDirection 未导出后，改用本地常量集合推导联合类型，没有绕过类型检查或新增依赖。
- 15 项已有业务回归测试全部通过，0 失败；本阶段没有新增重复实现的测试。
- 原生开发窗口已实际重启并加载；可访问性树显示自定义最小化与保存关闭按钮，旧系统标题栏不再出现，并存在原生 TAURI_DRAG_RESIZE_WINDOW 辅助区域。
- 原有暂停任务恢复提示及字段保留已通过原生窗口文字读取确认。未上传用户数据库或工作备注。
- 用户人工确认：「能透出，文字和按钮清楚」。这验证了当前 Windows 上的真实桌面透出和可读性，验证来源是用户反馈，非自动截图。
- 用户人工确认：「三项都正常」，对应拖动标题栏左侧、边缘缩放、最小化后从任务栏恢复。
- 自动原生截图仍超时，未获得原生截图，因此没有生成或用浏览器截图冒充原生透明验收证据。
- 用户人工确认「已关闭，窗口已退出」，随后进程检查确认 WorkMemo 已退出；没有强制结束应用进程。开发服务已清理，系统确认 1420 端口无 TCP 监听。
- Release 构建通过，耗时 2 分 15 秒。产物 E:\WorkMemo\src-tauri\target\release\workmemo.exe 为 6,042,624 字节（约 5.76 MiB），SHA256：5D6D3482090700121F11C4B854625FBAD9D51CDE5DE69DFCBAA7E55358439F07。
- 正式版已独立启动；原生可访问性树的页面 URL 为 http://tauri.localhost/，不是 Vite 地址，自定义标题栏、窗口按钮和任务表单加载正常，没有数据库或权限错误。
- 正式版重新打开后显示准备开始。为避免误判任务丢失，使用只读 SQLite 查询核验：原记录仍存在，已是 FINISHED、结束时间非空、累计时长保留。没有修改数据库。该场景验证了完成记录持久保留，不能视作「未完成任务恢复」的实际关闭测试；未完成任务在本阶段开发窗口重启时的恢复已读取确认，业务自动测试仍全部通过。
- 正式版窗口保留供用户使用。原生自动截图仍不可用，不声称已经自动查看正式版像素或完成全部兼容性验收。

## 6. PowerShell 命令与逐步验收

```powershell
Set-Location 'E:\WorkMemo'
npm ci
npm run build
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
npm run tauri dev
```

构建正式可执行文件：

```powershell
npm run tauri build -- --no-bundle
& 'E:\WorkMemo\src-tauri\target\release\workmemo.exe'
```

不要让开发版和正式版同时操作同一数据目录。人工检查方法及预期：

1. 把窗口移到有明显颜色/图案的桌面或其他窗口上方：圆角外完全透出，半透明面板内可见背后变化，文字与控件清楚。
2. 拖标题栏左侧：窗口移动；点击或编辑类别、数量、备注：正常操作，不触发拖动。
3. 拖四边和四角：窗口缩放，不能小于最小尺寸；展开较长内容后可滚动，不裁掉关闭按钮。
4. 最小化后从任务栏恢复：窗口和原任务保持。
5. 点击保存关闭，再重新打开：正常关闭，不后台假隐藏；未完成任务恢复为暂停，累计与字段保留。
6. 有任务时移动、缩放、最小化再恢复，计时仍由后端累计；窗口操作不能新建/重置任务。
7. 用 Tab 聚焦窗口按钮，按 Enter/空格触发；错误或保存失败时应出现提示。

已实际确认的项目只按上节记录，不将剩余步骤当作已通过。

## 7. 兼容性与边界

本机 Windows 10 x64、WebView2 155。不同 Windows 版本、GPU、远程桌面、高 DPI、多屏边缘和冷启动白闪仍需后续兼容性验收。Windows 截图工具超时是自动验收限制，不能用配置值代替用户真实视觉观察；本阶段已取得用户对透明、可读性和基本窗口操作的反馈。

固定透明度只作用于面板背景，不能在本阶段冒称已完成 Glass/Cream/Dark/Neon 换肤或透明度持久化。没有修改 SQLite 和计时逻辑。正式安装包尚未验收。

## 8. Git 与下一阶段

按用户既定授权，完成检查后提交推送，不强制推送：

```powershell
git add .
git diff --cached --check
git commit -m "feat: add transparent frameless desktop window"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

核对本地与远程 main 一致，并检查工作区。交付后等待用户确认；下一阶段实现统一主题变量、四种预设皮肤与背景透明度设置及持久化。
