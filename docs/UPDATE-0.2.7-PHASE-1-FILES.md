# 0.2.7 第一阶段完整文件清单

项目根路径：E:\WorkMemo。UPDATE 为已有文件，NEW FILE 为本轮新增；原有未跟踪规划不在清单内。

| 状态 | 完整路径 | 用途 |
| --- | --- | --- |
| UPDATE | `E:\WorkMemo\README.md` | 文档／完整许可 |
| UPDATE | `E:\WorkMemo\docs\BUILDING.md` | 文档／完整许可 |
| UPDATE | `E:\WorkMemo\docs\PHASE-8.md` | 文档／完整许可 |
| UPDATE | `E:\WorkMemo\docs\THIRD-PARTY-LICENSES.txt` | 文档／完整许可 |
| NEW FILE | `E:\WorkMemo\docs\UPDATE-0.2.7-PHASE-1-FILES.md` | 文档／完整许可 |
| NEW FILE | `E:\WorkMemo\docs\UPDATE-0.2.7-PHASE-1-SOURCE.md` | 文档／完整许可 |
| NEW FILE | `E:\WorkMemo\docs\UPDATE-0.2.7-PHASE-1.md` | 文档／完整许可 |
| UPDATE | `E:\WorkMemo\scripts\collect-licenses.mjs` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\scripts\dashboard-fixture.mjs` | 源码／素材信息／验收脚本 |
| NEW FILE | `E:\WorkMemo\scripts\desktop-fixture.mjs` | 源码／素材信息／验收脚本 |
| NEW FILE | `E:\WorkMemo\scripts\prepare-fiftysounds.mjs` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\scripts\verify-v025-followup.mjs` | 源码／素材信息／验收脚本 |
| NEW FILE | `E:\WorkMemo\scripts\verify-v027-island.mjs` | 源码／素材信息／验收脚本 |
| NEW FILE | `E:\WorkMemo\scripts\verify-v027-visual.mjs` | 源码／素材信息／验收脚本 |
| NEW FILE | `E:\WorkMemo\scripts\verify-v027-web.mjs` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\scripts\verify-web-ui.mjs` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src-tauri\sounds\README.md` | 源码／素材信息／验收脚本 |
| NEW FILE | `E:\WorkMemo\src-tauri\sounds\fiftysounds\LICENSE.txt` | 源码／素材信息／验收脚本 |
| NEW FILE | `E:\WorkMemo\src-tauri\sounds\fiftysounds\end.wav` | 静态提示音 |
| NEW FILE | `E:\WorkMemo\src-tauri\sounds\fiftysounds\manifest.json` | 源码／素材信息／验收脚本 |
| NEW FILE | `E:\WorkMemo\src-tauri\sounds\fiftysounds\pause.wav` | 静态提示音 |
| NEW FILE | `E:\WorkMemo\src-tauri\sounds\fiftysounds\resume.wav` | 静态提示音 |
| NEW FILE | `E:\WorkMemo\src-tauri\sounds\fiftysounds\start.wav` | 静态提示音 |
| NEW FILE | `E:\WorkMemo\src-tauri\sounds\fiftysounds\warning.wav` | 静态提示音 |
| UPDATE | `E:\WorkMemo\src-tauri\src\appearance.rs` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src-tauri\src\appearance_tests.rs` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src-tauri\src\sound.rs` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src-tauri\src\windows.rs` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src\App.css` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src\Dashboard.css` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src\Dashboard.tsx` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src\IslandExpansion.tsx` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src\NotificationApp.tsx` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src\SettingsExtras.tsx` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src\desktopPreferences.tsx` | 源码／素材信息／验收脚本 |
| NEW FILE | `E:\WorkMemo\src\islandRegion.ts` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src\themes.ts` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src\ui\BottomSheet.tsx` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\src\ui\UiProvider.tsx` | 源码／素材信息／验收脚本 |
| NEW FILE | `E:\WorkMemo\tests\island-region.test.mjs` | 源码／素材信息／验收脚本 |
| UPDATE | `E:\WorkMemo\tests\themes.test.mjs` | 源码／素材信息／验收脚本 |

二进制 WAV SHA256：

- `E:\WorkMemo\src-tauri\sounds\fiftysounds\end.wav`：`bb8f0936af5ef8ef87ddf34ac636ad8e387b351714b4a92a16d954b6de6056e1`
- `E:\WorkMemo\src-tauri\sounds\fiftysounds\pause.wav`：`66a0c3fb8f3c29bb4a84a61445c3e27d43d68abc0d849661a582e2a7915b5637`
- `E:\WorkMemo\src-tauri\sounds\fiftysounds\resume.wav`：`132ae0addcbf3e6a705e3c046ec730c953aa12e046a8f858a943eb9c8ed95ee8`
- `E:\WorkMemo\src-tauri\sounds\fiftysounds\start.wav`：`8d9620cedb3cbdab9126b53c11c9246cde15561dad05896a8fe7aa7ae229aae0`
- `E:\WorkMemo\src-tauri\sounds\fiftysounds\warning.wav`：`897969ee4a6738bf052aa770bc565a6610d5693bd0c399ca79befcedb54a0a39`

隔离截图、测试数据库、原始下载及 Windows debug EXE 在 E:\WorkMemo\artifacts\0.2.7，不提交 Git。完整可执行源码见 UPDATE-0.2.7-PHASE-1-SOURCE.md；文档与完整第三方许可在上表原路径。
