import { permissionOrigins } from './matching.js';
import LinkOutlined from '@ant-design/icons-svg/es/asn/LinkOutlined';
import GlobalOutlined from '@ant-design/icons-svg/es/asn/GlobalOutlined';
import SafetyCertificateOutlined from '@ant-design/icons-svg/es/asn/SafetyCertificateOutlined';
import ReloadOutlined from '@ant-design/icons-svg/es/asn/ReloadOutlined';
import './popup.css';

// Render the locally bundled Ant Design SVG definitions without injecting HTML.
function iconNode(definition) {
  function make(node) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', node.tag);
    for (const [key, value] of Object.entries(node.attrs ?? {})) element.setAttribute(key, value);
    for (const child of node.children ?? []) element.append(make(child));
    return element;
  }
  const icon = make(definition.icon);
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('fill', 'currentColor');
  return icon;
}
for (const [id, icon] of [['connection-icon', LinkOutlined], ['sites-icon', GlobalOutlined], ['grant-icon', SafetyCertificateOutlined], ['refresh-icon', ReloadOutlined]]) {
  document.getElementById(id).append(iconNode(icon));
}
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
      const item = document.createElement('li'); item.textContent = `${rule.category} · ${{path_prefix:"路径前缀",origin:"整个站点",domain_suffix:"域名后缀"}[rule.match_mode ?? "path_prefix"]} · ${rule.url_prefix}`; list.append(item);
    }
    origins = permissionOrigins(state?.config?.rules ?? []);
    grant.disabled = !state?.connected || origins.length === 0;
    const allowed = origins.length > 0 && await chrome.permissions.contains({ origins });
    permissionStatus.textContent = !state?.connected ? '先恢复本机连接，再同步工作站点授权'
      : origins.length === 0 ? '请先在 WorkMemo 配置 URL，再同步站点授权'
      : allowed ? '工作站点已授权' : '工作站点尚未授权，请点击下方按钮';
  } catch { status.textContent = '无法读取连接状态，请启动 WorkMemo，并在监测设置中检查本机连接'; }
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
