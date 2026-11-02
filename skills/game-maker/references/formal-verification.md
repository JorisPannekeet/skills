# Formal verification with TLA+

One spec (and one agent skill) per major system: story, cutscenes, each gameplay system.

## Per spec
- Variables mirror the TS state machine's states and flags.
- Actions mirror transitions/events.
- `TypeOK`, safety invariants (e.g. no cutscene starts while another runs; story flags monotonic; player can't be in two biomes).
- Liveness (e.g. every started cutscene ends; story always reachable to completion).
- Run TLC in CI on specs touched by a PR.

## Keeping code and spec aligned
- Generate or check transition tables from code against the spec.
- A TLC counterexample becomes a regression test with the exact event trace.
