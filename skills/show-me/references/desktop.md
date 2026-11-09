# macOS desktop walkthrough (native, Electron, Tauri)

The user watches a real mouse cursor glide to each element and click it. The recording shows the cursor and a ring on every click.

## 0. One-time setup
```bash
brew install cliclick
```
The terminal app running the agent needs **Screen Recording** and **Accessibility** in System Settings → Privacy & Security. If the recording comes out black, clicks do nothing, or osascript fails with error -1719, ask the user to grant these and restart the terminal.

## 1. Launch and frame the app
Build and launch the app (`open build/MyApp.app`, `npm run tauri dev`, `npm start` for Electron, or the project's documented command), then bring it to the front:
```bash
osascript -e 'tell application "MyApp" to activate'
```
Get the window bounds so the video only shows the app (other windows and notifications stay out of it):
```bash
osascript -e 'tell application "System Events" to tell process "MyApp" to get {position, size} of window 1'
# → 120, 80, 1280, 800   (x, y, width, height)
```

## 2. Start recording
```bash
bash <skill-dir>/scripts/record-desktop.sh start <feature-name> 120,80,1280,800
```
Leave out the rect to record the whole main screen.

## 3. Walk through with the cursor
First tell the user in one line: "Hands off mouse and keyboard, the cursor moves by itself for a moment."

Find each element's center in screen points, then move and click with easing so the motion is followable:
```bash
osascript -e 'tell application "System Events" to tell process "MyApp" to get {position, size} of button "Save" of window 1'
# center = x + w/2, y + h/2
cliclick -e 600 m:640,420 w:300 c:.     # glide there, pause, click
cliclick -e 600 m:400,300 c:. t:"hello" # click a field and type
cliclick kp:return
```
- `-e 600` eases the move over ~0.6 s. Never jump the cursor (`m:` without `-e`); the user must see it travel.
- Can't find the element through accessibility (custom-drawn UI, canvas, some Electron views)? Take a screenshot (`screencapture -x /tmp/s.png`), read it, and estimate the coordinates. On Retina screens divide screenshot pixels by 2 to get points.
- Never click through AppleScript/System Events (`click button …`); that skips the cursor. Use those only to find coordinates.
- A computer-use MCP that moves the real cursor works too; use it instead of cliclick.
- Pause ~1 s between actions and hold the final state ~2 s.

## 4. Stop recording
```bash
bash <skill-dir>/scripts/record-desktop.sh stop
```
Prints the .mov path. Always run `stop`, also when a step failed; otherwise the file is unfinished.
