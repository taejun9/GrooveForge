# plan-217-listening-pass

## Status

complete

## Owner

project_lead / plan_keeper

## User Request

Continue making GrooveForge into a desktop beat-making app that can satisfy working composers/producers while remaining easy for beginners.

## Goal

Add a UI-local Listening Pass surface that turns the current beat state into practical audition checkpoints for composition, arrangement, mix, and delivery so beginners know what to listen for and producers can scan session risks quickly.

## Non-Goals

- Do not add sampling, imported audio, audio analysis, reference-track upload, remote AI, plugin hosting, accounts, analytics, or cloud sync.
- Do not change saved project schema, render/export file contents, deterministic playback, or existing readiness scoring.
- Do not auto-play, auto-fix, auto-export, or run multi-step command chains.

## Context Map

- `src/ui/App.tsx` contains existing local summaries, focus jumps, Beat Readiness, Production Snapshot, Review Queue, Stem Audition, and export analysis.
- `src/styles.css` contains compact panel/button/readout styling for existing UI-local guidance surfaces.
- `docs/product/product.md` and `README.md` define the direct beat-making product spine.
- `docs/quality/rules.md` documents local-only, explicit-action QA constraints.
- `harness/scripts/run_qa.py` enforces product/document/code surface expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Add Listening Pass types, summary derivation, and UI rendering from existing local project/readiness/render/stem state.
- [x] Add focus buttons that route only to existing Compose, Arrange, Mix, Master, or Deliver panels without mutating project data.
- [x] Style the surface with stable responsive dimensions and no sampling or imported-audio affordances.
- [x] Update README, product docs, quality rules, and QA harness expectations.

## QA Plan

- `npm run typecheck` - passed
- `python3 harness/scripts/run_qa.py` - passed
- `git diff --check` - passed
- `npm run qa` - passed
- `python3 harness/scripts/run_quality_gate.py` - passed
- `npm run verify` - passed with existing Vite large chunk warning
- Browser smoke - blocked because local Vite dev server failed with `listen EPERM 127.0.0.1:5307`; escalation request was rejected by environment policy.

## Review Plan

QA completes before review starts. Review should verify that Listening Pass is read-only/UI-local except for explicit focus jumps, uses existing local signals, preserves direct beat composition, and does not introduce sampling or remote analysis.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Build Listening Pass as a UI-local audition checklist with focus jumps only. | The persistent goal needs a surface that helps beginners hear the next issue while giving producers fast composition/arrangement/mix/delivery checks without changing core data. |
| 2026-06-17 | Record browser smoke as blocked, not bypassed. | Local dev server listen permission failed under sandbox and escalation was rejected; policy says not to work around that path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created in `codex/plan-217-listening-pass`. |
| 2026-06-17 | harness_builder | Added Listening Pass summary derivation, rendering, focus jumps, styles, docs, and harness expectations. |
| 2026-06-17 | quality_runner | Completed QA commands; browser smoke blocked by local listen permission. |

## Completion Notes

Listening Pass now derives composition, arrangement, mix, and delivery audition checkpoints from existing local project/readiness/render/stem/target/brief state and routes Focus clicks only to existing workstation panels. Documentation and QA harness expectations were updated to preserve direct beat-making, local-only, no-sampling boundaries.
