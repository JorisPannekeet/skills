# Content

Rules for games with levels, progression and saves.

## Fill the grid

Write the content grid as data: rows are the game's elements, biomes or chapters; columns are what each one must have.

| | Dungeon | Boss | Key item | Optional challenge | Exterior |
|---|---|---|---|---|---|
| Stone | ✓ | ✓ | ✓ | ✓ | ✓ |
| Water | ✓ | ✓ | ✓ | ✓ | ✓ |
| Fire | ✓ | ✓ | ✓ | ✓ | ✓ |
| Wind | ✓ | ✓ | ✓ | ? | ✓ |

A test walks the grid and fails on an empty cell. An agent building the fourth row forgets a column far more easily than a test does.

Derive counts from the grid. A literal `3` for "number of challenge areas" is a bug waiting for the fourth element.

## Sameness

- Give each level a different macro shape, and write it in the brief before building starts: a ring you circle inward, a cloister around water, a long hall, a vertical climb.
- Make the signature hazard the architecture of the level, not decoration sprinkled on a shared plan.
- Vary the outside as well as the inside. An entrance should tell the player what waits behind it from a screen away.
- Render all floor plans side by side and look. If two could be swapped without a player noticing, redraw one.

## Levels as data

- A map is rows of characters plus a legend. The parser validates everything it can and throws on load: rectangular rows, known characters, every door has a key, every gate has an opener, every spawn is walkable.
- **Static solver.** A flood fill that knows what the player owns in each chapter. It proves the level can be finished with that kit, that rewards meant for later are not reachable early, and that the overworld opens exactly the next road in each chapter.
- **The bot plays it.** The full-game bot must finish every level through general path-finding and puzzle solving. No per-level waypoints. When the bot stalls, fix the level or teach the bot the mechanic, never special-case the map.
- Tests find things by legend character, not by coordinate, so a redrawn map does not break them.

## Saves

- The save is a versioned list of fields with ranges; loading validates every value.
- **Append-only ids.** Flags, items and areas get new ids at the end. Inserting in the middle silently scrambles every existing save.
- A test pins the ids that already shipped.
- When a field must change meaning, bump the version and migrate, or refuse the old save cleanly.

## Story

- Chapters, triggers and scripts live in one table. Code reads the table; it does not branch on chapter numbers.
- The guide (where the game points the player next) is derived from the same table, so it cannot disagree with the story.
