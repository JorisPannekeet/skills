#!/usr/bin/env node
// Headed Playwright walkthrough with video. Usage: node record-web.mjs steps.json
import { readFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { withCursor, glideTo } from './cursor.mjs';

let chromium, registry;
const projectRequire = createRequire(join(process.cwd(), 'x.js'));
try { ({ chromium } = projectRequire('playwright')); ({ registry } = projectRequire('playwright-core/lib/server/registry/index')); }
catch { console.error('Playwright not found. Run: npm i -D playwright@1.48.2 && npx playwright install chromium'); process.exit(2); }

const cfg = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const viewport = cfg.viewport ?? { width: 1440, height: 900 };
const outDir = resolve('show-me'); mkdirSync(outDir, { recursive: true });
const d = new Date(), p = (n) => String(n).padStart(2, '0');
const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
const target = join(outDir, `${stamp}-${cfg.name ?? 'demo'}.webm`);

const pause = cfg.slowMo ?? 600;
const fps = 60;
const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport, storageState: cfg.storageState });
await withCursor(context);
const page = await context.newPage();

// Playwright's recordVideo is fixed at 25 fps and 1 Mbps, so encode Chrome's screencast frames ourselves.
const ffmpeg = spawn(registry.findExecutable('ffmpeg').executablePathOrDie('javascript'),
  `-loglevel error -f image2pipe -framerate ${fps} -c:v mjpeg -i pipe:0 -y -an -c:v vp8 -crf 6 -b:v 12M -deadline realtime -cpu-used 8 -threads 4`.split(' ').concat(target),
  { stdio: ['pipe', 'ignore', 'inherit'] });
const encoded = new Promise((ok) => ffmpeg.on('close', ok));
const cdp = await context.newCDPSession(page);
let last = null, start = 0, written = 0;
const writeUntil = (t) => { for (const n = Math.round((t - start) * fps); written < n; written++) ffmpeg.stdin.write(last); };
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  if (last) writeUntil(metadata.timestamp); else start = metadata.timestamp;
  last = Buffer.from(data, 'base64');
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: viewport.width * 2, maxHeight: viewport.height * 2 });

let pos = { x: viewport.width / 2, y: viewport.height / 2 };
const syncCursor = () => page.evaluate(({ x, y }) => window.__showmePlace?.(x, y), pos).catch(() => {});

const highlight = async (sel) => {
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  pos = await glideTo(page, el, pos);
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
  await cdp.send('Page.stopScreencast').catch(() => {});
  if (last) writeUntil(Date.now() / 1000 + 1 / fps);
  ffmpeg.stdin.end();
  await encoded;
  await context.close();
  await browser.close();
}

console.log(`VIDEO ${target}`);
if (failed) { console.error(`FAILED ${failed}`); process.exit(1); }
