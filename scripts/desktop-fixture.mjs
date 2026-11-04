// Isolated IPC fixture for v0.2.7 browser checks only. No real backend is contacted.
export function desktopFixture(page) {
return page.addInitScript(() => {
  const params = new URLSearchParams(location.search), categories = ['评测', '质检', '开发', '文档'];
  const record = { id: 7, category: '开发', quantity: null, remark: '隔离任务', start_time: Date.now() - 60000, end_time: null, confirmed_end_time: null, duration_ms: 60000, duration_seconds: 60, status: 'WORKING', is_paused: params.get('state') === 'paused', recovery_pending: false, settlement_status: 'IN_PROGRESS', source: 'AUTO', control_mode: 'AUTO', revision: 1 };
  const ended = { ...record, id: 6, category: '文档', status: 'FINISHED', is_paused: true, settlement_status: 'PENDING', end_time: Date.now(), confirmed_end_time: Date.now() };
  const config = { enabled: true, revision: 3, times: { idle_pause_seconds: 120, away_pause_seconds: 120, hold_seconds: 600, idle_warning_seconds: 300, idle_end_seconds: 420 }, poll_interval_seconds: 1, auto_resume_manual: true, rules: [{ id: 1, category: '开发', match_mode: 'origin', url_prefix: 'https://work.example.test/' }] };
  const callbacks = new Map(), listeners = new Map(); let sequence = 0;
  const emit = (event, payload) => { for (const [id, entry] of listeners) if (entry.event === event) callbacks.get(entry.handler)?.({ event, id, payload }); };
  window.qa = { calls: [], active: params.get('state') === 'empty' ? null : record, candidate: params.has('candidate') ? { id: 21, rule_id: 1, category: '开发' } : null, unknown: params.has('unknown') ? 'https://new.example.test/work' : null, finishedRule: params.has('finished') ? 1 : null, tasks: [{id:1,name:'已有任务',category:'开发',record_id:params.has('suspended')?7:null,finished:false,suspended:params.has('suspended'),recovery_pending:params.has('suspended')}], notice: params.has('ended') ? { kind: 'ended', record: ended, idle_warning_seconds: 300, idle_end_seconds: 420 } : null, config, browse: false, fail: '', delay: 0, readsDelay: 100, emit, record };
  if (params.has('multi')) {
    window.qa.tasks = Array.from({length:Number(params.get('multi') || 2)}, (_,i) => ({id:i+1,name:i === 0 ? '当前任务' : `暂停任务 ${i+1}`,category:'开发',record_id:i === 0 ? 7 : 10+i,finished:false,suspended:i !== 0,recovery_pending:false}));
    if(window.qa.active)window.qa.active.task_name='当前任务';
  }
  window.isTauri = true;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: id => listeners.delete(id) };
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: params.has('notice') ? 'notice' : params.has('panel') ? 'settings' : 'main' }, currentWebview: { label: 'fixture' } },
    transformCallback(fn) { const id = ++sequence; callbacks.set(id, fn); return id; }, unregisterCallback(id) { callbacks.delete(id); },
    convertFileSrc() { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="700"><path fill="#8fa9bb" d="M0 0h800v700H0z"/><path fill="#b9ad96" d="m0 0 800 700H0z"/></svg>'); },
    async invoke(command, args = {}) {
      const q = window.qa; q.calls.push({ command, args });
      const snapshot = () => structuredClone({ active: q.active, recent_records: q.notice ? [q.notice.record] : [], pending_count: q.notice ? 1 : 0, warning: null, monitoring: { browsing_only: q.browse, browse_ready: true, browse_category: '开发', enabled: true, native_available: true, browser_connected: true, work_page: true, message: '已识别工作页面，等待新的鼠标或键盘活动', idle_warning: false, idle_warning_seconds: 300, idle_end_seconds: 420, revision:q.config.revision,unknown_page_url:q.unknown,finished_page_rule:q.finishedRule,start_candidate: q.candidate } });
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
      if (command === 'get_page_tasks') return structuredClone(q.tasks);
      if (command === 'get_ignored_pages') return [];
      if (command === 'bind_page') {q.unknown=null;q.config.revision++;return snapshot();}
      if (command === 'rebind_finished_page') {q.finishedRule=null;q.config.revision++;return snapshot();}
      if (command === 'confirm_recovery_task') {const target=q.tasks.find(t=>t.id===args.taskId);q.tasks=q.tasks.map(t=>({...t,suspended:t.id!==args.taskId,recovery_pending:false}));q.active={...record,id:target.record_id,task_name:target.name,is_paused:false,recovery_pending:false};return snapshot();}
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
