# 网页阶段 A：数据表达与请求恢复

2026-11-15，按用户“执行A吧”授权完成F01–F05。开发基线ff8c577，源码版本保持0.2.10，SQLite仍为schema 12。本轮没有发布或替换0.2.10安装包，没有操作真实任务或数据库，也没有进入阶段B/C/D。

## 目标、检查与最终行为

开发前重新读取PRODUCT-SPEC.md、阶段记录和WEB-AUDIT-PLAN-2026-11-15.md，检查React、HTTP封装、Rust查询、Tauri配置和SQLite状态约束。单独在127.0.0.1:4174启动生产网页预览；原4173隔离预览保持不动。

1. **F01状态与筛选一致。** 网页把原“进行中”筛选改为“未结束”，提交`unfinished`，Rust包含WORKING/SUSPENDED。行标签分别显示计时中、已暂停、已挂起、待恢复、未开始；结束后继续显示待补全/已确认。未完成的工作量列显示未结算，避免把状态与数量混在一起。旧API `working`仍只匹配WORKING（含其暂停状态），未改旧调用语义；汇总仍只计已结束工作。
2. **F02保留真实图表精度。** 分类柱图直接使用毫秒/3600000，不预先保留两位小数。小于0.01小时的tooltip显示秒数并注明不足0.01小时；1ms显示0.001秒，5秒显示5秒。真正的0仍是0。工作量tooltip复用formatQuantity，1e-12不被格式化成0。
3. **F03保留周期年份。** 趋势轴直接使用后端规范的HH:mm、YYYY-MM-DD、YYYY-MM，不再slice掉年份；保持图表原有防重叠标签能力。本轮没有改变自定义趋势补零或聚合规则。
4. **F04区分错误与恢复。** 401/403提示重新授权；503纯文本busy提示WorkMemo正忙；400保留业务校验消息；408/504及8秒传输超时提示超时；断网、格式异常各有说明。保留旧快照和输入。连接/服务/授权异常时停用写入入口，业务筛选错误不伪装成断线；成功读取后恢复。写入响应未知时提示核对或原样重试，不自动重发、不更换补录request_id。
5. **F05限制刷新并取消旧读取。** 手动刷新期间刷新按钮禁用，重复点击合并为一次。每次查询effect持有AbortController，切换筛选、刷新或卸载时取消旧meta/query，并保留原8秒超时。主动取消不提示断线；旧结果仍有stopped保护。保存、删除和补录不使用effect信号，刷新不撤销写入。

取消浏览器读取不保证撤销已进入Rust的SQL，所以仍保留服务器并发上限、事务和版本校验，不把客户端取消夸大成数据库操作回滚。没有引入依赖、扩大权限或迁移数据库。

## 实际执行的验证

| 检查 | 结果 |
| --- | --- |
| npm.cmd test | 66项通过：原59项及新增7项 |
| npm.cmd run typecheck | 通过；最终build亦执行TypeScript检查 |
| cargo test --locked --manifest-path src-tauri/Cargo.toml | 182项通过：177库+2 helper+2 host+1注册 |
| cargo fmt --manifest-path src-tauri/Cargo.toml -- --check | 通过 |
| npm.cmd run build | 通过；保留约1.565 MB的Dashboard分块提示，性能拆分属于C阶段 |
| npm.cmd run test:web | 完整生产资源网页回归通过；无非预期页面/console错误 |
| node scripts/verify-manual-entry.mjs | 5组通过，包括丢失响应原样重试只产生一条记录 |
| node scripts/verify-v027-web.mjs | 5组待补填场景通过 |
| node scripts/verify-web-phase-a.mjs | 新增5组阶段A浏览器场景通过，pageErrors为空 |
| git diff --check、脚本语法 | 通过 |

新状态契约JSON由Node fixture测试和Rust内存数据库测试共同读取，覆盖all/working/unfinished/pending/complete以及活动任务暂停前后，避免模拟数据与真实SQL再次产生不同筛选结果。

阶段A专项验证：

- 挂起和暂停记录在未结束列表中仍可见，标签描述真实状态，结束记录不混入。
- 实际ECharts series验证1ms、1秒、5秒、17.999秒、18秒、1小时和0；1e-12工作量也保留非零。
- 2024-01、2025-01、2026-01以及跨年日标签保持可区分。
- 503/400/403/非JSON成功响应/504提示各异；保留9条旧快照，恢复后写入入口重新启用。
- 1.6秒慢查询期间连点刷新，实际仅发1条query。
- 从慢速评测查询切换至质检，浏览器实际中止旧请求，无断线提示、无迟到覆盖。

既有完整网页回归保留保存失败输入、已提交但详情读取失败、放弃确认、焦点、删除、筛选分页、390–1920宽度和125/150% CSS缩放等用例；补录保留北京时间、纽约夏令时、零产出、零工时和去重用例。本轮只对已有隔离场景报告通过，未将其等同于原生Windows验收。

专项首轮遇到Ant Design选项的隐藏ARIA节点和可见文本双重匹配，修改测试选择器定位可见选项内容后通过；这是验收脚本修正，不是回退产品修复。后续自查把工作量tooltip改为复用既有有效位数格式化，并新增1e-12场景，避免为工时增加格式化时引入数量舍入问题。

## 完整文件清单与代码

| 类型 | 完整路径 | 作用 |
| --- | --- | --- |
| UPDATE | E:\WorkMemo\src\Dashboard.tsx | 状态标签、未结束筛选、刷新禁用 |
| NEW FILE | E:\WorkMemo\src\dashboard\recordStatus.ts | 统一状态文字 |
| UPDATE | E:\WorkMemo\src\dashboard\Charts.tsx | 工时精度、tooltip、周期年份 |
| UPDATE | E:\WorkMemo\src\dashboard\api.ts | 错误分类、取消信号与超时 |
| UPDATE | E:\WorkMemo\src\dashboard\useDashboardData.ts | effect读取取消、连接状态 |
| UPDATE | E:\WorkMemo\src-tauri\src\data_center.rs | unfinished查询，保留working兼容 |
| UPDATE | E:\WorkMemo\src-tauri\src\report_tests.rs | 真实SQLite状态契约 |
| UPDATE | E:\WorkMemo\scripts\dashboard-fixture.mjs | 与Rust一致的状态筛选 |
| UPDATE | E:\WorkMemo\scripts\audit-web-comprehensive.mjs | 兼容修复后的轴标签、503文字与禁用按钮 |
| NEW FILE | E:\WorkMemo\scripts\verify-web-phase-a.mjs | 生产资源、模拟Rust CSP、内存HTTP专项 |
| NEW FILE | E:\WorkMemo\tests\dashboard-api.test.mjs | HTTP分类、取消、超时与重试请求身份 |
| NEW FILE | E:\WorkMemo\tests\dashboard-status.test.mjs | 标签及fixture契约 |
| NEW FILE | E:\WorkMemo\tests\fixtures\dashboard-status-contract.json | Node/Rust共用状态样本，非产品数据 |
| NEW FILE | E:\WorkMemo\docs\WEB-PHASE-A.md | 本次交付 |
| NEW FILE | E:\WorkMemo\docs\WEB-PHASE-A-SOURCE.md | 上述13项实现/测试文件的完整源码，无省略 |
| UPDATE | E:\WorkMemo\docs\BUILDING.md | 新专项入口和兼容说明 |
| UPDATE | E:\WorkMemo\docs\PHASE-8.md | 阶段记录 |

完整实现位于项目文件；较长文件另汇集在WEB-PHASE-A-SOURCE.md，注明完整路径。没有把node_modules、dist、target、本地数据库、测试截图或凭据放入提交。

本地证据（Git忽略）：E:\WorkMemo\artifacts\web-phase-a\result.json、unfinished.png、phase-a-build.log、phase-a-node.log、phase-a-rust.log、phase-a-regression.log、phase-a-manual.log、phase-a-pending.log、phase-a-web.log。日志位于artifacts根目录；前两个证据位于web-phase-a子目录。早期failure.json/png保留作排错，最终结果以result.json和退出状态为准。旧全面审查取证脚本本轮只做兼容性修订和语法检查，未重新执行整套axe/性能取证。

## PowerShell命令与测试预期

```powershell
Set-Location E:\WorkMemo
npm.cmd test
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

保持preview运行，在第二个PowerShell执行；其他电脑请改为本机已有Playwright路径：

```powershell
Set-Location E:\WorkMemo
$env:WORKMEMO_PLAYWRIGHT='C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:WORKMEMO_WEB_URL='http://127.0.0.1:4174'
npm.cmd run test:web
node scripts/verify-manual-entry.mjs
node scripts/verify-v027-web.mjs
node scripts/verify-web-phase-a.mjs
```

预期全部通过，阶段A result.json有5组passed且errors为空、refreshBurstRequests为1。手动验收请用隔离数据：比较未结束筛选的计时/暂停/挂起记录，检查小于0.01小时的柱图tooltip和跨年轴标签，断线/繁忙后保留草稿并核对结果。不要为了测试结束真实任务。

## 兼容性、阶段边界与Git

实测Windows、Node24.18.0、Edge157、Rust MSVC。保留原AbortSignal.timeout，使用AbortController转接而不依赖较新的AbortSignal.any；没有引入Temporal或polyfill，后端日历桶保持字符串，不发生新增时区转换。报表本地日历、补录固定北京时间、schema 12和既有备份规则保持原约定。

本轮未执行Windows安装包重建/安装卸载、真实扩展/透明/DPI或真实读屏器验证。表单错误可见性、字段语义、对比度、播报和图表可访问替代仍在B阶段；自定义趋势连续性及加载性能仍在C阶段。A阶段完成后停在此处，不自动进入下一阶段或替换公开成品。

使用Modern Web Guidance：performance中的“DO debounce or throttle rapid event listeners”用于限制重复刷新触发；保留只读请求取消与原有写入保护。另检查了capture-location-agnostic-data，但本次仅保留已有规范日期字符串，无日期计算需求，不新增Temporal及其兼容层。

```powershell
git fetch origin main
git add -- src/Dashboard.tsx src/dashboard/recordStatus.ts src/dashboard/Charts.tsx src/dashboard/api.ts src/dashboard/useDashboardData.ts src-tauri/src/data_center.rs src-tauri/src/report_tests.rs scripts/dashboard-fixture.mjs scripts/audit-web-comprehensive.mjs scripts/verify-web-phase-a.mjs tests/dashboard-api.test.mjs tests/dashboard-status.test.mjs tests/fixtures/dashboard-status-contract.json docs/WEB-PHASE-A.md docs/WEB-PHASE-A-SOURCE.md docs/BUILDING.md docs/PHASE-8.md
git diff --cached --check
git diff --cached --stat
git commit -m "fix: correct dashboard state charts and request recovery"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

保留原有未跟踪docs/DYNAMIC-ISLAND-PLAN.md，不纳入提交。实际同步结果见本轮回复，网络失败时保留本地提交，不强推。
