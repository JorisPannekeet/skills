# Profiles

The core rules hold for every game. A profile says which of the remaining rules apply. Pick one option per row at the start and record it in the project's agent instructions, so no later agent has to guess.

## Core (always on)
- Deterministic fixed-tick sim, seeded PRNG, no wall clock in sim.
- `*.hot.ts` hot paths with the allocation ban.
- Download and frame-time budgets that fail the build.
- Sprites, music and SFX as code; one shared palette.
- No comments.
- The visual check loop (`visual-verification.md`).
- All UI strings through i18n keys.

## Renderer
| | 3D | 2D |
|---|---|---|
| Draws with | three.js, instanced meshes | canvas 2D, one sprite atlas |
| `sim-no-render-imports` bans | three.js and DOM | DOM and canvas |
| Scaling | camera and render target | backing store in art pixels, one `setTransform`, integer zoom |

## Shape
| | Arcade | Story |
|---|---|---|
| A session is | a run with a score | a save that progresses |
| Performance bar | 60 fps with 500 enemies | 60 fps in the densest real scene |
| Anti-cheat | server replays the input log | not needed without a leaderboard |
| og:images | per run, from final stats | optional |
| Balancing target | survival rate per difficulty | deaths per chapter, fight length, level curve |
| State machines | TLA+ per system | transition table + full-game bot, TLA+ where transitions interleave |
| Extra rules | | `content.md`: grid, level validation, append-only saves |

## Surface
- **Embed card:** every screen must work at 245px. Touch and keyboard both first-class. Test the card size in the frame renderer.
- **Full page:** the smallest supported size is a phone in portrait.

## Languages
- Default is 10 languages.
- A single language is acceptable for a first release. The lint rule against raw UI strings still applies, so adding the rest later is translation work only.
