export function entryMode({seen, reduced}) { return seen || reduced ? 'skip' : 'intro'; }

export function curtainDestination({href, target, download, modified}, current) {
  if (!href || download || modified || (target && target !== '_self')) return null;
  try {
    const from = new URL(current), to = new URL(href, from);
    if (!/^https?:$/.test(to.protocol) || from.origin !== to.origin || from.pathname === to.pathname) return null;
    if (!(/\/$/.test(to.pathname) || !/\.[^/]+$/.test(to.pathname))) return null;
    return to.pathname + to.search + to.hash;
  } catch { return null; }
}
