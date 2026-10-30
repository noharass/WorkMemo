# 许可文本来源

用于补充锁定依赖包未随 crate 归档提供的根目录许可文件；不为 WorkMemo 自身选择许可。

- alloc-stdlib-BSD-3-Clause.txt：Dropbox 上游提交 0a81fd6928ea3b33c8cd484aa4575d50ffb98012 的 LICENSE，适用于 alloc-stdlib 0.3.0。
  https://github.com/dropbox/rust-alloc-no-stdlib/blob/0a81fd6928ea3b33c8cd484aa4575d50ffb98012/LICENSE
- webview2-rs-MIT.txt：上游提交 edc2caf886175ccaebe86078c9cfe1ae2a187328 的 LICENSE，适用于当前锁定的 webview2-com 0.39.1、webview2-com-sys 0.39.1 和 webview2-com-macros 0.8.1。
  https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE
- MPL-2.0.txt：标准 MPL 2.0 许可全文，从本地 cssparser 0.37.0 的 LICENSE 完整复制，补充 selectors 0.38.0。官方文本：https://www.mozilla.org/en-US/MPL/2.0/

collect-licenses.mjs 按明确的包名与版本匹配补充；依赖升级后需要重新核对，不自动套用旧版权文本。每个 Cargo 条目同时提供相应版本的 crates.io 源码归档地址；没有修改第三方依赖源码。

- tauri-plugin-MIT.txt：tauri-plugin 2.7.2 的 crate 元数据声明 Apache-2.0 OR MIT，使用其 .cargo_vcs_info.json 对应 Tauri 官方提交 59b63ab500da9859f12d8888c3298bc29bba0b92 的 LICENSE-MIT 原文。
  https://github.com/tauri-apps/tauri/blob/59b63ab500da9859f12d8888c3298bc29bba0b92/LICENSE-MIT
