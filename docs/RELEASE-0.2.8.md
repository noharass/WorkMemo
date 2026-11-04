# WorkMemo 0.2.8 发布说明

新增网页与具名任务绑定、未绑定网页处理及任务间计时段切换。可为网页选择路径前缀、站点或域名后缀，忽略规则可撤销。已有网址规则迁移至相应类别默认任务。

升级前请备份工作数据。此版使用 SQLite schema 10，旧版无法直接读取升级后的数据库；回退时需使用升级前备份。Chrome 扩展需重新加载，并在扩展弹窗授权新网页识别和需要的站点。手动暂停、仅浏览、重启待确认和空闲保护继续生效；只有能归属网页的新操作才会恢复暂停的计时。

源码阶段通过 Rust 157 项库测试及主机与注册测试、Node 57 项、隔离浏览器检查。Windows 原生透明、真实扩展授权、焦点和实际多窗口切换尚未完成实机验收，见 [页面任务阶段记录](PAGE-TASK-SWITCH-PHASE-1.md)。

安装版和完整 ZIP 使用 `scripts/package-windows.ps1` 构建，随包提供第三方许可和 SHA256 校验文件。

首次公开 Release（以下摘要为已替换的原始文件）：<https://github.com/noharass/WorkMemo/releases/tag/v0.2.8>，构建提交 `aac079f294a9a778b70d6c2f7fa9fe2a27861826`。四个资产的 GitHub 摘要及匿名下载 SHA256 已核对。安装器 SHA256 `40b2e092a5809fc0101d56820eb21ebe321d270c004224bbd47f5f13c607751b`；ZIP SHA256 `6b3f78cb52f8e004970bce0e7626d76ca426e59f7dae97543c2a95447f64b5f3`。构建与验证输出位于 `E:\WorkMemo-release-028\artifacts\0.2.8`。

## 2026-11-04 同版本更新

按用户要求保留 0.2.8，公开资产已更新为含多任务列表的构建，构建提交 `9d56dc0f09712ca921972b6c385abc58a2d78126`。原有 v0.2.8 标签仍指向 `aac079f294a9a778b70d6c2f7fa9fe2a27861826`；资产对应的源码请使用上述构建提交。

安装器 SHA256：`360efd13b70005956d76f7e38b912a85ab401c9841ad450f3d5ac72f5f80d29d`；ZIP SHA256：`154cef5ebdca7c33291b20ebc5617b8347a20167d0d5574daa90fd7887d5bfa3`。四个资产均经 GitHub 摘要及匿名下载复核。原始文件备份位于 `E:\WorkMemo-release-028\artifacts\0.2.8-original`；本次校验回执位于 `E:\WorkMemo-release-028\artifacts\0.2.8\qa\REPLACEMENT-RECEIPT.json`。原生窗口及真实浏览器扩展的全面人工验收仍未完成。
