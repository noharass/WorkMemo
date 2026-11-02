# WorkMemo 提示音素材

来源：[Kenney Interface Sounds 1.0](https://kenney.nl/assets/interface-sounds)，作者 Kenney；[作者在 OpenGameArt 的同包页面](https://opengameart.org/content/interface-sounds)也标明 CC0。原始许可全文保存在 `source/LICENSE.txt`，第三方许可收集脚本会将其附入分发许可。

原始下载 ZIP SHA256：`f2193d072726d6758a5f7871b2dcc54dcce0d5c35c6f0a62f92549b327c81232`。仓库只保存实际用到的十个原始 OGG，不把整包或联网下载作为构建依赖。

| 套装 | 状态 | 原始 OGG | 分发 WAV | 时长 |
| --- | --- | --- | --- | --- |
| 柔和 | 开始 | confirmation_002 | start.wav | 539ms |
| 柔和 | 暂停 | minimize_001 | pause.wav | 258ms |
| 柔和 | 恢复 | maximize_001 | resume.wav | 258ms |
| 柔和 | 结束 | confirmation_001 | end.wav | 290ms |
| 柔和 | 空闲提醒 | question_001 | warning.wav | 491ms |
| 清脆 | 开始 | glass_001 | crisp/start.wav | 276ms |
| 清脆 | 暂停 | back_002 | crisp/pause.wav | 68ms |
| 清脆 | 恢复 | select_002 | crisp/resume.wav | 40ms |
| 清脆 | 结束 | confirmation_004 | crisp/end.wav | 490ms |
| 清脆 | 空闲提醒 | question_002 | crisp/warning.wav | 333ms |

处理：裁去静音、重采样为 22050Hz 单声道 16-bit PCM、统一响度和峰值、淡入 5ms／淡出 40ms，柔和套装另做 2800Hz 低通。每条最长 850ms；实际时长及源文件、分发文件 SHA256 见 `manifest.json`。没有将素材称作原创音效。

普通构建直接嵌入已保存的 WAV，无需音频解码器或 Python。仅编辑音效时，可用本机已有 Playwright／Edge 执行离线素材生成：

```powershell
Set-Location 'E:\WorkMemo'
$env:WORKMEMO_PLAYWRIGHT='C:/path/to/playwright/index.mjs'
node .\scripts\prepare-sounds.mjs
```

此脚本在离线浏览器 AudioContext 中解码原始 OGG，生成同一格式的 WAV 与摘要；不播放声音、不下载素材、不修改系统音量。

## v0.2.7 默认：FiftySounds

默认套装为 FiftySounds Menu / Interface。开始 Notification（sfx-menu1）、暂停 Menu（sfx-menu3）、恢复 Interface（sfx-menu2）、结束 Confirmation（sfx-menu6）、空闲提醒 Alert（sfx-menu5）。来源、处理后 WAV 和原始 MP3 摘要保存在 `fiftysounds/manifest.json`，许可说明见 `fiftysounds/LICENSE.txt`。旧 Kenney 两套仍可选回。

五个原始 ZIP 来自 `https://www.fiftysounds.com/music/sfx-menuN.zip`（N 为 1、2、3、5、6），本地原始下载保存在被忽略的 `artifacts/0.2.7/audio-source`，不作为独立素材库发布。解压相应 MP3 后可执行：

```powershell
node scripts/prepare-fiftysounds.mjs
```

作者工具使用现有 Playwright 解码，无新增运行依赖。处理为 22050Hz 单声道 16-bit PCM，目标 RMS 0.1、峰值不超过 0.45，淡入 5ms／淡出 40ms，最多 850ms；记录裁切处理，不声称完整播放原始文件。日常构建只嵌入已处理 WAV，无需联网或解码器。
