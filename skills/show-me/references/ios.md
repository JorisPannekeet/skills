# iOS / iPadOS walkthrough

The Simulator's own recorder (`simctl recordVideo`) and xcodebuildmcp taps never show a pointer. So record the Simulator window from the screen and tap with the real mouse cursor, exactly like the desktop flow.

## 0. One-time setup
Same as `references/desktop.md` step 0 (`brew install cliclick`, Screen Recording + Accessibility permissions).

## 1. Build, boot, show
With xcodebuildmcp: build & run the app on a simulator (pick the device the feature targets; iPad for kiosk/iPadOS work).
No xcodebuildmcp? `xcodebuild … -destination 'platform=iOS Simulator,name=<device>'`, then `xcrun simctl install booted <App.app>` and `xcrun simctl launch booted <bundle-id>`.

Bring the Simulator to the front and get its window bounds:
```bash
osascript -e 'tell application "Simulator" to activate'
osascript -e 'tell application "System Events" to tell process "Simulator" to get {position, size} of window 1'
# → 400, 60, 440, 920   (x, y, width, height)
```

## 2. Start recording
```bash
bash <skill-dir>/scripts/record-desktop.sh start <feature-name> 400,60,440,920
```

## 3. Walk through with the cursor
Tell the user in one line: "Hands off mouse and keyboard, the cursor moves by itself for a moment."

Find each element's screen point: take a screenshot (`screencapture -x -R400,60,440,920 /tmp/s.png`), read it, and estimate the element's center inside the window (Retina: divide screenshot pixels by 2), then add the window's x/y. Then glide and click; a click in the Simulator is a tap:
```bash
cliclick -e 600 m:620,500 w:300 c:.
cliclick t:"hello"
```
- Never tap through xcodebuildmcp or `simctl` during the recording; those taps have no cursor. Use them only to build, launch and read the UI.
- Never jump the cursor (`m:` without `-e`).
- Pause ~1 s between actions and hold the final state ~2 s.

## 4. Stop recording
```bash
bash <skill-dir>/scripts/record-desktop.sh stop
```
Prints the .mov path. Always run `stop`, also when a step failed; otherwise the file is unfinished.
