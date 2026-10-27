import { permissionOrigins } from './matching.js';
const status = document.querySelector('#status');
const list = document.querySelector('#rules');
const permissionStatus = document.querySelector('#permissions');
const grant = document.querySelector('#grant');
const error = document.querySelector('#error');
let origins = [];
async function refresh() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'status' });
    status.textContent = state?.message ?? '连接状态不可用';
    list.replaceChildren();
    for (const rule of state?.config?.rules ?? []) {
      const item = document.createElement('li'); item.textContent = `${rule.category} · ${rule.url_prefix}`; list.append(item);
    }
    origins = permissionOrigins(state?.config?.rules ?? []);
    grant.disabled = !state?.connected || origins.length === 0;
    const allowed = origins.length > 0 && await chrome.permissions.contains({ origins });
    permissionStatus.textContent = allowed ? '工作站点已授权' : '请先在 WorkMemo 配置 URL，再同步站点授权';
  } catch { status.textContent = '无法读取连接状态，请确认扩展主机已注册'; }
}
grant.addEventListener('click', async () => {
  error.textContent = '';
  try {
    // Request only these configured origins, synchronously from the user gesture.
    const allowed = await chrome.permissions.request({ origins });
    if (!allowed) error.textContent = '未获得工作站点授权，自动识别保持暂停。';
    else await chrome.runtime.sendMessage({ type: 'refresh' });
    await refresh();
  } catch { error.textContent = '站点授权未完成，请重新打开扩展面板后重试。'; }
});
document.querySelector('#refresh').addEventListener('click', async () => { await chrome.runtime.sendMessage({ type: 'refresh' }); await refresh(); });
await refresh();
setInterval(() => { void refresh(); }, 2_000);
