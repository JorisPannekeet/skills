# Web walkthrough

## Start the app
Check if something already listens (`lsof -i :3000 -i :5173 -i :8000`). If not, start it in the background
(`npm run dev &`, `php artisan serve &`, or the project's documented command) and wait until the URL responds.

## Option A — Playwright MCP / Chrome DevTools MCP is connected
Make sure it runs headed (no `--headless` flag). Navigate and interact with the MCP tools so the user watches live.
For video, use option B (MCP tools don't record video).

## Option B — bundled script (live + video)
Write the steps to a JSON file, then run:

```bash
npm i -D playwright@1.48.2 && npx playwright install chromium   # first time only
node <skill-dir>/scripts/record-web.mjs steps.json
```

steps.json:
```json
{
  "url": "http://localhost:5173",
  "name": "checkout-upsell",
  "viewport": { "width": 1080, "height": 1920 },
  "steps": [
    { "action": "click", "selector": "text=Burgers" },
    { "action": "fill", "selector": "#search", "value": "cheese" },
    { "action": "press", "key": "Enter" },
    { "action": "wait", "ms": 1500 },
    { "action": "scroll", "y": 600 }
  ]
}
```

Actions: `goto` (url), `click` (selector), `fill` (selector, value), `press` (key), `hover` (selector), `scroll` (y), `wait` (ms).
Prefer text/role selectors (`text=Afrekenen`, `role=button[name="Pay"]`) over CSS classes.
For kiosk screens use a portrait viewport (e.g. 1080×1920); otherwise 1440×900.

The script highlights each element before it's used, prints the video path, and exits non-zero on the first failing step (the video up to that point is kept).
