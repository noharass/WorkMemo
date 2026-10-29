# WorkMemo v0.2.3 完整文件清单

基线 bfc2b7f12aba3e48468a600ad9d16c2d2e0b9545。本轮改动完整文本见 RELEASE-0.2.3-SOURCE.md，整仓库代码以 v0.2.3 标签及项目文件为准。原有未跟踪 DYNAMIC-ISLAND-PLAN.md 不纳入清单或提交。

## 本轮文件

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\browser-extension\manifest.json |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.3-FILES.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.3-SOURCE.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.3.md |
| UPDATE | E:\WorkMemo\docs\USER-GUIDE.md |
| UPDATE | E:\WorkMemo\package-lock.json |
| UPDATE | E:\WorkMemo\package.json |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.lock |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.toml |
| UPDATE | E:\WorkMemo\src-tauri\src\browser_bridge.rs |
| UPDATE | E:\WorkMemo\src-tauri\tauri.conf.json |
| UPDATE | E:\WorkMemo\src\Dashboard.tsx |
| NEW FILE（交付，不提交） | E:\WorkMemo\artifacts\0.2.3\SHA256SUMS.txt |
| NEW FILE（交付，不提交） | E:\WorkMemo\artifacts\0.2.3\THIRD-PARTY-LICENSES.txt |
| NEW FILE（交付，不提交） | E:\WorkMemo\artifacts\0.2.3\WorkMemo_0.2.3_windows_x64.zip |
| NEW FILE（交付，不提交） | E:\WorkMemo\artifacts\0.2.3\WorkMemo_0.2.3_x64-setup.exe |

## 全部仓库文件

以下列出全部已跟踪及本轮新增文件；避免递归，不计算本清单与本轮完整源码快照。字节与 SHA256 按生成时工作区原始字节记录，Git 文本换行规范化可能使源码归档字节不同；安装包摘要以 RELEASE-0.2.3.md 和 SHA256SUMS 为准。

| 完整路径 | 字节 | SHA256 |
| --- | ---: | --- |
| E:\WorkMemo\.gitattributes | 420 | `eb627ecd7c50dfbd5caedf59093d107b2222ddb7fd4b3c4561b795847d184f75` |
| E:\WorkMemo\.gitignore | 464 | `67166e93f364a1398810f24a360cc95fe4a7a62fadb2788cbb941915483038cc` |
| E:\WorkMemo\.nvmrc | 3 | `68ca3fba3b7e864770cb61aeb306d4bd4354b68ab4dd38450860c5d823e42a53` |
| E:\WorkMemo\.vscode\extensions.json | 83 | `cc7476def213e1bb55aab9a7a5dc38214c8f60ca1b8fd0be22980aa580e91533` |
| E:\WorkMemo\AGENTS.md | 2937 | `c04cb6c95e7b706172eca7ca92e188f65c470b2752db0d49bd0bc5eba98039d6` |
| E:\WorkMemo\README.md | 5361 | `79dcc16e815db6ab2fe391bbc245fb0b4d4fa08df992b1bc24897ba6c866b446` |
| E:\WorkMemo\browser-extension\activity.js | 664 | `ab65a0165ce944692d848458a94de8c783066a769b5f0863e5e84a33a711854b` |
| E:\WorkMemo\browser-extension\background.js | 8740 | `259d164ce0210c94fbd72b316a2924b560ffb7ee08cb29ae1429714755e9d8fd` |
| E:\WorkMemo\browser-extension\bridge-config.js | 56 | `c77bc34bcec9bb97eeb980b975445a71f32e0e7631ed1f7a2495f76eb9ce47d5` |
| E:\WorkMemo\browser-extension\manifest.json | 1043 | `b9b3d4d4e1fb74191b707e8b03c592578dbfe652b46b9a00155142f8ce198026` |
| E:\WorkMemo\browser-extension\matching.js | 1598 | `2de4c94659b2fb525030b01a7a1aef020a6ccf04f9c633b79abf33ee90e51a6b` |
| E:\WorkMemo\browser-extension\popup.css | 1670 | `28e009203cb473c1b6cd09d72be644e2e5eb8bd86479fcb75991997c1cc36721` |
| E:\WorkMemo\browser-extension\popup.html | 1593 | `89a9ac5aaf223e01e5724d20e8205939298cb0410616b2dbed815bc01cfce0bb` |
| E:\WorkMemo\browser-extension\popup.js | 3443 | `1753e682a2832fca8548c65dacc3295a1a62b5725d6929a383539681ed13e0b5` |
| E:\WorkMemo\docs\ALPHA6-RELEASE-SOURCE.md | 33066 | `a724d527b009c7b22d889b0a37af06820e2d13e721b0767922e2b747fc9409ca` |
| E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1-FILES.md | 2292 | `9d4b74fd6b92cb1455897599c32eb1ddec3953f2bd3f6130a23f76b36cc2d6b5` |
| E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1-SOURCE.md | 214996 | `b36ad4d560caf57ff27141ac28a2b92692baf72fb7472c4b3255010384ba834e` |
| E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1.md | 9307 | `8ca7dd0f0e742924782440e3ec8a4423788bdfaa51f57dc02c434a4e34bb708b` |
| E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2-FILES.md | 3468 | `404ed57150f2b5616d07a449644827be0fbf0defe07a23da55162ec1ea412b0d` |
| E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2-SOURCE.md | 383132 | `29b61c17e022b45191a0a25eeb3c94c7ccdb56294dcfdf443fbc71a9b81d938d` |
| E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2.md | 13010 | `6d1f6962c659b87bb2aa768c57dedcae76de0570582697e25d0bd8e1e43200dd` |
| E:\WorkMemo\docs\AUTO-TRACKING-SPEC.md | 7965 | `6570962b31c7e0d04993ae4c4ed27b1bab4e24c13c92518ef590bc5f52fe6f65` |
| E:\WorkMemo\docs\BROWSER-BRIDGE.md | 2977 | `c1d3db9f0376dd35536d55e782da6c79eb213470a8af45c07a5e36be09032364` |
| E:\WorkMemo\docs\BROWSER-CONNECTION-DELIVERY.md | 9515 | `3595e8b42d1b860f4a336f155797fdd8cacc1a2443bced503bed6920570474a7` |
| E:\WorkMemo\docs\BROWSER-CONNECTION-SOURCE.md | 256859 | `3980e16783d7c83f3e015e0db1f6a3fa8e1a0699463e2337e4fb9459cabd0495` |
| E:\WorkMemo\docs\BROWSER-REGISTRATION-DELIVERY.md | 6691 | `75679cd3bfd6ea1f856d80754d390ddd6d3a41c475b8f830e7b89d81b41aedeb` |
| E:\WorkMemo\docs\BROWSER-REGISTRATION-FIX.md | 3594 | `548849ad4cae00751671678c35f0bb4e0c54a5a3931562abee504d9955d36085` |
| E:\WorkMemo\docs\BROWSER-REGISTRATION-SOURCE.md | 60844 | `ddbdd95b79615825b8e6e54851872e09e52671b6f59fa993d84d648066af0332` |
| E:\WorkMemo\docs\BUILDING.md | 3153 | `1785757f1072e55b5b650b58581a6dd0a4bc7e3e8d39c722673e895ae5e75f78` |
| E:\WorkMemo\docs\FIX-0.2.3-TREND-HEADER-SOURCE.md | 45970 | `47d7de60708457d2f031b7f9b9f195cb73e8a9203da3bd7e2363406eca6c7816` |
| E:\WorkMemo\docs\FIX-0.2.3-TREND-HEADER.md | 3679 | `0451f96a850f9d37e542241bc108dc93a18081ebc4d462d0851091aa1435147e` |
| E:\WorkMemo\docs\GITHUB-SYNC.md | 1512 | `a6698558f2677363ae30d0f3e20dd6b91ceaa851deee03caac0e93fa423b9815` |
| E:\WorkMemo\docs\ICON-UPDATE-FILES.md | 2146 | `04a3e57631c26e681923830889d24d2e1e3cdf053fc5616ab76900a8bfdd0d8c` |
| E:\WorkMemo\docs\ICON-UPDATE-SOURCE.md | 190715 | `0f68631bfc363f3ee20f5eb1ae8f081374ecb6c5ae04d0e6fe9ac4dc811973a8` |
| E:\WorkMemo\docs\ICON-UPDATE.md | 10027 | `5c0413ff6ed3a4c5788bb896f13755f6cc8b0ec2060ae3a760880b1a7f2ae7dd` |
| E:\WorkMemo\docs\ISLAND-AND-TIMING-PHASE1.md | 3536 | `d929aec18ab91f4aa356825825997be2b6de842785ff0ca4c5da5c3d0a3d0854` |
| E:\WorkMemo\docs\ISLAND-AND-TIMING-SOURCE.md | 188049 | `9b8b575a6362ff63e8edd571b4eabfc53fef0bb0b104f713fc397d2d08b2c584` |
| E:\WorkMemo\docs\PHASE-1-FILES.md | 2536 | `ff34f62a683470a4422c74887588104b4cd9f079a6ec2ab9d6ff334a136cd409` |
| E:\WorkMemo\docs\PHASE-1-SOURCE.md | 19748 | `f002c83fafa04308e5528971275967a6ec0686d79b5d11af7cc1dd3e9aa6c426` |
| E:\WorkMemo\docs\PHASE-1.md | 7934 | `b3df6c432609538d162ba67f3e0cb93ad940dfc9ab4aac9c2f241c1b4e9ce70c` |
| E:\WorkMemo\docs\PHASE-2-FILES.md | 1229 | `77d3cd35f1986dd9703ee2b519f3ef74311941d9c19b52973d02555fb894b4d5` |
| E:\WorkMemo\docs\PHASE-2-SOURCE.md | 58007 | `c436e1e5d33ad91138c6467d469be964e678c56086d1087b31cc57634bf1a664` |
| E:\WorkMemo\docs\PHASE-2.md | 9263 | `b5ad111de410b968887790f323e82dc35b5eb9b981cb7d13830de6bdee8d2c43` |
| E:\WorkMemo\docs\PHASE-3-FILES.md | 721 | `6ebaf3e7e17a84f28ba0c74d4432b0a24e1a65e047221263d8ff76fb74a8dc6b` |
| E:\WorkMemo\docs\PHASE-3-SOURCE.md | 28018 | `7875e294c43efa4388e4ff7662b97f65be6df86b55ffa954768ecb63559e3427` |
| E:\WorkMemo\docs\PHASE-3.md | 8740 | `308b38294326a740212d0bb79ef1bc7f03ec3a2a03af1f57a1cacfc9617aa2c8` |
| E:\WorkMemo\docs\PHASE-4-FILES.md | 1290 | `79c25b10c54d0c006e3fb4126b0212c6a2f6ec4cc22bd73b3257cef5b375e038` |
| E:\WorkMemo\docs\PHASE-4-SOURCE.md | 64428 | `ac2fd2ad1344dd2c14732a40f0acdd93521e52945b2a310a75107dd89ce02bbf` |
| E:\WorkMemo\docs\PHASE-4.md | 9379 | `ba7c169ed4ecc01eb6aa50a9ae22e4e6d001607513e929cd53b726847438b08a` |
| E:\WorkMemo\docs\PHASE-5-FILES.md | 886 | `499ebba14e094f121c64337667a17a677456c8390f5b622cb05810e4e92569b9` |
| E:\WorkMemo\docs\PHASE-5-SOURCE.md | 46290 | `0dc962b022716c6950466aa2d00bfc2b0387af69f382da27fa2d5ef6cb540e74` |
| E:\WorkMemo\docs\PHASE-5.md | 8411 | `a9ac5e09538687da562e0eb19b0f3e65dbe9707d0fdd440c353d49b70a220770` |
| E:\WorkMemo\docs\PHASE-6-FILES.md | 1151 | `55214b86654dcc2f7960f7468f06334b12603a284fba3b18a599a8d5c350551d` |
| E:\WorkMemo\docs\PHASE-6-SOURCE.md | 97679 | `493fca1ea0ef24bc741ef6a0c2d457aef003cc3507af0f0dfbb6e38327606d15` |
| E:\WorkMemo\docs\PHASE-6.md | 11238 | `ea0aba0bbb606e017aca2a0a0b6351fd8f1ba276af1f80d1a55bf7f645ffe784` |
| E:\WorkMemo\docs\PHASE-7-FILES.md | 568 | `040167b9777cb505756252ccf3bba0bba722eea90fbce0d20cb0c3c57215a505` |
| E:\WorkMemo\docs\PHASE-7-SOURCE.md | 37525 | `32ea99e7def9c562f3194dbcb224d7978a5432342cf56270cd45e5b25f7cf0dc` |
| E:\WorkMemo\docs\PHASE-7.md | 9979 | `f07d149bf2cdb6881943f27f120c82e1c3b49c5402bfc0efab0615accdd5b555` |
| E:\WorkMemo\docs\PHASE-8-FILES.md | 2344 | `6b6f831036afe2f60a1ea976bf3e777fac9b9cf7fa55be9b60f5f171aef5564c` |
| E:\WorkMemo\docs\PHASE-8-SOURCE.md | 66370 | `aca401787681fc46b0079f78d0ba5a71d89891b68c350e98d8d24fb76c7ef5b4` |
| E:\WorkMemo\docs\PHASE-8.md | 18018 | `cf34601d06b4f4640be755d8a12c0d534ac9089629506d49a57f19bf36fdfe11` |
| E:\WorkMemo\docs\PREVIEW-GUIDE.md | 4759 | `bc80e3b83c02e927f1834f93aa74dc690c6babbc510d8ae412f17fb5a89fa1d1` |
| E:\WorkMemo\docs\PREVIEW-INSTALLER-GUIDE.md | 3385 | `8365544a85f554d33f59ce4e62f11c93a63e80f02424af99201492a895bd56ce` |
| E:\WorkMemo\docs\PRODUCT-SPEC.md | 14979 | `ce0a2193d713dc6a22e02fed211222868cc24dbe1aac7e3a2b97f3238a43586e` |
| E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2-INSTALLER-SOURCE.md | 44747 | `e3ead7b1e678cada65de3ae5ddeb786be95fb5f2e1903342cf4994432f616aec` |
| E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2-INSTALLER.md | 5367 | `6e83e37731a492d38d158f73c2ddc43e7d9c91b0cae460410ba45b9e5c4e8e8d` |
| E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2-SOURCE.md | 203141 | `79c8d1f034f462d4bb76cfb243e42dcbe51f5ff4931a4a4b97cdc907c6764505` |
| E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2.md | 6520 | `955857a1f54060eec75d5ebc160c294d0e955e09a3dede42f4851cc8c004c2c0` |
| E:\WorkMemo\docs\RELEASE-0.2.0-alpha.3-SOURCE.md | 250226 | `5fc55ee4dea246a4f9dbc757d284975f8ada62b15abf5d066e4bc134c0ca81d6` |
| E:\WorkMemo\docs\RELEASE-0.2.0-alpha.3.md | 6745 | `c8db40717f327ce8ebbd267b69f1737f3720e4a636ffd7c237f13964114cc758` |
| E:\WorkMemo\docs\RELEASE-0.2.0-alpha.5-SOURCE.md | 199036 | `f5e4cde792ef938264a7c94d658b60a64d1bdd218369f078ab918aae88e23ca9` |
| E:\WorkMemo\docs\RELEASE-0.2.0-alpha.5.md | 4204 | `6fbfd188dae337ce8b13747a8840789776d9d06fd743c0e4d7b7d0fa6a9aa209` |
| E:\WorkMemo\docs\RELEASE-0.2.2-SOURCE.md | 20318 | `fa2d1e39c5438972ec8ae2094a44bbbd4d55c68cf5490318b88e008c5ec76c27` |
| E:\WorkMemo\docs\RELEASE-0.2.2.md | 6243 | `9f759c661d5b76b69dcb8444692019eae83842efa2800ce2e7f5c60588af2771` |
| E:\WorkMemo\docs\RELEASE-0.2.3.md | 9831 | `c02768c412d57938371964d285116b216780356ea6770fc8dc0e77e5707edf17` |
| E:\WorkMemo\docs\THIRD-PARTY-LICENSES.txt | 2414467 | `c433ebd157ee3b51aca04c8e70e3bce72c9d7a85cacc3138db9e1236a075a55d` |
| E:\WorkMemo\docs\UPDATE-0.2.2-COMPACT-SOURCE.md | 79526 | `c9ae9d090898694f2fc50fdd7dd2903fb15b7d9110be35b62f738cfd20dd772c` |
| E:\WorkMemo\docs\UPDATE-0.2.2-COMPACT.md | 5579 | `427fd2f03c02538c36d221d577c1d4e7d1ce8b2ec2a2afb5ed10349400f05cc7` |
| E:\WorkMemo\docs\UPDATE-0.2.2-FILES.md | 3485 | `3da7693d7e628a4d0108f93697a2b739da73f5720aa2dc744cf367247b558b97` |
| E:\WorkMemo\docs\UPDATE-0.2.2-LAYOUT-SOURCE.md | 77361 | `6b82d3f0c0f95a6e651741d64ad935254b7a184b4990258fdff78a52cff3aefd` |
| E:\WorkMemo\docs\UPDATE-0.2.2-LAYOUT.md | 6685 | `bc8fcffd20c175047ddddc0a9eebfba2d534fc0c148b30bce26beabbc484e46e` |
| E:\WorkMemo\docs\UPDATE-0.2.2-MULTI-URL-SOURCE.md | 115784 | `21a48ca58b0d7f622165714d9799dd3a02c711a8379a42f4ce7260018f55843c` |
| E:\WorkMemo\docs\UPDATE-0.2.2-MULTI-URL.md | 7178 | `b0d3fe5482e7536adeef40ab62197669a3be650bfb2b473a30c3ce2ea488d44f` |
| E:\WorkMemo\docs\UPDATE-0.2.2-SOURCE.md | 658000 | `6af9fc16d4fe16f5ac59b92e0d3a843d5e2564382f44f32246e6e9d78d5acbec` |
| E:\WorkMemo\docs\UPDATE-0.2.2.md | 10538 | `fd4282a50d1822988c3923e71edd72bd13d34aa2089d7f67beed269d55e7ffd5` |
| E:\WorkMemo\docs\UPDATE-0.2.3-PHASE-1-FILES.md | 2290 | `0c0845f533dece2584ca1983825aed1ec8ffe89b392a7c18d068c30f8b1138d1` |
| E:\WorkMemo\docs\UPDATE-0.2.3-PHASE-1-SOURCE.md | 497704 | `759b84c1df5bc1386ac2608b69ee3d132f87f66cc8f034d8d12b6b7d2c3c6e36` |
| E:\WorkMemo\docs\UPDATE-0.2.3-PHASE-1.md | 8259 | `cd428084aac933d67424ff194eca411168bfddb3c676d8ea18797cf8b3cf332e` |
| E:\WorkMemo\docs\UPDATE-0.2.3-PHASE-2-FILES.md | 5579 | `907bfd2160647b4e7f90cc16d6f8af4b6c3a6b00edec987160e20f03f517c2aa` |
| E:\WorkMemo\docs\UPDATE-0.2.3-PHASE-2-SOURCE.md | 320401 | `b0505664d25e12ca7c8049d02cbd3d657b23a8ea861646dc5710aae52348d16d` |
| E:\WorkMemo\docs\UPDATE-0.2.3-PHASE-2.md | 10861 | `00bf0e9df083f1faf6bcc120b76ef9221abee717d41744a8ca799dc30d7fd8b1` |
| E:\WorkMemo\docs\UPDATE-ALPHA6-SOURCE.md | 2753767 | `cae99b660c98885fef2c6697fda8a5417b4516efc37e69147a604f98799170a9` |
| E:\WorkMemo\docs\UPDATE-ALPHA6.md | 6657 | `84e44fa83a8fb500bbbb19edb7022827895063079d7be238028d95048f7e6c7a` |
| E:\WorkMemo\docs\USER-GUIDE.md | 15699 | `f35b7f16a975ec4590ac7aa481427309c643404e3c02c0137351b3f967c24acd` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\A-otter.json | 6149 | `b238af55760719723a414b0507cb014001c5cbf2706bbab5b3262ac77e378643` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\A1-otter.png | 1304609 | `5b12bc0a9aa32dbcc871169be6911b7e73513f03d8af305ec1669a19284af811` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\A2-otter.png | 1329714 | `b4c6a12d8380b950df8c26a13e7523ae563b989e901a83a344b9de32487eb569` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\B-owl.json | 7131 | `c30f3bf139fd9309aa07cd3be7538b7ddff2b00b4bc1f0064e13e37d0f65faa9` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\B1-owl.png | 1296414 | `d7a1fa281f2a6120fcb1a8f812d191632d03d1cc0cba35e32bc481b2ab348469` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\B2-owl.png | 1288886 | `7e8ee9d6ead16ff16942423ee1a4ebc96dc3024d780d0fe2712119301ed03e8b` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\C-capybara.json | 6763 | `0cd8857a778d247898cd68b4000cd658eda8972f6d22f6e3e3aa12aab53a25f2` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\C1-capybara.png | 1303456 | `724ddcd5474607a0d7093f08cf0361559f2ea2ff6d807bd8397185b15f8ef850` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\C2-capybara.png | 1348057 | `0adb7ad464ab448259ac739941c1b99e129bfa6d52d92dec38814fe90e4b8382` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\README.md | 4650 | `536546055d21022391525cb9f3d245f7e04a8653b46ed61a2ec94253304d5049` |
| E:\WorkMemo\docs\assets\brand-candidates\2026-10-29\SHA256SUMS.txt | 476 | `d525493906ed6077862083465db1b6a3c0be414db2148bf89970560733f2f170` |
| E:\WorkMemo\docs\assets\themes.svg | 2274 | `f133163f4d7c319443f2fa4db5227b805829fd2a0e3c41a7644590b2952d92a5` |
| E:\WorkMemo\docs\phase-1-browser-preview.png | 27488 | `65dfe930b6729da4c4c9914ae309228713b7b854bd60a80bf7c331b370d1bd50` |
| E:\WorkMemo\docs\phase-4-cream-preview.png | 47180 | `93a97714bd7c7968cb774a51f1d2717d8e738b89edefc2315a42f5b706d48a0a` |
| E:\WorkMemo\docs\phase-4-dark-preview.png | 50759 | `03ce6f2a983edb18cf0ae0af2584abfac5681b548617a822b38bbe0bf239ff5d` |
| E:\WorkMemo\docs\phase-4-glass-preview.png | 48420 | `667076c6cafdf625cd7967e873f6df4e8817ba9e31e56c1d111bfe35ff64e2e2` |
| E:\WorkMemo\docs\phase-4-neon-preview.png | 54115 | `00ad27979cee71ec05f6510cfa4ed98ffb681653de68536efa98a1284df4220e` |
| E:\WorkMemo\docs\phase-5-preview.png | 35405 | `1cdc9ede9a36c21aa0f7781e6b02b4133f86b41aa76881a53dc8c3e1eecbdf08` |
| E:\WorkMemo\docs\phase-6-browser-preview.png | 21664 | `be637f5345498dfcb9229b94b782628d1c60e072a8083bb93d04916d3c138bb8` |
| E:\WorkMemo\index.html | 453 | `8f3ad3ab85af598515d7c49a6f5687523b0a6bde81e96d0b35d4c6c4b328a3e4` |
| E:\WorkMemo\package-lock.json | 65111 | `7d14588460ab0b9d4beeda3a2d55f17183cc44eab88838cd0e02348e57233d5f` |
| E:\WorkMemo\package.json | 1232 | `bb4d043ee817d16b638a052992e8e6e377df6ae29d0821ab4577ebcc5864e059` |
| E:\WorkMemo\public\workmemo.png | 31309 | `ea692794c60cb811986860b9e0480d8ba69bbd3cef57bc916ae58b2af72e61ac` |
| E:\WorkMemo\scripts\browser-registration-test.nsi | 841 | `591137ab2636863374070dea5009d9b84693b36dcd934649d029344d6e17de81` |
| E:\WorkMemo\scripts\browser-resource-files.json | 125 | `e9ed1b3f607ca8be7993118b5e336ae80a5a96a0a5d0cd42dff0628004f5947c` |
| E:\WorkMemo\scripts\build-extension-popup.mjs | 615 | `5f79d42c0d2763e5e9fe59ec7db39febce7fd5c8bb3fab6c21a382d04f7c8ab1` |
| E:\WorkMemo\scripts\collect-licenses.mjs | 4836 | `028626cb56d1c2ca0cd1770ef46dd0e62163706a338568d2a715a04c17e16567` |
| E:\WorkMemo\scripts\package-preview-installer.ps1 | 6163 | `a1f329b9c5c99db26c6638e3d6a3457aa2304d19840519496909763fac9b2600` |
| E:\WorkMemo\scripts\package-preview.ps1 | 4269 | `3c58a8560628399711aec4fbfdd6ba5bcb5a80b0b8a7c35f411c72f96d2a2b18` |
| E:\WorkMemo\scripts\package-windows.ps1 | 4583 | `833cdf39a3294ef8afa346644d1d7bf598382bd1c93286221a7603f82d55913f` |
| E:\WorkMemo\scripts\prepare-browser-bridge.ps1 | 1317 | `82bb6a330c25e6cee6509be8b32b89f86635f6442656d034a98e689c84572bdf` |
| E:\WorkMemo\scripts\prepare-icon.mjs | 2333 | `6431c4bb29a7e8cf59a241e26a3b3587f475312ede2be7b019189d8d2a9cfe7b` |
| E:\WorkMemo\scripts\prepare-sounds.mjs | 3789 | `3e505898c7d8937a737f6b9fcd13b552764066ab4e82763ad2b92426db7e6662` |
| E:\WorkMemo\scripts\register-preview-browser.cmd | 518 | `f5d0c6a7c7b24542e3caa1b41cc67ca3bcf18e085c58278e317da17ca2064acd` |
| E:\WorkMemo\scripts\register-preview-browser.ps1 | 536 | `5aa990926bde42663fd6e14ac138188823f038e25e3b760c8250ce86b5e0eaea` |
| E:\WorkMemo\scripts\stage-browser-resources.mjs | 3215 | `97acfd1ade0c6efc7a28aadc89c0a79de5134035016254b9efa9596c151d0b84` |
| E:\WorkMemo\scripts\test-browser-registration.ps1 | 6816 | `79241971e0e30cf7665e13627da69e78652ad04002aa96312768362291ad53e3` |
| E:\WorkMemo\scripts\third-party-licenses\MPL-2.0.txt | 16726 | `fab3dd6bdab226f1c08630b1dd917e11fcb4ec5e1e020e2c16f83a0a13863e85` |
| E:\WorkMemo\scripts\third-party-licenses\README.md | 1105 | `d00e8100726986558960e973aee381debab60fc369392cea070f4f3ceddb58d1` |
| E:\WorkMemo\scripts\third-party-licenses\alloc-stdlib-BSD-3-Clause.txt | 1483 | `c0c56f26d9c051cac4d200c34c84e7ae9aaa853e01a982a1df08b09931e518ae` |
| E:\WorkMemo\scripts\third-party-licenses\ant-design-icons-MIT.txt | 1099 | `5d367fb0a07340571542eb4ee8eb1add62d37b71bad6786a57c2e9a86bf76c70` |
| E:\WorkMemo\scripts\third-party-licenses\is-mobile-MIT.txt | 1097 | `41199fc577f56d37d06db42992c3a89f669b3ea406da5699bb458bf5f7a0bb25` |
| E:\WorkMemo\scripts\third-party-licenses\webview2-rs-MIT.txt | 1067 | `0dcf41516e608bbcb6cdc5229feb7b86fe4a643b85e7df251133c93408fdac73` |
| E:\WorkMemo\scripts\verify-multi-url.mjs | 5953 | `fc05599ac41953b2dffb386ee25a8c5126b1116760bb1930f35660549cb693d2` |
| E:\WorkMemo\scripts\verify-ui-022.mjs | 11306 | `162638b4f12e00903216b1b2341e32ab9efeeac55e1d5efd14d2abb0066f523f` |
| E:\WorkMemo\scripts\verify-v023-phase1.mjs | 11210 | `7a282f00902af1f0d4c3b88cad03780af28548b5344e8ca0275edf2c382f69d7` |
| E:\WorkMemo\scripts\verify-v023-phase2.mjs | 15585 | `77abe57aba100ed97952d8a244b0b98f36266d58c1ed6386b35458b310bf7445` |
| E:\WorkMemo\src-tauri\.gitignore | 173 | `e1b11c0407131ad35a1f11d8ec2545c53de147a76f05e264e5b500a14b977332` |
| E:\WorkMemo\src-tauri\Cargo.lock | 112919 | `6bbac71288fed7c195490359393be144befcb6cc30e1290b7412ecbd70b63d16` |
| E:\WorkMemo\src-tauri\Cargo.toml | 1714 | `bcd74d7cf1ac8fab12f145ca3da79c123b20af95f627549ebb07d72fae69d430` |
| E:\WorkMemo\src-tauri\build.rs | 899 | `892761f707dfdf5a9ce8defab8c1cf1c9acb8948b549ef68fc345be5b8b13615` |
| E:\WorkMemo\src-tauri\capabilities\default.json | 518 | `b7d38a2e4ffcab6c3e1165b6ef117040f2fada54393503b539ac4fc892f4a7f0` |
| E:\WorkMemo\src-tauri\icons\128x128.png | 8713 | `e52b7c2b3e7f039f9a95b20403af1e0d11b76d743fe90b0560ac8add3d1244a6` |
| E:\WorkMemo\src-tauri\icons\128x128@2x.png | 31309 | `ea692794c60cb811986860b9e0480d8ba69bbd3cef57bc916ae58b2af72e61ac` |
| E:\WorkMemo\src-tauri\icons\32x32.png | 868 | `cd5c9d9582afae1a2d7b54d5e0eae223059902817730e56f0dbd90db9386a031` |
| E:\WorkMemo\src-tauri\icons\Square107x107Logo.png | 6661 | `0dab64ead92a90eb8751ad31c6615b86e38a85e4967f3bdca20e1c93e2992834` |
| E:\WorkMemo\src-tauri\icons\Square142x142Logo.png | 10617 | `3fd0c0a1ee5445aa4d628cb2fafbc3615e9cf1ec4b937bde2f6c3e4b5a026937` |
| E:\WorkMemo\src-tauri\icons\Square150x150Logo.png | 11507 | `5966fc8c79f38a8058e235f8c2db77c11c5e7a756ce4c7af0e5972068c2e26bc` |
| E:\WorkMemo\src-tauri\icons\Square284x284Logo.png | 37315 | `a2dce8f0eab0f07334d703609697f5b993b45035b684a095a28e03ebabbeba79` |
| E:\WorkMemo\src-tauri\icons\Square30x30Logo.png | 826 | `a695dfaa49ecd1dc6057eba784620322bc94eadb0c5b3ecce36d83cb0d62dd08` |
| E:\WorkMemo\src-tauri\icons\Square310x310Logo.png | 43761 | `73bcd4726d46f32dc26ea63623b7b06c9fc1959803202dfc0b4910922c7b4bb3` |
| E:\WorkMemo\src-tauri\icons\Square44x44Logo.png | 1541 | `c9af1a0a6e9ea0b34d757a85ddab50ff34bf852c660b7723d09c9a818284b31d` |
| E:\WorkMemo\src-tauri\icons\Square71x71Logo.png | 3334 | `c659fa06fdff99c4ddcd69141e9ae759134da261b68011ad5519c9497bf9c34a` |
| E:\WorkMemo\src-tauri\icons\Square89x89Logo.png | 4825 | `cf9eb8c04535ef5635cc30d8ec6a84e669969e4110b9247ea11196a97101b452` |
| E:\WorkMemo\src-tauri\icons\StoreLogo.png | 1720 | `7630031c81cf6558b66d589e3a1cfbf972de6256f466b78342f91b8f667de11e` |
| E:\WorkMemo\src-tauri\icons\icon.icns | 593922 | `4c207524f2d937bf598b2e115276f18209f52eabdaaf693ce89e3745769107e4` |
| E:\WorkMemo\src-tauri\icons\icon.ico | 38417 | `8f665d036d2133071e6e58cf5276c141b137052cb13670fdfe04ab379bec639b` |
| E:\WorkMemo\src-tauri\icons\icon.png | 103545 | `b6d8f54d38afd1bc881afad79b8123dbdb441e99097ea17bbee67639154f6593` |
| E:\WorkMemo\src-tauri\installer\browser-bridge.nsh | 2382 | `09e4e1431bc303365f7253280e48a3d45e929b60b133106f61c3306a863a1d02` |
| E:\WorkMemo\src-tauri\migrations\001_initial.sql | 1039 | `56ba2429ccc74bfa53b97ea363aeea1ec3dcaaf44490da6b30dea300dc909833` |
| E:\WorkMemo\src-tauri\migrations\002_settlement.sql | 4247 | `86e2f88393953ba29a6d48a843f6f0eacb54001b1a154ded0f3ef2381ef4caa5` |
| E:\WorkMemo\src-tauri\migrations\003_monitoring.sql | 1145 | `8a5c8da1b8b62369455862920fd36bb69bb8bb220d9728f23a38bda57b922967` |
| E:\WorkMemo\src-tauri\migrations\004_tracking_times.sql | 544 | `3ead3e105fa3d48a380e0657cd13aaf6fd83be2ba56f0a7e77dadda2a34ca57a` |
| E:\WorkMemo\src-tauri\migrations\005_monitor_options.sql | 263 | `55eddae33c5fe78af9b76beb70256c560a96a37fe204b887190cc06a2b88e41c` |
| E:\WorkMemo\src-tauri\migrations\006_import_sources.sql | 160 | `9f50eeb321ce08758094985cb78682fca39a1f40a2a31f551e31c9cc755275a6` |
| E:\WorkMemo\src-tauri\migrations\007_dashboard_intent.sql | 336 | `3d3ec16843600c86ff33d5ffc0230c87443f62c0bb60f6c3f40e840b6ee3f55b` |
| E:\WorkMemo\src-tauri\migrations\008_url_matching.sql | 856 | `42bb520a225e239bace9c3a06b56de1e9b0b4b898fbc8ad7a9001dbfd53c892b` |
| E:\WorkMemo\src-tauri\migrations\009_idle_categories.sql | 3337 | `8eb7a4dc9d6bf471196c9dbd7536c2b2ddc3e57717614283b70a6480660e9a29` |
| E:\WorkMemo\src-tauri\sounds\README.md | 1967 | `9ee043f0845d0d34687c79bca99344735c4d1444e58d6ec1ae59747cbf24fc85` |
| E:\WorkMemo\src-tauri\sounds\crisp\end.wav | 21670 | `ecda546a157f298d52ab3105a682c63b35879d00fea21517b3c0955b2709b450` |
| E:\WorkMemo\src-tauri\sounds\crisp\pause.wav | 3052 | `1934a71d3d71dc25273e62d6754e37bb8037a019462ebe13523f7a89417ee7c0` |
| E:\WorkMemo\src-tauri\sounds\crisp\resume.wav | 1824 | `6cce61ab41c1a230a1bce8f06d69f336c626dfa97a71f490160b6b31f26fb7bb` |
| E:\WorkMemo\src-tauri\sounds\crisp\start.wav | 12194 | `33d9332f89076fd1832900e42fe17069a732d2bf31a562deadc76dce7917eb99` |
| E:\WorkMemo\src-tauri\sounds\crisp\warning.wav | 14708 | `8fffe9b384395bb039ab29ad60dccdba8b3129c6a2613f50d91768521224bdf7` |
| E:\WorkMemo\src-tauri\sounds\end.wav | 12826 | `80f847ad6e60ecc58a09fd9d88a645c729d7c92c31ce7510438c48848c5d6a98` |
| E:\WorkMemo\src-tauri\sounds\manifest.json | 3589 | `dd96cac3288c7fa2c35c8c2ba6f4582df7ee77799a3d92de2d342c4931014d52` |
| E:\WorkMemo\src-tauri\sounds\pause.wav | 11438 | `42ae833612216eb4156daa773554f49d5672cfb5061ceb9238e64abcf5e01043` |
| E:\WorkMemo\src-tauri\sounds\resume.wav | 11438 | `cd910613dbe73a1a578a37dd14228c195309b8b4e7ef827ffd9678e164030c06` |
| E:\WorkMemo\src-tauri\sounds\source\LICENSE.txt | 574 | `f7966c773bbed0eca6a9c75081c44a178b38eae112724dbb5fdfbd4192d118a9` |
| E:\WorkMemo\src-tauri\sounds\source\back_002.ogg | 7029 | `61581c58194e3f19f531072edabbc344204c7e0a2887b8ededce4357bcf09195` |
| E:\WorkMemo\src-tauri\sounds\source\confirmation_001.ogg | 8968 | `063564703b6094d70718a3e787a55cc9141611e4ecd6b6637f8828f79b4a8c3a` |
| E:\WorkMemo\src-tauri\sounds\source\confirmation_002.ogg | 14169 | `33b17a9a9a2397c62b285c52c33a907fdffb476909c99e42dde603f6a7a8b12c` |
| E:\WorkMemo\src-tauri\sounds\source\confirmation_004.ogg | 12391 | `568967a3d9f8a8f6af54ea01729c4882284308f2a27d78c07ffd7ee0d6951661` |
| E:\WorkMemo\src-tauri\sounds\source\glass_001.ogg | 6103 | `183eebee20eb0a532b0b85104d139cbf2673eb66d95c3cc733ac9ea98362e7e8` |
| E:\WorkMemo\src-tauri\sounds\source\maximize_001.ogg | 12111 | `fd3e75e1de2f2fda90aceeacaeb0427ac8bddd3b07a6ce2a8f9ba923df3771f9` |
| E:\WorkMemo\src-tauri\sounds\source\minimize_001.ogg | 11924 | `8481912bc7fa5828924a00ef15b6cd613b994956e0817bd3122065c9b2896d2d` |
| E:\WorkMemo\src-tauri\sounds\source\question_001.ogg | 11700 | `abb8f9e4eb2071491b0b15f84ee302386b1847609310c1b000ae174639a6cc5a` |
| E:\WorkMemo\src-tauri\sounds\source\question_002.ogg | 9455 | `46056f10c70dda860e93bd27b66f4d33c0b7154eff28def06471b50028efa5b3` |
| E:\WorkMemo\src-tauri\sounds\source\select_002.ogg | 5463 | `4cc6ac5341b9b2c86fef80c347de028e9ab9f2e037586ac7d9fa59a403a1c012` |
| E:\WorkMemo\src-tauri\sounds\start.wav | 23814 | `b2b95674cf0c61ff817ad9a19e140c8bae097ae78a3ae3dabeedf1a1a5c9a6a3` |
| E:\WorkMemo\src-tauri\sounds\warning.wav | 21682 | `83efbfa8dd75a0e082b4d07a4b85725f7c342e37db07194322d12b1ac2ea92ad` |
| E:\WorkMemo\src-tauri\src\appearance.rs | 6158 | `b5f60a0122f7fa5da0aaddb1cfa3b9e3008a376e74698d9fe51bf0cc4ed4bb18` |
| E:\WorkMemo\src-tauri\src\appearance_tests.rs | 5979 | `99c8d582756610ce5c72cd9f2065fbc0ea1cf7a81a402957469e0b32b005f2f5` |
| E:\WorkMemo\src-tauri\src\bin\workmemo-browser.rs | 7255 | `92cb475150f19a7f158b5db07fc4a68d5f585b291197fe1c32ada826800002a4` |
| E:\WorkMemo\src-tauri\src\browser_bridge.rs | 7406 | `c68dd6c3d5c82287b11ff9a4aae7ef79953c311d4994998224506e9571b4ea15` |
| E:\WorkMemo\src-tauri\src\browser_protocol.rs | 3665 | `e0572984355f4f46f292d7dd324fac64ac55ebb45bbeff48140db74a40968762` |
| E:\WorkMemo\src-tauri\src\categories.rs | 12963 | `8eef074d54049d444a42627eff41e1e30c3c8bb53c75486a5110da989c0f3cb6` |
| E:\WorkMemo\src-tauri\src\clock.rs | 1201 | `5d4549dd2e53516a3079209c28b0b4600133e4d4e74f29148fbcb5a6830eacac` |
| E:\WorkMemo\src-tauri\src\connection.rs | 5827 | `b0a1a7efaba4a8841d49b77a334d00913e95c3116d05b1a80e2ff68fa3bd1c96` |
| E:\WorkMemo\src-tauri\src\dashboard.rs | 16446 | `817ddfe8b46fae03f807b6f4a6351f656ee104697b64244495385b696a52332d` |
| E:\WorkMemo\src-tauri\src\data_center.rs | 19593 | `788d1ef7d124063f1a9d8d6793f052548daa6b020dd0039f86a8ac070650eedb` |
| E:\WorkMemo\src-tauri\src\data_tools.rs | 42870 | `7bc5de27d25c3b26f8536ac432dc76d49e01acd1f31c9f46f2bd0e991d4de0cf` |
| E:\WorkMemo\src-tauri\src\database.rs | 22561 | `d9557e37a7c4b046e07cffcda895962acd4de4ef225ce9e751bd671207fb33e9` |
| E:\WorkMemo\src-tauri\src\database_tests.rs | 11204 | `e2116595d6645a8e873b3882dbaa11199691864706734b17266999cf4b2403bf` |
| E:\WorkMemo\src-tauri\src\desktop.rs | 13862 | `f8f7d7a186cf08fe813a97eea43d984efa47e51c665f032682ca4357c247e363` |
| E:\WorkMemo\src-tauri\src\history.rs | 7842 | `2f91753b699692d6affbf8912e61c6103946c7d946bf7d37adbc099af5d116fe` |
| E:\WorkMemo\src-tauri\src\history_tests.rs | 10454 | `ba60bd7ca4456286af23e9a82483a8f2be24ce954c74ec888cc801a94fba967f` |
| E:\WorkMemo\src-tauri\src\idle_pause_tests.rs | 7172 | `01e585e26c3cc206c2aba99595d942332593598af2205b104e342bca0f93078a` |
| E:\WorkMemo\src-tauri\src\lib.rs | 7074 | `58ed73e5b5813c1d5f040d962ff64291ad05cf9d8d03d0762fdd0dd88f0a9202` |
| E:\WorkMemo\src-tauri\src\main.rs | 657 | `b476733e9d01667542a39d3ea0de9061d16781d7e414473ff55affbf40535390` |
| E:\WorkMemo\src-tauri\src\monitor.rs | 9103 | `e0834f3d5313d64ca73b4f6680f9fe21e7aab13991f26d515123a7f5754db928` |
| E:\WorkMemo\src-tauri\src\native_activity.rs | 8888 | `e5615aa47b211bf8d6621b75e0e4e15c617765a4044f75716b20375be82a1ecf` |
| E:\WorkMemo\src-tauri\src\presentation.rs | 11441 | `6c612f8c86b73bb17bb904375b705ac62d0ff029b99babb444ce94dd7fa81d24` |
| E:\WorkMemo\src-tauri\src\registration.rs | 13759 | `5d20c60527f66e4704ae5d3c39e2374ffc2fcb999aeda984e4a223b1ef5ac0ef` |
| E:\WorkMemo\src-tauri\src\reliability_tests.rs | 13768 | `a1150111fa628e4596e1188fd12343a956d68a919fee625d806064d8ee1bd1fa` |
| E:\WorkMemo\src-tauri\src\report_periods.rs | 3151 | `6f84ffc78406711ecb060bf7a38811e49f40112e320eb420fead7df54fde2fdc` |
| E:\WorkMemo\src-tauri\src\report_tests.rs | 7335 | `7db3d401cfaaa2ff9d6ebd47b2d4e3a859febc947c66f91313601d1463917c3e` |
| E:\WorkMemo\src-tauri\src\service.rs | 20542 | `dfbc97902e93df90c986c6c1ea0b7b7820407012af8a36a7eef3d38a958eea4e` |
| E:\WorkMemo\src-tauri\src\settlement.rs | 3674 | `1b9de037e9c20175bf2689a4e0a19b436bc58b5370d0ec8978d908c4e091ceb6` |
| E:\WorkMemo\src-tauri\src\settlement_tests.rs | 13662 | `2b05c3293ba10fcc895fbb26bafe09d5347f737a2d1b7eafe007914a48d44778` |
| E:\WorkMemo\src-tauri\src\sound.rs | 7307 | `6d0718bb49e32b08edc28792613b05b201a48288c900248aaeaaef5126026f90` |
| E:\WorkMemo\src-tauri\src\tracking.rs | 37423 | `7a07fd4990773743ea17a96d90b99300dd6fe4b0080e949b9096d97dfc3290c0` |
| E:\WorkMemo\src-tauri\src\tracking_tests.rs | 55676 | `ae02da9c8ea3b2fd3466d533a92059abbc7d5965b54260b6347b4e4b538214d6` |
| E:\WorkMemo\src-tauri\src\windows.rs | 17541 | `dc7564e6d03af32715558f15f64158d144a27497529446a6fcf1ca45b457414c` |
| E:\WorkMemo\src-tauri\tauri.conf.json | 2048 | `a8a1c309332aafba4a82dfc63580c34b42e16a91de3e82004fbc58d5b520fb15` |
| E:\WorkMemo\src-tauri\tauri.preview.conf.json | 657 | `d77fcee70d7deee3ccf64ef261afd1363f641115bbd8bb3a3992e86f83ae648e` |
| E:\WorkMemo\src-tauri\tests\browser_host.rs | 4280 | `278e8e32f9bdab0fc42647f884c9d09513e7e770eaf3d89042647ae740d5e8dc` |
| E:\WorkMemo\src-tauri\tests\browser_registration.rs | 5490 | `914e8173bfd9c98c270107df8d939439ed81ac97c8c72f4cabc860ebf7a65d54` |
| E:\WorkMemo\src\App.css | 43055 | `cee02af5cf2f3d7e237014ae5ff4a79ed4a290c164fc8ecf5ef2cb53422ed910` |
| E:\WorkMemo\src\App.tsx | 15885 | `37a46f242c578659f26f2b5b77a35dd7acd9cea1d9a3f73e87860afa4c26646c` |
| E:\WorkMemo\src\AppearanceSettings.tsx | 6116 | `83e75b2e3c73e8fba2fa9a7b5e1056126c3b0d88c0e333cd6a60888b6c02f0ef` |
| E:\WorkMemo\src\CategoryNamesEditor.tsx | 2847 | `410ebd7dddf9156a4c36dcc4b9c3944ff67ea7406d9d715a0ebdf4d1630cfba3` |
| E:\WorkMemo\src\ConnectionPanel.tsx | 1652 | `5f8954effa427156daa3aad6b7019dda95c5a02f8a1ad94131626ce7f7f193bc` |
| E:\WorkMemo\src\Dashboard.css | 23875 | `36fbf0c7fc9413198769b8c0bf4472710ac606d8dacaff76adb16d884a5399cb` |
| E:\WorkMemo\src\Dashboard.tsx | 47442 | `5d5a790ccf48fa09b04a892e6c2ced4566afe8665fb088557d3b6bedccba8452` |
| E:\WorkMemo\src\DesktopWindow.tsx | 3727 | `3c53566d7a1a7e935f0913f364e7058eb7b3fedbe9e3ee8b1101b6490e03deef` |
| E:\WorkMemo\src\Drafts.tsx | 2111 | `a22e33ee1d080f559084f1fa2d1addd1cb36f4155f1e09556308555983e45b6f` |
| E:\WorkMemo\src\HistoryPanel.tsx | 9625 | `af8a8b33d2d7f93997ceed66351b7d2550f6c7dc3099d9a1b4e40c24ef413a34` |
| E:\WorkMemo\src\Icon.tsx | 1527 | `8557ec1a6199f084ed4972a1f77b2f9cf426c05cf833b45db2e4584af77d9e54` |
| E:\WorkMemo\src\MonitoringSettings.tsx | 11692 | `7830e277df9bad266c8fbfb2cbe9d9c374bbfca026658d8679c4ea4e7c5ff544` |
| E:\WorkMemo\src\NotificationApp.tsx | 12296 | `af1f8d00ae3d3da1e5593d0edd36793462361eb1a6e1a499827ce959890a33b4` |
| E:\WorkMemo\src\PanelApp.tsx | 15062 | `017787da140fed3c30ccce4f90390e732a43fe11b2fcdfa190288593a3f79df3` |
| E:\WorkMemo\src\SettingsExtras.tsx | 10054 | `b30af6e738625a189c8f565076ebc4fe136a1b2b51834379ae995b1d24b1d590` |
| E:\WorkMemo\src\SettlementPanel.tsx | 6734 | `c26f62d502ee3d8f7238793c3ad98f56a9c2f07d785b36614578b1befab572f5` |
| E:\WorkMemo\src\UiDialog.tsx | 940 | `91d43406a4982151b1fdccd14676aff0e9a5c5e579998926cd8a58c9bbc5b9cf` |
| E:\WorkMemo\src\WorkForm.tsx | 5414 | `b8d729fc75e4cfaf6e982375913a43a5d3f69e9be26713309294831200e6ab79` |
| E:\WorkMemo\src\assets\workmemo-icon.png | 555944 | `b6371d18743a8e80885ac656ec60727340069282fcf44c74bb3ff8aeed8f33bf` |
| E:\WorkMemo\src\categoryNames.tsx | 2338 | `871d09d7209bdb4f33301786ce0b007f73568ac3e451182fa4e0dea30b6d1835` |
| E:\WorkMemo\src\desktopPreferences.tsx | 8077 | `a4b0eb54353834dfd943c901d438762e5102d0ab7899c0e22feca19a48df5f1e` |
| E:\WorkMemo\src\draftController.ts | 1025 | `96a3b5438a07e3982b61346a0babb3bdd391b61dd8505c81c497c749ea52c7f7` |
| E:\WorkMemo\src\history.ts | 2204 | `328bac427cc6901d6fa910028483da346eb796f7f8cec8e67985b00bae1d27f2` |
| E:\WorkMemo\src\main.tsx | 823 | `67f3f88cdf8a8142f7cfaa3ca950f712f6061f6fdd830c7d29296bb05316470e` |
| E:\WorkMemo\src\reportPeriod.ts | 1167 | `3e9ee8d6960212a6faf8eb19329ec0748bd3a68c8c482b7d90a8d64a26a0d335` |
| E:\WorkMemo\src\themes.ts | 6851 | `490ff19075e1551fb509d14c400264f02a09659429393833ebaceb74ae99695b` |
| E:\WorkMemo\src\types.ts | 2801 | `d61444c717d96bc6c00043a73c8c4cef216b8038e520ec192a6788a019c745ca` |
| E:\WorkMemo\src\useAppearance.ts | 3809 | `abd909785fccb71a5e98a5e5f45e98161935fdb1ed8e9cda34bf677b8e4660fd` |
| E:\WorkMemo\src\useHistory.ts | 3441 | `a75d111f18c6aa349be1e3524935142c4f9c63f511aaee6af8bb8cc1ceaa17d4` |
| E:\WorkMemo\src\useWorkSession.ts | 6034 | `4faef470887d2f63da16a86ac2bdfebe282dedecc758e8517dc7a710e03548fa` |
| E:\WorkMemo\src\vite-env.d.ts | 39 | `424faf9241dd699dda995b367ed36665732da1e6ec1f33b2fd40394488ecac92` |
| E:\WorkMemo\src\workInput.ts | 1140 | `b732ac3a9fb0273a3c512df9a79eb02a1ae700ba9045582dcc0ceb7559b76da0` |
| E:\WorkMemo\src\workView.ts | 2871 | `e88537c64687d58e62e02e9d728229ab1adf13b7f74d55242f7b0bd99e60dbd0` |
| E:\WorkMemo\src\workload.ts | 421 | `40e09a800c8773ce30bbdba27147dcb9e5d82460b85ea450a3f73eccc71afc8b` |
| E:\WorkMemo\tests\browser-extension.test.mjs | 3337 | `7c809c498f8a25996edd4efc4dee74c07031809a7a861be8154209f669f9b6d9` |
| E:\WorkMemo\tests\browser-runtime.test.mjs | 13932 | `b54dfc99983998dba17655405924dd511db78e55acba2c3f1a4469d6562535fe` |
| E:\WorkMemo\tests\drafts.test.mjs | 2645 | `ed45c3182276c6995264a973a6b7e7c5c454168344ceb690bd5235e515047c23` |
| E:\WorkMemo\tests\history.test.mjs | 3256 | `469a0406f0b046d40a1919fdf4673ee9679cfc08c8fe60fb00ff55915f445ea4` |
| E:\WorkMemo\tests\page-activity.test.mjs | 1141 | `ba62e53daa93f106329d10ac525bc1a5b28e21c21468ad915a2ad09eca28bf27` |
| E:\WorkMemo\tests\report-period.test.mjs | 1140 | `c62fdcccc9083802f5df644b94d7c4aea98eb05228fe50f2ca045a2fb62af74b` |
| E:\WorkMemo\tests\themes.test.mjs | 3501 | `9ad9f086405f12ed941b30099398b54b21a8c5b049a1b013ce0a974cd49b67eb` |
| E:\WorkMemo\tests\workflow.test.mjs | 5476 | `924cc99db764c94b611745a856858bba600d04bcb53d615a3d3d79ab9fbd584f` |
| E:\WorkMemo\tests\workload.test.mjs | 770 | `a5ddbe000ce7f528341fd91349e09854905c897a432eb77d8d708bb169df9f34` |
| E:\WorkMemo\tsconfig.json | 614 | `9671b50541bcb0112d8914cf5f82c838fcaaa25bc3f14ab90cf40a49e929224e` |
| E:\WorkMemo\tsconfig.node.json | 223 | `6ec602b8aa146888c76f0b41ca3515f91f95919f6e6417a4670decaba8fcb982` |
| E:\WorkMemo\vite.config.ts | 919 | `c9aff1d437f11c8dd4c7095c7f94d1b5266b83e846a9c9ef13de6012c5edaf51` |
