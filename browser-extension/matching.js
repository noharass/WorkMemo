// Modes are deliberately host/path based: never match text in queries or fragments.
function parsed(rule) {
  const mode = rule.match_mode ?? 'path_prefix';
  if (mode === 'domain_suffix') return {mode, domain: rule.url_prefix};
  if (!['path_prefix', 'origin'].includes(mode)) return null;
  try { return {mode, url: new URL(rule.url_prefix)}; } catch { return null; }
}
export function permissionOrigins(rules) {
  return [...new Set(rules.flatMap(rule => {
    const p = parsed(rule);
    if (!p) return [];
    if (p.mode === 'domain_suffix') return [`http://*.${p.domain}/*`, `https://*.${p.domain}/*`];
    return [`${p.url.origin}/*`];
  }))];
}
export function matchRule(candidate, rules) {
  let url;
  try { url = new URL(candidate); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  const rank = {path_prefix: 3, origin: 2, domain_suffix: 1};
  return rules.map(rule => ({rule, p: parsed(rule)})).filter(({p}) => p)
    .sort((a,b) => rank[b.p.mode]-rank[a.p.mode] ||
      (b.p.mode === 'domain_suffix' ? b.p.domain.length-a.p.domain.length : b.p.url.pathname.length-a.p.url.pathname.length) || a.rule.id-b.rule.id)
    .find(({p}) => {
      if (p.mode === 'domain_suffix') return url.hostname === p.domain || url.hostname.endsWith(`.${p.domain}`);
      if (url.origin !== p.url.origin) return false;
      if (p.mode === 'origin') return true;
      const path = p.url.pathname.replace(/\/+$/, '');
      return !path || url.pathname === path || url.pathname.startsWith(`${path}/`);
    })?.rule.id ?? null;
}
