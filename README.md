<p align="center">
  <img src="public/workmemo.png" width="88" height="88" alt="WorkMemo 图标" />
</p>

<h1 align="center">WorkMemo</h1>

> v0.2.3 源码开发进度：空闲暂停、四类改名、日／周／月分类报表和两套提示音已实现，实际检查及原生验收限制见 [第 2 阶段记录](docs/UPDATE-0.2.3-PHASE-2.md)。Windows 正式成品待下一阶段，下面公开下载仍为 v0.2.2。

<p align="center"><strong>让忙过的一天，有迹可循。</strong></p>
<p align="center">一个安静待在桌面上的工作记录小工具。记下做了什么、花了多久，工作量可以忙完再补。</p>

<p align="center">
  <a href="https://github.com/noharass/WorkMemo/releases/download/v0.2.2/WorkMemo_0.2.2_x64-setup.exe"><strong>下载 Windows 安装版</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/noharass/WorkMemo/releases/download/v0.2.2/WorkMemo_0.2.2_windows_x64.zip">下载免安装 ZIP</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/noharass/WorkMemo/releases/tag/v0.2.2">v0.2.2 更新说明</a>
</p>
<p align="center">Windows 10 / 11 · x64 · 无需注册账号 · 记录保存在本机</p>

---

## 把注意力留给手上的事

有时候，一天下来做了不少事，回头却想不起时间都花在哪里。WorkMemo 想帮你留下一份简单的记录：什么时候开始，真正工作了多久，最后完成了多少。

- **顺手记一段工作**：选好类别就能开始，暂停不计时；数量和备注可以结束后再补。评测、质检、开发、文档都能分开看。
- **让工作页面帮你开表**：配置 Chrome 工作站点并授权后，检测到工作页面和新操作后，先问一句要不要开工。只想看看时选「仅浏览」，等你主动开始。检测和暂停阈值都能自己调整。
- **桌面上少一点打扰**：主窗口关闭后继续在后台运行，状态岛方便看一眼当前计时。Glass、Cream、Dark、Neon 四种皮肤，搭配自己的背景图；想少占些地方，就切到紧凑模式。
- **回头看，也找得到**：在 Chrome 数据中心看趋势、日历与每段工作的明细，补填数量和备注；需要换电脑或整理数据时，可以完整备份。

<p align="center"><img src="docs/assets/themes.svg" alt="Glass、Cream、Dark、Neon 四种皮肤配色" width="1000" /></p>
<p align="center"><sub>四种配色，选一个看着舒服的。</sub></p>

## 第一次用

1. 下载上面的安装版，或把 ZIP **完整解压**后运行 `WorkMemo/workmemo.exe`。不要只拿出主程序。
2. 想先试试，直接选类别，点击「手动开始工作」；结束后到「待补全」填写工作量，填 `0` 也可以。
3. 想用自动记录，打开「监测设置」，按[使用说明](docs/USER-GUIDE.md#使用-chrome-自动记录)装好配套扩展、添加工作网址并同步授权。

自动记录需要 Chrome 配套扩展；手动计时不需要。软件使用 Microsoft WebView2，安装版会在缺少时引导安装。

## 这次更新：多个工作网站，一份连续记录

**v0.2.2** 可以为同一工作添加多个 URL，分别使用路径前缀、整个站点或域名后缀。匹配站点之间切换时保留同一条计时记录；开工仍由你确认，想先看看就选「仅浏览」。

状态岛缩为约 320×56，暂停、继续和开始入口更顺手。新增轻提示音，可在布局设置关闭或试听；四种主题的按钮悬浮反馈也统一调整。

工作总览重新排成响应式网格：桌面左侧趋势、右侧类别与工作节奏；平板和手机自动换排，明细紧接图表。热力图色阶更清楚，趋势底部灰条移除，详情中的「编辑工作量」入口也已修复。

[查看 v0.2.2 下载与更新说明](https://github.com/noharass/WorkMemo/releases/tag/v0.2.2) · [发布校验与实测范围](docs/RELEASE-0.2.2.md)

## 从旧版本过来

更新前请先备份数据、从托盘退出旧版；更新后在 Chrome 扩展页重新加载配套扩展。**正式版与预览版的数据各自独立**：

- 从正式版更新：安装新版，沿用原有正式记录。
- 从预览版迁移：先退出预览版，再到新版「设置 → 数据管理」查看来源和数量，确认后合并；重复导入会跳过，有变化的记录会提示冲突。
- 想回退旧版：保留旧安装包和升级前的数据备份；旧程序不能直接读取新版数据格式。

具体步骤与数据位置见[使用说明](docs/USER-GUIDE.md#升级迁移与回退)。历史预览版仍保留在 [Releases](https://github.com/noharass/WorkMemo/releases)。

## 你的记录，留在你的电脑里

WorkMemo 不需要云账号。工作记录、监测设置、背景图片和备份都保存在本机。数据中心也由本机软件提供，使用期间请保持 WorkMemo 在后台运行。Chrome 扩展只在你授权的工作站点观察页面是否匹配、是否发生操作，不读取输入内容、具体按键或网页正文。

自动记录依赖页面连接和输入活动；阅读、思考时可能少计。遇到连接中断，会暂停无法确认的时间。检测间隔是目标频率，浏览器休眠或系统繁忙时可能延迟。

## 有哪里不顺手，告诉我

欢迎[提一个 Issue](https://github.com/noharass/WorkMemo/issues/new)。描述一下当时做了什么、希望它怎样工作，再附上软件版本和错误提示就好。请不要上传真实工作数据库或私人备注。

[使用说明](docs/USER-GUIDE.md) · [下载与更新](https://github.com/noharass/WorkMemo/releases/latest) · [反馈问题](https://github.com/noharass/WorkMemo/issues)
