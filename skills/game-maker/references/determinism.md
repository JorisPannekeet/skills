# Determinism & replays

## Run record
`{ gameVersion, seed, difficulty, inputs: packed per-tick bitfield (RLE) }`

## Server verification
1. Client submits run record + claimed score.
2. Server loads exact `gameVersion` sim (same code, Node/worker, no renderer).
3. Replays all ticks; computes score, final stats.
4. Accept only server-computed score; store record for replay and og:image.

## Random streams
One seeded stream per concern (combat, loot, world), all derived from the run seed and all part of sim state. A content edit then changes only the stream it touches, and replays stay stable across unrelated changes.

## Guarding determinism
- CI test: run N seeds twice and across environments; hash state per tick; must match.
- On mismatch, bisect tick, find the source, add a lint rule.
