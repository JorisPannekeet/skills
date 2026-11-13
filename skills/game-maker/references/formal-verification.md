# Formal verification with TLA+

One spec (and one agent skill) per major system: story, cutscenes, each gameplay system.

## When TLA+ earns its place
- Use it where transitions interleave: cutscenes against gameplay, several systems writing the same flags, anything with timers that can fire in either order.
- A strictly linear story can be covered by a transition table held as data, tests over that table, and a bot that plays from new game to every ending on several seeds. Write down that this is the choice, so the gap is deliberate.
- A soft-lock found by a player or a stuck bot means the cheaper method missed a state. Model that system.

## Per spec
- Variables mirror the TS state machine's states and flags.
- Actions mirror transitions/events.
- `TypeOK`, safety invariants (e.g. no cutscene starts while another runs; story flags monotonic; player can't be in two biomes).
- Liveness (e.g. every started cutscene ends; story always reachable to completion).
- Run TLC in CI on specs touched by a PR.

## Keeping code and spec aligned
- Generate or check transition tables from code against the spec.
- A TLC counterexample becomes a regression test with the exact event trace.
