# plan-363-note-velocity-meter

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working producers while staying approachable for first-time composers.

## Goal

Make note velocity visually scannable in the 808/Synth note grid so producers can read dynamics without selecting every note and beginners can understand why notes hit harder or softer.

## Non-Goals

- Do not change project schema, playback, render, MIDI export, save/load, or note-edit semantics.
- Do not add sampling, imported audio, recording, MIDI output, controller mapping, remote AI, accounts, analytics, cloud sync, macros, autoplay, or auto-export.
- Do not redesign the pattern editor or add a new piano-roll engine.

## Context Map

- `src/ui/workstationComposePanels.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- Keep feature work off `main`.
- Keep the note grid compact and stable across desktop/mobile widths.
- Reuse existing `NoteView.velocity`; do not introduce derived persistence.
- Preserve current note click, playhead, selection, glide, and chance badge behavior.
- QA and review are separate loops.

## Implementation Plan

- [x] Add velocity-aware aria labels and visible note-cell velocity meter/label for active notes.
- [x] Update CSS with stable note fill, velocity meter, chance, glide, and selected states.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, typecheck, build/verify, and document browser verification limits.
- [x] Complete review, move plan to completed, and create review mirror.

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

QA completes before review starts. Review should verify that note velocity is easier to scan in the 808/Synth grid, no click/edit/playhead/chance/glide behavior regresses, layout remains compact, and the change stays UI-only without schema, playback, export, sampling, recording, or cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add velocity meters to existing note cells instead of a new panel. | Producers need fast dynamic scanning in context; beginners benefit from direct feedback where they edit notes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created in `codex/plan-363-note-velocity-meter`. |
| 2026-06-19 | harness_builder | Added active-note velocity bars, numeric velocity labels, and velocity-aware aria labels for 808/Synth note cells without changing note data or playback/export paths. |
| 2026-06-19 | harness_builder | Updated product docs, quality rules, and static QA expectations for visible 808/Synth note-cell velocity meters. |
| 2026-06-19 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. |
| 2026-06-19 | quality_runner | Browser visual QA was attempted with `npm run dev -- --host 127.0.0.1 --port 5173`, but local server binding failed with `listen EPERM`; escalated execution was rejected by environment policy, so no browser workaround was used. |
| 2026-06-19 | review_judge | Post-QA review found no blocking issues; residual risk is limited to visual browser QA being blocked by local server binding policy. |
