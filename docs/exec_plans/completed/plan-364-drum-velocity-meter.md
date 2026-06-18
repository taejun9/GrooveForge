# plan-364-drum-velocity-meter

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working producers while staying approachable for first-time composers.

## Goal

Make drum step velocity visually scannable in the drum sequencer so producers can read accents and groove dynamics without selecting every hit, while beginners can understand why some hits feel stronger or softer.

## Non-Goals

- Do not change drum event schema, project save/load, playback, render, stem export, MIDI export, or drum editing semantics.
- Do not add sampling, imported audio, recording, remote AI, accounts, analytics, cloud sync, macros, autoplay, or auto-export.
- Do not redesign the drum sequencer or change Drum Foundation, Groove Feel, Drum Accent, selected-drum, chance, timing, repeat, or audition behavior.

## Context Map

- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- Keep feature work off `main`.
- Reuse existing `drumStepVelocity`; do not introduce derived persistence.
- Preserve the existing active-step velocity bar and selected/playhead/chance/repeat behavior.
- Keep drum cells compact and text contained at desktop and mobile widths.
- QA and review are separate loops.

## Implementation Plan

- [x] Add drum-step velocity-aware aria labels and visible compact velocity labels for active drum hits.
- [x] Update CSS so drum velocity labels coexist with existing velocity bars, chance badges, repeat labels, selected state, and playhead state.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, typecheck, build/verify, review, complete plan, and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review should verify that drum velocity is easier to scan in the step grid, existing chance/repeat/playhead/selected/click behavior remains intact, layout stays compact, and the change stays UI-only without schema, playback, render, export, sampling, recording, or cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add compact velocity labels to active drum steps instead of a new inspector panel. | Velocity is most useful while scanning the rhythm grid; the selected-step inspector already covers detailed editing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created in `codex/plan-364-drum-velocity-meter`. |
| 2026-06-19 | harness_builder | Added active drum-step velocity labels and velocity-aware aria details derived from existing `drumStepVelocity`. |
| 2026-06-19 | harness_builder | Updated product docs, quality rules, and static QA expectations for visible drum step velocity labels. |
| 2026-06-19 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. |
| 2026-06-19 | quality_runner | Browser visual QA was attempted with `npm run dev -- --host 127.0.0.1 --port 5173`, but local server binding failed with `listen EPERM`; escalated execution was rejected by environment policy, so no browser workaround was used. |
| 2026-06-19 | review_judge | Post-QA review found no blocking issues; residual risk is limited to visual browser QA being blocked by local server binding policy. |
