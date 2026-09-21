// Smooth wheel scrolling for the document only; touch and nested rails stay native.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mouseInput = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  let target = 0;
  let lastY = 0;
  let lastTime = 0;
  let direction = 0;
  const stop = () => { cancelAnimationFrame(frame); frame = 0; direction = 0; };
  const locked = () => /hidden|clip/.test(getComputedStyle(document.documentElement).overflowY)
    || /hidden|clip/.test(getComputedStyle(document.body).overflowY);
  const maxScroll = () => Math.max(0, document.scrollingElement.scrollHeight - innerHeight);
  function tick(time) {
    if (reducedMotion.matches || locked() || Math.abs(scrollY - lastY) > 2) { stop(); return; }
    target = Math.max(0, Math.min(target, maxScroll()));
    const elapsed = Math.min(64, time - lastTime);
    lastTime = time;
    const remaining = target - scrollY;
    const next = Math.abs(remaining) < .5 ? target : scrollY + remaining * (1 - Math.exp(-elapsed / 70));
    window.scrollTo({ top: next, behavior: 'instant' });
    lastY = scrollY;
    if (Math.abs(target - scrollY) < .5) { stop(); return; }
    frame = requestAnimationFrame(tick);
  }
  window.addEventListener('wheel', event => {
    if (event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey
      || reducedMotion.matches || !mouseInput.matches || !event.deltaY
      || Math.abs(event.deltaX) > Math.abs(event.deltaY) || locked()) { stop(); return; }
    // Do not divert wheel input from controls, dialogs, sidebars or horizontal carousels.
    for (const node of event.composedPath()) {
      if (!(node instanceof Element) || node === document.body || node === document.documentElement) continue;
      if (node.matches('input, textarea, select, [role="dialog"], [data-native-scroll]')) { stop(); return; }
      const style = getComputedStyle(node);
      if ((/auto|scroll/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1)
        || (/auto|scroll/.test(style.overflowX) && node.scrollWidth > node.clientWidth + 1)) { stop(); return; }
    }
    const delta = event.deltaY * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? innerHeight : 1);
    if (!frame || Math.sign(delta) !== direction) target = scrollY;
    const destination = Math.max(0, Math.min(target + delta, maxScroll()));
    if (destination === scrollY && !frame) return;
    event.preventDefault();
    target = destination;
    direction = Math.sign(delta);
    if (!frame) {
      lastY = scrollY;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }, { passive: false });
  window.addEventListener('keydown', stop);
  window.addEventListener('pointerdown', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('blur', stop);
  reducedMotion.addEventListener('change', stop);
})();
