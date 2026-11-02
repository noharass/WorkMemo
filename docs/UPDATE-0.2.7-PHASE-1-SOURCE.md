# 0.2.7 第一阶段完整变更源码

本文件汇编本轮所有变更的可执行文本源码、测试及素材清单全文。文档和完整第三方许可全文保存在 FILES 清单对应路径，不重复汇编；WAV 为二进制，文件和摘要见 FILES 及素材 manifest。代码没有省略段。

## UPDATE — E:\WorkMemo\scripts\collect-licenses.mjs

SHA256：`2355ce971540577722830d9dbf08492a8a787ef619e60e4fbf692330ababc5cc`

````mjs
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(process.argv[2] ?? join(root, 'docs', 'THIRD-PARTY-LICENSES.txt'));
const metadata = spawnSync('cargo', ['metadata', '--locked', '--format-version', '1', '--filter-platform', 'x86_64-pc-windows-msvc', '--manifest-path', join(root, 'src-tauri', 'Cargo.toml')], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
if (metadata.status !== 0) throw new Error(metadata.stderr || 'Unable to read Cargo metadata');
const sections = ['WorkMemo third-party dependency notices',
  'Collected from locally installed package archives. Cargo entries include build and cross-platform dependencies; not every listed package is linked into the Windows executable.', ''];
let count = 0;
const supplemental = {
  'tauri-plugin@2.7.2': ['tauri-plugin-MIT.txt', 'https://github.com/tauri-apps/tauri/blob/59b63ab500da9859f12d8888c3298bc29bba0b92/LICENSE-MIT'],
  '@ant-design/icons-svg@4.6.0': ['ant-design-icons-MIT.txt', 'https://github.com/ant-design/ant-design-icons/blob/7f2516ac91226d2b41f93b35cb5197c8d94f7189/LICENSE'],
  'is-mobile@5.0.0': ['is-mobile-MIT.txt', 'https://github.com/juliangruber/is-mobile/blob/2708dd8f07d91f354a46b8dff3053abb6b840067/Readme.md'],
  'alloc-stdlib@0.3.0': ['alloc-stdlib-BSD-3-Clause.txt', 'https://github.com/dropbox/rust-alloc-no-stdlib/blob/0a81fd6928ea3b33c8cd484aa4575d50ffb98012/LICENSE'],
  'selectors@0.38.0': ['MPL-2.0.txt', 'https://www.mozilla.org/en-US/MPL/2.0/'],
  'webview2-com@0.39.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
  'webview2-com-sys@0.39.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
  'webview2-com-macros@0.8.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
};
function collect(label, directory, license, repository, supplement, source) {
  sections.push(`=== ${label} ===`, `Declared license: ${license || 'not specified'}`, `Repository: ${typeof repository === 'string' ? repository : repository?.url || 'see package manifest'}`);
  if (source) sections.push(`Package source archive (unmodified): ${source}`);
  const files = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /(^|[-_.])(licen[cs]e|copying|notice)([-_.]|$)/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!files.length) {
    if (!supplement) throw new Error(`Missing license text for ${label}; review the package before distribution.`);
    sections.push(`Supplemental license source: ${supplement[1]}`, readFileSync(join(root, 'scripts', 'third-party-licenses', supplement[0]), 'utf8'));
  }
  for (const file of files) sections.push(`--- ${file.name} ---`, readFileSync(join(directory, file.name), 'utf8'));
  sections.push('');
  count += 1;
}
const graph = JSON.parse(metadata.stdout);
const resolved = new Set(graph.resolve.nodes.map((node) => node.id));
for (const pkg of graph.packages.filter((pkg) => pkg.source && resolved.has(pkg.id)).sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`))) {
  collect(`Cargo ${pkg.name} ${pkg.version}`, dirname(pkg.manifest_path), pkg.license, pkg.repository, supplemental[`${pkg.name}@${pkg.version}`], `https://crates.io/api/v1/crates/${pkg.name}/${pkg.version}/download`);
}
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
for (const [path, entry] of Object.entries(lock.packages).filter(([path, entry]) => path && (!entry.dev || path === "node_modules/tailwindcss")).sort()) {
  const directory = join(root, path);
  const pkg = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
  collect(`npm ${pkg.name} ${entry.version}`, directory, pkg.license, pkg.repository, supplemental[`${pkg.name}@${entry.version}`]);
}
const audioManifest=JSON.parse(readFileSync(join(root,'src-tauri','sounds','manifest.json'),'utf8'));
sections.push('=== Audio: Kenney Interface Sounds 1.0 ===','Declared license: CC0-1.0',`Source: ${audioManifest.source}`,`Processing: ${audioManifest.processing}`, ...audioManifest.sounds.map(item=>`${item.theme}/${item.cue}: ${item.source} -> ${item.file}`),readFileSync(join(root,'src-tauri','sounds','source','LICENSE.txt'),'utf8'),'');
const fiftySounds = JSON.parse(readFileSync(join(root,'src-tauri','sounds','fiftysounds','manifest.json'),'utf8'));
sections.push('=== Audio: FiftySounds Menu and Interface effects ===', `License: ${fiftySounds.license_url}`, `Source: ${fiftySounds.source}`, `Processing: ${fiftySounds.processing}`,
  ...fiftySounds.sounds.map(item => `${item.cue}: ${item.page} -> ${item.file} (SHA256 ${item.sha256})`),
  readFileSync(join(root,'src-tauri','sounds','fiftysounds','LICENSE.txt'),'utf8'), '');
mkdirSync(dirname(destination), { recursive: true });
const output = `${sections.join('\n')}\n`;
if (!existsSync(destination) || readFileSync(destination, 'utf8') !== output) writeFileSync(destination, output, 'utf8');
console.log(`Collected dependency notices for ${count} package versions.`);
````

## UPDATE — E:\WorkMemo\scripts\dashboard-fixture.mjs

SHA256：`229f8fe5d32466ef9f50df3410b043f5c4d90d52e5d04c680111cb35330971ca`

````mjs
// HTTP fixtures for browser verification only. Never connects to a WorkMemo database.
export const keys = ["评测", "质检", "开发", "文档"];
export const fixtureDate = "2026-10-29";
export async function dashboardFixture(page) {
  const names = {
    revision: 1,
    names: { 评测: "评测", 质检: "质检", 开发: "代码开发", 文档: "文档" },
  };
  const presentation = {
    version: 1,
    revision: 0,
    background: null,
    categories: Object.fromEntries(
      keys.map((key, i) => [
        key,
        {
          icon: ["checkSquare", "safety", "code", "note"][i],
          color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
        },
      ]),
    ),
  };
  const records = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    category: i < 5 ? "评测" : i === 5 ? "质检" : "开发",
    quantity: i < 4 ? [30, 40, 50, 8.5][i] : i === 5 ? 0 : null,
    remark: "隔离测试记录 · 不写入用户数据库",
    start_time: Date.parse(`${fixtureDate}T09:00:00+08:00`) + i * 1800000,
    end_time: Date.parse(`${fixtureDate}T10:00:00+08:00`) + i * 1800000,
    duration_ms: i < 5 ? 1920000 : i === 5 ? 1200000 : 2250000,
    duration_seconds: i < 5 ? 1920 : i === 5 ? 1200 : 2250,
    status: "FINISHED",
    is_paused: true,
    recovery_pending: false,
    settlement_status: i < 4 || i === 5 ? "COMPLETE" : "PENDING",
    source: "MANUAL_START",
    pause_reason: null,
    confirmed_end_time: null,
    last_input_time: null,
    end_reason: "MANUAL",
    legacy_duration_ms: 0,
    revision: 0,
    control_mode: "MANUAL",
    is_demo: false,
    demo_batch: null,
  }));
  const active = {
    ...records[0],
    id: 99,
    category: "开发",
    quantity: null,
    status: "WORKING",
    settlement_status: "IN_PROGRESS",
    end_time: null,
    is_paused: false,
    duration_ms: 25000,
    duration_seconds: 25,
  };
  const state = {
    records,
    active,
    names,
    presentation,
    saveFailure: null,
    queryFailure: false,
    detailFailure: false,
    queryDelay: 0,
    delayFor: null,
    saveDelay: 0,
    saves: 0,
    queries: 0,
    details: 0,
    deletes: 0,
    currentQuery: null,
    requests: [],
    revisions: [],
    segments: [],
    many: false,
  };
  const iso = (date) => date.toISOString().slice(0, 10);
  function range(query) {
    const anchor = query.anchor_date ?? fixtureDate;
    const date = new Date(anchor + "T12:00:00Z");
    let start = query.start_date,
      end = query.end_date;
    if (query.period === "day") start = end = anchor;
    if (query.period === "week") {
      date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
      start = iso(date);
      date.setUTCDate(date.getUTCDate() + 6);
      end = iso(date);
    }
    if (query.period === "month") {
      date.setUTCDate(1);
      start = iso(date);
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(0);
      end = iso(date);
    }
    return {
      period: query.period,
      anchor_date: query.period === "custom" ? null : anchor,
      start_date: start,
      end_date: end,
      trend_unit: query.period === "day" ? "hour" : "day",
    };
  }
  function aggregate(rows) {
    return {
      duration_ms: rows.reduce((n, row) => n + row.duration_ms, 0),
      quantity: rows
        .filter((row) => row.settlement_status === "COMPLETE")
        .reduce((n, row) => n + row.quantity, 0),
      records: rows.length,
      pending: rows.filter((row) => row.settlement_status === "PENDING").length,
      complete: rows.filter((row) => row.settlement_status === "COMPLETE")
        .length,
    };
  }
  function data(query) {
    const resolved = range(query);
    const extras = state.many
      ? Array.from({ length: 52 }, (_, i) => ({
          ...state.records[0],
          id: 200 + i,
          quantity: 1,
        }))
      : [];
    const demo = {
      ...state.records[0],
      id: 500,
      is_demo: true,
      demo_batch: "isolated-browser-fixture",
      quantity: 999,
    };
    const filtered = [
      ...state.records,
      ...extras,
      ...(state.active ? [state.active] : []),
      demo,
    ].filter((row) => {
      const date = iso(new Date(row.start_time + 8 * 3600000));
      return (
        (query.scope === "all" || row.is_demo === (query.scope === "demo")) &&
        (!resolved.start_date || date >= resolved.start_date) &&
        (!resolved.end_date || date <= resolved.end_date) &&
        (!query.category || row.category === query.category) &&
        (query.status === "all" ||
          (query.status === "working" && row.status !== "FINISHED") ||
          (query.status === "pending" && row.settlement_status === "PENDING") ||
          (query.status === "complete" && row.settlement_status === "COMPLETE"))
      );
    });
    const ended = filtered.filter((row) => row.status === "FINISHED");
    const categories = keys
      .filter((key) => !query.category || key === query.category)
      .map((category) => ({
        category,
        ...aggregate(ended.filter((row) => row.category === category)),
      }));
    const buckets =
      query.period === "day"
        ? Array.from(
            { length: 24 },
            (_, hour) => String(hour).padStart(2, "0") + ":00",
          )
        : query.period === "custom"
          ? [fixtureDate]
          : Array.from({ length: 32 }, (_, i) => {
              const date = new Date(resolved.start_date + "T12:00:00Z");
              date.setUTCDate(date.getUTCDate() + i);
              return iso(date);
            }).filter((date) => date <= resolved.end_date);
    const trend = buckets.map((date) => ({
      date,
      ...aggregate(
        ended.filter((row) =>
          query.period === "day"
            ? new Date(row.start_time + 8 * 3600000).getUTCHours() ===
              Number(date.slice(0, 2))
            : iso(new Date(row.start_time + 8 * 3600000)) === date,
        ),
      ),
    }));
    const pages = Math.max(1, Math.ceil(filtered.length / 50)),
      current = Math.min(query.page, pages);
    return {
      range: resolved,
      totals: aggregate(ended),
      categories,
      trend,
      monthly: false,
      calendar: ended.length
        ? [[fixtureDate, aggregate(ended).duration_ms]]
        : [],
      records: filtered.slice((current - 1) * 50, current * 50),
      record_count: filtered.length,
      page: current,
      pages,
      scope: query.scope,
    };
  }
  state.data = data;
  await page.route("**/api/**", async (route) => {
    const endpoint = new URL(route.request().url()).pathname.split("/").at(-1);
    const body = route.request().postData()
      ? route.request().postDataJSON()
      : null;
    state.requests.push({ endpoint, body });
    if (endpoint === "meta")
      return route.fulfill({
        json: {
          version: "0.2.5 · 隔离验收",
          category_names: names,
          presentation,
          active: state.active,
        },
      });
    if (endpoint === "query") {
      state.queries++;
      state.currentQuery = body;
      const result = data(body),
        failure = state.queryFailure;
      const delay = state.delayFor ? state.delayFor(body) : state.queryDelay;
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      return failure
        ? route.fulfill({ status: 500, json: { error: "隔离统计读取失败" } })
        : route.fulfill({ json: result });
    }
    if (endpoint === "detail") {
      state.details++;
      if (state.detailFailure)
        return route.fulfill({
          status: 500,
          json: { error: "隔离详情读取失败" },
        });
      const record = [
        ...state.records,
        ...(state.active ? [state.active] : []),
      ].find((row) => row.id === body.id);
      if (!record) return route.fulfill({ status: 404, json: { error: "记录已删除，请刷新列表" } });
      return route.fulfill({
        json: { record, segments: state.segments, revisions: state.revisions },
      });
    }
    if (endpoint === "save") {
      state.saves++;
      if (state.saveDelay)
        await new Promise((resolve) => setTimeout(resolve, state.saveDelay));
      if (state.saveFailure)
        return route.fulfill({
          status: state.saveFailure,
          json: {
            error:
              state.saveFailure === 409
                ? "记录已被其他窗口修改"
                : "隔离保存失败",
          },
        });
      const row = state.records.find((row) => row.id === body.id);
      const before = structuredClone(row);
      Object.assign(row, body, {
        revision: row.revision + 1,
        settlement_status: "COMPLETE",
      });
      state.revisions.push({
        revision: row.revision,
        changed_at: Date.now(),
        before,
        after: structuredClone(row),
      });
      return route.fulfill({ json: { ok: true } });
    }
    if (endpoint === "delete") {
      state.deletes++;
      state.records = state.records.filter((row) => row.id !== body.id);
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({
      status: 404,
      json: { error: "No fixture endpoint" },
    });
  });
  return state;
}
````

## NEW FILE — E:\WorkMemo\scripts\desktop-fixture.mjs

SHA256：`3cba9ee3631eff298fa390f7b60a01aff0c5b165f6587e5bce8fdd5e5e4a4408`

````mjs
// Isolated IPC fixture for v0.2.7 browser checks only. No real backend is contacted.
export function desktopFixture(page) {
return page.addInitScript(() => {
  const params = new URLSearchParams(location.search), categories = ['评测', '质检', '开发', '文档'];
  const record = { id: 7, category: '开发', quantity: null, remark: '隔离任务', start_time: Date.now() - 60000, end_time: null, confirmed_end_time: null, duration_ms: 60000, duration_seconds: 60, status: 'WORKING', is_paused: params.get('state') === 'paused', recovery_pending: false, settlement_status: 'IN_PROGRESS', source: 'AUTO', control_mode: 'AUTO', revision: 1 };
  const ended = { ...record, id: 6, category: '文档', status: 'FINISHED', is_paused: true, settlement_status: 'PENDING', end_time: Date.now(), confirmed_end_time: Date.now() };
  const config = { enabled: true, revision: 3, times: { idle_pause_seconds: 120, away_pause_seconds: 120, hold_seconds: 600, idle_warning_seconds: 300, idle_end_seconds: 420 }, poll_interval_seconds: 1, auto_resume_manual: true, rules: [{ id: 1, category: '开发', match_mode: 'origin', url_prefix: 'https://work.example.test/' }] };
  const callbacks = new Map(), listeners = new Map(); let sequence = 0;
  const emit = (event, payload) => { for (const [id, entry] of listeners) if (entry.event === event) callbacks.get(entry.handler)?.({ event, id, payload }); };
  window.qa = { calls: [], active: params.get('state') === 'empty' ? null : record, candidate: params.has('candidate') ? { id: 21, rule_id: 1, category: '开发' } : null, notice: params.has('ended') ? { kind: 'ended', record: ended, idle_warning_seconds: 300, idle_end_seconds: 420 } : null, config, browse: false, fail: '', delay: 0, readsDelay: 100, emit, record };
  window.isTauri = true;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: id => listeners.delete(id) };
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: params.has('notice') ? 'notice' : params.has('panel') ? 'settings' : 'main' }, currentWebview: { label: 'fixture' } },
    transformCallback(fn) { const id = ++sequence; callbacks.set(id, fn); return id; }, unregisterCallback(id) { callbacks.delete(id); },
    convertFileSrc() { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="700"><path fill="#8fa9bb" d="M0 0h800v700H0z"/><path fill="#b9ad96" d="m0 0 800 700H0z"/></svg>'); },
    async invoke(command, args = {}) {
      const q = window.qa; q.calls.push({ command, args });
      const snapshot = () => structuredClone({ active: q.active, recent_records: q.notice ? [q.notice.record] : [], pending_count: q.notice ? 1 : 0, warning: null, monitoring: { browsing_only: q.browse, browse_ready: true, browse_category: '开发', enabled: true, native_available: true, browser_connected: true, work_page: true, message: '已识别工作页面，等待新的鼠标或键盘活动', idle_warning: false, idle_warning_seconds: 300, idle_end_seconds: 420, start_candidate: q.candidate } });
      if (command.startsWith('plugin:event|')) {
        if (command.endsWith('|listen')) { const id = ++sequence; listeners.set(id, args); return id; }
        if (command.endsWith('|unlisten')) listeners.delete(args.eventId);
        if (command.endsWith('|emit')) emit(args.event, args.payload);
        return null;
      }
      if (command === q.fail) { await new Promise(r => setTimeout(r, q.delay || 120)); throw Error('隔离保存失败，请重试'); }
      if (command === 'get_snapshot') return snapshot();
      if (command === 'get_notice') return structuredClone(q.notice);
      if (command === 'get_appearance') return { version: 1, theme: params.get('theme') || 'cream', opacity: Number(params.get('opacity') || 65) };
      if (command === 'get_category_names') return { revision: 0, names: Object.fromEntries(categories.map(c => [c, c])) };
      if (command === 'get_layout_settings') return { density: params.get('density') || 'comfortable', revision: 0, sound_enabled: false, sound_theme: 'fiftysounds', font_size: params.has('large') ? 18 : 14, font_weight: 400, line_spacing: 'standard' };
      if (command === 'get_presentation') return { version: 1, revision: 0, background: params.has('background') ? { file: 'isolated-background.svg', opacity: 50 } : null, categories: Object.fromEntries(categories.map((c, i) => [c, { icon: ['checkSquare', 'safety', 'code', 'note'][i], color: '#447cba' }])) };
      if (command === 'get_monitor_config') { const value = structuredClone(q.config); await new Promise(r => setTimeout(r, q.readsDelay)); return value; }
      if (command === 'get_connection_status') return { state: 'ready', message: '隔离连接', version: 'fixture', identifier: 'fixture', host_name: 'fixture' };
      if (command === 'save_monitor_config') { await new Promise(r => setTimeout(r, q.delay)); q.config = { ...args.input, revision: q.config.revision + 1, rules: args.input.rules.map((r, i) => ({ ...r, id: i + 1 })) }; return structuredClone(q.config); }
      if (command === 'get_today_workload') return [];
      if (command === 'detect_preview_data') return false;
      if (command === 'get_startup_status') return { enabled: false, available: true, error: null };
      if (command === 'pause_task') { q.active = { ...q.active, is_paused: true, pause_reason: 'MANUAL' }; return snapshot(); }
      if (command === 'resume_task') { q.active = { ...q.active, is_paused: false, pause_reason: null }; return snapshot(); }
      if (command === 'finish_task') { q.notice = { kind: 'ended', record: { ...q.active, status: 'FINISHED', end_time: Date.now(), settlement_status: 'PENDING' } }; q.active = null; return snapshot(); }
      if (command === 'confirm_work') {
        await new Promise(r => setTimeout(r, q.delay));
        if (q.active || !q.candidate || q.candidate.id !== args.candidateId) throw Error('开工提示已失效');
        q.active = { ...record, id: 8, category: q.candidate.category, duration_ms: 0, duration_seconds: 0, is_paused: false }; q.candidate = null; return snapshot();
      }
      if (command === 'enter_browsing') { q.browse = true; q.candidate = null; return snapshot(); }
      if (command === 'start_task') {
        if ((q.active?.id ?? null) !== args.expectedActiveId || (q.active && !q.active.is_paused)) throw Error('当前任务已变化，请刷新后重新确认');
        q.active = { ...record, ...args.input, id: 9, control_mode: 'MANUAL', is_paused: false }; q.candidate = null; return snapshot();
      }
      if (command === 'settle_record') { await new Promise(r => setTimeout(r, q.delay)); if (q.notice?.record.id !== args.input.id || q.notice.record.revision !== args.input.expected_revision) throw Error('记录已变化'); q.notice = null; return snapshot(); }
      if (command === 'defer_notice') { if (q.notice?.record.id === args.id) q.notice = null; return null; }
      if (command === 'get_island_viewport') return innerHeight;
      return null;
    },
  };
});
}
````

## NEW FILE — E:\WorkMemo\scripts\prepare-fiftysounds.mjs

SHA256：`afb02349140e3c60cd092c6bc86e3f99e4c5541c94b4b85ed95bacaa703c2cd7`

````mjs
// Prepare only the five FiftySounds effects from official ZIP downloads in artifacts/0.2.7/audio-source.
// Decode original CC0 OGGs using an existing Chromium/Playwright installation.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const sounds=join(root,'src-tauri','sounds');
const selections={fiftysounds:{start:'sfx-menu1',pause:'sfx-menu3',resume:'sfx-menu2',end:'sfx-menu6',warning:'sfx-menu5'}};
const browser=await chromium.launch({channel:'msedge',headless:true});
const manifest=[];
try{
 const page=await browser.newPage();
 for(const [theme,cues] of Object.entries(selections))for(const [cue,source] of Object.entries(cues)){
  const original=readFileSync(join(root,'artifacts','0.2.7','audio-source',source+'.mp3'));
  const decoded=await page.evaluate(async base64=>{
   const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
   const context=new OfflineAudioContext(1,1,22050);
   const buffer=await context.decodeAudioData(bytes.buffer);
   const mono=new Float32Array(buffer.length);
   for(let channel=0;channel<buffer.numberOfChannels;channel++){
    const samples=buffer.getChannelData(channel);
    for(let i=0;i<samples.length;i++)mono[i]+=samples[i]/buffer.numberOfChannels;
   }
   return Array.from(mono);
  },original.toString('base64'));
  let begin=decoded.findIndex(v=>Math.abs(v)>0.0005);if(begin<0)throw new Error('Silent source');
  let end=decoded.length;while(end>begin&&Math.abs(decoded[end-1])<0.0005)end--;
  let samples=decoded.slice(Math.max(0,begin-110),Math.min(end+220,Math.max(0,begin-110)+Math.floor(22050*0.85)));
  if(theme==='soft'){
   const alpha=1-Math.exp(-2*Math.PI*2800/22050);let previous=0;
   samples=samples.map(value=>(previous+=alpha*(value-previous)));
  }
  const peak=Math.max(...samples.map(Math.abs));
  const rms=Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length);
  const gain=Math.min((theme==='soft'?0.32:0.45)/peak,(theme==='soft'?0.075:0.1)/rms);
  samples=samples.map((value,i)=>value*gain*Math.min(1,i/110,(samples.length-1-i)/882));
  const wav=Buffer.alloc(44+samples.length*2);
  wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);
  wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(22050,24);wav.writeUInt32LE(44100,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
  wav.write('data',36);wav.writeUInt32LE(samples.length*2,40);
  samples.forEach((value,i)=>wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,value))*32767),44+i*2));
  const relative=`fiftysounds/${cue}.wav`;
  mkdirSync(join(sounds,'fiftysounds'),{recursive:true});writeFileSync(join(sounds,relative),wav);
  manifest.push({theme,cue,source:`https://www.fiftysounds.com/music/${source}.zip`,page:`https://www.fiftysounds.com/royalty-free-music/${source}.html`,original_file:`${source}.mp3`,archive_sha256:createHash('sha256').update(readFileSync(join(root,'artifacts','0.2.7','audio-source',source+'.zip'))).digest('hex'),file:relative,duration_ms:Math.round(samples.length/22.05),sha256:createHash('sha256').update(wav).digest('hex'),source_sha256:createHash('sha256').update(original).digest('hex')});
 }
 writeFileSync(join(sounds,'fiftysounds','manifest.json'),JSON.stringify({source:'https://www.fiftysounds.com/royalty-free-music/menu-interface-sound-effects.html',license:'FiftySounds License',license_url:'https://www.fiftysounds.com/music-license.html',retrieved:'2026-11-02',sample_rate:22050,channels:1,bits:16,processing:'trim silence; resample; target RMS 0.1 and peak <=0.45; fade in 5ms/out 40ms; cap 850ms',sounds:manifest},null,2)+'\n');
 console.log(JSON.stringify(manifest.map(({theme,cue,duration_ms})=>({theme,cue,duration_ms}))));
}finally{await browser.close();}
````

## UPDATE — E:\WorkMemo\scripts\verify-v025-followup.mjs

SHA256：`1e289322e5f02a42668144ed44b9fc7e347a0d28033ad7024fe294e76e03c1aa`

````mjs
// The category workflow now explicitly selects records; keep the historical command usable.
import './verify-v027-web.mjs';
````

## NEW FILE — E:\WorkMemo\scripts\verify-v027-island.mjs

SHA256：`3fcd151bca354901c014df372689aebabf8af63933acbeedba4947598ff9c211`

````mjs
import { desktopFixture } from './desktop-fixture.mjs';
// Browser-only IPC fixtures. No real backend, database, registration or work task is used.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.7/qa/island/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 780, height: 680 } });
const errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
await desktopFixture(page);
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1420/';
async function load(params = {}, width = 780, height = 680) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}?${new URLSearchParams(params)}`);
  await page.locator('.desktop-frame').waitFor();
  await page.waitForTimeout(220);
}
// Native region is modelled by IPC observations; this does not prove Windows rendering.
try {
  await load({notice:'1',candidate:'1',state:'empty'},320,420);
  await page.getByRole('button',{name:'开始记录',exact:true}).waitFor();
  await page.waitForTimeout(650);
  const metrics = await page.evaluate(()=>({
    height:document.querySelector('.island-expansion').getBoundingClientRect().height,
    region:window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height ?? 56,
    calls:window.qa.calls.filter(c=>['set_island_region','hold_island'].includes(c.command)),
  }));
  if(process.argv.includes('--baseline')) {
    await writeFile(new URL('baseline.json',output),JSON.stringify(metrics,null,2));
    console.log(JSON.stringify(metrics));
  } else {
    assert.ok(metrics.height>50,JSON.stringify(metrics));
    assert.ok(metrics.region>=metrics.height+55,JSON.stringify(metrics));
    for(let i=0;i<3;i++) {
      await page.getByRole('button',{name:'收起展开区域',exact:true}).click();
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height),56);
      await page.getByRole('button',{name:'展开工作提醒',exact:true}).click();
      await page.waitForTimeout(400);
      assert.ok(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height)>100);
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.getByRole('button',{name:'收起展开区域',exact:true}).click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.island-expansion').evaluate(el=>el.getBoundingClientRect().height),0);
    await page.getByRole('button',{name:'展开工作提醒',exact:true}).click();
    await page.waitForTimeout(150);
    assert.ok(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height)>100);
    assert.equal(await page.getByRole('button',{name:'收起展开区域',exact:true}).getAttribute('aria-expanded'),'true');
    assert.deepEqual(errors,[]);
    await page.screenshot({path:fileURLToPath(new URL('candidate.png',output))});
    await writeFile(new URL('result.json',output),JSON.stringify({isolated:true,native:false,metrics,errors},null,2));
    console.log('Island native-region contract, repeated reveal and reduced-motion checks passed.');
  }
} finally { await browser.close(); }
````

## NEW FILE — E:\WorkMemo\scripts\verify-v027-visual.mjs

SHA256：`33f47e0b4f5a1205131ef40342ce00177cbda7b6490ba85e50f07e28c35d1dc1`

````mjs
import { desktopFixture } from './desktop-fixture.mjs';
// Browser-only IPC fixtures. No real backend, database, registration or work task is used.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.7/qa/visual/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 780, height: 680 } });
const errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
await desktopFixture(page);
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1420/';
async function load(params = {}, width = 780, height = 680) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}?${new URLSearchParams(params)}`);
  await page.locator('.desktop-frame').waitFor();
  await page.waitForTimeout(220);
}
try {
  const metrics=[];
  for(const theme of ['glass','cream','dark','neon']) for(const opacity of [40,65,100]) for(const density of ['compact','comfortable']) {
    await load({state:'empty',theme,opacity:String(opacity),density},420,380);
    await page.getByRole('region',{name:'监测状态'}).waitFor();
    await page.getByRole('button',{name:'新建任务',exact:true}).waitFor();
    await page.evaluate(()=>document.body.style.background='linear-gradient(110deg, #111 0%, #aaa 50%, #fff 100%)');
    const browse=page.getByRole('button',{name:'仅浏览',exact:true});
    await browse.hover();
    const styles=await browse.evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
    assert.ok(styles.background.startsWith('rgba('),JSON.stringify(styles));
    const alpha=Number(styles.background.split(',').at(-1).replace(')',''));
    assert.ok(alpha<=0.2,JSON.stringify(styles));
    assert.equal(await page.locator('.desktop-frame').evaluate(el=>getComputedStyle(el).opacity),'1');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    metrics.push({theme,opacity,density,styles});
    await page.screenshot({path:fileURLToPath(new URL(`main-${theme}-${opacity}-${density}.png`,output))});
  }
  await load({panel:'settings',section:'layout'},780,680);
  await page.getByRole('button',{name:'布局',exact:true}).click();
  const sound=page.getByRole('combobox',{name:'提示音套装',exact:true});
  assert.equal(await sound.inputValue(),'fiftysounds');
  for(const value of ['fiftysounds','soft','crisp']){
    await sound.selectOption(value);
    for(const cue of ['开始','暂停','恢复','结束','空闲提醒'])await page.getByRole('button',{name:`试听${cue}`,exact:true}).click();
  }
  assert.equal(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='preview_sound').length),15);
  assert.deepEqual(errors,[]);
  await writeFile(new URL('result.json',output),JSON.stringify({isolated:true,native:false,metrics,soundPreviewCalls:15,errors},null,2));
  console.log('24 four-skin/opacity/density layouts, hover alpha and 15 preview bindings passed.');
}finally{await browser.close();}
````

## NEW FILE — E:\WorkMemo\scripts\verify-v027-web.mjs

SHA256：`05b2bac1a830afa1e83e8fc83023df996d73f577204ca73f83d632e81d66e9df`

````mjs
// Isolated HTTP fixtures; no live task, real database or browser registration is touched.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture, fixtureDate } from './dashboard-fixture.mjs';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:1420';
const output = new URL('../artifacts/0.2.7/qa/web/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [], results = [];
let page;
async function setup(width = 1440) {
  await page?.close();
  page = await browser.newPage({ viewport: { width, height: 900 }, timezoneId: 'Asia/Shanghai' });
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => errors.push(error.message));
  return dashboardFixture(page);
}
const sheet = () => page.locator('.dc-sheet-root .wm-drawer-section');
const list = () => page.getByRole('region', { name: '待补填记录列表' });
const quantity = () => page.getByRole('textbox', { name: '工作量', exact: true });
async function goto() {
  await page.goto(`${base}/dashboard#token=isolated-v027`);
  await page.locator('.dc-category-report').getByText('128.5', { exact: true }).waitFor();
}
async function open(count = 2) {
  await page.getByRole('button', { name: `代码开发待补填${count}条`, exact: true }).click();
  await list().waitFor();
  await page.getByRole('button', { name: '补填记录7', exact: true }).waitFor();
  await page.waitForTimeout(300);
}
async function choose(id) {
  await page.getByRole('button', { name: `补填记录${id}`, exact: true }).click();
  await page.locator('#dc-editor').waitFor();
  await page.waitForFunction(() => document.activeElement?.id === 'dc-quantity');
}
async function test(name, action) { await action(); results.push(name); }
try {
  await test('choose an arbitrary record before editing; failures preserve fields; zero saves once and returns to scoped list', async () => {
    const state = await setup(); await goto(); await open();
    assert.equal(state.details, 0); assert.equal(await page.locator('#dc-editor').count(), 0);
    const request = state.requests.filter(r => r.endpoint === 'query' && r.body.status === 'pending').at(-1).body;
    assert.equal(request.anchor_date, fixtureDate); assert.equal(request.category, '开发'); assert.equal(request.scope, 'real');
    await choose(8);
    assert.equal(await sheet().locator('.dc-eyebrow').innerText(), 'WORK RECORD #8');
    assert.equal(await page.getByRole('button', { name: '保存并下一条', exact: true }).count(), 0);
    await page.getByRole('button', { name: '保存工作量', exact: true }).click();
    assert.equal(state.saves, 0);
    await quantity().fill('0');
    state.saveFailure = 409;
    await page.getByRole('button', { name: '保存工作量', exact: true }).click();
    await sheet().getByRole('alert').filter({ hasText: '记录已被其他窗口修改' }).waitFor();
    assert.equal(await quantity().inputValue(), '0');
    state.saveFailure = null; state.saveDelay = 150;
    await page.getByRole('button', { name: '保存工作量', exact: true }).evaluate(button => { button.click(); button.click(); });
    await list().waitFor(); await list().getByText('工作量已保存，请选择下一条记录。', { exact: true }).waitFor();
    assert.equal(state.saves, 2); assert.equal(state.records.find(r => r.id === 8).quantity, 0);
    assert.equal(state.records.find(r => r.id === 7).settlement_status, 'PENDING');
    assert.equal(await page.locator('#dc-editor').count(), 0);
    await page.waitForFunction(() => document.activeElement?.dataset.pendingId === '7');
    await page.screenshot({ path: fileURLToPath(new URL('saved-list.png', output)) });
  });
  await test('dirty return and close guard preserve input; single and empty lists still require explicit selection', async () => {
    const state = await setup(390); state.records = state.records.filter(r => r.id !== 8);
    await goto(); await open(1); assert.equal(state.details, 0);
    await choose(7); await quantity().fill('12');
    await page.getByRole('button', { name: '返回列表', exact: true }).click();
    const guard = page.getByRole('dialog', { name: '保留未保存的修改？' });
    await guard.getByRole('button', { name: '继续编辑', exact: true }).click();
    assert.equal(await quantity().inputValue(), '12');
    await page.getByRole('button', { name: '返回列表', exact: true }).click();
    await guard.getByRole('button', { name: '放弃修改', exact: true }).click();
    await list().waitFor(); assert.equal(state.saves, 0);
    state.records.find(r => r.id === 7).settlement_status = 'COMPLETE';
    await page.getByRole('button', { name: '刷新待补填列表', exact: true }).click();
    await list().getByText('当前分类在这个范围已没有待补填记录。', { exact: true }).waitFor();
    const box = await sheet().boundingBox();
    assert.ok(Math.abs(box.x + box.width / 2 - 195) < 2);
    await page.screenshot({ path: fileURLToPath(new URL('empty-mobile.png', output)) });
  });
  await test('51+ pending records are selectable across pages; original period/category/scope remain fixed', async () => {
    const state = await setup();
    const seed = state.records.find(r => r.id === 7);
    state.records.push(...Array.from({ length: 51 }, (_, i) => ({ ...seed, id: 1000 + i, remark: `隔离待补填 ${i}` })));
    state.records.push({ ...seed, id: 2000, start_time: Date.parse('2026-01-01T09:00:00+08:00') });
    await goto(); await open(53);
    await list().getByTitle('2', { exact: true }).click();
    await page.getByRole('button', { name: '补填记录1050', exact: true }).waitFor();
    await choose(1050); await quantity().fill('1');
    await page.getByRole('button', { name: '保存工作量', exact: true }).click(); await list().waitFor();
    assert.equal(state.records.find(r => r.id === 1050).settlement_status, 'COMPLETE');
    assert.equal(state.records.find(r => r.id === 2000).settlement_status, 'PENDING');
    const scoped = state.requests.filter(r => r.endpoint === 'query' && r.body.status === 'pending');
    assert.ok(scoped.some(r => r.body.page === 2));
    assert.ok(scoped.every(r => r.body.category === '开发' && r.body.scope === 'real' && r.body.anchor_date === fixtureDate));
    assert.equal(state.active.id, 99);
  });
  await test('commit followed by failed refresh stays saved; retry only reads and cannot resubmit', async () => {
    const state = await setup(); await goto(); await open(); await choose(7); await quantity().fill('3');
    state.queryFailure = true;
    await page.getByRole('button', { name: '保存工作量', exact: true }).click();
    await list().getByRole('alert').filter({ hasText: '已保存，列表刷新失败' }).waitFor();
    assert.equal(state.saves, 1); assert.equal(await page.locator('#dc-editor').count(), 0);
    state.queryFailure = false;
    await page.getByRole('button', { name: '刷新待补填列表', exact: true }).click();
    await page.getByRole('button', { name: '补填记录8', exact: true }).waitFor();
    assert.equal(state.saves, 1);
  });
  await test('changed and removed rows never select a replacement; initial read failure has an explicit retry', async () => {
    const state = await setup(); await goto();
    state.queryFailure = true;
    await page.getByRole('button', { name: '代码开发待补填2条', exact: true }).click();
    await list().getByRole('alert').waitFor(); assert.equal(state.details, 0);
    state.queryFailure = false;
    await page.getByRole('button', { name: '刷新待补填列表', exact: true }).click();
    await page.getByRole('button', { name: '补填记录7', exact: true }).waitFor();
    state.records.find(r => r.id === 7).category = '文档';
    await page.getByRole('button', { name: '补填记录7', exact: true }).click();
    await list().getByText('这条记录已变化，请重新选择。', { exact: true }).waitFor();
    assert.equal(await page.locator('#dc-editor').count(), 0);
    state.records = state.records.filter(r => r.id !== 8);
    await page.getByRole('button', { name: '补填记录8', exact: true }).click();
    await list().getByRole('alert').waitFor(); assert.equal(state.saves, 0);
  });
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ isolated: true, native: false, results, errors }, null, 2));
  console.log(`v0.2.7 pending selection: ${results.length} scenarios passed.`);
} catch (error) {
  await page?.screenshot({ path: fileURLToPath(new URL('failure.png', output)) });
  await writeFile(new URL('failure.json', output), JSON.stringify({ results, errors, message: String(error), html: await page?.content() }, null, 2));
  throw error;
} finally { await browser.close(); }
````

## UPDATE — E:\WorkMemo\scripts\verify-web-ui.mjs

SHA256：`83e7693c8f225fc034618112b1ad8e9e62469b55af49f67b5a936740621cae20`

````mjs
// End-to-end Ant Design regression. All /api requests are intercepted in an isolated browser.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dashboardFixture } from "./dashboard-fixture.mjs";
const { chromium } = await import(
  process.env.WORKMEMO_PLAYWRIGHT
    ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href
    : "playwright"
);
const output = new URL("../artifacts/web-ui/qa/", import.meta.url);
const baseUrl = process.env.WORKMEMO_WEB_URL ?? "http://127.0.0.1:1420";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  timezoneId: "Asia/Shanghai",
});
if (process.env.WORKMEMO_WEB_URL) {
  // Match the Rust data server's CSP while testing the compiled, local assets.
  await context.route("**/dashboard", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
      },
    });
  });
}
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [],
  warnings = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (value) => {
  if (
    value.type() === "error" &&
    !value.text().includes("status of 500") &&
    !value.text().includes("status of 409")
  )
    warnings.push(value.text());
});
const state = await dashboardFixture(page);
const shot = (name) =>
  page.screenshot({
    path: fileURLToPath(new URL(name + ".png", output)),
    fullPage: false,
  });
const result = { baseUrl };
const layoutOnly = process.argv.includes("--layout-only");
const sheet = page.locator(".dc-sheet-root .wm-drawer-section");
const editor = page.locator("#dc-editor");
const report = page.locator(".dc-category-report");
const quantity = page.getByRole("textbox", { name: "工作量", exact: true });
async function open(edit = false, index = 0) {
  await page.locator(".dc-page").waitFor({ state: "visible" });
  const background = await page.locator(".dc-page").boundingBox();
  await page
    .locator(".dc-records")
    .getByRole("button", { name: edit ? "编辑" : "详情", exact: true })
    .nth(index)
    .click();
  await sheet.waitFor();
  await page.waitForTimeout(350);
  await page.waitForFunction(
    () =>
      !document
        .querySelector(".wm-drawer-content-wrapper")
        ?.className.includes("-active"),
  );
  const locked = await page.locator(".dc-page").boundingBox();
  assert.ok(
    Math.abs(background.x - locked.x) < 1 &&
      Math.abs(background.width - locked.width) < 1,
    "opening the sheet must not shift the background",
  );
}
async function close() {
  await sheet.getByRole("button", { name: "关闭", exact: true }).click();
  await sheet.waitFor({ state: "hidden" });
  await page.waitForFunction(
    () => document.querySelector(".dc-page")?.inert === false,
  );
}
async function select(label, option) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page
    .locator(".wm-select-dropdown:visible")
    .getByText(option, { exact: true })
    .last()
    .click();
}
try {
  await page.goto(`${baseUrl}/dashboard#token=isolated-web-ui-fixture`);
  await report.getByText("128.5", { exact: true }).waitFor();
  assert.equal(await page.locator(".dc-kpi").count(), 3);
  assert.equal(await report.locator("tbody tr[data-row-key]").count(), 4);
  assert.equal(
    await report.locator(".dc-report-quantity strong").nth(1).textContent(),
    "0",
  );
  assert.equal(
    await report.locator(".dc-report-quantity strong").nth(2).textContent(),
    "待补填",
  );
  await shot("overview-desktop");
  await page.screenshot({
    path: fileURLToPath(new URL("overview-full.png", output)),
    fullPage: true,
  });
  if (!layoutOnly) {
    // Wait for the real canvas entrance animation, including slower CI/browser scheduling.
    await page.locator(".dc-trend .dc-chart canvas").evaluate(canvas => new Promise((resolve, reject) => {
      const started = performance.now(); let previous = "", stable = 0;
      function sample() {
        const current = canvas.toDataURL();
        stable = current === previous ? stable + 1 : 0; previous = current;
        if (stable >= 4 && performance.now() - started >= 350) return resolve(true);
        if (performance.now() - started > 5000) return reject(Error("Initial chart did not settle"));
        requestAnimationFrame(sample);
      }
      sample();
    }));
    const graph = await page.locator(".dc-trend .dc-chart").screenshot();
    await page.waitForTimeout(2400);
    const polledGraph = await page.locator(".dc-trend .dc-chart").screenshot();
    await writeFile(new URL("poll-before.png", output), graph);
    await writeFile(new URL("poll-after.png", output), polledGraph);
    assert.ok(graph.equals(polledGraph), "unchanged polling must not redraw a different chart");
    result.stablePolling = true;

    await open(true);
    assert.equal(state.saves, 0, "entering edit must not submit");
    await page.waitForFunction(
      () => document.activeElement?.id === "dc-quantity",
    );
    await shot("edit-desktop");
    const geometry = await sheet.boundingBox();
    assert.ok(
      geometry.width <= 761 && geometry.height <= 881,
      JSON.stringify(geometry),
    );
    assert.ok(
      Math.abs(geometry.y + geometry.height / 2 - 500) < 2 && Math.abs(geometry.x + geometry.width / 2 - 720) < 2,
      JSON.stringify(geometry),
    );
    const scrollY = await page.evaluate(() => scrollY);
    await page.mouse.move(80, 200);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(180);
    assert.equal(
      await page.evaluate(() => window.scrollY),
      scrollY,
      "background wheel is locked",
    );
    await quantity.fill("0");
    for (const status of [500, 409]) {
      state.saveFailure = status;
      await sheet.locator('button[form="dc-editor"]').click();
      await sheet
        .getByRole("alert")
        .filter({
          hasText: status === 409 ? "记录已被其他窗口修改" : "隔离保存失败",
        })
        .waitFor();
      assert.equal(await quantity.inputValue(), "0");
    }
    state.saveFailure = null;
    state.queryDelay = 900;
    await page.evaluate(() => {
      window.webFrames = [];
      window.webSample = true;
      const sample = () => {
        if (!window.webSample) return;
        window.webFrames.push({
          report: !!document.querySelector(".dc-report-table tbody"),
          kpi: document.querySelector(".dc-kpi strong")?.textContent,
          y: scrollY,
          loading: !!document.querySelector(".dc-category-report .dc-loading"),
        });
        requestAnimationFrame(sample);
      };
      sample();
    });
    await sheet.locator('button[form="dc-editor"]').click();
    await editor.waitFor({ state: "detached" });
    await page.waitForTimeout(1200);
    const frames = await page.evaluate(() => {
      window.webSample = false;
      return window.webFrames;
    });
    assert.ok(frames.length > 10);
    assert.ok(
      frames.every(
        (frame) =>
          frame.report &&
          !frame.loading &&
          !frame.kpi.startsWith("—") &&
          frame.y === scrollY,
      ),
      "save must preserve the background at every sampled frame",
    );
    await close();
    await report.getByText("98.5", { exact: true }).waitFor();
    // The Drawer restores the trigger after its leave callback, on the next frame.
    await page.waitForFunction(
      element => element === document.activeElement,
      await page.locator(".dc-records").getByRole("button", { name: "编辑", exact: true }).first().elementHandle(),
    );
    assert.equal(await page.evaluate(() => window.scrollY), scrollY);
    assert.equal(
      await page
        .locator(".dc-records")
        .getByRole("button", { name: "编辑", exact: true })
        .first()
        .evaluate((el) => el === document.activeElement),
      true,
    );
    state.queryDelay = 0;
    result.saveNoFlicker = {
      sampledFrames: frames.length,
      zero: true,
      failuresPreserveInput: true,
      focusRestored: true,
    };

    state.queryFailure = true;
    await page.getByRole("button", { name: "刷新连接", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "刷新失败，当前显示上次结果" })
      .waitFor();
    await report.getByText("98.5", { exact: true }).waitFor();
    state.queryFailure = false;
    await page.getByRole("button", { name: "刷新连接", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "刷新失败，当前显示上次结果" })
      .waitFor({ state: "detached" });
    result.staleSnapshotLabel = true;

    await open(true);
    await quantity.fill("12.5");
    await sheet.getByRole("button", { name: "关闭", exact: true }).click();
    const guard = page.getByRole("dialog", { name: "保留未保存的修改？" });
    await guard.waitFor();
    await page.waitForFunction(
      () => document.activeElement?.textContent === "继续编辑",
    );
    await shot("unsaved-confirmation");
    await page.keyboard.press("Control+s");
    assert.equal(state.saves, 3);
    await page.keyboard.press("Escape");
    await guard.waitFor({ state: "hidden" });
    assert.equal(await quantity.inputValue(), "12.5");
    assert.equal(
      await sheet.isVisible(),
      true,
      "one Escape must close only the confirmation",
    );
    await sheet.getByRole("button", { name: "关闭", exact: true }).click();
    await guard.getByRole("button", { name: "放弃修改", exact: true }).click();
    await sheet.waitFor({ state: "hidden" });
    result.nestedGuard = true;

    await open(true);
    await quantity.fill("1.25e2");
    await page.keyboard.press("Control+s");
    await editor.waitFor({ state: "detached" });
    assert.equal(state.records[0].quantity, 125);
    await close();
    result.scientificQuantity = true;

    // Invalid quantities remain strings and never reach the save endpoint.
    await open(true);
    const beforeInvalid = state.saves;
    for (const value of ["-1", "1e-9999", "1000000001"]) {
      await quantity.fill(value);
      await sheet.locator('button[form="dc-editor"]').click();
      await sheet.getByRole("alert").waitFor();
      assert.equal(state.saves, beforeInvalid);
      assert.equal(await quantity.inputValue(), value);
    }
    // Official Select popup stays inside the sheet and has keyboard selection.
    await sheet
      .getByRole("combobox", { name: "工作类别", exact: true })
      .click();
    const popup = sheet.locator(".wm-select-dropdown:visible");
    await popup.getByText("质检", { exact: true }).last().click();
    assert.equal(
      await sheet
        .getByRole("combobox", { name: "工作类别", exact: true })
        .getAttribute("aria-expanded"),
      "false",
    );
    await sheet
      .getByRole("button", { name: "关闭", exact: true })
      .last()
      .click();
    await guard.getByRole("button", { name: "放弃修改", exact: true }).click();
    await sheet.waitFor({ state: "hidden" });
    result.validationAndSheetSelect = true;

    // Persisted writes cannot be relabelled as failed when a follow-up GET fails.
    await open(true);
    await quantity.fill("126");
    state.detailFailure = true;
    await sheet.locator('button[form="dc-editor"]').click();
    await editor.waitFor({ state: "detached" });
    await sheet
      .getByRole("alert")
      .filter({ hasText: "已保存，详情刷新失败" })
      .waitFor();
    assert.equal(state.records[0].quantity, 126);
    assert.equal(
      await sheet
        .getByRole("button", { name: "编辑工作量", exact: true })
        .isDisabled(),
      true,
    );
    state.detailFailure = false;
    await close();
    result.committedReadFailure = true;

    // The guard's own save succeeds/fails without submitting the underlying form twice.
    await open(true);
    await quantity.fill("127");
    await page.keyboard.press("Escape");
    await guard.waitFor();
    const beforeGuardSave = state.saves;
    state.saveFailure = 500;
    await guard
      .getByRole("button", { name: "保存并继续", exact: true })
      .click();
    await guard
      .getByRole("alert")
      .filter({ hasText: "隔离保存失败" })
      .waitFor();
    assert.equal(state.saves, beforeGuardSave + 1);
    state.saveFailure = null;
    await guard.getByRole("button", { name: /保存并继续$/ }).click();
    await guard.waitFor({ state: "hidden" });
    await sheet.waitFor({ state: "hidden" });
    assert.equal(state.records[0].quantity, 127);
    result.guardSave = true;

    // DatePicker and Segmented retain natural-period and local-date semantics.
    await page
      .locator(".dc-period-bar")
      .getByText("周", { exact: true })
      .click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026-10-26 — 2026-11-01" })
      .waitFor();
    assert.equal(
      await page.getByRole("button", { name: "下一周期" }).isEnabled(),
      true,
    );
    await page.getByRole("button", { name: "下一周期" }).click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026-11-02 — 2026-11-08" })
      .waitFor();
    await page.getByRole("button", { name: "上一周期" }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("月", { exact: true })
      .click();
    const date = page.getByRole("textbox", { name: "基准日期", exact: true });
    await date.fill("2024-02-29");
    await date.press("Enter");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2024 年 02 月" })
      .waitFor();
    assert.equal(state.currentQuery.anchor_date, "2024-02-29");
    await date.click();
    await page.locator(".wm-picker-dropdown:visible").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "本月", exact: true }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("自定义", { exact: true })
      .click();
    await page.getByRole("button", { name: "全部日期", exact: true }).click();
    await page
      .locator(".dc-category-report")
      .getByText("最早记录 — 至今", { exact: false })
      .waitFor();
    await select("筛选工作类别", "代码开发");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".dc-report-table tbody tr[data-row-key]")
          .length === 1,
    );
    assert.equal(state.currentQuery.category, "开发");
    await select("筛选工作类别", "全部类别");
    await select("数据范围", "演示数据");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await report.getByText("999", { exact: true }).waitFor();
    await select("数据范围", "真实数据");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("日", { exact: true })
      .click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026.10.29" })
      .waitFor();
    result.periodsAndScopes = true;

    // An older, deliberately delayed query must not overwrite the latest result.
    state.delayFor = (query) => (query.category === "评测" ? 650 : 0);
    await select("筛选工作类别", "评测");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await select("筛选工作类别", "质检");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await report.getByText("0", { exact: true }).waitFor();
    await page.waitForTimeout(850);
    assert.equal(await report.locator("tbody tr[data-row-key]").count(), 1);
    assert.equal(await report.locator(".work-badge").innerText(), "质检");
    state.delayFor = null;
    await select("筛选工作类别", "全部类别");
    await page.getByRole("button", { name: "应用筛选" }).click();
    result.staleRequestIgnored = true;

    // Pagination is controlled by the existing 50-row backend contract.
    state.many = true;
    await page.getByRole("button", { name: "刷新连接" }).click();
    await page.locator(".wm-pagination-item-2").click();
    await page.waitForFunction(
      () =>
        document.querySelector(".wm-pagination-item-active")?.textContent ===
        "2",
    );
    assert.equal(state.currentQuery.page, 2);
    state.many = false;
    await page.locator(".wm-pagination-item-1").click();
    await page
      .locator(".dc-records")
      .getByRole("button", { name: "详情", exact: true })
      .first()
      .waitFor();
    result.pagination = true;

    // Read-only active records and explicit delete confirmation.
    const activeRow = page.locator('.dc-records tr[data-row-key="99"]');
    assert.equal(
      await activeRow
        .getByRole("button", { name: "编辑", exact: true })
        .isDisabled(),
      true,
    );
    await activeRow.getByRole("button", { name: "详情", exact: true }).click();
    await sheet.waitFor();
    assert.equal(
      await sheet
        .getByRole("button", { name: "编辑工作量", exact: true })
        .isDisabled(),
      true,
    );
    await close();
    await page
      .locator(".dc-records")
      .getByRole("button", { name: "删除", exact: true })
      .first()
      .click();
    const deletion = page.getByRole("dialog", { name: "删除这条记录？" });
    await deletion.waitFor();
    assert.equal(state.deletes, 0);
    await deletion.getByRole("button", { name: "取消", exact: true }).click();
    await deletion.waitFor({ state: "hidden" });
    assert.equal(state.deletes, 0);
    result.readOnlyAndDeleteCancel = true;

    // Body-only scrolling, nested focus, boundary chaining, short-screen footer.
    state.segments = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      start_time: state.records[0].start_time,
      end_time: state.records[0].end_time,
      duration_ms: 30000,
      state: "CLOSED",
    }));
    await page.setViewportSize({ width: 1024, height: 520 });
    await open();
    await sheet.getByRole("button", { name: "计时区间（25）" }).click();
    const body = sheet.locator(".wm-drawer-body");
    await body.evaluate((el) => (el.scrollTop = el.scrollHeight));
    const bodyTop = await body.evaluate((el) => el.scrollTop),
      backgroundTop = await page.evaluate(() => scrollY);
    await body.hover();
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => scrollY), backgroundTop);
    assert.ok((await body.evaluate((el) => el.scrollTop)) >= bodyTop);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .locator(".dc-sheet-root")
          .evaluate((el) => el.contains(document.activeElement)),
        true,
        JSON.stringify(
          await page.evaluate(() => ({
            focused: document.activeElement?.outerHTML.slice(0, 500),
          })),
        ),
      );
    }
    const footer = await sheet.locator(".wm-drawer-footer").boundingBox();
    assert.ok(footer.y + footer.height <= 520 && footer.y >= 0);
    await close();
    state.segments = [];
    result.shortScreenScrollAndFocus = true;
  }

  const widths = [];
  for (const width of [390, 640, 800, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(160);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `page overflow ${width}`,
    );
    await page.evaluate(() => scrollTo(0, 0));
    await shot("overview-" + width);
    await open(true);
    const box = await sheet.boundingBox();
    assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
    assert.ok(
      Math.abs(box.y + box.height / 2 - 500) < 2 && Math.abs(box.x + box.width / 2 - width / 2) < 2,
      JSON.stringify({ width, ...box }),
    );
    await shot("sheet-" + width);
    await close();
    widths.push(width);
  }
  result.widths = widths;
  const zooms = [];
  for (const zoom of [1.25, 1.5]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(
      (value) => (document.documentElement.style.zoom = String(value)),
      zoom,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await open(true);
    const box = await sheet.boundingBox();
    assert.ok(
      box.x >= 0 &&
        box.x + box.width <= 1281 &&
        box.y >= 0 &&
        box.y + box.height <= 901 && Math.abs(box.y + box.height / 2 - 450) < 2 && Math.abs(box.x + box.width / 2 - 640) < 2,
      JSON.stringify({ zoom, ...box }),
    );
    await shot("zoom-" + zoom);
    await close();
    zooms.push(zoom);
  }
  await page.evaluate(() => (document.documentElement.style.zoom = "1"));
  result.cssZooms = zooms;
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(true);
  await shot("reduced-motion");
  await close();
  result.reducedMotion = true;
  if (!layoutOnly) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => {
      window.motionFrames = [];
      window.sampleMotion = true;
      const sample = () => {
        if (!window.sampleMotion) return;
        const panel = document.querySelector(".wm-drawer-section");
        if (panel?.getClientRects().length)
          window.motionFrames.push({
            y: panel.getBoundingClientRect().y,
            locked: document.querySelector(".dc-page").inert,
          });
        requestAnimationFrame(sample);
      };
      sample();
    });
    await open();
    const settled = await sheet.boundingBox();
    await close();
    const animation = await page.evaluate(() => {
      window.sampleMotion = false;
      return window.motionFrames;
    });
    assert.ok(
      animation.some((frame) => frame.y > settled.y + 20),
      "official bottom motion must move the panel",
    );
    assert.ok(
      animation.every((frame) => frame.locked),
      "background remains locked throughout both motions",
    );
    result.officialMotion = { frames: animation.length };

    await open(true);
    await quantity.fill("128");
    state.saveDelay = 400;
    const before = state.saves;
    await sheet.locator('button[form="dc-editor"]').click();
    await page.keyboard.press("Control+s");
    await editor.waitFor({ state: "detached" });
    assert.equal(state.saves, before + 1);
    await close();
    state.saveDelay = 0;
    result.noDuplicateSubmission = true;

    const count = state.records.length;
    await page
      .locator('.dc-records tr[data-row-key="8"]')
      .getByRole("button", { name: "删除", exact: true })
      .click();
    const deletion = page.getByRole("dialog", { name: "删除这条记录？" });
    await deletion
      .getByRole("button", { name: "确认删除", exact: true })
      .click();
    await deletion.waitFor({ state: "hidden" });
    await page
      .locator('.dc-records tr[data-row-key="8"]')
      .waitFor({ state: "detached" });
    assert.equal(state.records.length, count - 1);
    assert.equal(state.deletes, 1);
    result.deleteAndRefresh = true;

    const firstFailure = await context.newPage();
    const failed = await dashboardFixture(firstFailure);
    failed.queryFailure = true;
    firstFailure.on("pageerror", (error) => errors.push(error.message));
    await firstFailure.goto(
      `${baseUrl}/dashboard#token=isolated-first-failure`,
    );
    await firstFailure
      .getByRole("alert")
      .filter({ hasText: "隔离统计读取失败" })
      .waitFor();
    assert.ok(
      (await firstFailure.locator(".dc-kpi strong").allTextContents()).every(
        (value) => value.startsWith("—"),
      ),
    );
    await firstFailure.close();
    const unauth = await context.newPage();
    unauth.on("pageerror", (error) => errors.push(error.message));
    await unauth.goto(`${baseUrl}/dashboard`);
    await unauth
      .getByRole("alert")
      .filter({ hasText: "请从 WorkMemo 打开数据中心" })
      .waitFor();
    assert.ok(
      (await unauth.locator(".dc-kpi strong").allTextContents()).every(
        (value) => value.startsWith("—"),
      ),
    );
    await unauth.close();
    result.firstLoadAndAuthorizationErrors = true;
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  await writeFile(
    new URL(
      layoutOnly
        ? "layout-result.json"
        : process.env.WORKMEMO_WEB_URL
          ? "production-result.json"
          : "result.json",
      output,
    ),
    JSON.stringify({ ...result, errors, warnings }, null, 2),
  );
  console.log(JSON.stringify(result));
} catch (error) {
  await shot("failure");
  await writeFile(
    new URL("failure-aria.txt", output),
    await sheet.ariaSnapshot().catch(() => "sheet missing"),
  );
  await writeFile(
    new URL("failure.json", output),
    JSON.stringify(
      {
        message: error.message,
        focused: await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 700)),
        errors,
        warnings,
        saves: state.saves,
        requests: state.requests.slice(-6),
        sheet: await sheet
          .evaluate((el) => ({
            inert: el.closest("[inert]")?.outerHTML.slice(0, 100),
            ariaHidden: el.closest("[aria-hidden]")?.outerHTML.slice(0, 100),
            buttons: [...el.querySelectorAll("button")].map((b) => ({
              text: b.textContent,
              disabled: b.disabled,
              hidden: b.closest("[aria-hidden]")?.getAttribute("aria-hidden"),
            })),
          }))
          .catch(() => null),
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
}
````

## NEW FILE — E:\WorkMemo\src-tauri\sounds\fiftysounds\manifest.json

SHA256：`1395cb936670cfd0d7174479a7327d83e1696c1e69384de85491353ad9e06c45`

````json
{
  "source": "https://www.fiftysounds.com/royalty-free-music/menu-interface-sound-effects.html",
  "license": "FiftySounds License",
  "license_url": "https://www.fiftysounds.com/music-license.html",
  "retrieved": "2026-11-02",
  "sample_rate": 22050,
  "channels": 1,
  "bits": 16,
  "processing": "trim silence; resample; target RMS 0.1 and peak <=0.45; fade in 5ms/out 40ms; cap 850ms",
  "sounds": [
    {
      "theme": "fiftysounds",
      "cue": "start",
      "source": "https://www.fiftysounds.com/music/sfx-menu1.zip",
      "page": "https://www.fiftysounds.com/royalty-free-music/sfx-menu1.html",
      "original_file": "sfx-menu1.mp3",
      "archive_sha256": "69121fd2096eb956ecd5480b4312dcfe9fd431405064dfc4bec3ed126c54c875",
      "file": "fiftysounds/start.wav",
      "duration_ms": 850,
      "sha256": "8d9620cedb3cbdab9126b53c11c9246cde15561dad05896a8fe7aa7ae229aae0",
      "source_sha256": "a53d999ddb14ded8d0f0834a450da9af6d96aebe1d47e338b1fe780fc770c792"
    },
    {
      "theme": "fiftysounds",
      "cue": "pause",
      "source": "https://www.fiftysounds.com/music/sfx-menu3.zip",
      "page": "https://www.fiftysounds.com/royalty-free-music/sfx-menu3.html",
      "original_file": "sfx-menu3.mp3",
      "archive_sha256": "0c151f2d039c11b8f73ca4d92d0e3606f70f4c53aca18128c0abe1f7f3f611c6",
      "file": "fiftysounds/pause.wav",
      "duration_ms": 850,
      "sha256": "66a0c3fb8f3c29bb4a84a61445c3e27d43d68abc0d849661a582e2a7915b5637",
      "source_sha256": "5f37b2e556e92bd64c944ad7e02b7374ee4acefab6d660a37e24d447b0b207a8"
    },
    {
      "theme": "fiftysounds",
      "cue": "resume",
      "source": "https://www.fiftysounds.com/music/sfx-menu2.zip",
      "page": "https://www.fiftysounds.com/royalty-free-music/sfx-menu2.html",
      "original_file": "sfx-menu2.mp3",
      "archive_sha256": "f3fd8ca68e015fd6b2c4e4e211b8480dd22168ae733819c37bc3aba7f70fe271",
      "file": "fiftysounds/resume.wav",
      "duration_ms": 850,
      "sha256": "132ae0addcbf3e6a705e3c046ec730c953aa12e046a8f858a943eb9c8ed95ee8",
      "source_sha256": "3a9a0bbf6f34a4d04b744002db93e2f638fb41050c280c98edfe0ed8de6503dd"
    },
    {
      "theme": "fiftysounds",
      "cue": "end",
      "source": "https://www.fiftysounds.com/music/sfx-menu6.zip",
      "page": "https://www.fiftysounds.com/royalty-free-music/sfx-menu6.html",
      "original_file": "sfx-menu6.mp3",
      "archive_sha256": "7642fe2dc5969832e1dede516d103ad7a32ca24d4c3ee674987854bd6bab292a",
      "file": "fiftysounds/end.wav",
      "duration_ms": 850,
      "sha256": "bb8f0936af5ef8ef87ddf34ac636ad8e387b351714b4a92a16d954b6de6056e1",
      "source_sha256": "d327b9a824b690e72bf170c1262ced9e393a3d43b3ca99c235c55e29bc418c7f"
    },
    {
      "theme": "fiftysounds",
      "cue": "warning",
      "source": "https://www.fiftysounds.com/music/sfx-menu5.zip",
      "page": "https://www.fiftysounds.com/royalty-free-music/sfx-menu5.html",
      "original_file": "sfx-menu5.mp3",
      "archive_sha256": "3f39c8c14f8e8b630f0bc941072992e40e2ddcce41193500420cf9cd30194a36",
      "file": "fiftysounds/warning.wav",
      "duration_ms": 850,
      "sha256": "897969ee4a6738bf052aa770bc565a6610d5693bd0c399ca79befcedb54a0a39",
      "source_sha256": "792228126555028d6a9ce5b01b69204dc0836677b5289c9414e922c7f987d253"
    }
  ]
}
````

## UPDATE — E:\WorkMemo\src-tauri\src\appearance.rs

SHA256：`7b958929ac0262d1ff1d93b9995cc19742fb48673e03cd21adef5ddb87193999`

````rs
use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
    sync::{
        Mutex,
        atomic::{AtomicU64, Ordering},
    },
};
use tauri::{Emitter, Manager, State};

const VERSION: u32 = 1;
const MAX_BYTES: u64 = 65_536;
static NEXT_TEMP: AtomicU64 = AtomicU64::new(0);
type Result<T> = std::result::Result<T, String>;

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Glass,
    Cream,
    Dark,
    Neon,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct Appearance {
    pub version: u32,
    pub theme: Theme,
    pub opacity: u8,
}

impl Default for Appearance {
    fn default() -> Self {
        Self {
            version: VERSION,
            theme: Theme::Cream,
            opacity: 65,
        }
    }
}

impl Appearance {
    fn validate(&self) -> Result<()> {
        if self.version != VERSION {
            return Err("外观设置版本不受支持，请使用匹配的应用版本。".into());
        }
        if !(40..=100).contains(&self.opacity) {
            return Err("背景不透明度须在 40% 到 100% 之间。".into());
        }
        Ok(())
    }
}

fn io_error(error: std::io::Error) -> String {
    format!("外观设置读写失败：{error}")
}

fn read_bytes(path: &Path) -> Result<Option<Vec<u8>>> {
    let file = match File::open(path) {
        Ok(file) => file,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(io_error(error)),
    };
    let mut bytes = Vec::new();
    file.take(MAX_BYTES + 1)
        .read_to_end(&mut bytes)
        .map_err(io_error)?;
    if bytes.len() as u64 > MAX_BYTES {
        return Err("外观配置文件过大，请检查配置后重试。".into());
    }
    Ok(Some(bytes))
}

fn decode(bytes: &[u8]) -> Result<Appearance> {
    let settings: Appearance =
        serde_json::from_slice(bytes).map_err(|e| format!("无法读取外观配置：{e}"))?;
    settings.validate()?;
    Ok(settings)
}

pub fn load(path: &Path) -> Result<Appearance> {
    match read_bytes(path)? {
        Some(bytes) => decode(&bytes),
        None => Ok(Appearance::default()),
    }
}

struct TemporaryFile(PathBuf);
impl Drop for TemporaryFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}

fn write_unique(parent: &Path, label: &str, extension: &str, bytes: &[u8]) -> Result<PathBuf> {
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let sequence = NEXT_TEMP.fetch_add(1, Ordering::Relaxed);
    let path = parent.join(format!(
        "appearance.{label}.{}.{nonce}.{sequence}.{extension}",
        std::process::id()
    ));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&path)
        .map_err(io_error)?;
    if let Err(error) = file.write_all(bytes).and_then(|_| file.sync_all()) {
        drop(file);
        let _ = fs::remove_file(&path);
        return Err(io_error(error));
    }
    Ok(path)
}

pub fn save(path: &Path, settings: Appearance) -> Result<Appearance> {
    settings.validate()?;
    let previous = read_bytes(path)?;
    if let Some(bytes) = &previous {
        if let Ok(value) = serde_json::from_slice::<serde_json::Value>(bytes) {
            if value
                .get("version")
                .and_then(|v| v.as_u64())
                .is_some_and(|v| v > u64::from(VERSION))
            {
                return Err("外观配置来自较新版本，未覆盖文件。请升级应用。".into());
            }
        }
    }
    let parent = path.parent().ok_or("外观配置目录无效。")?;
    fs::create_dir_all(parent).map_err(io_error)?;
    // An explicit save can repair invalid settings, retaining the original bytes.
    if let Some(bytes) = &previous {
        if decode(bytes).is_err() {
            write_unique(parent, "recovery", "json", bytes)?;
        }
    }
    let mut bytes =
        serde_json::to_vec_pretty(&settings).map_err(|e| format!("无法编码外观配置：{e}"))?;
    bytes.push(b'\n');
    let temporary = TemporaryFile(write_unique(parent, "pending", "tmp", &bytes)?);
    // Same-directory replacement: never truncate the live configuration first.
    fs::rename(&temporary.0, path).map_err(io_error)?;
    Ok(settings)
}

pub struct AppearanceState {
    path: Result<PathBuf>,
    gate: Mutex<()>,
}

impl AppearanceState {
    pub fn initialize(app: &tauri::App) -> Self {
        Self {
            path: app
                .path()
                .app_config_dir()
                .map(|p| p.join("appearance.json"))
                .map_err(|e| format!("无法定位外观配置目录：{e}")),
            gate: Mutex::new(()),
        }
    }
}

#[tauri::command]
pub async fn get_appearance(app: tauri::AppHandle) -> Result<Appearance> {
    tauri::async_runtime::spawn_blocking(move || {
        let state: State<'_, AppearanceState> = app.state();
        let _guard = state
            .gate
            .lock()
            .map_err(|_| "外观设置服务异常，请重新打开应用。")?;
        load(state.path.as_ref().map_err(|e| e.clone())?)
    })
    .await
    .map_err(|e| format!("无法加载外观设置：{e}"))?
}

#[tauri::command]
pub async fn save_appearance(app: tauri::AppHandle, settings: Appearance) -> Result<Appearance> {
    let handle = app.clone();
    let saved = tauri::async_runtime::spawn_blocking(move || {
        let state: State<'_, AppearanceState> = app.state();
        let _guard = state
            .gate
            .lock()
            .map_err(|_| "外观设置服务异常，请重新打开应用。")?;
        save(state.path.as_ref().map_err(|e| e.clone())?, settings)
    })
    .await
    .map_err(|e| format!("无法保存外观设置：{e}"))??;
    let _ = handle.emit("workmemo:appearance-changed", ());
    Ok(saved)
}

#[cfg(test)]
#[path = "appearance_tests.rs"]
mod tests;
````

## UPDATE — E:\WorkMemo\src-tauri\src\appearance_tests.rs

SHA256：`c8fd67a401190adc9b368818282033084962c270a9d2303067678d7e0c801766`

````rs
use super::*;

struct Directory(PathBuf);
impl Directory {
    fn new() -> Self {
        let sequence = NEXT_TEMP.fetch_add(1, Ordering::Relaxed);
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path = std::env::temp_dir().join(format!(
            "workmemo-appearance-{}-{nonce}-{sequence}",
            std::process::id()
        ));
        fs::create_dir(&path).unwrap();
        Self(path)
    }
    fn settings(&self) -> PathBuf {
        self.0.join("appearance.json")
    }
}
impl Drop for Directory {
    fn drop(&mut self) {
        for item in fs::read_dir(&self.0).unwrap().flatten() {
            let _ = fs::remove_file(item.path());
        }
        let _ = fs::remove_dir(&self.0);
    }
}

#[test]
fn missing_file_uses_default_without_writing() {
    let directory = Directory::new();
    assert_eq!(load(&directory.settings()).unwrap(), Appearance::default());
    assert!(!directory.settings().exists());
}

#[test]
fn all_themes_and_boundaries_round_trip_over_existing_file() {
    let directory = Directory::new();
    for theme in [Theme::Glass, Theme::Cream, Theme::Dark, Theme::Neon] {
        for opacity in [40, 65, 88, 100] {
            let expected = Appearance {
                version: 1,
                theme,
                opacity,
            };
            save(&directory.settings(), expected.clone()).unwrap();
            assert_eq!(load(&directory.settings()).unwrap(), expected);
        }
    }
    assert_eq!(fs::read_dir(&directory.0).unwrap().count(), 1);
}

#[test]
fn invalid_opacity_does_not_replace_saved_settings() {
    let directory = Directory::new();
    save(&directory.settings(), Appearance::default()).unwrap();
    let original = fs::read(directory.settings()).unwrap();
    for opacity in [0, 39, 101, 255] {
        assert!(
            save(
                &directory.settings(),
                Appearance {
                    opacity,
                    ..Appearance::default()
                }
            )
            .is_err()
        );
    }
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
}

#[test]
fn corrupted_file_is_reported_and_backed_up_before_explicit_repair() {
    let directory = Directory::new();
    let original = b"invalid settings";
    fs::write(directory.settings(), original).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
    save(&directory.settings(), Appearance::default()).unwrap();
    assert_eq!(load(&directory.settings()).unwrap(), Appearance::default());
    let backup = fs::read_dir(&directory.0)
        .unwrap()
        .flatten()
        .find(|item| item.file_name().to_string_lossy().contains("recovery"))
        .unwrap();
    assert_eq!(fs::read(backup.path()).unwrap(), original);
}

#[test]
fn newer_schema_is_not_overwritten() {
    let directory = Directory::new();
    let original = br#"{"version":2,"theme":"future","opacity":90}"#;
    fs::write(directory.settings(), original).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert!(save(&directory.settings(), Appearance::default()).is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
}

#[test]
fn rejects_unknown_theme_and_oversized_configuration() {
    let directory = Directory::new();
    fs::write(
        directory.settings(),
        br#"{"version":1,"theme":"unknown","opacity":90}"#,
    )
    .unwrap();
    assert!(load(&directory.settings()).is_err());
    fs::write(directory.settings(), vec![b' '; MAX_BYTES as usize + 1]).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert!(save(&directory.settings(), Appearance::default()).is_err());
}

#[cfg(windows)]
#[test]
fn failed_replace_keeps_original_and_removes_temporary_file() {
    let directory = Directory::new();
    save(&directory.settings(), Appearance::default()).unwrap();
    let original_bytes = fs::read(directory.settings()).unwrap();
    let original_permissions = fs::metadata(directory.settings()).unwrap().permissions();
    let mut readonly = original_permissions.clone();
    readonly.set_readonly(true);
    fs::set_permissions(directory.settings(), readonly).unwrap();
    let result = save(
        &directory.settings(),
        Appearance {
            theme: Theme::Dark,
            ..Appearance::default()
        },
    );
    fs::set_permissions(directory.settings(), original_permissions).unwrap();
    assert!(result.is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original_bytes);
    assert_eq!(fs::read_dir(&directory.0).unwrap().count(), 1);
}

#[test]
fn saving_appearance_never_changes_the_work_session() {
    use crate::{
        clock::SystemClock,
        database::{StartInput, Store},
    };
    let directory = Directory::new();
    let mut store = Store::open(
        &directory.0.join("workmemo.sqlite3"),
        Box::new(SystemClock::new()),
    )
    .unwrap();
    store
        .start(StartInput {
            category: "开发".into(),
            quantity: Some(2.5),
            remark: "isolation test".into(),
        })
        .unwrap();
    let original = store.snapshot().unwrap().active.unwrap();
    for theme in [Theme::Glass, Theme::Cream, Theme::Dark, Theme::Neon] {
        save(
            &directory.settings(),
            Appearance {
                version: 1,
                theme,
                opacity: 85,
            },
        )
        .unwrap();
    }
    let current = store.snapshot().unwrap().active.unwrap();
    assert_eq!(current.id, original.id);
    assert_eq!(current.start_time, original.start_time);
    assert_eq!(current.remark, original.remark);
    assert_eq!(current.quantity, original.quantity);
    assert_eq!(current.status, "WORKING");
    assert!(!current.is_paused);
    assert!(store.snapshot().unwrap().recent_records.is_empty());
}
````

## UPDATE — E:\WorkMemo\src-tauri\src\sound.rs

SHA256：`2d9a1ddbfe0d6a3680b2b62c963adeacd8c4c7207ef5a43d7911a47bd2037929`

````rs
//! A single backend transition observer; no frontend poll or window can replay cues.
#[derive(Clone, Copy, Debug, PartialEq, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Cue {
    Start,
    Pause,
    Resume,
    End,
    Warning,
}
#[derive(Clone, Copy, Debug, Default, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SoundTheme {
    #[default]
    Fiftysounds,
    Soft,
    Crisp,
}
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Status {
    pub id: i64,
    pub paused: bool,
    pub recovery: bool,
}
#[derive(Default)]
pub struct Tracker {
    previous: Option<(Option<Status>, bool)>,
}
impl Tracker {
    pub fn observe(&mut self, active: Option<Status>, warning: bool) -> Vec<Cue> {
        let old = self.previous.replace((active, warning));
        let Some((previous, was_warning)) = old else {
            return vec![];
        };
        let mut cues = vec![];
        if let Some(a) = active {
            if !a.recovery {
                match previous {
                    None => cues.push(Cue::Start),
                    Some(p) if p.id != a.id => cues.push(Cue::End),
                    Some(p) if p.paused != a.paused => {
                        cues.push(if a.paused { Cue::Pause } else { Cue::Resume })
                    }
                    _ => {}
                }
            }
        } else if previous.is_some() {
            cues.push(Cue::End);
        }
        if cues.is_empty()
            && active.is_some_and(|a| !a.recovery)
            && warning
            && (!was_warning || previous.map(|p| p.id) != active.map(|p| p.id))
        {
            cues.push(Cue::Warning);
        }
        cues
    }
}
fn pcm(cue: Cue, theme: SoundTheme) -> &'static [u8] {
    match (theme, cue) {
        (SoundTheme::Fiftysounds, Cue::Start) => include_bytes!("../sounds/fiftysounds/start.wav"),
        (SoundTheme::Fiftysounds, Cue::Pause) => include_bytes!("../sounds/fiftysounds/pause.wav"),
        (SoundTheme::Fiftysounds, Cue::Resume) => {
            include_bytes!("../sounds/fiftysounds/resume.wav")
        }
        (SoundTheme::Fiftysounds, Cue::End) => include_bytes!("../sounds/fiftysounds/end.wav"),
        (SoundTheme::Fiftysounds, Cue::Warning) => {
            include_bytes!("../sounds/fiftysounds/warning.wav")
        }
        (SoundTheme::Soft, Cue::Start) => include_bytes!("../sounds/start.wav"),
        (SoundTheme::Soft, Cue::Pause) => include_bytes!("../sounds/pause.wav"),
        (SoundTheme::Soft, Cue::Resume) => include_bytes!("../sounds/resume.wav"),
        (SoundTheme::Soft, Cue::End) => include_bytes!("../sounds/end.wav"),
        (SoundTheme::Soft, Cue::Warning) => include_bytes!("../sounds/warning.wav"),
        (SoundTheme::Crisp, Cue::Start) => include_bytes!("../sounds/crisp/start.wav"),
        (SoundTheme::Crisp, Cue::Pause) => include_bytes!("../sounds/crisp/pause.wav"),
        (SoundTheme::Crisp, Cue::Resume) => include_bytes!("../sounds/crisp/resume.wav"),
        (SoundTheme::Crisp, Cue::End) => include_bytes!("../sounds/crisp/end.wav"),
        (SoundTheme::Crisp, Cue::Warning) => include_bytes!("../sounds/crisp/warning.wav"),
    }
}
pub fn play(cue: Cue, theme: SoundTheme) -> Result<(), String> {
    let bytes = pcm(cue, theme);
    #[cfg(windows)]
    {
        use windows_sys::Win32::Media::Audio::{PlaySoundW, SND_ASYNC, SND_MEMORY, SND_NODEFAULT};
        // Static embedded PCM stays alive for asynchronous native playback.
        if unsafe {
            PlaySoundW(
                bytes.as_ptr().cast(),
                std::ptr::null_mut(),
                SND_ASYNC | SND_MEMORY | SND_NODEFAULT,
            )
        } == 0
        {
            return Err("系统未能播放提示音，请检查音频输出。".into());
        }
    }
    #[cfg(not(windows))]
    {
        let _ = bytes;
    }
    Ok(())
}
#[tauri::command]
pub fn preview_sound(theme: Option<SoundTheme>, cue: Option<Cue>) -> Result<(), String> {
    play(cue.unwrap_or(Cue::Start), theme.unwrap_or_default())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn transition_takes_priority_over_warning_and_muted_observations_do_not_replay() {
        let mut t = Tracker::default();
        t.observe(None, false);
        let a = Status {
            id: 1,
            paused: false,
            recovery: false,
        };
        assert_eq!(t.observe(Some(a), true), vec![Cue::Start]);
        assert_eq!(
            t.observe(Some(Status { paused: true, ..a }), true),
            vec![Cue::Pause]
        );
        // Same observer state is updated while muted; enabling sound cannot replay it.
        assert!(
            t.observe(Some(Status { paused: true, ..a }), true)
                .is_empty()
        );
        assert_eq!(t.observe(None, true), vec![Cue::End]);
        assert!(t.observe(None, true).is_empty());
        t.observe(Some(a), false);
        assert_eq!(t.observe(Some(Status { id: 2, ..a }), true), vec![Cue::End]);
        assert!(serde_json::from_str::<SoundTheme>("\"unknown\"").is_err());
        assert!(serde_json::from_str::<Cue>("\"unknown\"").is_err());
    }
    #[test]
    fn fifteen_embedded_cues_are_short_faded_non_silent_pcm_with_bounded_peak() {
        for theme in [SoundTheme::Fiftysounds, SoundTheme::Soft, SoundTheme::Crisp] {
            for cue in [Cue::Start, Cue::Pause, Cue::Resume, Cue::End, Cue::Warning] {
                let wav = pcm(cue, theme);
                assert_eq!(&wav[..4], b"RIFF");
                assert_eq!(&wav[8..16], b"WAVEfmt ");
                assert_eq!(&wav[36..40], b"data");
                assert_eq!(u16::from_le_bytes(wav[20..22].try_into().unwrap()), 1);
                assert_eq!(u16::from_le_bytes(wav[22..24].try_into().unwrap()), 1);
                assert_eq!(u32::from_le_bytes(wav[24..28].try_into().unwrap()), 22050);
                assert_eq!(u16::from_le_bytes(wav[34..36].try_into().unwrap()), 16);
                assert_eq!(
                    u32::from_le_bytes(wav[40..44].try_into().unwrap()) as usize,
                    wav.len() - 44
                );
                let samples: Vec<i16> = wav[44..]
                    .chunks_exact(2)
                    .map(|b| i16::from_le_bytes([b[0], b[1]]))
                    .collect();
                assert!(samples.len() <= 18743 && samples.len() > 220);
                assert_eq!(samples[0], 0);
                assert_eq!(samples.last(), Some(&0));
                let peak = samples.iter().map(|v| i32::from(*v).abs()).max().unwrap();
                assert!(peak > 100 && peak <= 14746);
                assert_ne!(pcm(cue, SoundTheme::Soft), pcm(cue, SoundTheme::Crisp));
                assert_ne!(
                    pcm(cue, SoundTheme::Fiftysounds),
                    pcm(cue, SoundTheme::Soft)
                );
            }
        }
    }
    #[test]
    fn transitions_are_once_only_and_initial_recovery_is_silent() {
        let mut t = Tracker::default();
        let a = Status {
            id: 1,
            paused: false,
            recovery: false,
        };
        assert!(t.observe(None, false).is_empty());
        assert_eq!(t.observe(Some(a), false), vec![Cue::Start]);
        assert!(t.observe(Some(a), false).is_empty());
        assert_eq!(
            t.observe(Some(Status { paused: true, ..a }), false),
            vec![Cue::Pause]
        );
        assert_eq!(t.observe(Some(a), false), vec![Cue::Resume]);
        assert_eq!(t.observe(Some(a), true), vec![Cue::Warning]);
        assert!(t.observe(Some(a), true).is_empty());
        assert_eq!(t.observe(None, false), vec![Cue::End]);
        let mut restarted = Tracker::default();
        assert!(
            restarted
                .observe(
                    Some(Status {
                        paused: true,
                        recovery: true,
                        ..a
                    }),
                    true
                )
                .is_empty()
        );
    }
}
````

## UPDATE — E:\WorkMemo\src-tauri\src\windows.rs

SHA256：`429ac0be50e924afb0c3e14c45da351e4b42fe16cbd792f8a0a867ee0dd9b8d1`

````rs
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, path::PathBuf, sync::Mutex};
use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Geometry {
    x: i32,
    y: i32,
    width: f64,
    height: f64,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default)]
pub struct Layout {
    pub density: String,
    pub revision: u64,
    pub sound_enabled: bool,
    pub sound_theme: crate::sound::SoundTheme,
    #[serde(default)]
    sound_library_version: u8,
    pub font_size: u8,
    pub font_weight: u16,
    pub line_spacing: String,
    windows: BTreeMap<String, Geometry>,
}
impl Default for Layout {
    fn default() -> Self {
        Self {
            density: "comfortable".into(),
            revision: 0,
            sound_enabled: true,
            sound_theme: crate::sound::SoundTheme::Fiftysounds,
            sound_library_version: 1,
            font_size: 14,
            font_weight: 400,
            line_spacing: "standard".into(),
            windows: BTreeMap::new(),
        }
    }
}
pub struct WindowState {
    pub path: PathBuf,
    pub data: Mutex<Layout>,
    pub dirty: Mutex<BTreeMap<String, bool>>,
    opening: Mutex<()>,
}
pub fn valid_label(label: &str) -> bool {
    matches!(label, "main" | "settings" | "history" | "settlement")
}
pub fn load(path: &std::path::Path) -> Result<Layout, String> {
    if !path.exists() {
        return Ok(Layout::default());
    }
    let bytes = std::fs::read(path).map_err(|e| e.to_string())?;
    let original: Layout = serde_json::from_slice(&bytes).map_err(|e| e.to_string())?;
    let migrated = decode_layout(&bytes)?;
    if original.sound_library_version == 0 {
        write_layout(path, &migrated)?;
    }
    Ok(migrated)
}
pub fn decode_layout(bytes: &[u8]) -> Result<Layout, String> {
    let mut d: Layout = serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
    if !(12..=18).contains(&d.font_size)
        || ![400, 500, 600, 700].contains(&d.font_weight)
        || !["tight", "standard", "loose"].contains(&d.line_spacing.as_str())
        || !["compact", "comfortable"].contains(&d.density.as_str())
        || d.sound_library_version > 1
        || d.windows.iter().any(|(k, v)| {
            !(valid_label(k) || k == "main-compact")
                || !v.width.is_finite()
                || !v.height.is_finite()
                || v.width < 100.0
                || v.height < 100.0
                || v.width > 10000.0
                || v.height > 10000.0
        })
    {
        return Err("窗口布局格式无效。".into());
    }
    if d.sound_library_version == 0 {
        d.sound_theme = crate::sound::SoundTheme::Fiftysounds;
        d.sound_library_version = 1;
        d.revision = d.revision.checked_add(1).ok_or("窗口设置修订号溢出")?;
    }
    Ok(d)
}
pub fn initialize(app: &tauri::App) -> Result<(), String> {
    let path = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("window-layout.json");
    let data = match load(&path) {
        Ok(data) => data,
        Err(_) => {
            // Preserve the unreadable file before allowing future geometry saves.
            let stamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map_err(|e| e.to_string())?
                .as_nanos();
            std::fs::copy(&path, path.with_extension(format!("invalid-{stamp}.json")))
                .map_err(|e| format!("无法保留损坏的窗口设置：{e}"))?;
            Layout::default()
        }
    };
    app.manage(WindowState {
        path,
        data: Mutex::new(data),
        dirty: Mutex::new(BTreeMap::new()),
        opening: Mutex::new(()),
    });
    if let Some(w) = app.get_webview_window("main") {
        restore(&w)?;
    }
    Ok(())
}
fn persist(state: &WindowState) -> Result<(), String> {
    let d = state.data.lock().map_err(|_| "窗口设置锁异常")?;
    write_layout(&state.path, &d)
}
fn write_layout(path: &std::path::Path, data: &Layout) -> Result<(), String> {
    if let Some(p) = path.parent() {
        std::fs::create_dir_all(p).map_err(|e| e.to_string())?;
    }
    let tmp = path.with_extension("pending");
    use std::io::Write;
    let mut file = std::fs::File::create(&tmp).map_err(|e| e.to_string())?;
    file.write_all(&serde_json::to_vec(data).map_err(|e| e.to_string())?)
        .and_then(|_| file.sync_all())
        .map_err(|e| e.to_string())?;
    drop(file);
    std::fs::rename(tmp, path).map_err(|e| e.to_string())
}
pub fn capture(window: &tauri::Window) -> Result<(), String> {
    if !valid_label(window.label()) || window.is_minimized().unwrap_or(true) {
        return Ok(());
    }
    let pos = window.outer_position().map_err(|e| e.to_string())?;
    let size = window
        .inner_size()
        .map_err(|e| e.to_string())?
        .to_logical::<f64>(window.scale_factor().map_err(|e| e.to_string())?);
    let state = window.state::<WindowState>();
    let compact = state.data.lock().map_err(|_| "窗口设置锁异常")?.density == "compact";
    let key = if window.label() == "main" && compact {
        "main-compact"
    } else {
        window.label()
    };
    state
        .data
        .lock()
        .map_err(|_| "窗口设置锁异常")?
        .windows
        .insert(
            key.into(),
            Geometry {
                x: pos.x,
                y: pos.y,
                width: size.width,
                height: size.height,
            },
        );
    persist(&state)
}
pub fn bounded(g: (i32, i32, f64, f64), area: (i32, i32, u32, u32), scale: f64) -> Geometry {
    let (ax, ay, aw, ah) = area;
    let width = g.2.max(320.0).min((aw as f64 / scale - 16.0).max(100.0));
    let height = g.3.max(220.0).min((ah as f64 / scale - 16.0).max(100.0));
    Geometry {
        x: g.0
            .clamp(ax, ax + (aw as f64 - width * scale).max(0.0) as i32),
        y: g.1
            .clamp(ay, ay + (ah as f64 - height * scale).max(0.0) as i32),
        width,
        height,
    }
}
fn restore(w: &tauri::WebviewWindow) -> Result<(), String> {
    let state = w.state::<WindowState>();
    let compact = state.data.lock().map_err(|_| "窗口设置锁异常")?.density == "compact";
    let key = if w.label() == "main" && compact {
        "main-compact"
    } else {
        w.label()
    };
    let d = state
        .data
        .lock()
        .map_err(|_| "窗口设置锁异常")?
        .windows
        .get(key)
        .cloned();
    let default = match w.label() {
        "main" if compact => (420.0, 260.0),
        "main" => (780.0, 560.0),
        "settlement" => (760.0, 620.0),
        _ => (900.0, 680.0),
    };
    let monitors = w.available_monitors().map_err(|e| e.to_string())?;
    let m = d
        .as_ref()
        .and_then(|g| {
            monitors.iter().find(|m| {
                let a = m.work_area();
                g.x >= a.position.x
                    && g.y >= a.position.y
                    && (g.x as i64) < a.position.x as i64 + a.size.width as i64
                    && (g.y as i64) < a.position.y as i64 + a.size.height as i64
            })
        })
        .or(monitors.first());
    if let Some(m) = m {
        let a = m.work_area();
        let s = m.scale_factor();
        let minimum_height: f64 = if w.label() == "main" && compact {
            220.0
        } else {
            280.0
        };
        let minimum_width: f64 = if w.label() == "main" { 360.0 } else { 320.0 };
        w.set_min_size(Some(tauri::LogicalSize::new(
            minimum_width.min((a.size.width as f64 / s - 16.0).max(100.0)),
            minimum_height.min((a.size.height as f64 / s - 16.0).max(100.0)),
        )))
        .map_err(|e| e.to_string())?;
        let (x, y) = d.as_ref().map(|g| (g.x, g.y)).unwrap_or((
            a.position.x + ((a.size.width as f64 - default.0 * s) / 2.0).max(0.0) as i32,
            a.position.y + ((a.size.height as f64 - default.1 * s) / 2.0).max(0.0) as i32,
        ));
        let g = bounded(
            (
                x,
                y,
                d.as_ref().map_or(default.0, |g| g.width),
                d.as_ref()
                    .map_or(default.1, |g| g.height)
                    .max(minimum_height),
            ),
            (a.position.x, a.position.y, a.size.width, a.size.height),
            s,
        );
        w.set_size(tauri::LogicalSize::new(g.width, g.height))
            .map_err(|e| e.to_string())?;
        w.set_position(tauri::PhysicalPosition::new(g.x, g.y))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
#[tauri::command]
pub fn fit_main_content(window: tauri::Window, height: f64) -> Result<(), String> {
    if window.label() != "main" {
        return Err("窗口不匹配".into());
    }
    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("无法定位主窗口显示器")?;
    let scale = window.scale_factor().map_err(|e| e.to_string())?;
    let area = monitor.work_area();
    let position = window.outer_position().map_err(|e| e.to_string())?;
    let state = window.state::<WindowState>();
    let compact = state.data.lock().map_err(|_| "窗口设置锁异常")?.density == "compact";
    let target = content_height(height, compact, area.size.height as f64 / scale)?;
    let current = window
        .inner_size()
        .map_err(|e| e.to_string())?
        .to_logical::<f64>(scale);
    if (current.height - target).abs() > 1.0 {
        window
            .set_size(tauri::LogicalSize::new(current.width, target))
            .map_err(|e| e.to_string())?;
    }
    let bottom = i64::from(area.position.y) + i64::from(area.size.height);
    let maximum_y = (bottom - (target * scale).ceil() as i64).max(i64::from(area.position.y));
    let y = i64::from(position.y).clamp(i64::from(area.position.y), maximum_y) as i32;
    if y != position.y {
        window
            .set_position(tauri::PhysicalPosition::new(position.x, y))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn content_height(requested: f64, compact: bool, work_area_height: f64) -> Result<f64, String> {
    if !requested.is_finite()
        || !(100.0..=10000.0).contains(&requested)
        || !work_area_height.is_finite()
        || work_area_height < 100.0
    {
        return Err("主窗口内容高度无效".into());
    }
    let maximum = (work_area_height - 16.0).max(100.0);
    let minimum: f64 = if compact { 220.0 } else { 280.0 };
    Ok(requested.ceil().clamp(minimum.min(maximum), maximum))
}

#[tauri::command]
pub async fn open_panel(
    app: tauri::AppHandle,
    panel: String,
    section: Option<String>,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || show_panel(&app, &panel, section))
        .await
        .map_err(|e| e.to_string())?
}
pub fn show_panel(
    app: &tauri::AppHandle,
    panel: &str,
    section: Option<String>,
) -> Result<(), String> {
    if panel == "history" || panel == "settlement" {
        return crate::dashboard::open_impl(
            app,
            if panel == "settlement" {
                "pending"
            } else {
                "all"
            },
            "real",
            false,
        );
    }
    let state = app.state::<WindowState>();
    let _opening = state.opening.lock().map_err(|_| "窗口创建锁异常")?;
    if !matches!(panel, "settings" | "history" | "settlement") {
        return Err("未知窗口".into());
    }
    let w = match app.get_webview_window(panel) {
        Some(w) => w,
        None => {
            let w = WebviewWindowBuilder::new(
                app,
                panel,
                WebviewUrl::App(
                    format!(
                        "index.html?panel={panel}&section={}",
                        section
                            .as_deref()
                            .filter(|s| ["appearance", "monitor", "layout", "data", "visuals"]
                                .contains(s))
                            .unwrap_or("monitor")
                    )
                    .into(),
                ),
            )
            .title(match panel {
                "settings" => "WorkMemo 设置",
                "history" => "WorkMemo 历史与统计",
                _ => "WorkMemo 待补全",
            })
            .inner_size(900.0, 680.0)
            .transparent(true)
            .no_redirection_bitmap(true)
            .decorations(false)
            .shadow(false)
            .visible(false)
            .build()
            .map_err(|e| e.to_string())?;
            restore(&w)?;
            w
        }
    };
    w.show()
        .and_then(|_| w.unminimize())
        .and_then(|_| w.set_focus())
        .map_err(|e| e.to_string())?;
    if let Some(s) = section {
        w.emit("workmemo:settings-section", s)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
#[tauri::command]
pub fn get_layout_settings(state: tauri::State<'_, WindowState>) -> Result<Layout, String> {
    Ok(state.data.lock().map_err(|_| "窗口设置锁异常")?.clone())
}
#[tauri::command]
pub fn set_layout_density(app: tauri::AppHandle, density: String) -> Result<(), String> {
    if !["compact", "comfortable"].contains(&density.as_str()) {
        return Err("间距无效".into());
    }
    let current = get_layout_settings(app.state())?;
    set_layout_options(
        app,
        LayoutInput {
            density,
            sound_enabled: current.sound_enabled,
            sound_theme: current.sound_theme,
            font_size: current.font_size,
            font_weight: current.font_weight,
            line_spacing: current.line_spacing,
            expected_revision: current.revision,
        },
    )?;
    Ok(())
}
#[tauri::command]
pub fn reset_window_layout(app: tauri::AppHandle) -> Result<(), String> {
    let s = app.state::<WindowState>();
    {
        let mut d = s.data.lock().map_err(|_| "窗口设置锁异常")?;
        let revision = d.revision + 1;
        *d = Layout {
            revision,
            ..Layout::default()
        };
    }
    persist(&s)?;
    for (_, w) in app.webview_windows() {
        if valid_label(w.label()) {
            restore(&w)?;
        }
    }
    let _ = app.emit("workmemo:layout-changed", ());
    Ok(())
}
#[tauri::command]
pub fn set_window_dirty(window: tauri::Window, dirty: bool) -> Result<(), String> {
    window
        .state::<WindowState>()
        .dirty
        .lock()
        .map_err(|_| "草稿状态锁异常")?
        .insert(window.label().into(), dirty);
    Ok(())
}
#[tauri::command]
pub fn close_panel(window: tauri::Window) -> Result<(), String> {
    if !matches!(window.label(), "settings" | "history" | "settlement") {
        return Err("窗口不匹配".into());
    }
    capture(&window)?;
    window.hide().map_err(|e| e.to_string())
}
pub fn has_drafts(app: &tauri::AppHandle) -> bool {
    app.state::<WindowState>()
        .dirty
        .lock()
        .map(|d| d.values().any(|v| *v))
        .unwrap_or(true)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn content_height_handles_short_screens_and_rejects_invalid_values() {
        assert_eq!(content_height(412.2, false, 900.0).unwrap(), 413.0);
        assert_eq!(content_height(200.0, false, 900.0).unwrap(), 280.0);
        assert_eq!(content_height(200.0, true, 900.0).unwrap(), 220.0);
        assert_eq!(content_height(900.0, false, 300.0).unwrap(), 284.0);
        assert_eq!(content_height(500.0, false, 200.0).unwrap(), 184.0);
        assert_eq!(content_height(500.0, true, 200.0).unwrap(), 184.0);
        assert!(content_height(f64::NAN, false, 900.0).is_err());
        assert!(content_height(f64::INFINITY, false, 900.0).is_err());
        assert!(content_height(20000.0, false, 900.0).is_err());
    }
    #[test]
    fn geometry_clamps_removed_monitor_and_high_dpi() {
        assert_eq!(
            bounded((0, 0, 420.0, 260.0), (0, 0, 1920, 1080), 1.0).height,
            260.0
        );
        let g = bounded((9999, -300, 900.0, 680.0), (0, 0, 1280, 720), 1.5);
        assert!(g.x >= 0 && g.y >= 0);
        assert!(g.width * 1.5 <= 1280.0 && g.height * 1.5 <= 720.0);
    }
    #[test]
    fn geometry_keeps_negative_monitor_coordinates_and_fits_small_desktops() {
        let g = bounded((-1800, 100, 900.0, 680.0), (-1920, 0, 1920, 1080), 1.0);
        assert_eq!((g.x, g.y), (-1800, 100));
        let g = bounded((9000, 9000, 780.0, 560.0), (0, 0, 800, 600), 2.0);
        assert!(g.width * 2.0 <= 800.0 && g.height * 2.0 <= 600.0);
        assert!(g.x >= 0 && g.y >= 0);
    }
    #[test]
    fn persisted_layout_rejects_unknown_windows_and_invalid_sizes() {
        assert!(decode_layout(br#"{"density":"comfortable","windows":{"main":{"x":0,"y":0,"width":780,"height":560}}}"#).is_ok());
        assert!(decode_layout(br#"{"density":"comfortable","windows":{"main":{"x":0,"y":0,"width":0,"height":560}}}"#).is_err());
        assert!(decode_layout(br#"{"density":"unknown","windows":{}}"#).is_err());
    }
    #[test]
    fn sound_theme_defaults_persists_and_rejects_invalid_values() {
        assert_eq!(
            decode_layout(br#"{"sound_enabled":false}"#)
                .unwrap()
                .sound_theme,
            crate::sound::SoundTheme::Fiftysounds
        );
        let crisp = decode_layout(
            br#"{"sound_library_version":1,"sound_enabled":false,"sound_theme":"crisp"}"#,
        )
        .unwrap();
        let loaded = decode_layout(&serde_json::to_vec(&crisp).unwrap()).unwrap();
        assert_eq!(loaded.sound_theme, crate::sound::SoundTheme::Crisp);
        assert!(!loaded.sound_enabled);
        assert!(decode_layout(br#"{"sound_theme":"unknown"}"#).is_err());
    }
    #[test]
    fn sound_migration_is_persisted_once_and_preserves_mute_geometry_and_reselected_legacy() {
        let path = std::env::temp_dir().join(format!(
            "workmemo-sound-migration-{}-{}.json",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::write(&path, br#"{"revision":7,"sound_enabled":false,"sound_theme":"crisp","font_size":18,"windows":{"main":{"x":-100,"y":20,"width":780,"height":560}}}"#).unwrap();
        let migrated = load(&path).unwrap();
        assert_eq!(migrated.sound_theme, crate::sound::SoundTheme::Fiftysounds);
        assert!(!migrated.sound_enabled);
        assert_eq!(migrated.revision, 8);
        assert_eq!(migrated.font_size, 18);
        assert_eq!(migrated.windows["main"].x, -100);
        let before = std::fs::read(&path).unwrap();
        assert_eq!(load(&path).unwrap().revision, 8);
        assert_eq!(before, std::fs::read(&path).unwrap());
        let selected = Layout {
            sound_theme: crate::sound::SoundTheme::Soft,
            ..migrated
        };
        write_layout(&path, &selected).unwrap();
        assert_eq!(
            load(&path).unwrap().sound_theme,
            crate::sound::SoundTheme::Soft
        );
        std::fs::remove_file(&path).unwrap();
        assert!(decode_layout(br#"{"sound_library_version":2}"#).is_err());
    }
    #[test]
    fn typography_migrates_defaults_and_validates_saved_options() {
        let legacy = decode_layout(br#"{"density":"compact","windows":{}}"#).unwrap();
        assert!(legacy.sound_enabled);
        let muted =
            decode_layout(br#"{"density":"compact","sound_enabled":false,"windows":{}}"#).unwrap();
        assert!(!muted.sound_enabled);
        assert!(
            !decode_layout(&serde_json::to_vec(&muted).unwrap())
                .unwrap()
                .sound_enabled
        );
        assert_eq!(legacy.font_size, 14);
        assert_eq!(legacy.font_weight, 400);
        let mut settings = legacy;
        settings.font_size = 18;
        settings.font_weight = 700;
        settings.line_spacing = "loose".into();
        decode_layout(&serde_json::to_vec(&settings).unwrap()).unwrap();
        settings.font_size = 19;
        assert!(decode_layout(&serde_json::to_vec(&settings).unwrap()).is_err());
        settings.font_size = 12;
        settings.font_weight = 900;
        assert!(decode_layout(&serde_json::to_vec(&settings).unwrap()).is_err());
    }
}

pub fn reload(app: &tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<WindowState>();
    *state.data.lock().map_err(|_| "窗口设置锁异常")? = load(&state.path)?;
    for (_, w) in app.webview_windows() {
        if valid_label(w.label()) {
            restore(&w)?;
        }
    }
    Ok(())
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LayoutInput {
    pub density: String,
    pub sound_enabled: bool,
    #[serde(default)]
    pub sound_theme: crate::sound::SoundTheme,
    pub font_size: u8,
    pub font_weight: u16,
    pub line_spacing: String,
    pub expected_revision: u64,
}
#[tauri::command]
pub fn set_layout_options(app: tauri::AppHandle, input: LayoutInput) -> Result<Layout, String> {
    if let Some(main) = app.get_webview_window("main") {
        capture(&main.as_ref().window())?;
    }
    let state = app.state::<WindowState>();
    let switch;
    let previous;
    {
        let mut d = state.data.lock().map_err(|_| "窗口设置锁异常")?;
        if d.revision != input.expected_revision {
            return Err("布局已变化，请重新读取。".into());
        }
        previous = d.clone();
        let mut next = d.clone();
        next.density = input.density;
        next.sound_enabled = input.sound_enabled;
        next.sound_theme = input.sound_theme;
        next.font_size = input.font_size;
        next.font_weight = input.font_weight;
        next.line_spacing = input.line_spacing;
        next.revision += 1;
        decode_layout(&serde_json::to_vec(&next).map_err(|e| e.to_string())?)?;
        switch = next.density != d.density;
        *d = next;
    }
    if let Err(error) = persist(&state) {
        *state.data.lock().map_err(|_| "窗口设置锁异常")? = previous;
        return Err(error);
    }
    if switch {
        if let Some(main) = app.get_webview_window("main") {
            restore(&main)?;
        }
    }
    let _ = app.emit("workmemo:layout-changed", ());
    get_layout_settings(app.state())
}
````

## UPDATE — E:\WorkMemo\src\App.css

SHA256：`aa99ece0b2d3129449def7c72633945977f9a66286cc90371b116567a78bb100`

````css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

:root {
  font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
  color: #303b35;
  background: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; background: transparent; }
body { overflow: hidden; }
button, input, select, textarea { font: inherit; }
button, input, select, textarea, summary { -webkit-tap-highlight-color: transparent; }
.desktop-frame { position: relative; width: 100%; height: 100%; padding: 8px; color: var(--text-primary); --panel: rgb(var(--surface-rgb) / var(--surface-opacity)); --content-gap: 12px; }
.desktop-frame[data-density="comfortable"] { --content-gap: 20px; }
.app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border: 1px solid var(--window-border); border-radius: var(--window-radius); background: rgb(var(--window-rgb) / var(--window-opacity)); box-shadow: var(--window-shadow); }
.titlebar { display: grid; grid-template-columns: auto auto minmax(64px, 1fr) auto; align-items: center; gap: 12px; flex-shrink: 0; min-height: 56px; padding: 8px 14px; background: var(--header-background); user-select: none; }
.titlebar-drag { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 34px; cursor: grab; touch-action: none; }
.titlebar-drag:active { cursor: grabbing; }
.brand-mark { display: block; width: 28px; height: 28px; flex-shrink: 0; object-fit: contain; }
.brand-name { display: block; font-size: 13px; font-weight: 600; letter-spacing: -.25px; white-space: nowrap; }
.icon { width: 20px; height: 20px; flex-shrink: 0; }
.main-nav { display: flex; align-items: center; gap: 3px; }
button.nav-button { position: relative; width: 31px; height: 34px; padding: 5px; justify-content: center; color: var(--text-muted); background: transparent; box-shadow: none; border-radius: 9px; }
button.nav-button:hover:not(:disabled) { background: var(--control-hover); }
button.nav-button[aria-pressed="true"] { color: var(--accent-text); }
button.nav-button[aria-pressed="true"]::after { content: ""; position: absolute; height: 2px; left: 8px; right: 8px; bottom: -3px; border-radius: 2px; background: var(--accent); }
.category-strip { display: flex; gap: 6px; min-width: 0; overflow-x: auto; overflow-y: hidden; padding: 3px 0; overscroll-behavior-x: contain; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.category-strip::-webkit-scrollbar { height: 2px; }
.category-strip::-webkit-scrollbar-thumb { border-radius: 2px; background: var(--scroll-thumb); }
.category-strip:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; border-radius: 6px; }
.category-chip { display: inline-flex; align-items: center; flex: 0 0 auto; gap: 6px; padding: 5px 9px; border-radius: 9px; font-size: 11px; line-height: 1.5; color: var(--text-muted); background: rgb(var(--surface-rgb) / 30%); white-space: nowrap; }
.category-chip span { font-variant-numeric: tabular-nums; }
.category-chip[data-current="true"] { color: var(--accent-text); background: var(--control-hover); }
.window-controls { display: flex; flex-shrink: 0; gap: 3px; justify-self: end; grid-column: -2; }
.window-content { display: flex; flex-direction: column; min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.window-content::-webkit-scrollbar { width: 6px; }
.window-content::-webkit-scrollbar-track { background: transparent; }
.window-content::-webkit-scrollbar-thumb { border-radius: 6px; background: var(--scroll-thumb); }
.workspace { width: 100%; max-width: 648px; margin: 0 auto; padding: var(--content-gap) 24px 18px; outline: none; }
.workspace.is-active { margin-block: auto; }
.window-error { flex-shrink: 0; margin: 8px 14px 0; padding: 8px 10px; max-height: 90px; overflow: auto; border-radius: var(--control-radius); background: var(--error-background); color: var(--error); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.resize-handle { position: absolute; z-index: 10; touch-action: none; }
.resize-North, .resize-South { left: 12px; right: 12px; height: 8px; cursor: ns-resize; }
.resize-North { top: 0; }
.resize-South { bottom: 0; }
.resize-East, .resize-West { top: 12px; bottom: 12px; width: 8px; cursor: ew-resize; }
.resize-East { right: 0; }
.resize-West { left: 0; }
.resize-NorthEast, .resize-NorthWest, .resize-SouthEast, .resize-SouthWest { width: 12px; height: 12px; }
.resize-NorthEast { top: 0; right: 0; cursor: nesw-resize; }
.resize-NorthWest { top: 0; left: 0; cursor: nwse-resize; }
.resize-SouthEast { bottom: 0; right: 0; cursor: nwse-resize; }
.resize-SouthWest { bottom: 0; left: 0; cursor: nesw-resize; }
button { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; background: var(--control-background); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); font-size: 12px; cursor: pointer; box-shadow: var(--button-shadow); transition: background .15s; }
button:hover:not(:disabled) { background: var(--control-hover); color: var(--accent-text); }
button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, summary:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 3px; }
button.secondary { background: var(--panel); color: var(--accent-text); border-color: var(--line); justify-content: center; box-shadow: none; }
button.secondary:hover:not(:disabled) { background: var(--secondary-hover); }
button.text-button { width: auto; background: transparent; color: var(--text-muted); border-color: var(--line); padding: 7px 10px; font-size: 10px; box-shadow: none; }
button.text-button:hover:not(:disabled) { background: var(--panel); }
button.window-control { width: 27px; height: 30px; padding: 5px; justify-content: center; border-radius: var(--control-radius); background: transparent; color: var(--text-muted); box-shadow: none; }
button.window-control:hover:not(:disabled) { background: var(--control-hover); }
button.window-close:hover:not(:disabled) { color: var(--on-close); background: var(--close-background); }
.window-control svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.timer-card { width: min(100%, 560px); margin-inline: auto; padding: calc(var(--content-gap) + 4px); border: 1px solid var(--window-border); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / var(--reading-opacity)); box-shadow: var(--panel-shadow); backdrop-filter: blur(12px); }

.task-copy { min-width: 0; }
.task-copy h1 { margin: 0; font-size: 20px; font-weight: 550; letter-spacing: -.4px; }
.task-summary { margin: 7px 0 0; color: var(--text-muted); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.meta-dot { margin-inline: 7px; }
.state-label { font-size: 10px; color: var(--text-muted); }
.state-label.working { color: var(--accent-text); }
.state-label.working::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
.timer { display: block; flex-shrink: 0; font-family: var(--timer-font); text-shadow: var(--timer-shadow); font-size: clamp(24px, 4.6vw, 34px); font-weight: 550; font-variant-numeric: tabular-nums; letter-spacing: -.8px; line-height: 1.3; white-space: nowrap; }
.timer-long { font-size: clamp(18px, 3.5vw, 26px); }
.task-remark, .record-remark { font-size: 12px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.task-remark { max-height: 160px; overflow-y: auto; }
.actions { margin-top: calc(var(--content-gap) + 6px); }
.actions button { width: auto; justify-content: center; }
button.round-action { width: 42px; height: 42px; padding: 11px; flex: 0 0 auto; border-radius: 50%; }
.round-action .icon-pause { stroke-width: 3; }
.round-action .icon-play { fill: currentColor; stroke-width: 1; }
button.quiet-action { padding: 7px 3px; border: 0; border-radius: 7px; background: transparent; color: var(--text-muted); font-size: 12px; box-shadow: none; }
button.quiet-action:hover:not(:disabled) { background: var(--control-hover); color: var(--accent-text); }
button.quiet-action:not(.finish-action) { margin-inline: auto; }
.form-card { width: min(100%, 560px); margin: var(--content-gap) auto 0; }
.form-card h2 { font-size: 12px; color: var(--text-muted); font-weight: 500; margin: 0 0 9px; }
.work-form { display: grid; gap: 10px; }
.work-form > button { min-height: 34px; padding: 8px 12px; }
.form-note > summary { display: flex; align-items: center; gap: 5px; width: fit-content; font-size: 11px; list-style: none; }
.form-note > summary::-webkit-details-marker { display: none; }
.form-note .icon { width: 15px; height: 15px; }
.form-note[open] > summary { margin-bottom: 3px; }

label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 5px; padding: 7px 10px; min-width: 0; border: 1px solid var(--line); border-radius: var(--control-radius); color: inherit; background: rgb(var(--input-rgb) / var(--reading-opacity)); font-size: 12px; }
input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: .85; }
option { color: var(--text-primary); background: rgb(var(--input-rgb)); }
input:disabled, select:disabled, textarea:disabled { opacity: .55; }
textarea { resize: vertical; min-height: 44px; max-height: 150px; line-height: 1.6; }
.hint { color: var(--text-muted); font-size: 10px; line-height: 1.8; margin: 9px 0 0; overflow-wrap: anywhere; }
.notice, .error-banner { border-radius: var(--control-radius); padding: 12px; margin: 0 0 16px; font-size: 11px; line-height: 1.8; overflow-wrap: anywhere; }
.notice { color: var(--notice-text); background: var(--notice-background); border: 1px solid var(--notice-border); }
.notice p { margin: 0 0 6px; }
.error-banner { color: var(--error); background: var(--error-background); border: 1px solid var(--error-border); }
.error-banner p { margin: 5px 0 0; }
.inline-error { font-size: 11px; color: var(--error); margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.field-error { display: block; margin-top: 6px; color: var(--error); font-size: 10px; overflow-wrap: anywhere; }
.field-count { display: block; text-align: right; margin-top: 4px; color: var(--text-muted); font-size: 10px; }
[aria-invalid="true"] { border-color: var(--error); }
.finished-card { border-color: var(--accent-text); }
.saved-feedback { margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--line); color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.switch-panel, .recent-panel, .connection-panel { margin-top: var(--content-gap); padding-top: 4px; font-size: 11px; }
.switch-panel { max-width: 560px; margin-inline: auto; }
summary { color: var(--text-muted); cursor: pointer; padding: 3px 0; }
details[open] > summary { margin-bottom: 15px; }
.connection-panel { margin-top: 15px; font-size: 10px; }
.connection-panel > p { font-size: 11px; }
.connection-panel button { margin-top: 10px; }
.record-list { list-style: none; padding: 0; margin: 0; }
.record-list li { padding: 12px 0; border-bottom: 1px solid var(--line); }
.record-list li:last-child { border-bottom: 0; }
.record-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; }
.record-heading strong { font-weight: 550; }
.record-heading span { font-variant-numeric: tabular-nums; color: var(--accent-text); }
.record-remark { margin: 7px 0 0; font-size: 11px; }
.appearance-feedback { margin: 0 0 10px; color: var(--accent-text); }
.preview-notice { padding: 6px 9px; margin-bottom: 10px; font-size: 10px; }
.appearance-error-detail { font-size: 10px; }
.appearance-dialog { width: min(390px, calc(100% - 40px)); max-height: calc(100% - 36px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb) / var(--surface-opacity)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.appearance-dialog::backdrop { background: transparent; }
.settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.settings-heading h2 { margin: 0; font-size: 17px; font-weight: 600; }
.settings-heading button { font-size: 22px; line-height: 1; }
.theme-fieldset { padding: 0; margin: 20px 0; border: 0; min-width: 0; }
.theme-fieldset legend { margin-bottom: 10px; padding: 0; font-size: 11px; color: var(--text-muted); }

button.theme-choice { display: flex; align-items: center; gap: 9px; padding: 12px 10px; text-align: left; background: rgb(var(--window-rgb)); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); box-shadow: none; }
button.theme-choice:hover:not(:disabled) { background: rgb(var(--surface-rgb) / var(--surface-opacity)); }
button.theme-choice[aria-pressed="true"] { outline: 2px solid var(--accent-text); outline-offset: 1px; }
.theme-sample { display: grid; align-content: center; gap: 4px; flex-shrink: 0; width: 30px; height: 35px; padding: 5px; border-radius: 5px; background: rgb(var(--surface-rgb) / var(--surface-opacity)); border: 1px solid var(--line); }
.theme-sample span { height: 2px; width: 100%; background: var(--text-muted); border-radius: 2px; }
.theme-sample span:first-child { width: 60%; height: 4px; background: var(--accent); }
.theme-label { display: grid; gap: 5px; min-width: 0; }
.theme-label strong { font-size: 12px; font-weight: 600; }
.theme-label > span { font-size: 9px; color: var(--text-muted); white-space: nowrap; }
.opacity-heading { display: flex; align-items: center; justify-content: space-between; }
.opacity-heading output { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--accent-text); }
input.opacity-slider { padding: 0; margin: 10px 0 3px; border: 0; background: transparent; min-height: 24px; accent-color: var(--accent); cursor: pointer; }
.opacity-scale { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 9px; }
button.reset-opacity { margin: 15px 0 0; padding: 6px 8px; font-size: 10px; }
.settings-actions { margin-top: 20px; }
.settings-actions button { justify-content: center; }
.appearance-dialog > .notice, .appearance-dialog > .error-banner { margin: 14px 0 0; }
@media (max-width: 540px) {
  .brand-name { font-size: 12px; }
  .titlebar { gap: 8px; padding-inline: 10px; }
  .workspace { padding-inline: 14px; }
}
@media (max-width: 380px) {
  .titlebar { gap: 4px; padding-inline: 8px; }
  .titlebar-drag { gap: 6px; }
  .brand-name { font-size: 11px; }
  .brand-mark { width: 25px; height: 25px; }
  button.nav-button { width: 27px; }
  .main-nav { gap: 0; }
  .window-controls { gap: 0; }
  .titlebar .window-control { width: 24px; }
  .workspace { padding-inline: 10px; }
  .task-row { gap: 10px; }
  .timer-card { padding: var(--content-gap); }
  .task-copy h1 { font-size: 17px; }
  .actions { gap: 14px; }
}
@media (prefers-reduced-motion: reduce) { button { transition: none; } }
.history-entry { margin-top: 15px; }
.history-dialog, .delete-dialog { width: min(500px, calc(100% - 32px)); max-height: calc(100% - 32px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb) / var(--surface-opacity)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.history-dialog::backdrop, .delete-dialog::backdrop { background: rgb(0 0 0 / 25%); }
.history-filters { display: grid; gap: 10px; margin-top: 18px; }
.history-filters input, .history-filters select { padding: 9px 6px; font-size: 11px; }
.history-filters .hint { margin-top: 0; }
.filter-category-row { display: grid; grid-template-columns: 1fr 90px; gap: 12px; align-items: end; }
.filter-category-row button { justify-content: center; }
.history-tabs { margin: 18px 0 15px; }
.history-tabs button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--secondary-hover); }
.history-overview { font-size: 11px; line-height: 1.8; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 8px; margin: 13px 0 18px; }
.summary-grid > div { min-width: 0; padding: 11px 7px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); }
.summary-grid dt { font-size: 10px; color: var(--text-muted); }
.summary-grid dd { margin: 7px 0 0; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.summary-grid small { font-size: 9px; font-weight: normal; }
.history-empty { margin: 15px 0; font-size: 12px; line-height: 1.9; color: var(--text-muted); }
.history-records { list-style: none; margin: 0; padding: 0; }
.history-records li { padding: 15px 0; border-bottom: 1px solid var(--line); }
.history-records .record-remark { max-height: 110px; overflow: auto; }
button.delete-link { margin: 9px 0 0 auto; color: var(--error); }
.history-pagination { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 18px; font-size: 10px; color: var(--text-muted); }
.history-pagination button { width: auto; padding: 8px 10px; font-size: 11px; }
.stats-section { margin-top: 20px; }
.stats-section h3 { font-size: 12px; font-weight: 600; }
.stats-scroll { overflow-x: auto; }
.stats-section table { width: 100%; border-collapse: collapse; font-size: 10px; font-variant-numeric: tabular-nums; }
.stats-section th, .stats-section td { padding: 9px 5px; border-bottom: 1px solid var(--line); text-align: right; overflow-wrap: anywhere; }
.stats-section th { font-weight: 500; }
.stats-section tr > :first-child { text-align: left; white-space: nowrap; }
.stats-section thead { color: var(--text-muted); }
.history-feedback { color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.delete-dialog { width: min(350px, calc(100% - 40px)); }
.delete-dialog h2 { margin: 0; font-size: 17px; }
.delete-dialog > p { font-size: 12px; line-height: 1.8; }
.delete-record-detail { padding: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); font-size: 11px; line-height: 1.8; max-height: 160px; overflow: auto; }
button.danger-button { color: var(--error); background: var(--error-background); border-color: var(--error-border); }
button.danger-button:hover:not(:disabled) { background: var(--error-background); border-color: var(--error); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.ui-dialog { width: min(360px, calc(100% - 28px)); max-height: calc(100% - 28px); margin: auto; padding: 18px; color: var(--text-primary); background: rgb(var(--surface-rgb) / var(--reading-opacity)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.ui-dialog::backdrop { background: rgb(0 0 0 / 18%); }
.density-settings { margin: 20px 0 0; padding: 0; border: 0; }
.density-settings legend { margin-bottom: 10px; font-size: 12px; }
.density-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.density-options button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--control-hover); }
.utilities-panel { margin-top: 20px; font-size: 11px; }
.utilities-panel > button { margin-top: 12px; }
.note-heading { margin-top: 20px; font-size: 13px; }
.settlement-entry { margin-top: 12px; }
.settlement-panel { margin-top: 12px; padding: 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: var(--panel); }
.settlement-panel h2 { margin: 0; font-size: 16px; }
.settlement-panel .settings-heading .secondary { width: auto; flex-shrink: 0; font-size: 12px; line-height: 1.5; }
.settlement-record { padding: 12px 0; border-top: 1px solid var(--line); }
.settlement-record summary { cursor: pointer; }
.settlement-form { display: grid; gap: 12px; margin-top: 12px; }
.monitor-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; font-size: 10px; color: var(--text-muted); }
.monitor-status button { flex-shrink: 0; }
.monitor-settings { margin-top: 12px; }
.monitor-toggle { display: flex; align-items: center; gap: 8px; }
.monitor-toggle input { width: auto; margin: 0; }
.monitor-rule { display: grid; gap: 8px; margin: 0; padding: 10px; border: 1px solid var(--line); border-radius: var(--control-radius); min-width: 0; }
.notice-titlebar { padding: 12px 16px; }
.notice-titlebar span { flex: 1; font-size: 13px; cursor: grab; }
.notice-titlebar button { width: auto; padding: 7px 10px; }
.notice-content { padding: 0 18px 18px; overflow: auto; min-height: 0; }
.notice-content h1 { font-size: 18px; line-height: 1.5; }
.notice-content > section > .secondary, .notice-content > .text-button { margin-top: 14px; }
.island-frame { padding: 5px; }
.island-shell { flex-direction: row; align-items: center; border-radius: 32px; padding: 0 8px 0 14px; }
.island-drag { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; height: 100%; cursor: grab; }
.island-mark { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: 50%; color: var(--accent); border: 1px solid var(--window-border); font-weight: 700; }
.island-info { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 2px; }
.island-info strong, .island-info small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.island-info strong { font-size: 14px; }
.island-info small { font-size: 11px; color: var(--text-secondary); }
.island-time { font: 600 15px ui-monospace, monospace; white-space: nowrap; }
.island-open { flex: 0 0 30px; width: 30px; height: 30px; margin-left: 5px; padding: 0; border-radius: 50%; }
.island-error { color: var(--accent); font-weight: bold; }


/* Desktop refresh: keep all color and surface choices tied to the four theme tokens. */
.icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; font-size: 18px; line-height: 1; }
.icon svg, .window-control .icon svg { display: block; width: 1em; height: 1em; fill: currentColor; stroke: none; }
.window-control .icon { width: 16px; height: 16px; font-size: 14px; }
.app-shell { border-radius: var(--window-radius); }
.titlebar { min-height: 62px; padding: 10px 17px; border-bottom: 1px solid var(--line); }
.brand-mark { width: 30px; height: 30px; }
.brand-name { font-size: 14px; letter-spacing: -.35px; }
.main-nav { gap: 5px; }
button.nav-button { width: 34px; height: 34px; border-radius: 10px; }
button.nav-button[aria-pressed="true"] { background: var(--control-hover); }
button.nav-button[aria-pressed="true"]::after { bottom: -2px; }
.category-chip { padding: 6px 10px; border: 1px solid var(--line); border-radius: 999px; }
.workspace { max-width: 680px; padding: 20px 24px 24px; }
.workspace.is-active { margin-block: 0; }
.monitor-status { min-height: 42px; padding: 7px 11px; margin: 0 auto 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--surface-rgb) / 45%); font-size: 11px; }
.monitor-status button { border: 0; color: var(--accent-text); font-size: 11px; }
.timer-card { width: 100%; max-width: none; padding: 22px; border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / var(--reading-opacity)); }
.task-eyebrow { margin-bottom: 10px; color: var(--text-muted); font-size: 10px; font-weight: 600; letter-spacing: .05em; }
.task-eyebrow .icon { width: 14px; height: 14px; font-size: 13px; }
.task-copy h1 { font-size: 22px; font-weight: 650; letter-spacing: -.5px; }
.task-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
.task-summary .meta-dot { margin: 0 2px; }
.task-control-mode { padding: 2px 7px; border: 1px solid var(--line); border-radius: 999px; color: var(--text-muted); font-size: 10px; }
.task-mode-hint { max-width: 310px; margin: 8px 0 0; color: var(--text-muted); font-size: 10px; line-height: 1.6; }
.timer { font-family: ui-monospace, Consolas, monospace; font-size: clamp(23px, 4vw, 32px); letter-spacing: -1px; }
.actions { gap: 12px; margin-top: 18px; padding-top: 15px; border-top: 1px solid var(--line); }
button.round-action { width: 38px; height: 38px; padding: 9px; }
button.quiet-action { padding: 8px 10px; }
.form-card { width: 100%; max-width: none; padding: 16px 18px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.work-form { gap: 12px; }
.work-form > button { min-height: 40px; font-weight: 600; }
.switch-panel { max-width: none; padding: 12px 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.switch-panel summary { font-weight: 600; color: var(--text-primary); }
.switch-confirm { margin-top: 18px; font-size: 12px; line-height: 1.8; }
.switch-confirm p { margin: 0; }
.confirm-actions { margin-top: 10px; }
.confirm-actions button { justify-content: center; }
.ui-dialog, .history-dialog, .appearance-dialog, .delete-dialog { padding: 22px; }
.settings-heading { padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.settings-heading h2 { font-size: 16px; }
.monitor-settings { margin-top: 18px; }
.monitor-rule { padding: 14px; border-radius: 12px; }
.monitor-rule legend { color: var(--text-primary); font-weight: 600; }
.monitor-toggle input { accent-color: var(--accent); }
.monitor-toggle { line-height: 1.6; }
.history-records li, .settlement-record { padding: 15px 0; }
.notice-titlebar { padding: 14px 18px; border-bottom: 1px solid var(--line); }
.notice-titlebar span { font-weight: 600; }
.notice-content { padding: 8px 18px 18px; }
.island-shell { padding: 0 10px 0 14px; border-radius: 32px; }
.island-mark { color: var(--on-accent); background: var(--accent); border: 0; }
.island-info small { color: var(--text-muted); }
.island-time { font: 600 15px ui-monospace, Consolas, monospace; }
.island-open { display: flex; justify-content: center; align-items: center; color: var(--accent-text); background: var(--control-hover); }
.island-open .icon { width: 14px; height: 14px; font-size: 13px; transform: rotate(45deg); }
@media (max-width: 540px) {
  .titlebar { padding-inline: 10px; }
  .workspace { padding: 14px; }
  .timer-card { padding: 16px; }
}
@media (max-width: 380px) {
  .titlebar { padding-inline: 8px; }
  .workspace { padding: 10px; }
  .timer-card { padding: 13px; }
  .task-copy h1 { font-size: 17px; }
  .task-row { gap: 6px; }
  .timer { font-size: 22px; }
}

/* Secondary pages share the same cards, controls and token-driven typography. */
.history-dialog { width: min(540px, calc(100% - 32px)); }
.history-filters { padding: 14px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--window-rgb) / 45%); }
.history-filters label { color: var(--text-muted); font-weight: 600; }
.history-filters button { min-height: 38px; }
.history-tabs { padding: 4px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-tabs button { border-color: transparent; background: transparent; }
.history-tabs .icon, .history-pagination .icon, .history-filters .icon, .delete-link .icon { width: 15px; height: 15px; font-size: 14px; }
.history-overview { padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 45%); }
.summary-grid > div { padding: 12px 10px; }
.history-records { display: grid; gap: 9px; }
.history-records li { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-records .record-heading { align-items: flex-start; }
.stats-section { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.stats-section h3 { margin: 0 0 10px; }
.settlement-panel { padding: 18px; }
.settlement-panel .settings-heading { margin-bottom: 12px; }
.settlement-record { border-bottom: 1px solid var(--line); }
.settlement-form { padding: 0 4px 10px; }

button.theme-choice { min-height: 68px; padding: 12px; }
.theme-sample { width: 36px; height: 42px; border-radius: 9px; }
.theme-label strong { font-size: 13px; }
.theme-label > span { white-space: normal; }
.opacity-heading { margin-top: 20px; }

.notice-content h1 { margin-top: 12px; }
.notice-content p { line-height: 1.7; }

/* Independent panels reserve fixed header/footer rows. Only the body scrolls. */
.panel-app{display:flex;flex-direction:column;flex:1;min-height:0;height:100%;overflow:hidden}
.panel-app .panel-surface{flex:1;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden}
.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 22px;border-bottom:1px solid var(--line);flex-shrink:0}
.panel-heading h2{margin:0;font-size:18px}.panel-heading button{width:auto}
.panel-scroll{overflow:auto;min-height:0;padding:18px 24px 24px;scrollbar-width:thin}
.panel-actions{grid-row:3;display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:14px 22px;border-top:1px solid var(--line);background:rgb(var(--surface-rgb)/var(--reading-opacity))}
.panel-actions>button{width:auto;min-width:120px}.panel-actions .history-pagination{width:100%;margin:0}
.settings-tabs{display:flex;gap:8px;padding:12px 20px;border-bottom:1px solid var(--line);flex-shrink:0}.settings-tabs button{width:auto;flex:1}
.settings-tabs button[aria-pressed=true]{border-color:var(--accent);color:var(--accent-text)}
.draft-indicator{font-size:11px;margin:0;padding:6px 24px;color:var(--accent-text);flex-shrink:0}
.panel-app>.error-banner{margin:8px 20px;flex-shrink:0;max-height:80px;overflow:auto}
.data-buttons{display:flex;gap:10px;margin:14px 0 24px;flex-wrap:wrap}.data-buttons button{width:auto}
.panel-app .monitor-settings{padding:0}.panel-app .theme-grid{max-width:760px}.panel-app .settlement-form{max-width:760px;margin-top:20px}
@media(max-width:600px){.panel-scroll{padding:14px}.panel-heading,.panel-actions{padding:12px}.settings-tabs{padding:8px}.panel-actions>button{min-width:0;flex:1}}

/* Shared preferences: every desktop surface uses the saved typography. */
.desktop-frame{font-size:var(--body-size,14px);font-weight:var(--body-weight,400);line-height:var(--body-line,1.6)}
.desktop-frame button,.desktop-frame input,.desktop-frame select,.desktop-frame textarea,.desktop-frame label,.desktop-frame summary{font-size:1em;font-weight:inherit;line-height:inherit}
.desktop-frame h1{font-size:1.5em}.desktop-frame h2{font-size:1.2em}.desktop-frame h3{font-size:1.05em}.desktop-frame .hint,.desktop-frame .task-summary{font-size:.82em}.desktop-frame .timer{font-size:2.25em}.desktop-frame .task-control-mode{font-size:.75em}
.app-shell{position:relative;isolation:isolate}.window-background{position:absolute;inset:0;z-index:-1;pointer-events:none;background-size:cover;background-position:center}
button.nav-button[aria-pressed="true"]::after{display:none}.desktop-frame .main-nav{display:flex;gap:3px}.desktop-frame .titlebar{grid-template-columns:auto auto minmax(0,1fr) auto}
.work-badge{display:inline-flex;align-items:center;gap:8px;min-width:0}.work-symbol{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:31px;height:31px;border-radius:9px;color:var(--work-color);background:color-mix(in srgb,var(--work-color) 12%,transparent)}.work-symbol .icon{font-size:19px}.work-badge>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
button.workload-carousel{display:flex;align-items:center;justify-content:center;gap:7px;min-width:0;overflow:hidden;padding:6px 9px;border:1px solid var(--line);border-radius:999px;background:rgb(var(--surface-rgb)/45%);color:var(--text-primary);font-size:.8em;white-space:nowrap}.workload-carousel .work-symbol{width:22px;height:22px;border-radius:50%}.workload-carousel .icon{font-size:14px}.workload-carousel .work-badge{gap:5px;flex-shrink:0}.workload-carousel small{color:var(--text-muted);font-size:.8em;overflow:hidden;text-overflow:ellipsis}.workload-carousel>span{overflow:hidden;text-overflow:ellipsis}
.home-footer{display:flex;align-items:center;gap:8px;margin-top:12px;min-width:0}.home-footer button{flex-shrink:0}.monitor-caption{font-size:.72em;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:auto}.start-prompt{border:1px solid var(--line);border-radius:var(--panel-radius);background:rgb(var(--surface-rgb)/var(--reading-opacity));padding:16px;margin-bottom:12px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}.start-prompt>strong{font-size:1em}.start-prompt p{width:100%;color:var(--text-muted);font-size:.85em;margin:0}.start-prompt>div{display:flex;gap:9px;width:100%}.start-prompt button{justify-content:center}.browse-banner{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:12px;background:rgb(var(--surface-rgb)/85%);font-size:.88em}.browse-banner button{width:auto;justify-content:center;flex-shrink:0}
.panel-actions>button,.settings-actions>button,.data-buttons>button{justify-content:center!important;text-align:center}.panel-app button{max-width:100%}.panel-heading{padding:12px 22px}.panel-heading h2{font-size:1.15em}.settings-tabs{gap:5px;padding:10px 16px}.settings-tabs button{padding:8px 9px;font-size:.88em}.layout-form{display:grid;gap:18px;max-width:650px}.layout-form input[type=range]{padding:0}.font-preview{padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}.visual-category{border:1px solid var(--line);border-radius:12px;padding:15px;margin:0 0 18px;min-width:0}.visual-category legend{padding:0 7px}.color-field{display:flex!important;align-items:center;gap:12px;margin-bottom:12px}.color-field input{width:45px;height:30px;padding:2px;margin:0}.color-field span{color:var(--text-muted);font-size:.8em}.icon-picker{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:7px;margin-top:12px}.icon-picker button{min-height:40px;padding:8px}.icon-picker button[aria-pressed=true]{border-color:var(--accent-text);outline:1px solid var(--accent-text);background:var(--control-hover)}.background-settings{margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}.compact-help{margin:8px 0;font-size:.84em;color:var(--text-muted)}.compact-help summary{cursor:pointer}.monitor-diagnostics,.advanced-settings{padding:12px 14px;border:1px solid var(--line);border-radius:10px;margin-bottom:14px}.monitor-diagnostics>summary,.advanced-settings>summary{cursor:pointer;font-weight:600}.monitor-diagnostics>p,.monitor-diagnostics>button,.monitor-diagnostics>details{margin-top:12px}.advanced-settings>fieldset{margin-top:12px}
.desktop-frame[data-density=compact]{padding:5px;--content-gap:6px}.desktop-frame[data-density=compact] .titlebar{min-height:39px;padding:5px 8px;gap:5px}.desktop-frame[data-density=compact] .brand-name{display:none}.desktop-frame[data-density=compact] .brand-mark{width:22px;height:22px}.desktop-frame[data-density=compact] .titlebar-drag{min-height:24px}.desktop-frame[data-density=compact] .nav-button{width:25px;height:25px;padding:4px}.desktop-frame[data-density=compact] .nav-button .icon{font-size:15px}.desktop-frame[data-density=compact] .window-control{width:22px;height:25px;padding:4px}.desktop-frame[data-density=compact] .window-controls{gap:0}.desktop-frame[data-density=compact] .workload-carousel{padding:3px 5px;gap:4px;font-size:.7em}.desktop-frame[data-density=compact] .workload-carousel small{display:none}.desktop-frame[data-density=compact] .workload-carousel .work-symbol{width:17px;height:17px}.desktop-frame[data-density=compact] .workload-carousel .work-symbol .icon{font-size:12px}.desktop-frame[data-density=compact] .workspace{padding:8px 10px 9px;max-width:none}.desktop-frame[data-density=compact] .auxiliary{display:none}.desktop-frame[data-density=compact] .timer-card{padding:10px 12px;border-radius:12px}.desktop-frame[data-density=compact] .task-copy h1{font-size:1em}.desktop-frame[data-density=compact] .task-summary{margin-top:3px;font-size:.7em;gap:3px}.desktop-frame[data-density=compact] .task-control-mode{font-size:.9em;padding:0 4px}.desktop-frame[data-density=compact] .task-copy .work-symbol{width:25px;height:25px}.desktop-frame[data-density=compact] .task-copy .work-symbol .icon{font-size:16px}.desktop-frame[data-density=compact] .timer{font-size:1.65em}.desktop-frame[data-density=compact] .actions{margin-top:6px;padding-top:6px;gap:8px}.desktop-frame[data-density=compact] .round-action{width:29px;height:29px;padding:6px}.desktop-frame[data-density=compact] .quiet-action{padding:3px 5px;font-size:.8em}.desktop-frame[data-density=compact] .form-card{padding:9px 11px;margin-top:0;border-radius:12px}.desktop-frame[data-density=compact] .work-form{gap:7px}.desktop-frame[data-density=compact] .work-form label{font-size:.82em}.desktop-frame[data-density=compact] .work-form select{padding:4px 8px;margin-top:2px}.desktop-frame[data-density=compact] .work-form>button{min-height:30px;padding:4px 9px;font-size:.82em;justify-content:center}.desktop-frame[data-density=compact] .form-note>summary{font-size:.72em}.desktop-frame[data-density=compact] .home-footer{margin-top:6px;gap:4px}.desktop-frame[data-density=compact] .home-footer button{font-size:.7em;padding:4px 7px}.desktop-frame[data-density=compact] .monitor-caption{font-size:.65em}.desktop-frame[data-density=compact] .switch-panel{margin-top:6px;padding:5px 9px;font-size:.8em}.desktop-frame[data-density=compact] .start-prompt{padding:10px;gap:6px;margin-bottom:7px}.desktop-frame[data-density=compact] .start-prompt p{font-size:.75em}.desktop-frame[data-density=compact] .start-prompt button{padding:5px 8px;font-size:.82em}.desktop-frame[data-density=compact] .browse-banner{padding:8px 10px;margin-bottom:7px}.desktop-frame[data-density=compact] .browse-banner button{padding:5px 8px}.desktop-frame[data-density=compact] .settings-tabs{padding:6px 10px}.desktop-frame[data-density=compact] .settings-tabs button{padding:5px 7px;font-size:.8em}.desktop-frame[data-density=compact] .panel-heading{padding:8px 14px}.desktop-frame[data-density=compact] .panel-scroll{padding:10px 14px}.desktop-frame[data-density=compact] .panel-actions{padding:8px 14px}.desktop-frame[data-density=compact] .panel-actions>button{padding:7px 12px}.desktop-frame[data-density=compact] .monitor-settings{gap:9px}.desktop-frame[data-density=compact] .monitor-rule{padding:9px;gap:6px}.desktop-frame[data-density=compact] .theme-choice{min-height:48px;padding:8px}.desktop-frame[data-density=compact] .theme-sample{width:25px;height:28px}.desktop-frame[data-density=compact] .visual-category{padding:10px;margin-bottom:10px}
/* Main titlebar: identity + one settings entry, drag space, workload, window controls. */
.desktop-frame .titlebar.titlebar-main { grid-template-columns:auto auto minmax(32px,1fr) minmax(120px,320px) auto; }
.titlebar-main .titlebar-space { align-self:stretch; min-width:32px; }
.titlebar-main .workload-carousel { min-height:32px; }
.titlebar-main .workload-carousel .work-badge { flex:0 1 auto; min-width:0; }
.titlebar-main .workload-carousel strong { flex:0 0 auto; font-variant-numeric:tabular-nums; }
.desktop-frame[data-density=compact] .titlebar.titlebar-main { grid-template-columns:auto auto minmax(24px,1fr) minmax(100px,240px) auto; min-height:42px; gap:6px; }
.desktop-frame[data-density=compact] .titlebar-main .titlebar-space { min-width:24px; }
.desktop-frame[data-density=compact] .titlebar-main .nav-button { width:28px; height:28px; }
.desktop-frame[data-density=compact] .titlebar-main .workload-carousel { min-height:28px; padding:4px 8px; font-size:.75em; }
@media(max-width:600px) { .titlebar-main .brand-name { display:none; } }

/* Compact native status window: all persistent actions share the same row. */
.island-frame { padding:4px; }
.island-shell { position:relative; display:flex; flex-direction:column; align-items:stretch; justify-content:center; padding:5px 8px; border-radius:20px; gap:5px; }
.island-main-row { display:flex; align-items:center; min-height:30px; gap:5px; }
.island-drag { height:auto; gap:7px; }
.island-drag .work-symbol { width:26px; height:26px; border-radius:8px; flex-shrink:0; }
.island-drag .work-symbol .icon { font-size:16px; }
.island-info { gap:0; }
.island-info strong { font-size:12px; line-height:1.4; }
.island-info small { font-size:9px; line-height:1.4; }
.island-drag .island-time { font-size:12px; }
button.island-action, button.island-open { display:flex; justify-content:center; align-items:center; flex:0 0 26px; width:26px; height:26px; margin:0; padding:4px; border-radius:50%; background:transparent; color:var(--text-muted); box-shadow:none; }
button.island-action:hover:not(:disabled),button.island-open:hover:not(:disabled) { background:var(--control-hover); color:var(--accent-text); }
button.island-start { width:auto; flex-shrink:0; min-height:26px; padding:4px 8px; font-size:10px; border-radius:8px; }
.island-intent { display:flex; gap:6px; padding-left:33px; }
.island-intent button { width:auto; min-height:25px; padding:3px 10px; font-size:10px; justify-content:center; }
.island-error { position:absolute; left:2px; top:2px; font-size:10px; }
.layout-form { width:100%; margin-inline:auto; }
.layout-form input[type=range] { margin-inline:0; }
.panel-surface:has(.layout-form) .panel-heading, .panel-surface:has(.layout-form) .panel-actions { width:100%; max-width:694px; margin-inline:auto; }
button { transition:background-color .14s,border-color .14s,color .14s; }
button:active:not(:disabled) { box-shadow:inset 0 1px 2px rgb(0 0 0 / 12%); }
button.nav-button:hover:not(:disabled),button.text-button:hover:not(:disabled),button.workload-carousel:hover:not(:disabled) { background:var(--control-hover); }
@media (prefers-reduced-motion:reduce) { button { transition:none; } }

.monitor-work-sites { display:grid; gap:10px; min-width:0; }
.monitor-work-sites h3 { margin:0; font-size:1em; }
.monitor-work-sites > .hint { margin:0; }
.monitor-work-group { border:1px solid var(--line); border-radius:12px; min-width:0; }
.monitor-work-group > summary { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; list-style:none; }
.monitor-work-group > summary::before { content:"›"; color:var(--text-muted); transition:transform .14s; }
.monitor-work-group[open] > summary::before { transform:rotate(90deg); }
.monitor-work-group > summary span { margin-left:auto; font-size:.8em; color:var(--text-muted); }
.monitor-work-urls { display:grid; gap:10px; padding:0 12px 12px; min-width:0; }

.category-names-editor { display: grid; gap: 12px; margin-block: 16px; padding-block: 16px; border-block: 1px solid var(--border); }

.sound-preview-buttons { display: flex; flex-wrap: wrap; gap: 8px; }

/* v0.2.5: retain the desktop layout and theme tokens. */
.desktop-frame .titlebar.titlebar-main { grid-template-columns:auto minmax(24px,1fr) auto auto auto; }
.titlebar-main .titlebar-drag:first-child { grid-column:1; grid-row:1; }
.titlebar-main .titlebar-space { grid-column:2; grid-row:1; min-width:24px; }
.titlebar-main .browse-toolbar { grid-column:3; grid-row:1; }
.titlebar-main .main-nav { grid-column:4; grid-row:1; padding-left:8px; border-left:1px solid var(--line); }
.titlebar-main .window-controls { grid-column:5; grid-row:1; }
.desktop-frame[data-density=compact] .titlebar.titlebar-main { grid-template-columns:auto minmax(24px,1fr) auto auto auto; }
button.browse-toolbar { width:auto; padding:4px 2px; gap:7px; color:var(--text-muted); background:transparent; box-shadow:none; font-size:12px; white-space:nowrap; }
button.browse-toolbar .icon { width:17px; height:17px; font-size:17px; }
button.browse-toolbar[aria-pressed=true] { color:var(--accent-text); }
.browse-switch { width:30px; height:18px; padding:2px; border-radius:20px; background:rgb(var(--surface-rgb)/65%); border:1px solid var(--line); }
.browse-switch::before { content:""; display:block; width:12px; height:12px; border-radius:50%; background:var(--text-muted); transition:transform .18s,background .18s; }
[aria-pressed=true] .browse-switch { background:var(--control-pressed); border-color:var(--accent-text); }
[aria-pressed=true] .browse-switch::before { transform:translateX(12px); background:var(--accent-text); }
.window-background { inset:-4px; filter:blur(2px); }
.workspace { display:flex; flex-direction:column; flex:0 0 auto; min-height:0; gap:12px; }
.workspace.is-active { margin-block:0; }
.workspace > .timer-card,.workspace > .form-card { width:100%; margin:0; border-color:var(--window-border); background:rgb(var(--surface-rgb)/var(--reading-opacity)); box-shadow:var(--panel-shadow); backdrop-filter:blur(12px); }
.monitor-status-card h1 { margin:0 0 10px; font-size:1.15em; }
.monitor-status-card p { overflow-wrap:anywhere; }
.monitor-status-card > button { margin-top:12px; }
.workspace .actions { display:flex; flex-wrap:wrap; align-items:center; gap:12px; border-top:1px solid var(--line); padding-top:18px; }
.workspace .quiet-action { gap:7px; }
.workspace .home-footer { margin-top:0; }
.workspace .home-footer .text-button { padding:3px 0; border:0; border-radius:0; }
button.browse-toolbar[aria-pressed=true]:disabled { opacity:.85; }
.workspace > .notice,.workspace > .error-banner { margin-bottom:0; }
.work-form .category-field { display:flex; align-items:center; gap:12px; }
.category-field-symbol { display:grid; place-items:center; width:40px; height:40px; flex-shrink:0; border-radius:var(--control-radius); color:var(--accent-text); background:var(--control-hover); }
.work-form .category-field label { flex:1; min-width:0; }
.work-form .category-field select { border:0; background:transparent; margin:0; padding:10px 4px; font-size:1.05em; box-shadow:none; }
.work-input-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.work-input-row label { min-width:0; }
.work-input-row textarea { min-height:42px; resize:vertical; }
.work-form .start-work { width:100%; justify-content:center; border-radius:999px; gap:9px; margin-top:2px; }
.work-form .cancel-switch { justify-content:flex-start; width:auto; color:var(--text-primary); background:transparent; padding:4px 0; box-shadow:none; }
.switch-hint { font-size:11px; color:var(--text-muted); margin:0; }
button.today-strip { display:flex; gap:13px; width:100%; flex-shrink:0; padding:12px 0 2px; border:0; border-top:1px solid var(--line); border-radius:0; box-shadow:none; background:transparent; color:var(--text-muted); font-size:12px; text-align:left; }
button.today-strip:hover { background:transparent; color:var(--text-primary); }
.today-strip-label { display:flex; align-items:center; gap:7px; flex-shrink:0; color:var(--text-primary); white-space:nowrap; }
.today-strip .icon { width:16px; height:16px; font-size:16px; }
.today-strip-viewport { display:block; flex:1; min-width:0; overflow:hidden; }
.today-strip-track { display:flex; width:max-content; gap:32px; white-space:nowrap; }
.today-strip-track > span { flex-shrink:0; }
.today-strip-track.is-scrolling { animation:today-scroll var(--scroll-duration) linear infinite; }
.today-strip:hover .today-strip-track,.today-strip:focus-visible .today-strip-track { animation-play-state:paused; }
@keyframes today-scroll { to { transform:translateX(calc(-1 * var(--scroll-distance))); } }
.desktop-frame[data-density=compact] .workspace { gap:8px; }
.desktop-frame[data-density=compact] .workspace .actions { gap:8px; padding-top:10px; }
.desktop-frame[data-density=compact] .category-field-symbol { width:30px; height:30px; }
.desktop-frame[data-density=compact] .today-strip { font-size:10px; gap:8px; padding-top:8px; }
.desktop-frame[data-density=compact] .workspace .home-footer { margin-top:0; }
@media(max-width:440px) {
  .workspace .actions { gap:8px; }
  .workspace .quiet-action { padding-inline:4px; gap:4px; }
  .workspace .quiet-action .icon { width:17px; height:17px; font-size:17px; }
  .work-input-row { grid-template-columns:1fr; gap:8px; }
  .browse-toolbar .browse-switch { display:none; }
  .titlebar-main .main-nav { padding-left:4px; }
}
@media(prefers-reduced-motion:reduce) {
  .today-strip-track.is-scrolling { animation:none; }
  .today-strip-track > span[aria-hidden] { display:none; }
  .today-strip-viewport { overflow-x:auto; scrollbar-width:thin; }
  .browse-switch::before { transition:none; }
}

/* Fixed island body; the lower reveal shares this single material layer. */
.island-frame { padding:4px; }
.island-frame .island-shell { position:absolute; left:4px; top:4px; width:312px; height:auto; max-height:calc(100% - 8px); padding:0; gap:0; display:flex; flex-direction:column; justify-content:flex-start; border-radius:20px; overflow:hidden; backdrop-filter:blur(12px); }
.island-frame .island-main-row { position:relative; width:310px; height:46px; min-height:46px; flex:0 0 46px; padding:5px 7px; margin:0; gap:3px; border-radius:20px; }
.island-frame .island-drag { align-self:stretch; min-width:0; height:auto; }
.island-frame .island-info { min-width:0; }
.island-frame .island-drag .work-symbol { flex:0 0 25px; width:25px; height:25px; }
.island-frame .island-time { font-size:12px; }
.island-frame button.island-action,.island-frame button.island-open { flex:0 0 22px; width:22px; height:26px; padding:3px; border-radius:8px; }
.island-frame .island-action .icon,.island-frame .island-open .icon { width:14px; height:14px; font-size:14px; }
.island-expansion { width:310px; flex:none; overflow:hidden; transition:height .2s ease,opacity .2s ease,transform .2s ease; }
.island-expansion:not(.island-reveal-enter):not(.island-reveal-appear):not(.island-reveal-leave) { overflow-y:auto; scrollbar-width:thin; }
.island-expansion-content { padding:5px 13px 14px; font-size:12px; }
.island-expansion-content h2 { margin:0 0 8px; font-size:14px; font-weight:600; }
.island-expansion-content p { margin:0 0 9px; line-height:1.65; }
.island-expansion-content button { min-height:29px; padding:6px 9px; font-size:11px; justify-content:center; }
.island-buttons { display:flex; gap:8px; }
.island-expansion .settlement-form { display:flex; flex-direction:column; gap:9px; }
.island-expansion .settlement-form .hint { font-size:10px; margin:0; }
.island-expansion .settlement-form label { font-size:11px; }
.island-expansion .settlement-form input,.island-expansion .settlement-form select,.island-expansion .settlement-form textarea { margin-top:4px; padding:5px 7px; font-size:12px; }
.island-expansion .text-button { margin-top:8px; width:100%; }
.island-discard { padding:8px; margin-bottom:10px; border:1px solid var(--line); border-radius:var(--control-radius); }
.island-discard button+button { margin-top:6px; }
@media(prefers-reduced-motion:reduce) { .island-expansion { transition:none; } }

/* v0.2.7: shared translucent controls, with local reading protection rather than content opacity. */
.desktop-frame .titlebar, .desktop-frame .home-footer, .desktop-frame .footer,
.desktop-frame .settings-tabs, .desktop-frame .panel-surface,
.island-frame .island-main-row, .island-frame .island-expansion-content {
  background: rgb(var(--window-rgb) / var(--reading-opacity));
}
.desktop-frame button.today-strip, .desktop-frame button.today-strip:hover {
  background: rgb(var(--window-rgb) / var(--reading-opacity));
}
.desktop-frame .titlebar { border-radius: var(--window-radius) var(--window-radius) 0 0; }
button.secondary { background: var(--control-background); color: var(--text-primary); }
button:active:not(:disabled) { background: var(--control-pressed); box-shadow: none; }
button.browse-toolbar:hover:not(:disabled), button.browse-toolbar[aria-pressed=true] {
  background: var(--control-hover); color: var(--accent-text); border-radius: 8px;
}
button.browse-toolbar, button.window-control, button.nav-button,
button.island-action, button.island-open, button.quiet-action { border-color: transparent; }
.work-form > button:not(.cancel-switch), .monitor-status-card > button,
.settlement-form button[type=submit], .panel-actions > button:not(.secondary) {
  background: var(--primary-background); color: var(--accent-text); border-color: var(--window-border);
  justify-content: center; gap: 9px;
}
.work-form > button:hover:not(:disabled), .monitor-status-card > button:hover:not(:disabled),
.settlement-form button[type=submit]:hover:not(:disabled), .panel-actions > button:hover:not(:disabled) {
  background: var(--control-hover);
}
.desktop-frame .appearance-dialog, .desktop-frame .history-dialog, .desktop-frame .delete-dialog,
.desktop-frame .ui-dialog { background: rgb(var(--surface-rgb) / var(--reading-opacity)); backdrop-filter: blur(16px); }
````

## UPDATE — E:\WorkMemo\src\Dashboard.css

SHA256：`c22e560ce708d0c776fd3ab4a2fcf95661ae1a37164cbebd652853903a922c12`

````css
/* Web-only layout. Ant Design owns control appearance, focus, motion and overlays. */
/* Keep specificity below the library's `html body` scroll locker. */
body:where(:has(.data-center)) {
  overflow: auto;
  background: #edf2ee;
}
/* Legacy desktop buttons use width:100%; web controls opt out without a global reset. */
.wm-ui-root .wm-btn:not(.wm-btn-icon-only),
.dc-sheet-root .wm-btn:not(.wm-btn-icon-only),
.wm-modal .wm-btn:not(.wm-btn-icon-only) {
  width: auto;
}
.data-center {
  min-height: 100vh;
  color: #243c33;
  background: #edf2ee;
  font:
    14px/1.6 "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
}
.data-center *,
.dc-sheet-root * {
  box-sizing: border-box;
}
.data-center h1,
.data-center h2,
.dc-sheet-title h2 {
  margin: 0;
  font-weight: 650;
  letter-spacing: -0.025em;
}
.data-center h2 {
  font-size: 16px;
}
.data-center p {
  margin: 0;
}
.data-center .icon,
.dc-sheet-root .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  font-size: 17px;
}
.data-center .work-badge,
.dc-sheet-root .work-badge {
  min-width: 0;
  gap: 9px;
  font-weight: 550;
}
.data-center .work-badge > span:last-child,
.dc-sheet-root .work-badge > span:last-child {
  white-space: normal;
  overflow-wrap: anywhere;
}
.data-center .work-symbol,
.dc-sheet-root .work-symbol {
  width: 30px;
  height: 30px;
  border-radius: 9px;
}
.data-center .work-symbol .icon,
.dc-sheet-root .work-symbol .icon {
  font-size: 16px;
}
.dc-sidebar {
  width: 68px;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 0;
  background: rgb(255 255 255 / 60%);
  border-right: 1px solid #e3ebe5;
}
.dc-brand {
  display: inline-flex;
  margin-bottom: 26px;
}
.dc-brand img {
  width: 36px;
  height: 36px;
}
.dc-sidebar-bottom {
  margin-top: auto;
  padding-top: 20px;
}
.connection-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b48350;
  box-shadow: 0 0 0 4px #b4835010;
}
.connection-dot.connected {
  background: #37936d;
  box-shadow: 0 0 0 4px #37936d10;
}
.dc-page {
  margin-left: 68px;
}
.dc-topbar {
  position: sticky;
  top: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
  padding: 0 28px;
  background: rgb(255 255 255 / 65%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e3ebe5;
}
.dc-breadcrumb {
  font-size: 12px;
  color: #64796d;
  white-space: nowrap;
}
.dc-breadcrumb > span {
  color: #89998f;
  margin-left: 12px;
}
.dc-sync {
  display: inline-block;
  min-width: 118px;
  color: #89998f;
  font-size: 11px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.dc-main {
  max-width: 1380px;
  margin: auto;
  padding: 28px 28px 0;
}
.dc-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.dc-eyebrow {
  display: block;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #86998d;
  margin-bottom: 6px;
  font-weight: 600;
}
.dc-heading h1 {
  font-size: 28px;
  line-height: 1.3;
  margin-bottom: 7px;
}
.dc-heading p {
  font-size: 13px;
  color: #718579;
}
.dc-notice {
  margin-block: 14px;
}
.dc-period-bar,
.dc-period-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-period-nav {
  justify-content: flex-start;
}
.dc-period-nav strong {
  min-width: 154px;
  text-align: center;
  color: #355b46;
  font-size: 14px;
  font-weight: 550;
}
.dc-filter-form {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.dc-filter-form > .wm-form-item {
  flex: 1 1 136px;
  min-width: 120px;
  margin-bottom: 0;
}
.dc-filter-form .wm-picker,
.dc-filter-form .wm-select {
  width: 100%;
}
.dc-filter-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dc-filter-summary {
  border-top: 1px solid #edf2ee;
  margin-top: 16px;
  padding-top: 12px;
  min-height: 30px;
  font-size: 11px;
  color: #7b8e81;
  overflow-wrap: anywhere;
}
.dc-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-block: 18px;
}
.dc-kpi-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #718579;
}
.dc-kpi-label .icon {
  color: #87a58f;
}
.dc-kpi strong {
  display: block;
  font-size: 30px;
  font-weight: 650;
  line-height: 1.6;
  color: #284d3a;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-kpi strong small {
  font-size: 12px;
  font-weight: 400;
  margin-left: 8px;
  color: #7b8e81;
}
.dc-kpi p {
  font-size: 11px;
  color: #7b8e81;
}
.dc-card {
  min-width: 0;
  margin-bottom: 18px;
}
.dc-card-title {
  padding-block: 16px;
  white-space: normal;
}
.dc-card-title p {
  margin-top: 4px;
  font-size: 11px;
  color: #7b8e81;
  font-weight: 400;
}
.dc-report-quantity strong {
  display: block;
  font-size: 22px;
  font-weight: 650;
  line-height: 1.4;
  color: #284d3a;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-report-quantity small {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: #7b8e81;
}
.dc-number {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dc-date {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.dc-muted {
  color: #7b8e81;
  font-size: 12px;
}
.dc-report-note {
  padding: 14px 24px;
  color: #7b8e81;
  font-size: 11px;
}
.dc-report-cards {
  display: grid;
  gap: 12px;
  padding: 12px;
}
.dc-report-cards dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}
.dc-report-cards dt {
  font-size: 11px;
  color: #7b8e81;
  margin-bottom: 6px;
}
.dc-report-cards dd {
  margin: 0;
}
.dc-chart {
  width: 100%;
  height: 260px;
  overflow: hidden;
}
.dc-auxiliary {
  margin-bottom: 18px;
}
.dc-auxiliary small {
  margin-left: 10px;
}
.dc-auxiliary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.dc-auxiliary-grid > * {
  min-width: 0;
}
.dc-category .dc-chart {
  height: 180px;
}
.dc-calendar .dc-chart {
  height: 158px;
}
.dc-heat-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding-bottom: 8px;
  font-size: 10px;
  color: #7b8e81;
}
.dc-heat-legend i {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  border: 1px solid #1f23281a;
}
.dc-records {
  scroll-margin-top: 80px;
  outline: none;
}
.dc-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  flex-wrap: wrap;
}
.dc-pagination > span {
  color: #7b8e81;
  font-size: 11px;
}
.dc-page-footer {
  text-align: center;
  color: #899c8f;
  font-size: 11px;
  padding: 12px 0 28px;
}
.dc-loading {
  padding: 24px;
}
.dc-sheet-title h2 {
  font-size: 20px;
  color: #243c33;
}
.dc-sheet-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dc-unsaved {
  font-size: 12px;
  color: #9c752f;
}
.dc-record-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px;
  background: #f4f8f5;
  border: 1px solid #e6eee8;
  border-radius: 12px;
}
.dc-record-summary > div {
  margin-left: auto;
  text-align: right;
}
.dc-record-summary strong {
  display: block;
  font:
    600 24px/1.4 ui-monospace,
    monospace;
  color: #284d3a;
}
.dc-record-summary small {
  display: block;
  color: #7b8e81;
  font-size: 11px;
}
.dc-detail-times {
  margin-block: 22px;
}
.dc-detail-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #7b8e81;
}
.dc-detail-quantity strong {
  color: #284d3a;
  font-size: 24px;
  font-variant-numeric: tabular-nums;
}
.dc-detail-remark {
  padding: 16px;
  min-height: 76px;
  background: #f7faf8;
  border-radius: 10px;
  color: #526c5d;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.9;
}
.dc-audit {
  margin-top: 22px;
}
.dc-segment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
}
.dc-revision {
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
  overflow-wrap: anywhere;
}
.dc-revision p {
  margin-block: 8px 0;
  white-space: pre-wrap;
}
.dc-confirm-description {
  color: #65796f;
  line-height: 1.9;
  margin-block: 12px;
  overflow-wrap: anywhere;
}
@media (max-width: 1000px) {
  .dc-main {
    padding: 24px 20px 0;
  }
  .dc-topbar {
    padding-inline: 20px;
  }
  .dc-auxiliary-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 760px) {
  .dc-sidebar {
    display: none;
  }
  .dc-page {
    margin-left: 0;
  }
  .dc-breadcrumb > span,
  .dc-sync {
    display: none;
  }
  .dc-main {
    padding: 20px 16px 0;
  }
  .dc-topbar {
    padding-inline: 16px;
  }
}
@media (max-width: 640px) {
  .dc-main {
    padding-inline: 12px;
  }
  .dc-heading {
    align-items: flex-start;
  }
  .dc-heading h1 {
    font-size: 24px;
  }
  .dc-heading > .wm-tag {
    display: none;
  }
  .dc-period-bar {
    justify-content: center;
  }
  .dc-period-nav {
    justify-content: center;
    gap: 6px;
  }
  .dc-period-nav strong {
    min-width: 138px;
    font-size: 12px;
  }
  .dc-filter-form {
    gap: 12px;
  }
  .dc-filter-form > .wm-form-item {
    flex-basis: calc(50% - 6px);
    min-width: 0;
  }
  .dc-filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .dc-kpis {
    gap: 8px;
  }
  .dc-kpi .wm-card-body {
    padding: 12px 10px;
  }
  .dc-kpi strong {
    font-size: 23px;
  }
  .dc-kpi strong small {
    display: block;
    margin: 0;
    line-height: 1.4;
  }
  .dc-kpi-label {
    font-size: 11px;
  }
  .dc-kpi-label .icon {
    display: none;
  }
  .dc-kpi p {
    font-size: 10px;
    margin-top: 8px;
  }
  .dc-auxiliary small {
    display: block;
    margin-left: 0;
  }
  .dc-pagination {
    padding: 16px;
  }
  .dc-sheet-footer {
    flex-wrap: wrap;
  }
  .dc-sheet-footer > span {
    font-size: 11px;
  }
  .dc-report-note {
    padding-inline: 16px;
  }
}

/* Local browser translucency: the page canvas stays a normal browser surface. */
.data-center { background: linear-gradient(145deg, #f3f2eb, #e7efea 52%, #edf0f5); }
.data-center .wm-card { backdrop-filter: blur(12px); }
.dc-pending-list { display: grid; gap: 16px; min-width: 0; }
.dc-pending-list > p { color: #536b5b; }
.dc-pending-list .wm-table-cell { overflow-wrap: anywhere; }
.dc-pending-refresh { justify-self: start; }
````

## UPDATE — E:\WorkMemo\src\Dashboard.tsx

SHA256：`cbe9933e889d82bb48a6f7ff9a0530cac37f70d58fc33d6b71dcae65a540a31b`

````tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Collapse,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  Menu,
  Modal,
  Pagination,
  Segmented,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  type InputRef,
  type TableColumnsType,
} from "antd";
import dayjs from "dayjs";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
} from "./types";
import { formatQuantity, localDate } from "./history";
import {
  shiftPeriod,
  reportRangeLabel,
  type ReportPeriod,
} from "./reportPeriod";
import { useCategoryNames } from "./categoryNames";
import { DEFAULT_PRESENTATION, WorkBadge } from "./desktopPreferences";
import { validateWorkInput } from "./workInput";
import { Icon } from "./Icon";
import { UiProvider, useMediaQuery } from "./ui/UiProvider";
import { BottomSheet } from "./ui/BottomSheet";
import {
  api,
  initialQuery,
  type CategoryTotal,
  type Detail,
  type Data,
  type Query,
  type Row,
} from "./dashboard/api";
import { useDashboardData } from "./dashboard/useDashboardData";
import { CalendarChart, CategoryChart, TrendChart } from "./dashboard/Charts";
import "./Dashboard.css";

const minDate = dayjs("1970-01-01"),
  maxDate = dayjs("9999-12-31");
function RecordStatus({ row }: { row: Row }) {
  return (
    <Tag
      color={
        row.status !== "FINISHED"
          ? "processing"
          : row.settlement_status === "PENDING"
            ? "gold"
            : "success"
      }
    >
      {row.status !== "FINISHED"
        ? "进行中"
        : row.settlement_status === "PENDING"
          ? "待补全"
          : "已确认"}
    </Tag>
  );
}
function Title({ title, description }: { title: string; description: string }) {
  return (
    <div className="dc-card-title">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
function DashboardContent() {
  const { message } = AntApp.useApp();
  const { name } = useCategoryNames();
  const narrow = useMediaQuery("(max-width: 640px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [query, setQuery] = useState<Query>(initialQuery);
  const [filters, setFilters] = useState<Query>(initialQuery);
  const [refresh, setRefresh] = useState(0);
  const { data, meta, error, online, refreshing, updatedAt, loading } =
    useDashboardData(query, refresh);
  const [actionError, setActionError] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    category: "开发",
    quantity: "",
    remark: "",
  });
  const [editorError, setEditorError] = useState("");
  const [detailStale, setDetailStale] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<Query | null>(null);
  const [pendingData, setPendingData] = useState<Data | null>(null);
  const [pendingError, setPendingError] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const selectedPending = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quantityInput = useRef<InputRef>(null);
  const safeConfirmAction = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const recordsRef = useRef<HTMLElement>(null);
  const [confirmation, setConfirmation] = useState<"guard" | "delete" | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const next = useRef<(() => void) | null>(null);
  const afterConfirm = useRef<(() => void) | null>(null);
  const [categoryMetric, setCategoryMetric] = useState("duration");
  const [section, setSection] = useState("overview");
  const presentation = meta?.presentation ?? DEFAULT_PRESENTATION;
  const categoryOptions = CATEGORIES.map((value) => ({
    value,
    label: name(value),
  }));
  const dirty =
    !!detail &&
    editing &&
    (fields.category !== detail.record.category ||
      fields.quantity !==
        (detail.record.quantity === null
          ? ""
          : String(detail.record.quantity)) ||
      fields.remark !== detail.record.remark);
  const blocked = busy || confirmation !== null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0])
          setSection(entries[0].isIntersecting ? "records" : "overview");
      },
      { rootMargin: "-64px 0px -25% 0px" },
    );
    if (recordsRef.current) observer.observe(recordsRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (editing && sheetOpen && !confirmation)
      quantityInput.current?.focus({ preventScroll: true });
  }, [editing, sheetOpen, confirmation, detail?.record.id]);
  function applyQuery(value: Query) {
    setFilters(value);
    setQuery(value);
  }
  function selectPeriod(period: ReportPeriod) {
    applyQuery({
      ...filters,
      period,
      anchor_date:
        period === "custom"
          ? null
          : filters.anchor_date || data?.range.anchor_date || null,
      start_date: period === "custom" ? (data?.range.start_date ?? null) : null,
      end_date: period === "custom" ? (data?.range.end_date ?? null) : null,
      page: 1,
    });
  }
  function movePeriod(direction: number) {
    const anchor = data?.range.anchor_date;
    const shifted = anchor && shiftPeriod(query.period, anchor, direction);
    if (shifted) applyQuery({ ...query, anchor_date: shifted, page: 1 });
  }
  function leave(action: () => void) {
    if (busyRef.current || confirmation) return;
    if (dirty) {
      next.current = action;
      setConfirmation("guard");
      setConfirmOpen(true);
    } else action();
  }
  function showDetail(value: Detail, edit: boolean) {
    setDetail(value);
    setDetailStale(false);
    setFields({
      category: value.record.category,
      quantity: value.record.quantity === null ? "" : String(value.record.quantity),
      remark: value.record.remark,
    });
    setEditing(edit && value.record.status === "FINISHED");
    setSheetOpen(true);
  }
  async function openDetail(row: Row, edit = false) {
    if (busyRef.current || detail) return;
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    setEditorError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      setPendingQuery(null);
      showDetail(value, edit);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const readPending = useCallback(async (criteria: Query) => {
    let list = await api<Data>("query", criteria);
    if (criteria.page > list.pages && list.pages > 0)
      list = await api<Data>("query", { ...criteria, page: list.pages });
    setPendingQuery({ ...criteria, page: list.page });
    setPendingData(list);
    setPendingError("");
  }, []);
  async function refreshPending(criteria: Query) {
    if (busyRef.current || !online) return;
    busyRef.current = true; setBusy(true);
    try { await readPending(criteria); }
    catch (e) { setPendingError(String(e instanceof Error ? e.message : e)); }
    finally { busyRef.current = false; setBusy(false); }
  }
  function returnToPending() {
    if (!pendingQuery) return;
    setDetail(null); setEditing(false); setEditorError("");
    void refreshPending(pendingQuery);
  }
  useEffect(() => {
    if (!sheetOpen || detail || !pendingData) return;
    const frame = requestAnimationFrame(() => {
      const id = selectedPending.current;
      const button = document.querySelector<HTMLElement>(`[data-pending-id="${id}"]`)
        ?? document.querySelector<HTMLElement>("[data-pending-id]")
        ?? document.querySelector<HTMLElement>(".dc-pending-refresh");
      button?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [sheetOpen, detail, pendingData]);
  async function selectPending(row: Row) {
    if (!pendingQuery || !pendingData || busyRef.current || !online) return;
    selectedPending.current = row.id;
    busyRef.current = true; setBusy(true); setPendingError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      const record = value.record;
      const date = localDate(new Date(record.start_time));
      if (record.status !== "FINISHED" || record.settlement_status !== "PENDING"
        || record.category !== pendingQuery.category
        || (pendingQuery.scope !== "all" && record.is_demo !== (pendingQuery.scope === "demo"))
        || (pendingData.range.start_date && date < pendingData.range.start_date)
        || (pendingData.range.end_date && date > pendingData.range.end_date)) {
        setPendingStatus("这条记录已变化，请重新选择。");
        await readPending(pendingQuery);
        return;
      }
      showDetail(value, true); setEditorError("");
    } catch (e) {
      // A removed row must not silently open a different record.
      try { await readPending(pendingQuery); }
      catch { /* Preserve the original error and offer an explicit retry. */ }
      setPendingError(e instanceof Error ? e.message : String(e));
    } finally { busyRef.current = false; setBusy(false); }
  }
  async function openCategoryPending(category: string) {
    if (busyRef.current || sheetOpen || !online) return;
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const criteria: Query = { ...query, anchor_date: data?.range.anchor_date ?? query.anchor_date, category, status: "pending", page: 1 };
    setPendingQuery(criteria); setPendingData(null); setPendingError(""); setPendingStatus("");
    selectedPending.current = null; setSheetOpen(true);
    setActionError("");
    await refreshPending(criteria);
  }
  const save = useCallback(async () => {
    if (!detail || busyRef.current || !online) return false;
    const result = validateWorkInput(
      fields.category,
      fields.quantity,
      fields.remark,
      true,
    );
    if (!result.ok) {
      setEditorError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    let committed = false;
    try {
      const input: SettleInput = {
        ...result.input,
        quantity: result.input.quantity,
        id: detail.record.id,
        expected_revision: detail.record.revision,
      };
      await api("save", input);
      committed = true;
      // A successful write remains successful if its follow-up read fails.
      const record: Row = {
        ...detail.record,
        ...result.input,
        settlement_status: "COMPLETE",
      };
      setDetail({ ...detail, record });
      setEditing(false);
      setDetailStale(true);
      setFields({
        category: record.category,
        quantity: String(record.quantity),
        remark: record.remark,
      });
      setRefresh((value) => value + 1);
      if (pendingQuery) {
        setDetail(null); setEditing(false); setEditorError("");
        setPendingStatus("工作量已保存，请选择下一条记录。");
        // A committed write stays committed even when refreshing the list fails.
        setPendingData(null);
        try { await readPending(pendingQuery); }
        catch (e) { setPendingError(`已保存，列表刷新失败：${e instanceof Error ? e.message : String(e)}`); }
        return true;
      }
      const updated = await api<Detail>("detail", { id: detail.record.id });
      setDetail(updated);
      setDetailStale(false);
      void message.success({ content: "工作量已保存", key: "workload-save" });
      return true;
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      setEditorError(
        committed
          ? `已保存，详情刷新失败：${text}。请关闭后重新打开详情。`
          : text,
      );
      if (committed)
        void message.warning({
          content: "已保存，详情刷新失败",
          key: "workload-save",
        });
      return committed;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [detail, fields, online, message, pendingQuery, readPending]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s" &&
        editing &&
        sheetOpen &&
        !confirmation
      ) {
        event.preventDefault();
        void save();
      }
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, editing, sheetOpen, confirmation, save]);
  async function remove() {
    if (!deleting || busyRef.current || !online) return;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    try {
      await api("delete", {
        id: deleting.id,
        expected_revision: deleting.revision,
      });
      setConfirmOpen(false);
      setRefresh((value) => value + 1);
      void message.success("记录已删除");
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function closeConfirmation() {
    if (!busyRef.current) {
      next.current = null;
      afterConfirm.current = null;
      setConfirmOpen(false);
    }
  }
  function restoreTrigger() {
    requestAnimationFrame(() => {
      (trigger.current?.isConnected
        ? trigger.current
        : recordsRef.current
      )?.focus({ preventScroll: true });
    });
  }
  function pendingLink(row: CategoryTotal) {
    return row.pending > 0 ? <Button type="link" size="small" className="dc-pending-link"
      aria-label={`${name(row.category)}待补填${row.pending}条`} disabled={!online || busy || sheetOpen}
      onClick={() => { void openCategoryPending(row.category); }}>{row.pending} 条</Button>
      : <span className="dc-muted">0 条</span>;
  }
  const reportColumns: TableColumnsType<CategoryTotal> = [
    {
      title: "工作类型",
      dataIndex: "category",
      width: "29%",
      render: (value: string) => (
        <WorkBadge category={value} presentation={presentation} />
      ),
    },
    {
      title: "已确认工作量",
      key: "quantity",
      render: (_, row) => (
        <div className="dc-report-quantity">
          <strong>
            {row.complete > 0
              ? formatQuantity(row.quantity)
              : row.pending > 0
                ? "待补填"
                : "—"}
          </strong>
          <small>
            {row.complete > 0
              ? `已确认 ${row.complete} 条`
              : row.pending > 0
                ? "尚未确认产出"
                : "暂无已结束记录"}
          </small>
        </div>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "已结束记录",
      dataIndex: "records",
      render: (value: number) => <span className="dc-number">{value} 条</span>,
    },
    {
      title: "待补填",
      dataIndex: "pending",
      render: (_, row) => pendingLink(row),
    },
  ];
  const recordColumns: TableColumnsType<Row> = [
    {
      title: "类别",
      dataIndex: "category",
      width: 150,
      render: (value: string, row) => (
        <Space orientation="vertical" size={4}>
          <WorkBadge category={value} presentation={presentation} />
          {row.is_demo && <Tag color="gold">演示</Tag>}
        </Space>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "start_time",
      width: 170,
      render: (value: number) => (
        <span className="dc-date">{formatTime(value)}</span>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      width: 120,
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "工作量",
      key: "quantity",
      width: 110,
      render: (_, row) =>
        row.settlement_status === "COMPLETE" ? (
          <span className="dc-number">{formatQuantity(row.quantity)}</span>
        ) : (
          <span className="dc-muted">
            {row.status === "FINISHED" ? "待补填" : "进行中"}
          </span>
        ),
    },
    {
      title: "状态",
      key: "status",
      width: 100,
      render: (_, row) => <RecordStatus row={row} />,
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 190,
      ellipsis: true,
      render: (value: string) => (
        <span className="dc-muted">{value || "—"}</span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 170,
      render: (_, row) => (
        <Space size={2} className="dc-row-actions">
          <Button
            type="link"
            size="small"
            disabled={busy}
            onClick={() => {
              void openDetail(row);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              void openDetail(row, true);
            }}
          >
            {row.settlement_status === "PENDING" ? "补填" : "编辑"}
          </Button>
          <Button
            type="text"
            danger
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              setEditorError("");
              setDeleting(row);
              setConfirmation("delete");
              setConfirmOpen(true);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const totals = data?.totals;
  const scrollBehavior = reduced ? "instant" : "smooth";
  const dateField = (
    label: string,
    value: string | null,
    change: (value: string | null) => void,
    required = false,
  ) => (
    <Form.Item label={label}>
      <DatePicker
        aria-label={label}
        value={value ? dayjs(value) : null}
        minDate={minDate}
        maxDate={maxDate}
        allowClear={!required}
        format="YYYY-MM-DD"
        onChange={(date) => change(date?.format("YYYY-MM-DD") ?? null)}
        inputReadOnly={false}
      />
    </Form.Item>
  );
  return (
    <div className="data-center">
      <aside className="dc-sidebar" inert={!!detail || !!confirmation}>
        <Tooltip title="WorkMemo 工作数据中心" placement="right">
          <a
            className="dc-brand"
            href="/dashboard"
            aria-label="WorkMemo 工作数据中心"
          >
            <img src="/workmemo.png" alt="" />
          </a>
        </Tooltip>
        <Menu
          mode="inline"
          inlineCollapsed
          selectedKeys={[section]}
          items={[
            {
              key: "overview",
              icon: <Icon name="chart" />,
              label: "工作总览",
              title: "工作总览",
            },
            {
              key: "records",
              icon: <Icon name="list" />,
              label: "工作明细",
              title: "工作明细",
            },
          ]}
          onClick={({ key }) => {
            if (key === "records")
              recordsRef.current?.scrollIntoView({ behavior: scrollBehavior });
            else window.scrollTo({ top: 0, behavior: scrollBehavior });
          }}
        />
        <div className="dc-sidebar-bottom">
          <Tooltip
            title={`${online ? "本机连接正常" : "等待本机连接"} · v${meta?.version ?? "0.2.4"}`}
            placement="right"
          >
            <span
              className={`connection-dot ${online ? "connected" : ""}`}
              role="img"
              aria-label={online ? "本机连接正常" : "等待本机连接"}
            />
          </Tooltip>
        </div>
      </aside>
      <div className="dc-page" inert={!!detail || !!confirmation}>
        <header className="dc-topbar">
          <span className="dc-breadcrumb">
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <Space size={12}>
            <span className="dc-sync" aria-live="polite">
              {refreshing
                ? "正在刷新…"
                : updatedAt
                  ? `更新于 ${new Date(updatedAt).toLocaleTimeString("zh-CN", { hour12: false })}`
                  : "等待连接"}
            </span>
            <Button
              icon={<Icon name="refresh" />}
              onClick={() => setRefresh((value) => value + 1)}
            >
              刷新连接
            </Button>
          </Space>
        </header>
        <main className="dc-main">
          <div className="dc-heading">
            <div>
              <span className="dc-eyebrow">WORK REPORT</span>
              <h1>工作总览</h1>
              <p>按类型看清工作量，按周期回顾投入。</p>
            </div>
            <Tag variant="filled">记录保存在本机</Tag>
          </div>
          {query.scope !== "real" && (
            <Alert
              className="dc-notice"
              type="warning"
              showIcon
              title={
                query.scope === "demo"
                  ? "正在查看演示数据"
                  : "当前结果包含演示数据"
              }
              description="示例仅用于查看效果，日常真实统计默认排除。"
            />
          )}
          {(error || actionError) && (
            <Alert
              className="dc-notice"
              type="error"
              showIcon
              title={
                data && error ? "刷新失败，当前显示上次结果" : "操作未完成"
              }
              description={actionError || error}
              action={
                <Button
                  size="small"
                  onClick={() => {
                    setActionError("");
                    setRefresh((value) => value + 1);
                  }}
                >
                  重试
                </Button>
              }
            />
          )}
          {meta?.active && (
            <Alert
              className="dc-notice dc-active"
              type="info"
              showIcon
              title={
                <Space wrap>
                  <WorkBadge
                    category={meta.active.category}
                    presentation={presentation}
                  />
                  <span>
                    {meta.active.is_paused
                      ? "当前任务已暂停"
                      : "当前任务正在计时"}
                  </span>
                </Space>
              }
              description="结束后可在这里补填工作量，进行中的任务不计入已结束报表。"
            />
          )}
          <Card
            className="dc-filters"
            styles={{ body: { padding: narrow ? 16 : 20 } }}
          >
            <div className="dc-period-bar">
              <Segmented
                aria-label="统计周期"
                value={filters.period}
                options={[
                  { value: "day", label: "日" },
                  { value: "week", label: "周" },
                  { value: "month", label: "月" },
                  { value: "custom", label: "自定义" },
                ]}
                onChange={(value) => selectPeriod(value as ReportPeriod)}
              />
              {query.period !== "custom" && (
                <div className="dc-period-nav">
                  <Button
                    aria-label="上一周期"
                    icon={<Icon name="left" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, -1)
                    }
                    onClick={() => movePeriod(-1)}
                  />
                  <strong>
                    {data ? reportRangeLabel(data.range) : "正在读取周期…"}
                  </strong>
                  <Button
                    aria-label="下一周期"
                    icon={<Icon name="right" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, 1)
                    }
                    onClick={() => movePeriod(1)}
                  />
                  <Button
                    onClick={() =>
                      applyQuery({ ...query, anchor_date: null, page: 1 })
                    }
                  >
                    {
                      {
                        day: "今天",
                        week: "本周",
                        month: "本月",
                        custom: "当前",
                      }[query.period]
                    }
                  </Button>
                </div>
              )}
            </div>
            <Form
              layout="vertical"
              className="dc-filter-form"
              onFinish={() => applyQuery({ ...filters, page: 1 })}
            >
              {filters.period === "custom" ? (
                <>
                  {dateField("开始日期", filters.start_date, (value) =>
                    setFilters({ ...filters, start_date: value }),
                  )}
                  {dateField("结束日期", filters.end_date, (value) =>
                    setFilters({ ...filters, end_date: value }),
                  )}
                </>
              ) : (
                dateField(
                  "基准日期",
                  filters.anchor_date ??
                    data?.range.anchor_date ??
                    localDate(new Date()),
                  (value) => setFilters({ ...filters, anchor_date: value }),
                  true,
                )
              )}
              <Form.Item label="类别">
                <Select
                  aria-label="筛选工作类别"
                  value={filters.category ?? ""}
                  options={[
                    { value: "", label: "全部类别" },
                    ...categoryOptions,
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, category: value || null })
                  }
                />
              </Form.Item>
              <Form.Item label="状态">
                <Select
                  aria-label="筛选记录状态"
                  value={filters.status}
                  options={[
                    { value: "all", label: "全部状态" },
                    { value: "pending", label: "待补全" },
                    { value: "complete", label: "已确认" },
                    { value: "working", label: "进行中" },
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                />
              </Form.Item>
              <Form.Item label="数据范围">
                <Select
                  aria-label="数据范围"
                  value={filters.scope}
                  options={[
                    { value: "real", label: "真实数据" },
                    { value: "demo", label: "演示数据" },
                    { value: "all", label: "全部数据" },
                  ]}
                  onChange={(value) => setFilters({ ...filters, scope: value })}
                />
              </Form.Item>
              <div className="dc-filter-actions">
                {filters.period === "custom" && (
                  <Button
                    onClick={() =>
                      applyQuery({
                        ...filters,
                        start_date: null,
                        end_date: null,
                        page: 1,
                      })
                    }
                  >
                    全部日期
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Icon name="search" />}
                >
                  应用筛选
                </Button>
              </div>
            </Form>
            <div className="dc-filter-summary">
              {JSON.stringify(filters) !== JSON.stringify(query)
                ? "筛选条件已修改，点击应用筛选后更新结果。"
                : `当前已应用 · ${data ? reportRangeLabel(data.range) : "正在读取周期"} · ${query.category ? name(query.category) : "全部类别"} · ${({ all: "全部状态", pending: "待补全", complete: "已确认", working: "进行中" } as Record<string, string>)[query.status]}`}
            </div>
          </Card>
          <section className="dc-kpis" aria-label="工作数据汇总">
            {[
              {
                label: "有效工时",
                value: totals ? (totals.duration_ms / 3600000).toFixed(1) : "—",
                unit: "小时",
                icon: "clock" as const,
                caption: "已结束记录的有效时间",
              },
              {
                label: "已结束记录",
                value: totals ? String(totals.records) : "—",
                unit: "条",
                icon: "list" as const,
                caption: "进行中的任务单独保留",
              },
              {
                label: "待补全",
                value: totals ? String(totals.pending) : "—",
                unit: "条",
                icon: "note" as const,
                caption: "工时已保存，等待填写工作量",
              },
            ].map((item) => (
              <Card key={item.label} className="dc-kpi">
                <div className="dc-kpi-label">
                  <span>{item.label}</span>
                  <Icon name={item.icon} />
                </div>
                <strong>
                  {item.value}
                  <small>{item.unit}</small>
                </strong>
                <p>{item.caption}</p>
              </Card>
            ))}
          </section>
          <Card
            className="dc-card dc-category-report"
            title={
              <Title
                title="分类工作量"
                description={`${data ? reportRangeLabel(data.range) : "正在读取…"} · 数量按类型分别合计`}
              />
            }
            extra={<Tag>自动汇总</Tag>}
            styles={{ body: { padding: 0 } }}
          >
            {loading ? (
              <div className="dc-loading" role="status">
                <Skeleton active paragraph={{ rows: 4 }} title={false} />
              </div>
            ) : data ? (
              <>
                {narrow ? (
                  <div className="dc-report-cards">
                    {data.categories.map((row) => (
                      <Card
                        size="small"
                        key={row.category}
                        title={
                          <WorkBadge
                            category={row.category}
                            presentation={presentation}
                          />
                        }
                      >
                        <dl>
                          <div>
                            <dt>已确认工作量</dt>
                            <dd className="dc-report-quantity">
                              <strong>
                                {row.complete > 0
                                  ? formatQuantity(row.quantity)
                                  : row.pending > 0
                                    ? "待补填"
                                    : "—"}
                              </strong>
                              <small>
                                {row.complete > 0
                                  ? `已确认 ${row.complete} 条`
                                  : row.pending > 0
                                    ? "尚未确认产出"
                                    : "暂无已结束记录"}
                              </small>
                            </dd>
                          </div>
                          <div>
                            <dt>有效工时</dt>
                            <dd className="dc-number">
                              {formatDuration(row.duration_ms / 1000)}
                            </dd>
                          </div>
                          <div>
                            <dt>已结束记录</dt>
                            <dd>{row.records} 条</dd>
                          </div>
                          <div>
                            <dt>待补填</dt>
                            <dd>
                              {pendingLink(row)}
                            </dd>
                          </div>
                        </dl>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Table<CategoryTotal>
                    className="dc-report-table"
                    rowKey="category"
                    columns={reportColumns}
                    dataSource={data.categories}
                    pagination={false}
                    scroll={{ x: 680 }}
                  />
                )}
                <p className="dc-report-note">
                  按记录开始日期归属周期。未补填不视为 0；当前任务不计入此报表。
                </p>
                {data.totals.records === 0 && (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="这个范围还没有已结束记录"
                  />
                )}
              </>
            ) : (
              <Empty
                description="暂无统计结果，请检查连接后重试"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
          <Card
            className="dc-card dc-trend"
            title={
              <Title
                title="工作趋势"
                description={`${data?.range.trend_unit === "hour" ? "按开始小时汇总" : data?.range.trend_unit === "month" ? "按开始月份汇总" : "按开始日期汇总"} · 已结束记录的有效工时`}
              />
            }
            extra={<Tag>时间视角</Tag>}
            styles={{ body: { padding: "12px 8px 8px" } }}
          >
            {data ? (
              <TrendChart trend={data.trend} range={data.range} />
            ) : loading ? (
              <div className="dc-loading">
                <Skeleton active />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无趋势数据"
              />
            )}
          </Card>
          <Collapse
            className="dc-auxiliary"
            items={[
              {
                key: "analysis",
                label: (
                  <span>
                    辅助分析{" "}
                    <small className="dc-muted">类别分布与工作的节奏</small>
                  </span>
                ),
                children: data ? (
                  <div className="dc-auxiliary-grid">
                    <Card
                      className="dc-category"
                      title={
                        <Title
                          title="工作分布"
                          description="按工作类别回顾投入"
                        />
                      }
                      extra={
                        <Select
                          aria-label="工作分布指标"
                          value={categoryMetric}
                          options={[
                            { value: "duration", label: "工时（小时）" },
                            { value: "quantity", label: "工作量" },
                          ]}
                          onChange={setCategoryMetric}
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CategoryChart
                        categories={data.categories}
                        presentation={presentation}
                        metric={categoryMetric}
                        onCategory={(label) => {
                          const key = CATEGORIES.find(
                            (value) => name(value) === label,
                          );
                          if (key)
                            applyQuery({ ...query, category: key, page: 1 });
                        }}
                      />
                    </Card>
                    <Card
                      className="dc-calendar"
                      title={
                        <Title
                          title="工作的节奏"
                          description="已应用筛选范围 · 最多展示近90天有效工时"
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CalendarChart
                        calendar={data.calendar}
                        range={data.range}
                      />
                      <div className="dc-heat-legend" aria-label="工时由少到多">
                        少{" "}
                        {[
                          "#ebedf0",
                          "#9be9a8",
                          "#40c463",
                          "#30a14e",
                          "#216e39",
                        ].map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}{" "}
                        多
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无分析数据"
                  />
                ),
              },
            ]}
          />
          <section
            className="dc-records"
            id="records"
            ref={recordsRef}
            tabIndex={-1}
          >
            <Card
              className="dc-card"
              title={
                <Title
                  title="工作明细"
                  description="查看计时区间、补填工作量，或回顾修正记录。"
                />
              }
              extra={<Tag>{data ? data.record_count : "—"} 条记录</Tag>}
              styles={{ body: { padding: 0 } }}
            >
              {loading ? (
                <div className="dc-loading">
                  <Skeleton active paragraph={{ rows: 5 }} />
                </div>
              ) : (
                <Table<Row>
                  rowKey="id"
                  columns={recordColumns}
                  dataSource={data?.records ?? []}
                  pagination={false}
                  scroll={{ x: 1010 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          error ? "未能读取工作明细" : "当前筛选没有工作记录"
                        }
                      />
                    ),
                  }}
                />
              )}
              <footer className="dc-pagination">
                <span>每页 50 条 · 共 {data?.pages ?? "—"} 页</span>
                <Pagination
                  current={data?.page ?? query.page}
                  total={data?.record_count ?? 0}
                  pageSize={50}
                  showSizeChanger={false}
                  size={narrow ? "small" : undefined}
                  onChange={(page) => applyQuery({ ...query, page })}
                />
              </footer>
            </Card>
          </section>
          <footer className="dc-page-footer">
            WorkMemo · 记录留在本机，注意力留给手上的事。
          </footer>
        </main>
      </div>
      <BottomSheet
        open={sheetOpen}
        blocked={blocked}
        covered={!!confirmation}
        title={
          <div className="dc-sheet-title">
            <span className="dc-eyebrow">
              WORK RECORD {detail ? `#${detail.record.id}` : ""}
            </span>
            <h2>
              {pendingQuery && !detail ? "选择待补填记录" : editing ? "填写工作量" : "工作详情"}{" "}
              {detail?.record.is_demo && <Tag color="gold">演示数据</Tag>}
            </h2>
          </div>
        }
        drawerRender={(node) => (
          <div inert={!!confirmation} style={{ display: "contents" }}>
            {node}
          </div>
        )}
        onClose={() => leave(() => setSheetOpen(false))}
        afterOpenChange={(open) => {
          if (open && editing)
            quantityInput.current?.focus({ preventScroll: true });
          if (!open) {
            setDetail(null);
            setEditing(false);
            setEditorError("");
            setPendingQuery(null);
            setPendingData(null); setPendingError(""); setPendingStatus("");
            restoreTrigger();
          }
        }}
        footer={
          <div className="dc-sheet-footer">
            <span className={dirty ? "dc-unsaved" : "dc-muted"}>
              {pendingQuery?.category ? `${name(pendingQuery.category)} · ` : ""}
              {dirty ? "有未保存修改" : "数据保存在本机"}
            </span>
            <Space wrap>
              <Button
                disabled={blocked}
                onClick={() => leave(() => setSheetOpen(false))}
              >
                关闭
              </Button>
              {pendingQuery && detail && <Button disabled={blocked} onClick={() => leave(returnToPending)}>
                返回列表
              </Button>}
              {editing ? (
                <Button
                  key="save"
                  type="primary"
                  form="dc-editor"
                  htmlType="submit"
                  aria-label="保存工作量"
                  aria-busy={busy}
                  loading={busy ? { delay: 120 } : false}
                  disabled={!online || !!confirmation}
                >
                  保存工作量
                </Button>
              ) : detail ? (
                <Button
                  key="edit"
                  type="primary"
                  aria-label="编辑工作量"
                  disabled={
                    !online ||
                    blocked ||
                    detailStale ||
                    detail?.record.status !== "FINISHED"
                  }
                  onClick={() => setEditing(true)}
                >
                  编辑工作量
                </Button>
              ) : null}
            </Space>
          </div>
        }
      >
        {pendingQuery && !detail && <section className="dc-pending-list" aria-label="待补填记录列表">
          <p>{name(pendingQuery.category ?? "")} · {pendingData ? reportRangeLabel(pendingData.range) : "当前已应用周期"} · 请选择具体记录</p>
          {pendingStatus && <Alert type={pendingStatus.startsWith("工作量已保存") ? "success" : "info"} title={pendingStatus} role="status" />}
          {pendingError && <Alert type="error" title={pendingError} showIcon />}
          <Button className="dc-pending-refresh" disabled={blocked || !online} loading={busy} onClick={() => { void refreshPending(pendingQuery); }}>刷新待补填列表</Button>
          {busy && !pendingData ? <Skeleton active /> : pendingData && <>
            <Table<Row> rowKey="id" pagination={false} dataSource={pendingData.records} scroll={{ x: 550 }}
              locale={{ emptyText: "当前分类在这个范围已没有待补填记录。" }} columns={[
                { title: "记录", key: "record", render: (_, row) => <><strong>#{row.id}</strong><div>{formatTime(row.start_time)}</div><div>至 {row.end_time ? formatTime(row.end_time) : "—"}</div></> },
                { title: "有效工时", key: "duration", render: (_, row) => formatDuration(row.duration_ms / 1000) },
                { title: "备注", dataIndex: "remark", render: (value: string) => value || "无备注" },
                { title: "操作", key: "action", render: (_, row) => <Button data-pending-id={row.id} aria-label={`补填记录${row.id}`} disabled={blocked || !online || !!pendingError} onClick={() => { void selectPending(row); }}>补填</Button> },
              ]} />
            <Pagination current={pendingData.page} total={pendingData.record_count} pageSize={50} showSizeChanger={false} disabled={blocked || !online}
              onChange={page => { void refreshPending({ ...pendingQuery, page }); }} />
          </>}
        </section>}
        {detail && (
          <div className="dc-detail-content">
            <div className="dc-record-summary">
              <WorkBadge
                category={detail.record.category}
                presentation={presentation}
              />
              <div>
                <strong>
                  {formatDuration(detail.record.duration_ms / 1000)}
                </strong>
                <small>有效工时</small>
              </div>
              <RecordStatus row={detail.record} />
            </div>
            <Descriptions
              className="dc-detail-times"
              size="small"
              column={narrow ? 1 : 2}
              items={[
                {
                  key: "start",
                  label: "开始",
                  children: formatTime(detail.record.start_time),
                },
                {
                  key: "end",
                  label: "结束",
                  children: detail.record.end_time
                    ? formatTime(detail.record.end_time)
                    : "尚未结束",
                },
              ]}
            />
            {editing ? (
              <Form
                id="dc-editor"
                layout="vertical"
                onFinish={() => {
                  void save();
                }}
                disabled={blocked}
              >
                <Form.Item label="工作类别" htmlFor="dc-category">
                  <Select
                    id="dc-category"
                    value={fields.category}
                    options={categoryOptions}
                    onChange={(value) =>
                      setFields((previous) => ({
                        ...previous,
                        category: value,
                      }))
                    }
                    getPopupContainer={(element) => element.parentElement!}
                  />
                </Form.Item>
                <Form.Item
                  label="工作量"
                  htmlFor="dc-quantity"
                  extra="0 表示已确认无产出；支持小数和科学计数，最大 10 亿。"
                >
                  <Input
                    id="dc-quantity"
                    ref={quantityInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="填写本次工作量"
                    value={fields.quantity}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <Form.Item label="备注" htmlFor="dc-remark">
                  <Input.TextArea
                    id="dc-remark"
                    maxLength={4000}
                    rows={5}
                    value={fields.remark}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        remark: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <p className="dc-muted">
                  修改类别、数量和备注，计时结果保持原样。Ctrl+S 保存。
                </p>
              </Form>
            ) : (
              <div>
                <div className="dc-detail-quantity">
                  <span>已确认工作量</span>
                  <strong>
                    {detail.record.settlement_status === "COMPLETE"
                      ? formatQuantity(detail.record.quantity)
                      : detail.record.status === "FINISHED"
                        ? "待补填"
                        : "进行中"}
                  </strong>
                </div>
                <div className="dc-detail-remark">
                  {detail.record.remark || "未填写备注。"}
                </div>
              </div>
            )}
            {editorError && (
              <Alert
                type="error"
                showIcon
                title={editorError}
                className="dc-notice"
              />
            )}
            <Collapse
              className="dc-audit"
              items={[
                {
                  key: "segments",
                  label: `计时区间（${detail.segments.length}）`,
                  children: detail.segments.length ? (
                    detail.segments.map((segment) => (
                      <div className="dc-segment" key={segment.id}>
                        <span>
                          {formatTime(segment.start_time)}
                          <br />
                          {segment.end_time
                            ? formatTime(segment.end_time)
                            : "计时中"}
                        </span>
                        <strong className="dc-number">
                          {formatDuration(segment.duration_ms / 1000)}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">
                      旧记录仅保留累计工时，没有可展示的区间。
                    </p>
                  ),
                },
                {
                  key: "revisions",
                  label: `修正记录（${detail.revisions.length}）`,
                  children: detail.revisions.length ? (
                    detail.revisions.map((revision) => (
                      <div className="dc-revision" key={revision.revision}>
                        <strong>
                          第 {revision.revision} 次 ·{" "}
                          {formatTime(revision.changed_at)}
                        </strong>
                        <p>
                          {name(revision.before?.category)} →{" "}
                          {name(revision.after?.category)} · 数量{" "}
                          {formatQuantity(revision.before?.quantity)} →{" "}
                          {formatQuantity(revision.after?.quantity)}
                        </p>
                        <p>
                          备注：{revision.before?.remark || "未填"} →{" "}
                          {revision.after?.remark || "未填"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">尚无修正。</p>
                  ),
                },
              ]}
            />
          </div>
        )}
      </BottomSheet>
      <Modal
        open={confirmOpen}
        centered
        width={460}
        zIndex={1200}
        mask={{ closable: false }}
        keyboard={!busy}
        closable={false}
        destroyOnHidden
        title={
          confirmation === "delete" ? "删除这条记录？" : "保留未保存的修改？"
        }
        onCancel={closeConfirmation}
        afterOpenChange={(open) => {
          if (open) safeConfirmAction.current?.focus({ preventScroll: true });
        }}
        afterClose={() => {
          setConfirmation(null);
          setDeleting(null);
          const action = afterConfirm.current;
          afterConfirm.current = null;
          action?.();
        }}
        footer={
          confirmation === "delete" ? (
            <Space>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                取消
              </Button>
              <Button
                danger
                type="primary"
                aria-label="确认删除"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void remove();
                }}
              >
                确认删除
              </Button>
            </Space>
          ) : (
            <Space wrap>
              <Button
                type="primary"
                aria-label="保存并继续"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void save().then((ok) => {
                    if (ok) {
                      afterConfirm.current = next.current;
                      next.current = null;
                      setConfirmOpen(false);
                    }
                  });
                }}
              >
                保存并继续
              </Button>
              <Button
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  afterConfirm.current = next.current;
                  next.current = null;
                  setConfirmOpen(false);
                }}
              >
                放弃修改
              </Button>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                继续编辑
              </Button>
            </Space>
          )
        }
      >
        {confirmation === "delete" ? (
          <>
            <p className="dc-confirm-description">
              {deleting &&
                `${name(deleting.category)} · ${formatTime(deleting.start_time)}${deleting.is_demo ? " · 演示数据" : ""}`}
            </p>
            <p className="dc-confirm-description">
              删除后不可撤销，计时区间和修正记录也会一同删除。
            </p>
          </>
        ) : (
          <p className="dc-confirm-description">
            保存成功后再离开；保存失败会保留输入。
          </p>
        )}
        {editorError && (
          <Alert
            className="dc-notice"
            type="error"
            title={editorError}
            showIcon
          />
        )}
      </Modal>
    </div>
  );
}
export default function Dashboard() {
  return (
    <UiProvider>
      <DashboardContent />
    </UiProvider>
  );
}
````

## UPDATE — E:\WorkMemo\src\IslandExpansion.tsx

SHA256：`d52db1c28b948d12ed8e1cfdbd269b3cd41bd44a1680bd05b8407c21f910e216`

````tsx
import CSSMotion from "@rc-component/motion";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { islandRegionSync } from "./islandRegion";

export function IslandExpansion({ open, children, onCollapsed, onError }: {
  open: boolean; children: ReactNode; onCollapsed: () => void; onError: (error: string) => void;
}) {
  const [maximum, setMaximum] = useState(364);
  const [reduced, setReduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const region = useRef<ReturnType<typeof islandRegionSync> | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!isTauri()) return;
    const update = () => { void invoke<number>("get_island_viewport").then(height => setMaximum(Math.max(0, height - 56))).catch(e => onError(String(e))); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [onError]);
  useEffect(() => {
    const measure = () => setContentHeight(Math.min(content?.scrollHeight ?? 0, maximum));
    const observer = new ResizeObserver(measure);
    if (content) observer.observe(content);
    measure();
    return () => observer.disconnect();
  }, [maximum, open, content]);
  useEffect(() => {
    if (!isTauri()) return;
    const sync = islandRegionSync(invoke, onError);
    region.current = sync;
    return () => { sync.dispose(); region.current = null; };
  }, [onError]);
  useEffect(() => {
    if (!container) return;
    const measure = () => {
      const height = Math.min(maximum + 56, Math.max(56, container.getBoundingClientRect().height + 56));
      // Keep held through the leave animation; release only at its endpoint.
      region.current?.update(height, openRef.current || height > 56.5);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container); measure();
    return () => observer.disconnect();
  }, [container, maximum, open]);
  const measured = (element: HTMLElement) => Math.min(element.scrollHeight, maximum);
  return <CSSMotion visible={open} motionName="island-reveal" motionAppear={!reduced} motionEnter={!reduced} motionLeave={!reduced}
    forceRender removeOnLeave={false} motionDeadline={260}
    onAppearStart={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onEnterStart={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onAppearActive={element => ({ height: measured(element), opacity: 1, transform: "translateY(0)" })}
    onEnterActive={element => ({ height: measured(element), opacity: 1, transform: "translateY(0)" })}
    onLeaveStart={element => ({ height: element.getBoundingClientRect().height, opacity: 1, transform: "translateY(0)" })}
    onLeaveActive={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onVisibleChanged={visible => {
      if (!visible && !openRef.current) {
        region.current?.update(56, false);
        onCollapsed();
      }
    }}>
    {({ className, style }, ref) => <div ref={node => {
      setContainer(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }}
      className={`island-expansion ${className || ""}`} style={{ height: open ? contentHeight : 0, maxHeight: maximum, ...style }} aria-hidden={!open} inert={!open}>
      <div className="island-expansion-content" ref={setContent}>{children}</div>
    </div>}
  </CSSMotion>;
}
````

## UPDATE — E:\WorkMemo\src\NotificationApp.tsx

SHA256：`c60b9c6074fd4035b678fcb047dfc1610ee57ba0e2c43cd7ffb96c2b0a487fa6`

````tsx
import { useCategoryNames } from "./categoryNames";
import { usePresentation, WorkBadge, useDashboard } from "./desktopPreferences";
import { Icon } from "./Icon";
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useAppearance } from "./useAppearance";
import { useWorkSession } from "./useWorkSession";
import { themeStyle } from "./themes";
import { formatDuration, type WorkNotice, type WorkRecord } from "./types";
import { DraftContext, type Draft } from "./Drafts";
import { SettlementForm } from "./SettlementPanel";
import { IslandExpansion } from "./IslandExpansion";
import { islandView } from "./islandView";
import "./App.css";

export function NotificationApp() {
  const session = useWorkSession();
  const snapshot = session.snapshot;
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const dashboard = useDashboard();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [editing, setEditing] = useState<WorkRecord | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [deferring, setDeferring] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  const draft = useRef<Draft | null>(null);
  const editingRef = useRef(editing); editingRef.current = editing;
  const revision = useRef(0);
  const seen = useRef("");
  const busy = session.busy || deferring;
  const [dirty, setDirty] = useState(false);
  const registerDraft = useCallback((_id: string, value: Draft | null) => {
    draft.current = value; setDirty(!!value?.dirty);
  }, []);
  useEffect(() => {
    void invoke("set_window_dirty", { dirty: dirty || busy }).catch(e => setError(String(e)));
  }, [dirty, busy]);
  useEffect(() => () => { void invoke("set_window_dirty", { dirty: false }).catch(() => {}); }, []);
  useEffect(() => {
    let stopped = false, reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      const request = revision.current;
      try {
        const value = await invoke<WorkNotice | null>("get_notice");
        if (!stopped && request === revision.current) { setNotice(value); setReadError(""); }
      } catch (e) { if (!stopped) setReadError(String(e)); }
      finally { reading = false; }
    }
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 1000);
    const unlisten = listen("workmemo:appearance-changed", () => { void appearance.reload(); });
    return () => { stopped = true; clearInterval(timer); void unlisten.then(fn => fn()); };
  }, [appearance.reload]);
  const { active, candidate, notice: visibleNotice, key } = islandView(snapshot, notice);
  useEffect(() => {
    if (key === seen.current) return;
    seen.current = key;
    if (key && !editingRef.current) setExpanded(true);
    if (!key && !editingRef.current) setExpanded(false);
  }, [key]);
  const monitor = snapshot?.monitoring;
  const state = monitor?.browsing_only
    ? monitor.browse_ready
      ? "工作页面已就绪"
      : "仅浏览 · 当前不计时"
    : candidate
      ? "准备开始工作？"
      : active?.recovery_pending
        ? "上次工作待恢复"
        : active?.pause_reason === "MANUAL"
          ? "手动暂停 · 已停表"
          : active?.pause_reason === "IDLE_PAUSE" ? "键鼠空闲暂停" : active?.pause_reason === "AWAY"
            ? "离页暂停 · 已停表"
            : active?.pause_reason === "MONITOR"
              ? "监测中断 · 已停表"
              : active?.is_paused
                ? "已暂停 · 已停表"
                : snapshot?.monitoring.idle_warning
                  ? "空闲提醒 · 暂计"
                  : snapshot?.monitoring.away_pause_remaining_seconds != null
                    ? `离页宽限 · ${formatDuration(snapshot.monitoring.away_pause_remaining_seconds)} 后暂停`
                    : active?.control_mode === "AUTO"
                      ? "自动记录中 · 暂计"
                      : "手动计时 · 暂计";

  async function later(force = false) {
    if (busy) return;
    if (draft.current?.dirty && !force) { setDiscard(true); return; }
    setDeferring(true); setError("");
    try {
      if (editing) await invoke("defer_notice", { id: editing.id, kind: "ended" });
      else if (visibleNotice) await invoke("defer_notice", { id: visibleNotice.record.id, kind: visibleNotice.kind });
      revision.current++;
      if (!editing || notice?.record.id === editing.id) setNotice(null);
      setDiscard(false); setExpanded(false);
      setDirty(false);
    } catch (e) { setError(String(e)); }
    finally { setDeferring(false); }
  }
  const latestLater = useRef(later); latestLater.current = later;
  const busyRef = useRef(busy); busyRef.current = busy;
  useEffect(() => {
    const unlisten = listen("workmemo:request-close", () => {
      if (busyRef.current) { setError("正在保存，请稍候。"); return; }
      void latestLater.current();
    });
    return () => { void unlisten.then(fn => fn()); };
  }, []);
  const combinedError = error || session.commandError || session.connectionError || readError;
  return <div className="desktop-frame island-frame" style={themeStyle(appearance.current)}>
    <div className="app-shell island-shell">
      <div className="island-main-row">
        <div className="island-drag" role="group" aria-label="拖动状态岛" onMouseDown={event => {
          if (event.button === 0) void getCurrentWindow().startDragging().then(() => invoke("fit_island_position")).catch(e => setError(String(e)));
        }}>
          {active || candidate || monitor?.browse_category ? <WorkBadge category={active?.category ?? candidate?.category ?? monitor?.browse_category ?? "开发"} presentation={presentation.current} showName={false} /> : <span className="work-symbol"><Icon name="read" /></span>}
          <span className="island-info"><strong>{active ? name(active.category) : candidate ? name(candidate.category) : visibleNotice?.kind === "ended" ? "工作已结束" : "仅浏览"}</strong>
            <small>{snapshot ? visibleNotice?.kind === "ended" ? "结果已保存 · 待填写工作量" : state : "状态不可用"}</small></span>
          {active && <strong className="island-time">{formatDuration(active.duration_seconds)}</strong>}
        </div>
        {candidate && <button type="button" className="island-action" aria-label="开始识别的工作" title={`开始记录 · ${name(candidate.category)}`} disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}><Icon name="play" /></button>}
        {!candidate && active && !monitor?.browsing_only && <button type="button" className="island-action" aria-label={active.is_paused ? "继续记录" : "暂停记录"} disabled={busy || !!session.connectionError || active.recovery_pending} onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}><Icon name={active.is_paused ? "play" : "pause"} /></button>}
        {!candidate && monitor?.browsing_only && <button type="button" className="island-action" aria-label={active ? "继续记录" : "开始记录"} disabled={busy || !monitor.browse_ready || !!active?.recovery_pending || !!session.connectionError} onClick={() => { void session.confirmWork(null); }}><Icon name="play" /></button>}
        {(visibleNotice || candidate || editing || combinedError || (snapshot?.pending_count ?? 0) > 0) && <button type="button" className="island-action island-expand" aria-expanded={expanded} title={expanded ? "收起展开区域" : "展开工作提醒"} aria-label={expanded ? "收起展开区域" : "展开工作提醒"} onClick={() => {
          if (expanded && editing) { void later(); return; }
          setExpanded(value => !value);
        }}><Icon name={expanded ? "left" : "right"} /></button>}
        <button type="button" className="island-open" aria-label="打开WorkMemo" onClick={() => { void invoke("show_main", {settlement:false}).catch(e => setError(String(e))); }}><Icon name="open" /></button>
      </div>
      <IslandExpansion open={expanded} onError={setError} onCollapsed={() => { setEditing(null); setDiscard(false); setDirty(false); }}>
        {dashboard.fallback}
        {combinedError && <p className="inline-error" role="alert">{combinedError}</p>}
        {editing ? <>
          <h2>填写工作量 · {name(editing.category)}</h2>
          {discard && <div className="island-discard" role="alert"><p>放弃本次未保存的填写？原记录仍在待补全列表。</p><button type="button" disabled={busy} onClick={() => { void later(true); }}>放弃填写并收起</button><button type="button" className="secondary" onClick={() => setDiscard(false)}>继续填写</button></div>}
          <DraftContext.Provider value={registerDraft}><SettlementForm compact key={editing.id} record={editing} busy={busy}
            onSave={async input => {
              const saved = await session.settle(input);
              if (saved) {
                revision.current++;
                setNotice(current => current?.record.id === input.id ? null : current);
                setDirty(false); setExpanded(false);
              }
              return saved;
            }} /></DraftContext.Provider>
          <button className="text-button" type="button" disabled={busy} onClick={() => { void later(); }}>稍后填写</button>
          {session.commandError && <button className="text-button" type="button" onClick={() => { void dashboard.open("pending"); }}>打开待补全列表核对</button>}
        </> : candidate ? <section aria-label="开工确认"><h2>开始记录 · {name(candidate.category)}</h2><p>已匹配工作网址，确认前不计时。</p><div className="island-buttons"><button disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}>开始记录</button><button className="secondary" disabled={busy} onClick={() => { void session.browse(); }}>仅浏览</button></div></section> : visibleNotice?.kind === "ended" ? <section aria-label="工作结束提醒">
          <h2>本次工作已结束</h2><p>{name(visibleNotice.record.category)} · 有效工时 {formatDuration(visibleNotice.record.duration_seconds)}</p>
          <p>结果已保存，工作量可稍后填写。</p>
          <div className="island-buttons"><button type="button" disabled={busy || !!session.connectionError} onClick={() => { setEditing(visibleNotice.record); setExpanded(true); }}>填写工作量</button><button className="secondary" type="button" disabled={busy} onClick={() => { void later(); }}>稍后</button></div>
        </section> : visibleNotice?.kind === "idle" ? <section aria-label="空闲提醒">
          <h2>空闲提醒</h2><p>连续 {formatDuration(visibleNotice.idle_warning_seconds)} 无输入；到达 {formatDuration(visibleNotice.idle_end_seconds)} 时结束计时，最后输入后的尾段不计入工时。</p>
          <button type="button" disabled={busy} onClick={() => { void later(); }}>知道了</button>
        </section> : null}
        {!editing && (snapshot?.pending_count ?? 0) > 0 && <button type="button" className="text-button" onClick={() => { void dashboard.open("pending"); }}>待补全 {snapshot?.pending_count}</button>}
      </IslandExpansion>
      {combinedError && !expanded && <span className="island-error" role="alert" aria-label={combinedError} title={combinedError}>!</span>}
    </div>
  </div>;
}
````

## UPDATE — E:\WorkMemo\src\SettingsExtras.tsx

SHA256：`fb761693d5960e5c6a97fc5710d5500bd90205eeff9dcbfadc42321c621e90b7`

````tsx
import { CategoryNamesEditor } from "./CategoryNamesEditor";
import { StartupSetting } from "./StartupSetting";
import { useCategoryNames } from "./categoryNames";
import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { Surface, useDraft } from "./Drafts";
import { Icon } from "./Icon";
import { CATEGORIES } from "./types";
import {
  DEFAULT_LAYOUT,
  useLayout,
  WORK_ICONS,
  WorkBadge,
  type LayoutSettings,
  type PresentationController,
} from "./desktopPreferences";
const iconLabels: Record<string, string> = {
  checkSquare: "检查",
  safety: "盾牌",
  code: "代码",
  note: "文档",
  search: "搜索",
  chart: "图表",
  list: "清单",
  clock: "时钟",
  star: "星标",
  rocket: "火箭",
  bulb: "灵感",
  tool: "工具",
  read: "阅读",
  check: "完成",
  home: "主页",
  settings: "设置",
};
export function VisualSettings({
  presentation,
}: {
  presentation: PresentationController;
}) {
  const { name } = useCategoryNames();
  const { current, setVisual } = presentation;
  const compact = useLayout().current.density === "compact";
  useDraft(
    "category-visuals",
    presentation.dirty,
    presentation.busy,
    presentation.save,
    presentation.cancel,
  );
  return (
    <Surface
      title="工作名称、图标与颜色"
      actions={
        <>
          <button
            className="secondary"
            disabled={presentation.busy}
            onClick={presentation.cancel}
          >
            取消预览
          </button>
          <button
            disabled={presentation.busy || !presentation.loaded || !isTauri()}
            onClick={() => {
              void presentation.save();
            }}
          >
            保存工作外观
          </button>
        </>
      }
    >
      <p className="hint">
        同一类别在主页、状态岛和数据中心使用相同的图标与颜色。
      </p>
      <CategoryNamesEditor />
      {CATEGORIES.map((category) => {
        const visual = current.categories[category];
        return (
          <fieldset key={category} className="visual-category">
            <legend>
              <WorkBadge category={category} presentation={current} />
            </legend>
            <label className="color-field">
              类别颜色
              <input
                aria-label={`${name(category)}颜色`}
                type="color"
                value={visual.color}
                disabled={presentation.busy}
                onChange={(e) =>
                  setVisual(category, { ...visual, color: e.target.value })
                }
              />
              <span>{visual.color}</span>
            </label>
            <details open={!compact}>
              <summary>选择图标：{iconLabels[visual.icon]}</summary>
              <div className="icon-picker">
                {WORK_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    title={iconLabels[icon]}
                    aria-label={`${name(category)}使用${iconLabels[icon]}图标`}
                    aria-pressed={visual.icon === icon}
                    className="secondary"
                    disabled={presentation.busy}
                    onClick={() => setVisual(category, { ...visual, icon })}
                  >
                    <Icon name={icon} />
                  </button>
                ))}
              </div>
            </details>
          </fieldset>
        );
      })}
      {presentation.error && (
        <p className="error-banner" role="alert">
          {presentation.error}
        </p>
      )}
    </Surface>
  );
}
export function LayoutPanel() {
  const layout = useLayout();
  const [current, setCurrent] = useState(DEFAULT_LAYOUT);
  const [saved, setSaved] = useState(DEFAULT_LAYOUT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(current) !== JSON.stringify(saved);
  useEffect(() => {
    if (layout.loaded && !dirty && !busy) {
      setCurrent(layout.current);
      setSaved(layout.current);
    }
  }, [layout.current, layout.loaded]);
  async function save() {
    if (busy) return false;
    setBusy(true);
    setError("");
    try {
      const result = await invoke<LayoutSettings>("set_layout_options", {
        input: {
          density: current.density,
          sound_enabled: current.sound_enabled,
          sound_theme: current.sound_theme,
          font_size: current.font_size,
          font_weight: current.font_weight,
          line_spacing: current.line_spacing,
          expected_revision: saved.revision,
        },
      });
      setSaved(result);
      setCurrent(result);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  useDraft("layout", dirty, busy, save, () => {
    setCurrent(saved);
    setError("");
  });
  function field<K extends keyof LayoutSettings>(
    name: K,
    value: LayoutSettings[K],
  ) {
    setCurrent((p) => ({ ...p, [name]: value }));
  }
  return (
    <Surface
      title="布局、字体与音效"
      actions={
        <button
          disabled={busy || !layout.loaded || !isTauri()}
          onClick={() => {
            void save();
          }}
        >
          保存布局
        </button>
      }
    >
      <div className="layout-form">
        <StartupSetting />
        <label className="monitor-toggle"><input type="checkbox" checked={current.sound_enabled} disabled={busy} onChange={e => field("sound_enabled", e.target.checked)}/>关键状态提示音</label>
        <label>提示音套装<select aria-label="提示音套装" value={current.sound_theme??"fiftysounds"} disabled={busy} onChange={event=>field("sound_theme",event.target.value as LayoutSettings["sound_theme"])}>
          <option value="fiftysounds">FiftySounds · 默认</option><option value="soft">柔和轻提示</option><option value="crisp">清脆短提示</option>
        </select></label>
        <div className="sound-preview-buttons" aria-label="分别试听提示音">
          {([["start","开始"],["pause","暂停"],["resume","恢复"],["end","结束"],["warning","空闲提醒"]] as const).map(([cue,label])=><button key={cue} type="button" className="secondary" disabled={!isTauri()||busy} onClick={()=>{void invoke("preview_sound",{theme:current.sound_theme??"fiftysounds",cue}).catch(e=>setError(String(e)));}}>试听{label}</button>)}
        </div>
        <p className="hint">试听当前选择，保存布局后应用。试听不受提示音开关限制；日常只在状态变化时响一次。</p>
        <label>
          界面模式
          <select
            disabled={busy}
            value={current.density}
            onChange={(e) =>
              field("density", e.target.value as LayoutSettings["density"])
            }
          >
            <option value="comfortable">舒展 · 完整信息</option>
            <option value="compact">紧凑 · 极简信息</option>
          </select>
        </label>
        <p className="hint">
          紧凑模式让主窗口成为小计时器，二级页面默认折叠辅助内容；错误与恢复提醒始终可见。
        </p>
        <label>
          正文字号：{current.font_size}px
          <input
            type="range"
            min={12}
            max={18}
            step={1}
            value={current.font_size}
            disabled={busy}
            onChange={(e) => field("font_size", Number(e.target.value))}
          />
        </label>
        <label>
          文字粗细
          <select
            disabled={busy}
            value={current.font_weight}
            onChange={(e) => field("font_weight", Number(e.target.value))}
          >
            {[
              [400, "常规"],
              [500, "中等"],
              [600, "半粗"],
              [700, "加粗"],
            ].map(([v, n]) => (
              <option value={v} key={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          行距
          <select
            disabled={busy}
            value={current.line_spacing}
            onChange={(e) =>
              field(
                "line_spacing",
                e.target.value as LayoutSettings["line_spacing"],
              )
            }
          >
            <option value="tight">紧密</option>
            <option value="standard">标准</option>
            <option value="loose">宽松</option>
          </select>
        </label>
        <div
          className="font-preview"
          style={{
            fontSize: current.font_size,
            fontWeight: current.font_weight,
            lineHeight: { tight: 1.35, standard: 1.6, loose: 1.85 }[
              current.line_spacing
            ],
          }}
        >
          把注意力留给手上的事。
          <br />
          计时、类别和操作，清楚就好。
        </div>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void invoke("reset_window_layout")
              .then(() => invoke<LayoutSettings>("get_layout_settings"))
              .then((result) => {
                setCurrent(result);
                setSaved(result);
                void layout.reload();
              })
              .catch((e) => setError(String(e)))
              .finally(() => setBusy(false));
          }}
        >
          恢复所有窗口默认布局
        </button>
      </div>
      {(error || layout.error) && (
        <p className="error-banner" role="alert">
          {error || layout.error}
        </p>
      )}
    </Surface>
  );
}
````

## UPDATE — E:\WorkMemo\src\desktopPreferences.tsx

SHA256：`343742135711c8f80a7d59a2da1d106fa6a2fcedf9adb1bbe8bfce5af45f9b85`

````tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { invoke, isTauri, convertFileSrc } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { CATEGORIES, type Category } from "./types";
import { useCategoryNames } from "./categoryNames";
import { Icon, type IconName } from "./Icon";

export type CategoryVisual = { icon: IconName; color: string };
export type Background = { file: string; opacity: number };
export type Presentation = {
  version: 1;
  revision: number;
  categories: Record<string, CategoryVisual>;
  background: Background | null;
};
export const DEFAULT_PRESENTATION: Presentation = {
  version: 1,
  revision: 0,
  background: null,
  categories: Object.fromEntries(
    CATEGORIES.map((name, i) => [
      name,
      {
        icon: (["checkSquare", "safety", "code", "note"] as IconName[])[i],
        color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
      },
    ]),
  ),
};
export const WORK_ICONS: IconName[] = [
  "checkSquare",
  "safety",
  "code",
  "note",
  "search",
  "chart",
  "list",
  "clock",
  "star",
  "rocket",
  "bulb",
  "tool",
  "read",
  "check",
  "home",
  "settings",
];
export type LayoutSettings = {
  density: "compact" | "comfortable";
  revision: number;
  sound_enabled: boolean;
  sound_theme: "fiftysounds" | "soft" | "crisp";
  font_size: number;
  font_weight: number;
  line_spacing: "tight" | "standard" | "loose";
};
export const DEFAULT_LAYOUT: LayoutSettings = {
  density: "comfortable",
  revision: 0,
  sound_enabled: true,
  sound_theme: "fiftysounds",
  font_size: 14,
  font_weight: 400,
  line_spacing: "standard",
};
export function layoutStyle(layout: LayoutSettings): CSSProperties {
  return {
    "--body-size": `${layout.font_size}px`,
    "--body-weight": layout.font_weight,
    "--body-line": { tight: 1.35, standard: 1.6, loose: 1.85 }[
      layout.line_spacing
    ],
  } as CSSProperties;
}
export function backgroundStyle(background: Background): CSSProperties {
  return {
    backgroundImage: `url("${convertFileSrc(background.file, "background")}")`,
    opacity: background.opacity / 100,
  };
}
export function WorkBadge({
  category,
  presentation,
  showName = true,
}: {
  category: string;
  presentation: Presentation;
  showName?: boolean;
}) {
  const { name } = useCategoryNames();
  const visual =
    presentation.categories[category] ??
    DEFAULT_PRESENTATION.categories["开发"];
  return (
    <span
      className="work-badge"
      style={{ "--work-color": visual.color } as CSSProperties}
    >
      <span className="work-symbol">
        <Icon name={visual.icon} />
      </span>
      {showName && <span>{name(category)}</span>}
    </span>
  );
}
export function useLayout() {
  const [current, setCurrent] = useState(DEFAULT_LAYOUT);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!isTauri());
  const reload = useCallback(async () => {
    if (!isTauri()) return;
    try {
      setCurrent(await invoke<LayoutSettings>("get_layout_settings"));
      setError("");
      setLoaded(true);
    } catch (e) {
      setError(String(e));
    }
  }, []);
  useEffect(() => {
    void reload();
    if (!isTauri()) return;
    const p = listen("workmemo:layout-changed", () => {
      void reload();
    });
    return () => {
      void p.then((f) => f()).catch(() => {});
    };
  }, [reload]);
  return { current, error, loaded, reload };
}
export function usePresentation() {
  const [current, setCurrent] = useState(DEFAULT_PRESENTATION);
  const [saved, setSaved] = useState(DEFAULT_PRESENTATION);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!isTauri());
  const saving = useRef(false);
  const state = useRef({ current, saved });
  state.current = { current, saved };
  const reload = useCallback(async () => {
    if (
      !isTauri() ||
      saving.current ||
      JSON.stringify(state.current.current) !==
        JSON.stringify(state.current.saved)
    )
      return;
    try {
      const p = await invoke<Presentation>("get_presentation");
      setSaved(p);
      setCurrent(p);
      setError("");
      setLoaded(true);
    } catch (e) {
      setError(String(e));
    }
  }, []);
  useEffect(() => {
    void reload();
    if (!isTauri()) return;
    const p = listen("workmemo:presentation-changed", () => {
      void reload();
    });
    return () => {
      void p.then((f) => f()).catch(() => {});
    };
  }, [reload]);
  async function save() {
    if (!isTauri() || saving.current) return false;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const p = await invoke<Presentation>("save_presentation", {
        settings: current,
      });
      setCurrent(p);
      setSaved(p);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  async function importImage() {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const bg = await invoke<Background | null>("import_background");
      if (bg) setCurrent((p) => ({ ...p, background: bg }));
    } catch (e) {
      setError(String(e));
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return {
    current,
    saved,
    busy,
    error,
    loaded,
    dirty: JSON.stringify(current) !== JSON.stringify(saved),
    save,
    reload,
    importImage,
    cancel: () => {
      if (!saving.current) {
        setCurrent(saved);
        setError("");
      }
    },
    setBackground: (background: Background | null) =>
      setCurrent((p) => ({ ...p, background })),
    setVisual: (category: Category | string, visual: CategoryVisual) =>
      setCurrent((p) => ({
        ...p,
        categories: { ...p.categories, [category]: visual },
      })),
  };
}
export type PresentationController = ReturnType<typeof usePresentation>;
export function useDashboard() {
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const last = useRef({ view: "all", scope: "real" });
  async function open(view = "all", scope = "real", defaultBrowser = false) {
    last.current = { view, scope };
    setError("");
    try {
      await invoke("open_dashboard", { view, scope, defaultBrowser });
      setUrl("");
    } catch (e) {
      setError(String(e));
      try {
        setUrl(await invoke<string>("get_dashboard_address", { view, scope }));
      } catch (f) {
        setError(String(f));
      }
    }
  }
  return {
    open,
    fallback: error && (
      <div className="error-banner" role="alert">
        <p>{error}</p>
        {url && (
          <>
            <input
              aria-label="本机数据中心地址"
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
            />
            <div className="data-buttons">
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(url)
                    .catch(() =>
                      setError("请选中上面的地址，按 Ctrl+C 复制。"),
                    );
                }}
              >
                复制地址
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  void open(last.current.view, last.current.scope, true);
                }}
              >
                使用默认浏览器
              </button>
            </div>
          </>
        )}
      </div>
    ),
  };
}
````

## NEW FILE — E:\WorkMemo\src\islandRegion.ts

SHA256：`1c06181b4e0777d98d48a6d68ce01986e3b52c2560dc41525d9d4deea630dc03`

````ts
/** Serialize native clipping updates; a stale collapse must not release a reopened island. */
export function islandRegionSync(invoke: (command: string, args: Record<string, unknown>) => Promise<unknown>, onError: (error: string) => void) {
  let pending: { height: number; expanded: boolean } | null = null;
  let running = false;
  let latest: { height: number; expanded: boolean } | null = null;
  let stopped = false;
  async function drain() {
    if (running || stopped) return;
    running = true;
    try {
      while (pending && !stopped) {
        const request = pending; pending = null;
        try {
          if (request.expanded) await invoke("hold_island", { holding: true });
          if (stopped || latest !== request) continue;
          await invoke("set_island_region", { height: request.height });
          if (!stopped && latest === request && !request.expanded)
            await invoke("hold_island", { holding: false });
        } catch (error) { if (!stopped) onError(String(error)); }
      }
    } finally { running = false; }
  }
  return {
    update(height: number, expanded: boolean) {
      latest = { height, expanded }; pending = latest; void drain();
    },
    dispose() { stopped = true; pending = null; },
  };
}
````

## UPDATE — E:\WorkMemo\src\themes.ts

SHA256：`ef6c3e793d467ec1ec0a7bb0a33d37836a434313d8141cdf5cb66b558e62efc5`

````ts
import type { CSSProperties } from "react";

export const THEME_IDS = ["glass", "cream", "dark", "neon"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const MIN_OPACITY = 40;
export const MAX_OPACITY = 100;

export interface Appearance {
  version: 1;
  theme: ThemeId;
  opacity: number;
}

export const DEFAULT_APPEARANCE: Appearance = { version: 1, theme: "cream", opacity: 65 };

interface Theme {
  name: string;
  description: string;
  defaultOpacity: number;
  scheme: "light" | "dark";
  windowRgb: string;
  surfaceRgb: string;
  inputRgb: string;
  text: string;
  muted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  onAccent: string;
  line: string;
  border: string;
  header: string;
  controlHover: string;
  secondaryHover: string;
  shadow: string;
  panelShadow: string;
  buttonShadow: string;
  timerShadow: string;
  timerFont: string;
  radius: number;
  controlRadius: number;
  noticeText: string;
  noticeBg: string;
  noticeBorder: string;
  errorText: string;
  errorBg: string;
  errorBorder: string;
  closeBg: string;
  onClose: string;
  scroll: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  glass: {
    name: "Glass", description: "薄荷烟玻璃", defaultOpacity: 65, scheme: "dark",
    windowRgb: "30 42 57", surfaceRgb: "43 58 76", inputRgb: "31 44 59",
    text: "#f0f5fa", muted: "#c5d2e0", accent: "#83dfce", accentHover: "#90e3d4",
    accentText: "#a0efdf", onAccent: "#142f2c", line: "#52657b", border: "rgb(196 218 241 / 27%)",
    header: "transparent", controlHover: "rgb(188 218 235 / 12%)", secondaryHover: "#3d5369",
    shadow: "0 2px 8px rgb(9 20 35 / 24%)", panelShadow: "inset 0 1px 0 rgb(255 255 255 / 5%), 0 4px 16px rgb(4 15 29 / 10%)",
    buttonShadow: "none", timerShadow: "none", timerFont: '"Segoe UI", sans-serif', radius: 24, controlRadius: 10,
    noticeText: "#e3e6c3", noticeBg: "#394233", noticeBorder: "#6d7958",
    errorText: "#ffd4cc", errorBg: "#482f39", errorBorder: "#916272",
    closeBg: "#a84a48", onClose: "#ffffff", scroll: "rgb(197 220 235 / 30%)",
  },
  cream: {
    name: "Cream", description: "温暖奶油", defaultOpacity: 65, scheme: "light",
    windowRgb: "245 243 238", surfaceRgb: "255 253 248", inputRgb: "255 254 250",
    text: "#303b35", muted: "#435247", accent: "#3b6551", accentHover: "#345b48",
    accentText: "#284b38", onAccent: "#ffffff", line: "#d7d8c9", border: "rgb(255 255 247 / 85%)",
    header: "rgb(255 255 255 / 15%)", controlHover: "rgb(70 90 65 / 12%)", secondaryHover: "#eeeee5",
    shadow: "0 2px 6px rgb(51 43 25 / 18%)", panelShadow: "0 6px 24px rgb(74 65 43 / 4%)",
    buttonShadow: "none", timerShadow: "none", timerFont: '"Segoe UI", sans-serif', radius: 22, controlRadius: 10,
    noticeText: "#625022", noticeBg: "#ece5d4", noticeBorder: "#d7c89e",
    errorText: "#8b392e", errorBg: "#f6e7e2", errorBorder: "#e5c1b7",
    closeBg: "#a94f43", onClose: "#ffffff", scroll: "rgb(79 102 71 / 42%)",
  },
  dark: {
    name: "Dark", description: "安静深色", defaultOpacity: 65, scheme: "dark",
    windowRgb: "23 29 38", surfaceRgb: "32 40 51", inputRgb: "28 35 45",
    text: "#edf2f8", muted: "#c2ccd8", accent: "#a8d8be", accentHover: "#b2dfc6",
    accentText: "#bce5cd", onAccent: "#16291f", line: "#4b596a", border: "rgb(156 181 203 / 34%)",
    header: "rgb(0 0 0 / 12%)", controlHover: "rgb(188 211 235 / 15%)", secondaryHover: "#344254",
    shadow: "0 2px 6px rgb(0 0 0 / 45%)", panelShadow: "0 6px 20px rgb(0 0 0 / 10%)",
    buttonShadow: "none", timerShadow: "none", timerFont: '"Segoe UI", sans-serif', radius: 18, controlRadius: 8,
    noticeText: "#f1db9f", noticeBg: "#3b3526", noticeBorder: "#766643",
    errorText: "#ffd3ca", errorBg: "#472d30", errorBorder: "#8c5558",
    closeBg: "#a8434c", onClose: "#ffffff", scroll: "rgb(184 205 229 / 42%)",
  },
  neon: {
    name: "Neon", description: "赛博微光", defaultOpacity: 65, scheme: "dark",
    windowRgb: "15 22 35", surfaceRgb: "22 32 49", inputRgb: "18 28 44",
    text: "#edf9ff", muted: "#c0d3e7", accent: "#6ef3da", accentHover: "#85f5e0",
    accentText: "#87f7e2", onAccent: "#092c29", line: "#3e697d", border: "rgb(110 243 218 / 57%)",
    header: "rgb(80 141 202 / 7%)", controlHover: "rgb(110 243 218 / 15%)", secondaryHover: "#234256",
    shadow: "0 1px 6px rgb(44 211 194 / 30%)", panelShadow: "inset 0 0 18px rgb(57 139 199 / 5%)",
    buttonShadow: "0 0 14px rgb(110 243 218 / 14%)", timerShadow: "0 0 18px rgb(110 243 218 / 20%)",
    timerFont: 'Consolas, "Cascadia Mono", monospace', radius: 12, controlRadius: 6,
    noticeText: "#f8e2a0", noticeBg: "#343526", noticeBorder: "#76754a",
    errorText: "#ffd0e1", errorBg: "#402b42", errorBorder: "#936581",
    closeBg: "#a9426c", onClose: "#ffffff", scroll: "rgb(110 243 218 / 45%)",
  },
};

export function isAppearance(value: unknown): value is Appearance {
  if (typeof value !== "object" || value === null) return false;
  const settings = value as Partial<Appearance>;
  return settings.version === 1 && THEME_IDS.some((id) => id === settings.theme)
    && typeof settings.opacity === "number" && Number.isInteger(settings.opacity)
    && settings.opacity >= MIN_OPACITY && settings.opacity <= MAX_OPACITY;
}

export function themeStyle(settings: Appearance): CSSProperties {
  const theme = THEMES[settings.theme];
  const windowOpacity = settings.opacity / 100;
  const readingOpacity = Math.max(0.12, windowOpacity < 1 ? (0.8 - windowOpacity) / (1 - windowOpacity) : 0);
  const variables: Record<string, string | number> = {
    "--text-primary": theme.text, "--text-muted": theme.muted,
    "--accent": theme.accent, "--accent-hover": theme.accentHover,
    "--accent-text": theme.accentText, "--on-accent": theme.onAccent,
    "--line": theme.line, "--window-rgb": theme.windowRgb,
    "--surface-rgb": theme.surfaceRgb, "--input-rgb": theme.inputRgb,
    "--window-opacity": windowOpacity, "--surface-opacity": Math.max(0.24, readingOpacity),
    // Local reading surfaces protect text at low window opacity; empty space stays transparent.
    "--reading-opacity": readingOpacity,
    "--control-background": `rgb(${theme.surfaceRgb} / 24%)`,
    "--primary-background": `color-mix(in srgb, ${theme.accent} 10%, transparent)`,
    "--control-pressed": `color-mix(in srgb, ${theme.accent} 18%, transparent)`,
    "--window-border": theme.border, "--header-background": theme.header,
    "--control-hover": theme.controlHover, "--secondary-hover": theme.controlHover,
    "--window-shadow": theme.shadow, "--panel-shadow": theme.panelShadow,
    "--button-shadow": theme.buttonShadow, "--timer-shadow": theme.timerShadow,
    "--timer-font": theme.timerFont, "--window-radius": `${theme.radius}px`,
    "--panel-radius": `${Math.max(10, theme.radius - 2)}px`, "--control-radius": `${theme.controlRadius}px`,
    "--notice-text": theme.noticeText, "--notice-background": theme.noticeBg, "--notice-border": theme.noticeBorder,
    "--error": theme.errorText, "--error-background": theme.errorBg, "--error-border": theme.errorBorder,
    "--close-background": theme.closeBg, "--on-close": theme.onClose, "--scroll-thumb": theme.scroll,
  };
  return { ...variables, colorScheme: theme.scheme } as CSSProperties;
}
````

## UPDATE — E:\WorkMemo\src\ui\BottomSheet.tsx

SHA256：`8c8254d8a8bf3f46450a846c26cce826ac1687a717b2a15d6933c01164536aee`

````tsx
import { Drawer, type DrawerProps } from "antd";
import { useMediaQuery } from "./UiProvider";

/** Ant Design owns motion, focus registration and scroll locking. */
export function BottomSheet({
  blocked = false,
  covered = false,
  ...props
}: DrawerProps & { blocked?: boolean; covered?: boolean }) {
  const narrow = useMediaQuery("(max-width: 640px)");
  // Percentages follow the fixed overlay's visible height, including CSS/browser zoom.
  return (
    <Drawer
      {...props}
      placement="bottom"
      size={narrow ? "calc(100% - 24px)" : "min(760px, 88%)"}
      rootClassName="dc-sheet-root"
      className="dc-sheet"
      destroyOnHidden={false}
      push={false}
      mask={{ closable: false }}
      keyboard={!blocked}
      focusable={{ trap: !covered, focusTriggerAfterClose: true }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        // Ant Design 6.6's focus lock handles DOM focus changes, but Edge can move
        // Tab from the final control into browser chrome without a focusin event.
        // Complete that boundary through the official Drawer's keyboard hook.
        if (covered || event.defaultPrevented || event.key !== "Tab") return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            "button, input, textarea, select, a[href], [tabindex]",
          ),
        ].filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            !element.closest("[inert]") &&
            element.getClientRects().length > 0,
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        const target =
          event.shiftKey && document.activeElement === first
            ? last
            : !event.shiftKey && document.activeElement === last
              ? first
              : null;
        if (target) {
          event.preventDefault();
          target.focus({ preventScroll: true });
        }
      }}
      closable={{
        disabled: blocked,
        placement: "end",
        "aria-label": "关闭工作详情",
      }}
      styles={{
        wrapper: {
          width: narrow ? "calc(100% - 24px)" : "min(760px, calc(100% - 48px))",
          marginInline: "auto",
          marginBlock: "auto",
          insetInline: 0,
          insetBlock: 0,
          borderRadius: 20,
          overflow: "hidden",
        },
        section: {
          background: "rgb(250 253 250 / 86%)",
          backdropFilter: "blur(18px)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 90px #173c2b30",
        },
        header: { padding: "20px 24px", flexShrink: 0 },
        body: {
          padding: "22px 24px",
          overscrollBehavior: "contain",
          overflowY: blocked ? "hidden" : "auto",
        },
        footer: { flexShrink: 0, background: "rgb(255 255 255 / 38%)" },
        mask: {
          background: "rgb(20 38 30 / 30%)",
          backdropFilter: "blur(3px)",
        },
      }}
    />
  );
}
````

## UPDATE — E:\WorkMemo\src\ui\UiProvider.tsx

SHA256：`4e5509df52ebf5784eb883d76c05915b56f37dce5d6474b2bd66cd40df7f896d`

````tsx
import { App, ConfigProvider, type ThemeConfig } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const change = () => setMatches(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, [query]);
  return matches;
}

/** Shared Ant Design configuration; imported only by surfaces that opt into it. */
export function UiProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const theme = useMemo<ThemeConfig>(
    () => ({
      token: {
        colorPrimary: "#287b63",
        colorInfo: "#287b63",
        colorSuccess: "#287b63",
        colorText: "#243c33",
        colorTextSecondary: "#65796f",
        colorBgLayout: "#f4f7f5",
        colorBorder: "#dce6df",
        colorBorderSecondary: "#e9efeb",
        colorError: "#b74251",
        colorInfoBg: "#eef7f2",
        colorInfoBorder: "#cfe5d8",
        colorSuccessBg: "#edf7f0",
        colorSuccessBorder: "#cfe5d8",
        colorPrimaryBg: "#eaf3ee",
        colorBgContainer: "rgb(255 255 255 / 66%)",
        colorBgElevated: "rgb(255 255 255 / 90%)",
        fontFamily: '"Segoe UI", "Microsoft YaHei UI", sans-serif',
        fontSize: 14,
        borderRadius: 10,
        controlHeight: 38,
        motion: !reducedMotion,
        motionDurationMid: "0.18s",
        motionDurationSlow: "0.24s",
      },
      components: {
        Button: {
          primaryShadow: "none",
          defaultShadow: "none",
          fontWeight: 500,
          colorPrimary: "rgb(40 123 99 / 9%)",
          colorPrimaryHover: "rgb(40 123 99 / 15%)",
          colorPrimaryActive: "rgb(40 123 99 / 22%)",
          primaryColor: "#285c49",
          defaultBg: "rgb(255 255 255 / 34%)",
          defaultColor: "#365a48",
          defaultBorderColor: "rgb(68 105 81 / 24%)",
          defaultHoverBg: "rgb(40 123 99 / 8%)",
          defaultActiveBg: "rgb(40 123 99 / 15%)",
        },
        Table: {
          headerBg: "rgb(246 249 247 / 55%)",
          headerColor: "#65796f",
          rowHoverBg: "#f7faf8",
          cellPaddingBlock: 16,
        },
        Card: { headerBg: "transparent" },
        Drawer: { footerPaddingBlock: 16, footerPaddingInline: 24 },
        Menu: {
          collapsedWidth: 68,
          itemBorderRadius: 10,
          itemSelectedBg: "#eaf3ee",
        },
      },
    }),
    [reducedMotion],
  );
  return (
    <ConfigProvider
      prefixCls="wm"
      locale={zhCN}
      theme={theme}
      button={{ autoInsertSpace: false }}
    >
      <App className="wm-ui-root">{children}</App>
    </ConfigProvider>
  );
}
````

## NEW FILE — E:\WorkMemo\tests\island-region.test.mjs

SHA256：`439da7e080857efc700dc43c0d668a993fe5edac31fc593abaea2915660f6ec3`

````mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { islandRegionSync } from '../src/islandRegion.ts';

test('late collapse completion cannot release a reopened island; latest region wins', async () => {
  const calls = [];
  let resolveCollapse;
  const done = new Promise(resolve => { resolveCollapse = resolve; });
  const sync = islandRegionSync(async (command, args) => {
    calls.push({ command, args });
    if (command === 'set_island_region' && args.height === 56) await done;
  }, error => assert.fail(error));
  sync.update(56, false);
  sync.update(180, true);
  sync.update(220, true);
  resolveCollapse();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(calls, [
    { command: 'set_island_region', args: { height: 56 } },
    { command: 'hold_island', args: { holding: true } },
    { command: 'set_island_region', args: { height: 220 } },
  ]);
  sync.update(56, false);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(calls.at(-1), { command: 'hold_island', args: { holding: false } });
  sync.dispose();
});

test('native errors are reported and subsequent updates can retry', async () => {
  const errors = [], calls = [];
  let fail = true;
  const sync = islandRegionSync(async (command, args) => {
    if (fail) throw Error('region unavailable');
    calls.push({ command, args });
  }, error => errors.push(error));
  sync.update(180, true);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.match(errors[0], /region unavailable/);
  fail = false; sync.update(200, true);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(calls.at(-1).args.height, 200);
  sync.dispose();
});
````

## UPDATE — E:\WorkMemo\tests\themes.test.mjs

SHA256：`1cb7e7b6dc3b5b7d5171b8690900e20a98b0afb6fe9efd7710c26232ebd42f55`

````mjs
import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_APPEARANCE, isAppearance, MAX_OPACITY, MIN_OPACITY, THEME_IDS, THEMES, themeStyle } from "../src/themes.ts";

function hex(value) {
  assert.match(value, /^#[0-9a-f]{6}$/i);
  return [1, 3, 5].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}
function rgb(value) { return value.split(" ").map(Number); }
function blend(foreground, background, opacity) {
  return foreground.map((value, index) => value * opacity + background[index] * (1 - opacity));
}
function luminance(color) {
  const linear = color.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function readable(foreground, background, label) {
  const values = [luminance(hex(foreground)), luminance(background)].sort((a, b) => a - b);
  const contrast = (values[1] + 0.05) / (values[0] + 0.05);
  assert.ok(contrast >= 4.5, `${label}: contrast ${contrast.toFixed(2)} is below 4.5`);
}

for (const id of THEME_IDS) {
  test(`${id}: readable foregrounds at both opacity boundaries over black and white`, () => {
    const theme = THEMES[id];
    assert.ok(theme.defaultOpacity >= MIN_OPACITY && theme.defaultOpacity <= MAX_OPACITY);
    for (const opacity of [MIN_OPACITY, 65, MAX_OPACITY]) {
      for (const backdrop of [[0, 0, 0], [255, 255, 255]]) {
        const canvas = blend(rgb(theme.windowRgb), backdrop, opacity / 100);
        const readingOpacity = themeStyle({ version: 1, theme: id, opacity })["--reading-opacity"];
        const background = blend(rgb(theme.windowRgb), canvas, readingOpacity);
        for (const [name, foreground] of Object.entries({ primary: theme.text, muted: theme.muted, accent: theme.accentText })) {
          readable(foreground, background, `${id}/${opacity}/${name}`);
        }
        const panel = blend(rgb(theme.surfaceRgb), canvas, readingOpacity);
        const input = blend(rgb(theme.inputRgb), panel, readingOpacity);
        readable(theme.text, panel, `${id}/panel`);
        readable(theme.muted, input, `${id}/input`);
      }
    }
    readable(theme.onAccent, hex(theme.accent), `${id}/button`);
    readable(theme.onAccent, hex(theme.accentHover), `${id}/button-hover`);
    readable(theme.noticeText, hex(theme.noticeBg), `${id}/notice`);
    readable(theme.errorText, hex(theme.errorBg), `${id}/error`);
    readable(theme.onClose, hex(theme.closeBg), `${id}/close`);
  });
}

test("reject malformed or out-of-range appearance payloads", () => {
  assert.ok(isAppearance(DEFAULT_APPEARANCE));
  for (const value of [null, {}, { ...DEFAULT_APPEARANCE, version: 2 },
    { ...DEFAULT_APPEARANCE, theme: "unknown" }, { ...DEFAULT_APPEARANCE, opacity: 39 },
    { ...DEFAULT_APPEARANCE, opacity: 101 }, { ...DEFAULT_APPEARANCE, opacity: 88.5 },
    { ...DEFAULT_APPEARANCE, opacity: NaN }]) assert.equal(isAppearance(value), false);
});

test("all skins provide the same complete CSS token set without changing the selected settings", () => {
  const expected = Object.keys(themeStyle(DEFAULT_APPEARANCE)).sort();
  for (const id of THEME_IDS) {
    const settings = Object.freeze({ version: 1, theme: id, opacity: MIN_OPACITY });
    const style = themeStyle(settings);
    assert.deepEqual(Object.keys(style).sort(), expected);
    assert.ok(Object.values(style).every((value) => value !== undefined && value !== ""));
    assert.equal(style["--window-opacity"], MIN_OPACITY / 100);
    assert.equal(style.colorScheme, THEMES[id].scheme);
    assert.equal(settings.opacity, MIN_OPACITY);
  }
});
````
