# Balancing

Bots play the deterministic sim headless. The balance suite states the targets as tests and runs in CI.

## Bots

- **A skilled bot** that guards, dodges and uses the whole kit. It sets the floor: if it struggles, the game is too hard.
- **A sloppy bot** that never guards or dodges. It sets the ceiling: if it cannot finish, new players cannot either.
- For a story game, both play from new game to the ending, on several seeds, with and without optional content.
- Bots use the same input word as the player. They never write state.

## Measure the thing itself

A metric must not change when something unrelated changes.

- **Fight length** runs from the first blow to the kill. Timing from when the enemy wakes up includes the walk to the fight, so the number moves whenever the map does.
- **Retries** reset the clock. Report the winning attempt and the number of attempts separately.
- **Chapter time** includes travel, so use it to watch pacing, not difficulty.
- When a number moves, find out what it measured before changing the game. Log the event that starts the clock and the one that stops it.

## Make the targets robust

- Assert on the **median across seeds**, with a looser bound on the extremes. One unlucky run should not fail the build.
- State targets as ranges with room on both sides of today's value.
- **Separate random streams** for combat, loot and world generation. Otherwise a harmless map edit shifts every later roll, and a test about one boss fails because of a change in another level.
- If a test only passes after nudging one enemy by one tile, the test is measuring noise. Fix the metric, not the enemy.

## Typical targets

| Arcade | Story |
|---|---|
| Survival rate per difficulty | Deaths per chapter for each bot |
| Time to first death | Fight length per boss, from the first blow |
| Score distribution | Regular enemy kill time |
| | Level and attack curve by chapter |

## When a balance test fails

1. Reproduce with the seed.
2. Decide whether the game changed or the measurement did.
3. If the game changed on purpose, move the target in the same PR and say so in the description, with the before and after numbers.
4. If the measurement was wrong, fix the measurement and keep the old data for comparison.
