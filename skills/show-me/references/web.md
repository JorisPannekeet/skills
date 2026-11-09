# Web walkthrough

## Start the app
Check if something already listens (`lsof -i :3000 -i :5173 -i :8000`). If not, start it in the background
(`npm run dev &`, `php artisan serve &`, or the project's documented command) and wait until the URL responds.

## Record with the bundled script
Always record with `record-web.mjs`; it is the only web path that draws a mouse cursor. Playwright MCP, Chrome DevTools MCP and preview tools record no cursor, so don't use them for the walkthrough.

Write the steps to a JSON file, then run:

```bash
npm i -D playwright@1.48.2 && npx playwright install chromium   # first time only, in the project root
node <skill-dir>/scripts/record-web.mjs steps.json
```

steps.json:
```json
{
  "url": "http://localhost:5173",
  "name": "checkout-upsell",
  "viewport": { "width": 1080, "height": 1920 },
  "storageState": "show-me/auth.json",
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
Run it from the project root so it finds the project's Playwright.
`storageState` is optional: a Playwright storage-state file (cookies + localStorage) for pages behind a login.
For kiosk screens use a portrait viewport (e.g. 1080×1920); otherwise 1440×900.

The script draws a cursor that glides to each element and shows a ring on every click (Playwright's video has no pointer of its own), highlights the element before it's used, prints the video path, and exits non-zero on the first failing step (the video up to that point is kept).

Need something the steps can't do (seed data, mint a session)? Prepare it in a separate script that writes `storageState`, then record with `record-web.mjs`. If you truly must drive the browser from your own script, it has to show the cursor too:
```js
import { withCursor, glideTo } from '<skill-dir>/scripts/cursor.mjs';
await withCursor(context);                    // before context.newPage()
pos = await glideTo(page, locator, pos);      // before every click/fill
```
