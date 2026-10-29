# v0.2.3 第 2 阶段完整文件清单

相对于起点 d462b5c。产物、原始 ZIP、截图、试听合辑及用户数据库不提交；既有未跟踪规划文件保留。

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\.gitattributes |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| UPDATE | E:\WorkMemo\docs\THIRD-PARTY-LICENSES.txt |
| NEW FILE | E:\WorkMemo\docs\UPDATE-0.2.3-PHASE-2-FILES.md |
| NEW FILE | E:\WorkMemo\docs\UPDATE-0.2.3-PHASE-2-SOURCE.md |
| NEW FILE | E:\WorkMemo\docs\UPDATE-0.2.3-PHASE-2.md |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md |
| UPDATE | E:\WorkMemo\scripts\collect-licenses.mjs |
| NEW FILE | E:\WorkMemo\scripts\prepare-sounds.mjs |
| UPDATE | E:\WorkMemo\scripts\verify-ui-022.mjs |
| UPDATE | E:\WorkMemo\scripts\verify-v023-phase1.mjs |
| NEW FILE | E:\WorkMemo\scripts\verify-v023-phase2.mjs |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\README.md |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\crisp\end.wav |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\crisp\pause.wav |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\crisp\resume.wav |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\crisp\start.wav |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\crisp\warning.wav |
| UPDATE | E:\WorkMemo\src-tauri\sounds\end.wav |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\manifest.json |
| UPDATE | E:\WorkMemo\src-tauri\sounds\pause.wav |
| UPDATE | E:\WorkMemo\src-tauri\sounds\resume.wav |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\LICENSE.txt |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\back_002.ogg |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\confirmation_001.ogg |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\confirmation_002.ogg |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\confirmation_004.ogg |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\glass_001.ogg |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\maximize_001.ogg |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\minimize_001.ogg |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\question_001.ogg |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\question_002.ogg |
| NEW FILE | E:\WorkMemo\src-tauri\sounds\source\select_002.ogg |
| UPDATE | E:\WorkMemo\src-tauri\sounds\start.wav |
| UPDATE | E:\WorkMemo\src-tauri\sounds\warning.wav |
| UPDATE | E:\WorkMemo\src-tauri\src\data_center.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\report_periods.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\report_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\service.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\sound.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\tracking_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\windows.rs |
| UPDATE | E:\WorkMemo\src\App.css |
| UPDATE | E:\WorkMemo\src\Dashboard.css |
| UPDATE | E:\WorkMemo\src\Dashboard.tsx |
| UPDATE | E:\WorkMemo\src\SettingsExtras.tsx |
| UPDATE | E:\WorkMemo\src\desktopPreferences.tsx |
| NEW FILE | E:\WorkMemo\src\reportPeriod.ts |
| NEW FILE | E:\WorkMemo\tests\report-period.test.mjs |

## 二进制素材摘要

原始许可全文保留在原路径；每个 OGG 和 WAV 的来源映射及处理说明见 sounds/manifest.json。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| src-tauri/sounds/crisp/end.wav | 21670 | ecda546a157f298d52ab3105a682c63b35879d00fea21517b3c0955b2709b450 |
| src-tauri/sounds/crisp/pause.wav | 3052 | 1934a71d3d71dc25273e62d6754e37bb8037a019462ebe13523f7a89417ee7c0 |
| src-tauri/sounds/crisp/resume.wav | 1824 | 6cce61ab41c1a230a1bce8f06d69f336c626dfa97a71f490160b6b31f26fb7bb |
| src-tauri/sounds/crisp/start.wav | 12194 | 33d9332f89076fd1832900e42fe17069a732d2bf31a562deadc76dce7917eb99 |
| src-tauri/sounds/crisp/warning.wav | 14708 | 8fffe9b384395bb039ab29ad60dccdba8b3129c6a2613f50d91768521224bdf7 |
| src-tauri/sounds/end.wav | 12826 | 80f847ad6e60ecc58a09fd9d88a645c729d7c92c31ce7510438c48848c5d6a98 |
| src-tauri/sounds/pause.wav | 11438 | 42ae833612216eb4156daa773554f49d5672cfb5061ceb9238e64abcf5e01043 |
| src-tauri/sounds/resume.wav | 11438 | cd910613dbe73a1a578a37dd14228c195309b8b4e7ef827ffd9678e164030c06 |
| src-tauri/sounds/source/back_002.ogg | 7029 | 61581c58194e3f19f531072edabbc344204c7e0a2887b8ededce4357bcf09195 |
| src-tauri/sounds/source/confirmation_001.ogg | 8968 | 063564703b6094d70718a3e787a55cc9141611e4ecd6b6637f8828f79b4a8c3a |
| src-tauri/sounds/source/confirmation_002.ogg | 14169 | 33b17a9a9a2397c62b285c52c33a907fdffb476909c99e42dde603f6a7a8b12c |
| src-tauri/sounds/source/confirmation_004.ogg | 12391 | 568967a3d9f8a8f6af54ea01729c4882284308f2a27d78c07ffd7ee0d6951661 |
| src-tauri/sounds/source/glass_001.ogg | 6103 | 183eebee20eb0a532b0b85104d139cbf2673eb66d95c3cc733ac9ea98362e7e8 |
| src-tauri/sounds/source/maximize_001.ogg | 12111 | fd3e75e1de2f2fda90aceeacaeb0427ac8bddd3b07a6ce2a8f9ba923df3771f9 |
| src-tauri/sounds/source/minimize_001.ogg | 11924 | 8481912bc7fa5828924a00ef15b6cd613b994956e0817bd3122065c9b2896d2d |
| src-tauri/sounds/source/question_001.ogg | 11700 | abb8f9e4eb2071491b0b15f84ee302386b1847609310c1b000ae174639a6cc5a |
| src-tauri/sounds/source/question_002.ogg | 9455 | 46056f10c70dda860e93bd27b66f4d33c0b7154eff28def06471b50028efa5b3 |
| src-tauri/sounds/source/select_002.ogg | 5463 | 4cc6ac5341b9b2c86fef80c347de028e9ab9f2e037586ac7d9fa59a403a1c012 |
| src-tauri/sounds/start.wav | 23814 | b2b95674cf0c61ff817ad9a19e140c8bae097ae78a3ae3dabeedf1a1a5c9a6a3 |
| src-tauri/sounds/warning.wav | 21682 | 83efbfa8dd75a0e082b4d07a4b85725f7c342e37db07194322d12b1ac2ea92ad |
