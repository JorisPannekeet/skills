# Visual verification

Lint, types, tests, budgets and replays can all pass on a game where the hero holds the sword and the shield in the same hand. Only looking catches that. Build the tools for looking on day one.

## The four tools

1. **Headless frame renderer.** A script that imports the real renderer, draws into a software canvas and writes a PNG. No browser needed, so any agent can run it.
   - Named scenes for set pieces (combat, a boss, a menu).
   - A `tour` mode that visits points of interest on the real maps: spawn, boss, each object kind, each puzzle tile.
   - Switches for the things that change the look: view size (desktop, phone, card), time of day, weather, facing, animation state.
2. **Sprite sheet view.** Lays out every frame of one sprite set with labels. Use it for proportions, anchors and animation frames side by side.
3. **Floor plan view** (story profile). One image per map, one colored cell per tile, dots for objects, enemies and spawns. Put all maps of one kind side by side: sameness is obvious in this view and invisible in the code.
4. **Real-browser route.** Build, serve the build, open the page in a headless browser, drive it with keys through title, play, menus and pause, and screenshot each step. Fail on any page error. This is the only tool that exercises the real DOM, CSS, input and loading path.

Keep all of them out of the game's dependencies and its download.

## How to judge a frame

- **Zoomed in** (a small scene at a high upscale): pixel craft. Tones per material, light direction, stray pixels, anchors.
- **At game zoom** (desktop and phone): readability. Can you tell what each thing is from a screen away? Is the important thing on screen?
- **Against the references**, side by side, not from memory.
- **Before and after.** Render the previous commit into a second folder and compare. "It is better" needs both images.

## Rules

- A change the player can see is not done until its frames have been opened.
- A delegate's report names the frames it looked at, by path.
- "It compiles" and "tests pass" are not statements about how the game looks.
- When a player reports a visual bug, add the scene that shows it to the frame renderer before fixing it.
