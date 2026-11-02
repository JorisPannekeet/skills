# Performance

## Zero-GC patterns for `*.hot.ts`
- Struct-of-arrays with typed arrays (`Float32Array` positions, `Uint16Array` types) sized at init.
- Object pools with free lists; entities are indices.
- Scratch vectors created once at module init in a non-hot file, passed in.
- Plain `for (let i = 0; i < n; i++)` loops.
- Spatial hash grid preallocated for collisions with 500+ enemies.
- Instanced meshes in three.js; update instance matrices in-place.

## Budgets enforced in CI
- First download gzipped ≤ budget (~124 KB reference).
- Headless frame-time benchmark at 500 enemies; fail on regression.
- Allocation profile check: zero allocations per tick in a sampled run.
