(() => {
  if (globalThis.__workmemoActivityInstalled) return;
  globalThis.__workmemoActivityInstalled = true;
  let lastSent = -Infinity;
  function signal(event) {
    if (!event.isTrusted || document.visibilityState !== 'visible' || !document.hasFocus()) return;
    const now = performance.now();
    if (now - lastSent < 250) return;
    lastSent = now;
    // No key, target, text, URL, coordinates, or page content is read or sent.
    chrome.runtime.sendMessage({type: 'page-activity'}).catch(() => {});
  }
  for (const type of ['keydown', 'pointerdown', 'wheel']) {
    document.addEventListener(type, signal, {capture: true, passive: true});
  }
})();
