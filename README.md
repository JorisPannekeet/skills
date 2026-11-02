<img src="assets/icon.svg" width="64" height="64" alt="">

# Skills For Builders

[![skills.sh](https://skills.sh/b/JorisPannekeet/skills)](https://skills.sh/JorisPannekeet/skills)

Agent skills for people who ship with AI.

Agents are fast, but they don't know your standards. They allocate in a game loop, use `Math.random` in a simulation that must replay bit for bit, or finish a UI change and describe it in a wall of text instead of showing it.

These skills give the agent those standards up front, so you get the right result on the first try.

## Install

```bash
npx skills@latest add JorisPannekeet/skills
```

Or install a single skill:

```bash
npx skills@latest add JorisPannekeet/skills --skill show-me
```

## Why use it?

Agents optimize for "it works". These skills push them toward "it works, it's fast, and you can see it".

- **Rules the build enforces.** Every bug class becomes a lint rule, and size and frame-time budgets fail CI.
- **Proof instead of claims.** The agent demos what it built on video, live, instead of telling you it's done.

## Reference

- **[game-maker](./skills/game-maker/SKILL.md)**: Build browser games with tiny bundles, deterministic simulation, zero-GC hot loops, code-generated pixel art and chiptune audio, TLA+ verified state machines, and headless bot balancing.
- **[show-me](./skills/show-me/SKILL.md)**: See what was just built. Opens a visible browser, the iOS Simulator, or your macOS desktop app with a real moving cursor, walks through the new feature at human speed, records a video, and ends with a 3-bullet summary.
