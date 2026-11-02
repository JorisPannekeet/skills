---
name: game-maker
description: Build browser games the way a high-velocity, AI-assisted solo dev ships them — tiny bundles, deterministic simulation, zero-GC hot loops, code-generated pixel art and chiptune audio, lint-enforced conventions, TLA+ verified state machines, and headless bot balancing. Use this skill whenever the user is building, extending, debugging, optimizing, or balancing a web game (three.js, canvas, WebGL, TypeScript), or mentions game loops, sprites, chip music, replays, leaderboards, anti-cheat, difficulty tuning, embedding a game in a social post/card, or frame-rate/GC stutter — even if they don't say "game maker".
---

# Game Maker

Opinionated rules for shipping a fast, tiny, cheat-resistant browser game at very high PR velocity with AI agents. Treat every rule as a constraint the build enforces, not a suggestion.

## Core principles

1. **Every bug becomes a lint rule.** When you find a class of bug, fix it, then write a custom lint rule that makes it impossible to reintroduce. The ruleset is the project's memory. See `references/lint-rules.md`.
2. **Context lives in file paths.** File names/extensions declare constraints the linter enforces (e.g. `*.hot.ts`).
3. **Determinism is non-negotiable.** Same inputs → same run, bit for bit. Enables replays, server-side score verification, and bot balancing.
4. **Budgets fail the build.** Bundle size and frame time are CI gates, not aspirations.
5. **Everything is code.** No audio files, no image files. Music, SFX and sprites are source code.
6. **No comments.** A lint rule bans them. If code needs explaining, rename it or add a test.

## Architecture

- **Renderer:** three.js draws the 3D scene only. It is a view, never the source of truth.
- **Engine (custom):** simulation, post-processing and audio are owned code.
- **Simulation:** fixed-timestep tick, pure function of `(state, inputs)`. Rendering interpolates; it never mutates sim state.
- **Separate frame vs tick:** per-frame code (render, interpolation, post-fx) and per-tick code (sim) both live in `.hot.ts` files.

## Hot paths (`*.hot.ts`)

Any code running every frame or every tick goes in a `.hot.ts` file. A lint rule bans allocation there:
- no object/array literals, no closures/arrow functions, no `new`, no spread/rest, no template strings, no `.map/.filter/.reduce`, no destructuring that allocates.
- Use preallocated pools, typed arrays (struct-of-arrays), scratch vectors passed in, index loops.
Goal: the game loop produces ~zero garbage so GC never causes stutter. Details: `references/performance.md`.

## Determinism

- Seeded PRNG (e.g. sfc32/xorshift) owned by sim state; `Math.random` banned in sim code by lint.
- No `Date.now`/`performance.now` in sim; time = tick count.
- Avoid float divergence: fixed-point or carefully ordered math; no transcendental functions with platform-dependent results in sim (lint-ban `Math.sin` etc. in sim or use lookup tables).
- No iteration over unordered collections whose order can vary; stable IDs.
- Record runs as `seed + version + input log`. Replay = re-run the sim.
- **Anti-cheat:** on high-score submit, the server replays the full input log headless and accepts only the score it computes.
See `references/determinism.md`.

## Formal verification (TLA+)

Model every major state machine in TLA+ — story progression, cutscenes, each game system — and check invariants and liveness with TLC. Keep one verification skill/spec per major system. When TLC finds a counterexample: fix it, add a regression test, and add a lint rule if the bug class is syntactic. See `references/formal-verification.md`.

## Audio: live synthesis, no files

- Custom Game Boy-style chip in Web Audio: **2 pulse voices** (duty cycle), **1 wave voice** (wavetable), **1 noise voice** (LFSR), plus a **synthwave layer** (pads/bass/arps).
- Songs are text in code (tracker-style pattern strings), parsed at build or load.
- **Biome transitions:** music changes per biome seamlessly by continuing the current melody — share tempo/key/phrase grid, crossfade or swap patterns on bar boundaries, and carry the melodic position into the next song.
See `references/audio.md`.

## Pixel art as code

- Every sprite is its own source file drawn against **one shared palette** (palette indices, not colors).
- A build step rasterizes and packs all sprites into a single **sprite atlas**.
- Lint: sprites may only reference palette indices.

## Distribution & embedding

- Must run inside an X post (player card), from a **245px card to full screen**. Responsive canvas, integer-ish pixel scaling, input that works at tiny sizes.
- **Performance bar:** 60 fps with 500 enemies on a mid-range phone.
- **Download budget:** CI fails if the first download exceeds budget (reference: ~124 KB gzipped). Lazy-load everything non-essential.
- **Dynamic og:images** per run, rendered from final stats, localized.
- **i18n:** all user-facing strings via keys; 10 languages; lint bans raw string literals in UI.

## Balancing

Bots play headless (same deterministic sim, no renderer) thousands of runs per difficulty. Tune parameters until survival rates hit targets per difficulty. Run in CI to catch balance regressions.

## Workflow for agents

1. Read the path: `.hot.ts`? sim? sprite? song? Apply its constraints.
2. Make the change small; one PR per concern (velocity comes from many small PRs).
3. Run lint, typecheck, tests, TLC specs touched, bundle budget, determinism replay check.
4. Found a bug? Fix → test → **propose a lint rule** that prevents the class.
5. Never add comments. Rename or test instead.
