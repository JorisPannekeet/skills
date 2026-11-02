# Lint rules

The ruleset grows with every bug found. Each rule: name, what it bans, why (the bug that caused it), autofix if possible.

## Baseline rules
| Rule | Scope | Bans |
|---|---|---|
| no-alloc-in-hot | `*.hot.ts` | object/array literals, closures, `new`, spread, template literals, allocating array methods, allocating destructuring |
| no-comments | all | `//` and `/* */` (except tooling pragmas if strictly required) |
| no-nondeterminism-in-sim | sim/** | `Math.random`, `Date`, `performance.now`, unordered iteration, platform-variant math |
| sim-no-render-imports | sim/** | importing three.js or DOM |
| sprite-palette-only | sprites/** | color literals; only palette indices |
| no-raw-ui-strings | ui/** | string literals shown to users; must use i18n keys |
| no-audio-image-assets | all | importing .mp3/.ogg/.wav/.png/.jpg |

## Writing a new rule
1. Write a minimal failing fixture reproducing the bug.
2. Implement the rule (custom ESLint/oxlint/Biome plugin) as an AST visitor.
3. Add valid + invalid test cases.
4. Run across the repo; fix or autofix all hits in the same PR.
