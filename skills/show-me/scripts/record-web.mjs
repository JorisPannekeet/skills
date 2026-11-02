#!/usr/bin/env node
// Headed Playwright walkthrough with video. Usage: node record-web.mjs steps.json
import { readFileSync, mkdirSync, renameSync } from 'node:fs';
import { join, resolve } from 'node:path';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.error('Playwright not found. Run: npm i -D playwright@1.48.2 && npx playwright install chromium'); process.exit(2); }

const cfg = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const viewport = cfg.viewport ?? { width: 1440, height: 900 };
const outDir = resolve('show-me'); mkdirSync(outDir, { recursive: true });
const d = new Date(), p = (n) => String(n).padStart(2, '0');
const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
const target = join(outDir, `${stamp}-${cfg.name ?? 'demo'}.webm`);

const pause = cfg.slowMo ?? 600;
const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport, recordVideo: { dir: outDir, size: viewport } });
// Playwright's video never shows a pointer, so draw one in the page that follows real mouse events.
await context.addInitScript(() => {
  const install = () => {
    if (document.getElementById('__showme_cursor')) return;
    const c = document.createElement('div');
    c.id = '__showme_cursor';
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2.5l15 8.2-6.6 1.6-3.1 6.2z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: 'fixed', left: '-4px', top: '-2px', zIndex: '2147483647', pointerEvents: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.4))' });
    document.documentElement.appendChild(c);
    const place = (x, y) => { c.style.transform = `translate(${x}px, ${y}px)`; };
    window.__showmePlace = place;
    place(innerWidth / 2, innerHeight / 2);
    addEventListener('mousemove', (e) => place(e.clientX, e.clientY), true);
    addEventListener('mousedown', (e) => {
      const r = document.createElement('div');
      Object.assign(r.style, { position: 'fixed', left: `${e.clientX - 18}px`, top: `${e.clientY - 18}px`, width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #ff3b30', zIndex: '2147483646', pointerEvents: 'none' });
      document.documentElement.appendChild(r);
      r.animate([{ transform: 'scale(.4)', opacity: 1 }, { transform: 'scale(1.4)', opacity: 0 }], { duration: 500, easing: 'ease-out' }).onfinish = () => r.remove();
    }, true);
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', install); else install();
});
const page = await context.newPage();

let pos = { x: viewport.width / 2, y: viewport.height / 2 };
const syncCursor = () => page.evaluate(({ x, y }) => window.__showmePlace?.(x, y), pos).catch(() => {});

const glideTo = async (el) => {
  const box = await el.boundingBox();
  if (!box) return;
  const to = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const from = pos, start = Date.now(), duration = 700;
  for (let t = 0; t < 1; ) {
    t = Math.min(1, (Date.now() - start) / duration);
    const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
    await page.mouse.move(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e);
  }
  pos = to;
};

const highlight = async (sel) => {
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await glideTo(el);
  await el.evaluate((n) => { n.style.outline = '4px solid #ff3b30'; n.style.outlineOffset = '3px'; });
  await page.waitForTimeout(400);
  await el.evaluate((n) => { n.style.outline = ''; n.style.outlineOffset = ''; }).catch(() => {});
  return el;
};

let failed = null;
try {
  await page.goto(cfg.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  for (const [i, s] of (cfg.steps ?? []).entries()) {
    try {
      await syncCursor();
      switch (s.action) {
        case 'goto':   await page.goto(s.url, { waitUntil: 'networkidle' }); break;
        case 'click':  await (await highlight(s.selector)).click(); break;
        case 'hover':  await (await highlight(s.selector)).hover(); break;
        case 'fill':   await (await highlight(s.selector)).fill(s.value ?? ''); break;
        case 'press':  await page.keyboard.press(s.key); break;
        case 'scroll': await page.mouse.wheel(0, s.y ?? 500); break;
        case 'wait':   await page.waitForTimeout(s.ms ?? 1000); break;
        default: throw new Error(`unknown action "${s.action}"`);
      }
      await page.waitForTimeout(pause);
    } catch (e) { failed = `step ${i + 1} (${s.action} ${s.selector ?? s.key ?? ''}): ${e.message.split('\n')[0]}`; break; }
  }
  await syncCursor();
  await page.waitForTimeout(2000);
} finally {
  const video = page.video();
  await context.close();
  await browser.close();
  if (video) renameSync(await video.path(), target);
}

console.log(`VIDEO ${target}`);
if (failed) { console.error(`FAILED ${failed}`); process.exit(1); }
