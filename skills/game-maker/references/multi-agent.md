# Several agents on one game

A game splits well across agents because its layers are separable: sim, renderer, audio, UI, content. It splits badly when two agents guess at the same interface.

## Order of work

1. **Contract first, by one author.** Before any fan-out, write the shared definitions: ids and caps, the state shape, the input word, the event list, tile and object kinds, file ownership. Stub the functions other layers will call. Everyone builds against this.
2. **One owner per file.** The brief lists which files each builder may edit. Shared files are append-only, with each builder's entries near its own definitions.
3. **One worktree per builder.** A sentence in a brief is not a lock. Separate checkouts are.
4. **One integration pass.** Merge the branches in one place and rerun everything: lint, types, the full test suite, the full-game bot, budgets, the browser route. Checks that passed on each branch can fail on the combination, balance most of all.

## Briefs

- Open with the player's goal in their own words.
- State what was decided already, and what is the builder's to decide.
- Point at files to read instead of pasting them.
- Give each builder a different assignment where sameness is the risk (see `content.md`).
- Define done as checks with outputs, plus frames looked at.
- Ask for a report with: what the player now sees, paths of the frames, each check's output, what was left out, what another owner must know.

## What to verify yourself

- Open the frames. Do not relay a builder's description of them.
- Rerun the suite on the merged result.
- Read every edit a builder made outside its own files.
- When several builders report the same problem with a shared tool or test, that is the root cause to fix before merging.
