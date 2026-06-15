# plan-072-pattern-compare

## Status

Completed

## Owner

Team Forge

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working composers while remaining easy for first-time composers.

## Goal

Add a Pattern Compare strip so producers can judge Pattern A/B/C density and arrangement usage quickly, while beginners can cue a pattern preview or place a pattern into the selected song block without hunting across panels.

## Non-Goals

- No new project file schema, audio engine rewrite, MIDI input, sampling, imported audio, remote AI, analytics, accounts, cloud sync, hidden generation, or automatic arrangement mutation.
- No replacing existing Pattern tabs, variation tools, Pattern Chain, or Arrangement editor.
- No autoplay side effects when cueing a pattern; cueing only selects the pattern and preview mode.

## Context Map

- `src/ui/App.tsx`: Pattern panel, selected pattern state, arrangement block update handlers, playback mode.
- `src/styles.css`: Pattern panel layout and responsive styles.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product contract and QA guardrails.
- `harness/scripts/run_qa.py`: static expectations for UI/data contracts.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-072-pattern-compare` and `.worktree/plan-072-pattern-compare` for git repository work.
- Preserve the beat-first, event-based product boundary.

## Implementation Plan

- [x] Inspect Pattern panel and arrangement update paths.
- [x] Add Pattern Compare summary cards for A/B/C with event counts, track counts, arrangement usage, Cue, and Use controls.
- [x] Route Cue through selected-pattern preview state without adding undo history or autoplay.
- [x] Route Use through the existing undoable selected-arrangement-block update path.
- [x] Update docs and static QA expectations.
- [x] Run QA, review, completion, merge, push, and cleanup.

## QA Plan

- [x] `python3 harness/scripts/run_qa.py`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run qa`
- [x] `npm run verify`
- [x] Browser smoke: confirmed Pattern Compare cards render once for A/B/C, Cue switches the current pattern readout and preview mode, Use changes the selected block pattern through undoable history, Undo restores the selected block pattern, console errors are empty, and horizontal overflow is false.

## Review Plan

QA completes before review starts. Review checks that Pattern Compare is local, deterministic, beginner-legible, useful for producer comparison, undo semantics are correct, fixed Pattern A/B/C data is preserved, and no sampling/remote/hidden automation scope was introduced.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add compare/cue/use controls instead of a new pattern data model. | The app already has Pattern A/B/C data; the current gap is fast comparison and placement, not schema breadth. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | repo_cartographer | Inspected Pattern panel state, selected-pattern preview, and selected arrangement block update paths. |
| 2026-06-16 | harness_builder | Added Pattern Compare summary cards with Cue and Use controls wired to existing view/update paths. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for Pattern Compare. |
| 2026-06-16 | quality_runner | Ran automated QA, build/typecheck, verify, and browser smoke on port 5179. |

## Completion Notes

Pattern Compare is implemented as a local UI workflow over existing Pattern A/B/C and arrangement state. It adds no project schema and preserves existing playback/export semantics.
