<p align="center">
  <img src="public/workmemo.png" width="88" height="88" alt="WorkMemo 图标" />
</p>

<h1 align="center">WorkMemo</h1>

<p align="center"><strong>让忙过的一天，有迹可循。</strong></p>
<p align="center">一个安静待在桌面上的工作记录小工具。记下做了什么、花了多久，工作量可以忙完再补。</p>

<p align="center">
  <a href="https://github.com/noharass/WorkMemo/releases/download/v0.2.9/WorkMemo_0.2.9_x64-setup.exe"><strong>下载 Windows 安装版</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/noharass/WorkMemo/releases/download/v0.2.9/WorkMemo_0.2.9_windows_x64.zip">下载免安装 ZIP</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/noharass/WorkMemo/releases/tag/v0.2.9">v0.2.9 更新说明</a>
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
2. 想先试试，点击「新建任务」，选择类别后点击「开始工作」；结束后到「待补全」填写工作量，填 `0` 也可以。
3. 想用自动记录，打开「监测设置」，按[使用说明](docs/USER-GUIDE.md#使用-chrome-自动记录)装好配套扩展、添加工作网址并同步授权。

自动记录需要 Chrome 配套扩展；手动计时不需要。软件使用 Microsoft WebView2，安装版会在缺少时引导安装。

## 这次更新：灵动岛默认收起与任务入口修复

**v0.2.9** 在 0.2.8 的页面任务与多任务列表基础上，包含灵动岛默认收起、仅浏览下新建／重新绑定入口修复。切换标签和新提醒只更新短文字及静态圆点，点击箭头才展开，补填草稿保留。保留页面间自动切换、分类待补填、工时占比和原有四皮肤。

主窗、设置、状态岛和网页统一轻透明控件，减少重复说明并补齐卡片圆角。四皮肤新默认不透明度为 65%，可选 40–100%；已有透明度保持。修正灵动岛首次展开的原生区域更新，以及网页导航提示随滚动晃动的问题。

默认提示音为 FiftySounds；保留静音及旧柔和／清脆选择。数据库沿用 0.2.8 的 schema 10；此前 0.2.7 的同版本修订与历史下载继续保留。更新前请备份，原始 schema 9 程序不能直接读取升级后的数据。Windows 原生透明、区域点击、焦点和系统 DPI 验收仍有工具限制，详见发布记录。

[查看 v0.2.9 下载与更新说明](https://github.com/noharass/WorkMemo/releases/tag/v0.2.9) · [本次构建校验与验收限制](docs/RELEASE-0.2.9.md)

完整实现保留在 [0.2.7 第一阶段](docs/UPDATE-0.2.7-PHASE-1.md) 与 [反馈修订](docs/FIX-0.2.7-FEEDBACK.md)。旧版下载和阶段记录继续保留。

## 从旧版本过来

更新前请先备份数据、从托盘退出旧版；更新后在 Chrome 扩展页重新加载配套扩展。**正式版与预览版的数据各自独立**：

- 从正式版更新：安装新版，沿用原有正式记录。
- 从预览版迁移：先退出预览版，再到新版「设置 → 数据管理」查看来源和数量，确认后合并；重复导入会跳过，有变化的记录会提示冲突。
- 想回退旧版：保留旧安装包和升级前的记录、设置备份；旧版可能无法读取新的音效、透明度设置或数据库格式。

具体步骤与数据位置见[使用说明](docs/USER-GUIDE.md#升级迁移与回退)。历史预览版仍保留在 [Releases](https://github.com/noharass/WorkMemo/releases)。

## 你的记录，留在你的电脑里

WorkMemo 不需要云账号。工作记录、监测设置、背景图片和备份都保存在本机。数据中心也由本机软件提供，使用期间请保持 WorkMemo 在后台运行。Chrome 扩展只在你授权的工作站点观察页面是否匹配、是否发生操作，不读取输入内容、具体按键或网页正文。

自动记录依赖页面连接和输入活动；阅读、思考时可能少计。遇到连接中断，会暂停无法确认的时间。检测间隔是目标频率，浏览器休眠或系统繁忙时可能延迟。

## 有哪里不顺手，告诉我

欢迎[提一个 Issue](https://github.com/noharass/WorkMemo/issues/new)。描述一下当时做了什么、希望它怎样工作，再附上软件版本和错误提示就好。请不要上传真实工作数据库或私人备注。

[使用说明](docs/USER-GUIDE.md) · [下载与更新](https://github.com/noharass/WorkMemo/releases/latest) · [反馈问题](https://github.com/noharass/WorkMemo/issues)
