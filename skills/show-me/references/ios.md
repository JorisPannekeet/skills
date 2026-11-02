# iOS / iPadOS walkthrough

## 1. Build, boot, show
With xcodebuildmcp: build & run the app on a simulator (pick the device the feature targets; iPad for kiosk/iPadOS work).
Then bring the Simulator to the front so the user can watch: `open -a Simulator`.

## 2. Start recording
```bash
bash <skill-dir>/scripts/record-ios.sh start <feature-name>
```

## 3. Walk through
Use xcodebuildmcp's UI tools (describe the UI to find elements, then tap / swipe / type text).
Pause ~1 s between actions (`sleep 1`) so the video is followable.
Hold the final state ~2 s.

## 4. Stop recording
```bash
bash <skill-dir>/scripts/record-ios.sh stop
```
Prints the .mp4 path. Always run `stop`, also when a step failed — otherwise the file is unfinished.

No xcodebuildmcp available? Build with `xcodebuild … -destination 'platform=iOS Simulator,name=<device>'`,
install with `xcrun simctl install booted <App.app>`, launch with `xcrun simctl launch booted <bundle-id>`,
and ask the user to tap through while recording runs.
