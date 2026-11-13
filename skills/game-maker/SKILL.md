---
name: game-maker
description: Build browser games the way a high-velocity, AI-assisted solo dev ships them — tiny bundles, deterministic simulation, zero-GC hot loops, code-generated pixel art and chiptune audio, lint-enforced conventions, verified state machines, headless bot balancing, and frames the agent has actually looked at. Use this skill whenever the user is building, extending, debugging, optimizing, or balancing a web game (three.js, 2D canvas, WebGL, TypeScript), or mentions game loops, sprites, pixel art quality, levels or dungeons, chip music, replays, leaderboards, anti-cheat, difficulty tuning, save files, embedding a game in a social post/card, or frame-rate/GC stutter — even if they don't say "game maker".
---

# Game Maker

Opinionated rules for shipping a fast, tiny, cheat-resistant browser game at very high PR velocity with AI agents. Treat every rule as a constraint the build enforces, not a suggestion.

## Core principles

1. **Every bug becomes a rule the build enforces.** When you find a class of bug, fix it, then make it impossible to reintroduce: a custom lint rule if the class is syntactic, a test if it is not. The ruleset is the project's memory. See `references/lint-rules.md`.
2. **Context lives in file paths.** File names/extensions declare constraints the linter enforces (e.g. `*.hot.ts`).
3. **Determinism is non-negotiable.** Same inputs → same run, bit for bit. Enables replays, server-side score verification, and bot balancing.
4. **Budgets fail the build.** Bundle size and frame time are CI gates, not aspirations.
5. **Everything is code.** No audio files, no image files. Music, SFX and sprites are source code.
6. **No comments.** A lint rule bans them. If code needs explaining, rename it or add a test.
7. **Look at it.** Every gate above can pass on a game that looks wrong. A change the player can see is not done until the agent has opened rendered frames of it. See `references/visual-verification.md`.

## Pick a profile first

The core rules apply to every game: deterministic fixed-tick sim, `*.hot.ts` hot paths, budgets, everything as code, no comments, the visual check loop. The rest depends on the game. Choose once, at the start, and write the choice in the project's agent instructions.

| Choice | Options |
|---|---|
| Renderer | **3D:** three.js draws the scene. **2D:** canvas 2D and a sprite atlas, no three.js. |
| Shape | **Arcade** (runs, score, waves): the 500-enemy bar, replay anti-cheat, per-run og:images, survival-rate balancing. **Story** (maps, saves, progression): a story table, a save format, level validation, a bot that plays the whole game to every ending. |
| Surface | **Embed card** (245px card to full screen) or **full page** only. |
| Languages | 10 by default. One is acceptable if every string still goes through i18n keys. |

Details and what each choice turns on or off: `references/profiles.md`.

## Architecture

- **Renderer:** a view, never the source of truth. three.js for 3D, canvas 2D for 2D.
- **Engine (custom):** simulation, post-processing and audio are owned code.
- **Simulation:** fixed-timestep tick, pure function of `(state, inputs)`. Rendering interpolates; it never mutates sim state.
- **Separate frame vs tick:** per-frame code (render, interpolation, post-fx) and per-tick code (sim) both live in `.hot.ts` files.
- **Sim units are not pixels.** Positions, sizes and speeds are in sim units. The renderer owns how many art pixels a sim unit covers, so the art resolution can change without touching the sim.

## Hot paths (`*.hot.ts`)

Any code running every frame or every tick goes in a `.hot.ts` file. A lint rule bans allocation there:
- no object/array literals, no closures/arrow functions, no `new`, no spread/rest, no template strings, no `.map/.filter/.reduce`, no destructuring that allocates.
- Use preallocated pools, typed arrays (struct-of-arrays), scratch vectors passed in, index loops.
Goal: the game loop produces ~zero garbage so GC never causes stutter. Details: `references/performance.md`.

## Determinism

- Seeded PRNG (e.g. sfc32/xorshift) owned by sim state; `Math.random` banned in sim code by lint.
- **One random stream per concern** (combat, loot, world). With a single stream, moving one enemy one tile changes every later loot roll, and unrelated tests start failing.
- No `Date.now`/`performance.now` in sim; time = tick count.
- Avoid float divergence: fixed-point or carefully ordered math; no transcendental functions with platform-dependent results in sim (lint-ban `Math.sin` etc. in sim or use lookup tables).
- No iteration over unordered collections whose order can vary; stable IDs.
- Record runs as `seed + version + input log`. Replay = re-run the sim.
- **Anti-cheat (arcade):** on high-score submit, the server replays the full input log headless and accepts only the score it computes.
See `references/determinism.md`.

## Seeing the game

Set these up before the first sprite, not after the first complaint:
- a **headless frame renderer** that draws the real renderer into a software canvas and writes a PNG, with named scenes and a tour over the real maps;
- a **sprite sheet view** that lays out every frame of a sprite set;
- a **floor plan view** of each map (story profile);
- one **real-browser route**: build, serve, drive the page with keys in a headless browser, screenshot each screen, and fail on any page error.

Judge each visual change twice: zoomed in for craft, at game zoom for readability. See `references/visual-verification.md`.

## Verifying state machines

Every major state machine (story progression, cutscenes, each game system) is verified by something that explores it, not only by unit tests of single transitions.
- **TLA+ and TLC** for systems with interleaved or concurrent transitions. One spec per system. See `references/formal-verification.md`.
- **A transition table plus a full-game bot** is enough for a linear story: the table is data, tests check it, and the bot plays from new game to every ending on several seeds.
Choose per system and write down which one covers it. A counterexample or a stuck bot becomes a regression test.

## Audio: live synthesis, no files

- Custom Game Boy-style chip in Web Audio: **2 pulse voices** (duty cycle), **1 wave voice** (wavetable), **1 noise voice** (LFSR), plus a **synthwave layer** (pads/bass/arps).
- Songs are text in code (tracker-style pattern strings), parsed at build or load.
- **Biome transitions:** music changes per biome seamlessly by continuing the current melody — share tempo/key/phrase grid, crossfade or swap patterns on bar boundaries, and carry the melodic position into the next song.
See `references/audio.md`.

## Pixel art as code

- Every sprite is source code drawn against **one shared palette** (palette indices, not colors). The palette is append-only.
- A build step rasterizes and packs all sprites into a single **sprite atlas**.
- Lint: sprites may only reference palette indices.
- **Storing art as code says nothing about how good it is.** Before the first sprite: collect reference images, pick the art resolution from them, and agree the bar (3 to 5 tones per material, one light direction, readable silhouettes).
- Build characters from **rigs and generators** (parts, mirrored halves, recolors, shape painters with shading), not whole frames typed by hand. It keeps the download small and the style consistent.
- **The world moves.** Idle motion on characters, ambient particles, weather, flicker. All of it thins to near nothing under `prefers-reduced-motion`.
See `references/art-direction.md`.

## Content (story profile)

Agents copy a working level and reskin it. Players notice on the second level.
- **Fill the grid.** List what every element, biome or chapter must have (a dungeon, a boss, a key item, an optional challenge, a distinct exterior). A test fails when a cell is empty.
- **Assign shapes before anyone draws.** Each level gets a different macro shape (a ring, a cloister, a long hall, a tower) written in the brief, so parallel builders do not converge on one floor plan.
- **Levels are data, checked twice:** a static solver proves each map can be finished with only what the player owns at that point, and a bot plays it for real.
- **Saves are append-only.** New flags and ids go at the end. A test pins the positions of the ones that already shipped.
See `references/content.md`.

## Feel

Bots and tests do not catch feel bugs. Walk the checklist in `references/feel.md` by hand on every input change: buffered inputs honor the direction held when they fire, every cooldown is visible, held items sit in the hands in every facing, each input device has its own sensible mapping.

## Distribution & embedding

- **Embed card:** must run inside an X post (player card), from a **245px card to full screen**. Responsive canvas, integer pixel scaling (an art pixel covers a whole number of screen pixels where the size allows), input that works at tiny sizes.
- **Performance bar:** 60 fps on a mid-range phone, with 500 enemies for the arcade profile.
- **Download budget:** CI fails if the first download exceeds budget (reference: ~124 KB gzipped). Lazy-load everything non-essential, and give each lazy chunk its own budget so it cannot grow unwatched (art is the usual one).
- **Dynamic og:images** per run, rendered from final stats, localized (arcade).
- **i18n:** all user-facing strings via keys; lint bans raw string literals in UI.

## Balancing

Bots play headless (same deterministic sim, no renderer) thousands of runs per difficulty. Tune parameters until the targets hold. Run in CI to catch balance regressions.
- **Measure the thing itself.** A fight starts at the first blow, not when the enemy wakes up. A metric that includes the walk to the fight changes when the map does.
- **Assert on medians across seeds**, not on every single run. Single runs are chaotic.
- **Use two bots:** one that plays well and one that never guards or dodges. The targets sit between them.
See `references/balancing.md`.

## Workflow for agents

1. Read the path: `.hot.ts`? sim? sprite? song? map? Apply its constraints.
2. Make the change small; one PR per concern (velocity comes from many small PRs).
3. Run lint, typecheck, tests, the specs or bots that cover what you touched, bundle budgets, determinism replay check.
4. If the player can see the change, render frames and open them.
5. Found a bug? Fix → test → **propose a lint rule** if the class is syntactic.
6. Never add comments. Rename or test instead.

Several agents on one game: write the shared contract first, give every file one owner, give every builder its own worktree, and integrate in one pass that reruns everything. See `references/multi-agent.md`.
