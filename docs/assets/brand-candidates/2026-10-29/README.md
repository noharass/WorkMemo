# WorkMemo IP 图标候选 · 2026-10-29

本次目标：为 WorkMemo 设计六张可供选择的角色图标候选。产品依据是项目 README 的“让忙过的一天，有迹可循”和 PRODUCT-SPEC.md 的轻量、本地、可靠、少打扰定位。已检查当前图标位置、主题色与运行进程；本轮只新增设计资源，不操作工作记录或运行中的程序。

使用 [ip-as-logo 技能](https://github.com/s1dashu/ip-as-logo-skill/blob/acb834c717bcd0a487c49732d08397ba280d690b/SKILL.md) 的三方向、每方向两张、左右下角对照流程。技能仓库为 [s1dashu/ip-as-logo-skill](https://github.com/s1dashu/ip-as-logo-skill)，查询到的 main 提交为 `acb834c717bcd0a487c49732d08397ba280d690b`。用户已确认生成本批六张。

生成方式为内置 image_gen，约束写入主提示词；工具未披露底层模型名，不能据此断言具体型号。每张独立生成一次；六个返回结果全部原样保存，没有重试、筛选、改色、裁剪、缩放或其他后处理。提示请求约 1536×1536，实际六张均为原生 1254×1254 PNG。候选配色表记录的是提示词中的指定颜色，并非输出像素的逐色测量。

| 编号 | 方向及产品联系 | 指定构图 | 指定主体颜色 | 指定背景 | 文件 |
| --- | --- | --- | --- | --- | --- |
| A1 | 小水獭：勤快、可靠的记录伙伴 | 左下探出 | 奶油 #F4DFC2、深棕 #503B32 | 青绿 #73A99C | [A1-otter.png](A1-otter.png) |
| A2 | 小水獭：勤快、可靠的记录伙伴 | 右下探出 | 奶油 #F4DFC2、深棕 #503B32 | 青绿 #73A99C | [A2-otter.png](A2-otter.png) |
| B1 | 小猫头鹰：专注观察与工作记忆 | 左下探出 | 薄荷 #B9E3C7、墨绿 #234D42 | 蓝色 #819DBD | [B1-owl.png](B1-owl.png) |
| B2 | 小猫头鹰：专注观察与工作记忆 | 右下探出 | 薄荷 #B9E3C7、墨绿 #234D42 | 蓝色 #819DBD | [B2-owl.png](B2-owl.png) |
| C1 | 水豚：安静陪伴、减少打扰 | 左下探出 | 暖杏 #E7B176、深褐 #65443A | 紫色 #9B8BAF | [C1-capybara.png](C1-capybara.png) |
| C2 | 水豚：安静陪伴、减少打扰 | 右下探出 | 暖杏 #E7B176、深褐 #65443A | 紫色 #9B8BAF | [C2-capybara.png](C2-capybara.png) |

| A1 · 小水獭 | A2 · 小水獭 |
| --- | --- |
| ![A1](A1-otter.png) | ![A2](A2-otter.png) |
| B1 · 小猫头鹰 | B2 · 小猫头鹰 |
| ![B1](B1-owl.png) | ![B2](B2-owl.png) |
| C1 · 水豚 | C2 · 水豚 |
| ![C1](C1-capybara.png) | ![C2](C2-capybara.png) |

完整文件清单（全部 NEW FILE，路径基准 `E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\`）：

- `A1-otter.png`、`A2-otter.png`：A 方向原图。
- `B1-owl.png`、`B2-owl.png`：B 方向原图。
- `C1-capybara.png`、`C2-capybara.png`：C 方向原图。
- `A-otter.json`、`B-owl.json`、`C-capybara.json`：逐张完整提示词、配色、指定角落、尺寸、提供方及保存路径；无省略的提示代码清单。
- `SHA256SUMS.txt`：六张原图的 SHA256。
- `README.md`：本交付说明与预览。

检查范围：核对六个文件存在、PNG 签名、IHDR 尺寸、SHA256 以及三份 JSON 可解析且每份含两个独立提示词。未把创意结果做符合/不符合评级。PNG 可在 Windows 10/11 图片查看器及现代浏览器中打开；本轮尚未生成 ICO、ICNS 或 Tauri 各尺寸资源，因此尚未验收任务栏、托盘和桌面小尺寸效果。应用没有改动，本轮无需启动或构建，也不将既有运行进程视为本轮启动测试通过。

PowerShell 查看及复核：

```powershell
Set-Location -LiteralPath 'E:\WorkMemo'
$candidateDir = 'E:\WorkMemo\docs\assets\brand-candidates\2026-10-29'
Invoke-Item -LiteralPath (Join-Path $candidateDir 'A1-otter.png')
Get-ChildItem -LiteralPath $candidateDir -Filter '*.png' | Get-FileHash -Algorithm SHA256
Get-Content -LiteralPath (Join-Path $candidateDir 'SHA256SUMS.txt')
Get-Content -LiteralPath (Join-Path $candidateDir 'A-otter.json') -Raw | ConvertFrom-Json
```

预期：图片查看器打开 A1；六张文件的摘要与 SHA256SUMS.txt 对应一致；JSON 显示两个候选及完整提示词。选择方案可直接使用 A1、A2、B1、B2、C1、C2 编号。更换成品图标属于选定后的后续步骤。

本轮 Git 操作限定此新增目录，保留工作区其他开发中的修改：

```powershell
git fetch origin main
git add -- docs/assets/brand-candidates/2026-10-29
git diff --cached --check
git diff --cached --stat
git commit -m "design: add six WorkMemo mascot icon candidates"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```
