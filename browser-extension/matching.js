export function permissionOrigins(rules) {
  return [...new Set(rules.map(rule => `${new URL(rule.url_prefix).origin}/*`))];
}

export function matchRule(candidate, rules) {
  if (!candidate) return null;
  let url;
  try { url = new URL(candidate); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  return [...rules].sort((a, b) => new URL(b.url_prefix).pathname.length - new URL(a.url_prefix).pathname.length || a.id - b.id)
    .find(rule => {
      const prefix = new URL(rule.url_prefix);
      const path = prefix.pathname.replace(/\/+$/, '');
      return url.origin === prefix.origin && (!path || url.pathname === path || url.pathname.startsWith(`${path}/`));
    })?.id ?? null;
}
