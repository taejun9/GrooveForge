# plan-695-input-audition-command-reference-readouts

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Keyboard Capture, Capture Step Mode, MIDI Input, and Editor Audition in the Create section of Command Reference as readout-backed Quick Actions entries so users can discover local input posture, capture placement/defaults, Web MIDI status, selected-event audition, Input Capture Result feedback, and Editor Audition Result feedback from the command map.

## Non-Goals

- Do not change Keyboard Capture toggling, target selection, key mapping, capture defaults, capture insertion, duplicate blocking, or Capture Step Mode behavior.
- Do not change Web MIDI permission handling, input parsing, arm/disarm behavior, note mapping, or status handling.
- Do not change Editor Audition one-shot synthesis, selected-event routing, selected-event state, or audition result derivation.
- Do not change project schema, save/load, undo/redo, local drafts, realtime playback, render/export, MIDI export, Handoff Pack, or Handoff Sheet behavior.
- Do not add recording, audio input, MIDI output, clock sync, sampler devices, imported audio, sampling, hidden generation, remote AI, accounts, analytics, cloud sync, macros, command chains, autoplay, or auto-export.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Keyboard Capture, Web MIDI Input, Input Capture Result, Editor Audition, and Editor Audition Result behavior.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-695-input-audition-command-reference-readouts` and `.worktree/plan-695-input-audition-command-reference-readouts` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change Keyboard Capture, Capture Step Mode, MIDI Input, and Editor Audition Create Command Reference rows to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe input/audition command-map coverage without expanding scope.
- [x] Add harness expectations that pin the four rows and direct-composition/local-only boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Keyboard Capture, Capture Step Mode, MIDI Input, Editor Audition, Input Capture Result, Editor Audition Result, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark input and audition Create rows as readout-backed Command Reference entries. | These direct beat-writing tools already expose local posture or result feedback; the command map should make that input and audition loop clear for beginners and fast for producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for input and audition Command Reference readout coverage. |
| 2026-06-25 | harness_builder | Marked Keyboard Capture, Capture Step Mode, MIDI Input, and Editor Audition as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing input or audition behavior. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; runtime smoke covered 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference, docs, and harness coverage changed while input capture and editor audition runtime behavior stayed unchanged. |

## Completion Notes

- Keyboard Capture, Capture Step Mode, MIDI Input, and Editor Audition are marked as `Quick Actions / Readout` in the Create Command Reference.
- README, product, quality, and harness coverage describe local input posture, capture placement/defaults, Web MIDI status, selected-event audition, Input Capture Result feedback, and Editor Audition Result feedback.
- Keyboard Capture behavior, Capture Step Mode behavior, Web MIDI permission/status handling, Editor Audition one-shot synthesis, project data, playback, export, sampling scope, and remote boundaries remain unchanged.
