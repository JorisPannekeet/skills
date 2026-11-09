---
name: show-me
description: Show the user what was just built, live and on video, instead of describing it in text. Opens a visible (headed) browser, the iOS Simulator, or the macOS desktop app with a real moving cursor, walks through the new feature step by step at human speed, records a video, and ends with a 3-bullet summary. Use whenever the user types /show-me, says "laat zien", "show me", "demo it", "ik wil het zien", "wat heb je gemaakt?", or seems to have lost track of what changed — and proactively at the end of any UI change in a web app (React, Laravel/Blade, kiosk-web), iOS/iPadOS app, or macOS desktop app (native, Electron, Tauri).
---

# /show-me

Goal: the user *sees* the result. Not a wall of text, not a static screenshot.

## 1. Pick the platform
- Web (package.json, vite, next, artisan, a localhost URL) → read `references/web.md`
- iOS/iPadOS (.xcodeproj, .xcworkspace, Package.swift with an app target) → read `references/ios.md`
- macOS desktop app (Electron, Tauri, .xcodeproj with a macOS target) → read `references/desktop.md`
- Several changed → do web first, then iOS, then desktop.

## 2. Plan the walkthrough (max ~8 steps)
From the diff / recent work, decide the shortest path that demonstrates the change:
start screen → navigate to the feature → interact (click, type, toggle) → show the result state.
Include one edge/error state only if it was part of the change.

## 3. Run it live and record
Follow the platform reference. Always:
- Visible window (never headless) so the user can watch along.
- A mouse cursor is visible in every video: it glides to each element before every click/tap. Use the bundled scripts; a recording without a cursor is a failed run, redo it.
- Slow enough to follow (~0.5–1 s between actions).
- Record a video to `./show-me/<YYYYMMDD-HHMM>-<feature>.(webm|mov)`.
- Leave the browser/Simulator/app open at the final state for a few seconds.

## 4. Report — short
Exactly this, nothing more:

```
🎬 <path to video>
• <what you see in step 1–2>
• <the key interaction>
• <the end result / what changed>
```

No code dump, no diff recap, no "let me know if…". If something failed along the way, one extra line: `⚠️ <what broke>`.

## Rules
- Don't start a second dev server if one is already running; reuse it.
- If login is required, use seeded/test credentials from .env.example, README or seeders; never real customer data.
- Add `show-me/` to .gitignore if it isn't there.
