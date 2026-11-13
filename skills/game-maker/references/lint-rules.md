# Lint rules

The ruleset grows with every bug found. Each rule: name, what it bans, why (the bug that caused it), autofix if possible.

A lint rule fits a bug class you can see in the syntax. When the class is about behavior (a soft-lock, a metric that measures the wrong thing, a save that no longer loads), the rule is a test: a regression test for the case, and where possible a test over the whole data set so the next instance fails too.

## Baseline rules
| Rule | Scope | Bans |
|---|---|---|
| no-alloc-in-hot | `*.hot.ts` | object/array literals, closures, `new`, spread, template literals, allocating array methods, allocating destructuring |
| no-comments | all | `//` and `/* */` (except tooling pragmas if strictly required) |
| no-nondeterminism-in-sim | sim/** | `Math.random`, `Date`, `performance.now`, unordered iteration, platform-variant math |
| sim-no-render-imports | sim/** | importing the renderer, three.js, canvas or DOM |
| sprite-palette-only | sprites/** | color literals; only palette indices |
| no-raw-ui-strings | ui/** | string literals shown to users; must use i18n keys |
| no-audio-image-assets | all | importing .mp3/.ogg/.wav/.png/.jpg |

## Baseline data tests
| Test | Checks |
|---|---|
| content grid | every element, biome or chapter has each required kind of content |
| level solver | each map can be finished with what the player owns at that point; later rewards are not reachable early |
| shipped ids | flags, items and areas that already shipped keep their positions in the save |
| palette | append-only, within the cap |

## Writing a new rule
1. Write a minimal failing fixture reproducing the bug.
2. Implement the rule (custom ESLint/oxlint/Biome plugin) as an AST visitor.
3. Add valid + invalid test cases.
4. Run across the repo; fix or autofix all hits in the same PR.
