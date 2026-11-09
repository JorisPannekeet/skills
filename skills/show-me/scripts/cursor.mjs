export const withCursor = (context) => context.addInitScript(() => {
  const install = () => {
    if (!document.documentElement || document.getElementById('__showme_cursor')) return;
    const c = document.createElement('div');
    c.id = '__showme_cursor';
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2.5l15 8.2-6.6 1.6-3.1 6.2z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: 'fixed', left: '-4px', top: '-2px', zIndex: '2147483647', pointerEvents: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.4))' });
    document.documentElement.appendChild(c);
    c.style.transform = `translate(${window.__showmeXY?.[0] ?? innerWidth / 2}px, ${window.__showmeXY?.[1] ?? innerHeight / 2}px)`;
  };
  const place = (x, y) => {
    window.__showmeXY = [x, y];
    install();
    document.getElementById('__showme_cursor').style.transform = `translate(${x}px, ${y}px)`;
  };
  window.__showmePlace = place;
  addEventListener('mousemove', (e) => place(e.clientX, e.clientY), true);
  addEventListener('mousedown', (e) => {
    const r = document.createElement('div');
    Object.assign(r.style, { position: 'fixed', left: `${e.clientX - 18}px`, top: `${e.clientY - 18}px`, width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #ff3b30', zIndex: '2147483646', pointerEvents: 'none' });
    document.documentElement.appendChild(r);
    r.animate([{ transform: 'scale(.4)', opacity: 1 }, { transform: 'scale(1.4)', opacity: 0 }], { duration: 500, easing: 'ease-out' }).onfinish = () => r.remove();
  }, true);
  const keep = () => { install(); new MutationObserver(install).observe(document.documentElement, { childList: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', keep); else keep();
});

export const glideTo = async (page, el, from) => {
  const box = await el.boundingBox();
  if (!box) return from;
  const to = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const start = Date.now(), duration = 700;
  for (let t = 0; t < 1; ) {
    t = Math.min(1, (Date.now() - start) / duration);
    const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
    await page.mouse.move(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e);
  }
  return to;
};
