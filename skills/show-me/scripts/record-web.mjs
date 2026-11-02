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

const browser = await chromium.launch({ headless: false, slowMo: cfg.slowMo ?? 600 });
const context = await browser.newContext({ viewport, recordVideo: { dir: outDir, size: viewport } });
const page = await context.newPage();

const highlight = async (sel) => {
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
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
    } catch (e) { failed = `step ${i + 1} (${s.action} ${s.selector ?? s.key ?? ''}): ${e.message.split('\n')[0]}`; break; }
  }
  await page.waitForTimeout(2000);
} finally {
  const video = page.video();
  await context.close();
  await browser.close();
  if (video) renameSync(await video.path(), target);
}

console.log(`VIDEO ${target}`);
if (failed) { console.error(`FAILED ${failed}`); process.exit(1); }
