# plan-365-chord-velocity-meter

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working producers while staying approachable for first-time composers.

## Goal

Make chord event velocity visually scannable in the Chord Editor so producers can read harmonic dynamics without selecting every chord, while beginners can understand why some chords hit harder or softer.

## Non-Goals

- Do not change chord event schema, project save/load, playback, render, stem export, MIDI export, or chord editing semantics.
- Do not add sampling, imported audio, recording, remote AI, accounts, analytics, cloud sync, macros, autoplay, or auto-export.
- Do not redesign the Chord Editor or change Chord Pads, Chord Rhythm, Chord Voicing, selected-chord, chance, inversion, playhead, clipboard, or audition behavior.

## Context Map

- `src/ui/workstationComposePanels.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- Keep feature work off `main`.
- Reuse existing `ChordEvent.velocity`; do not introduce derived persistence.
- Preserve existing chord chance badges, inversion labels, selected/playing state, controls, and editor audition.
- Keep chord cards compact and text contained across desktop/mobile widths.
- QA and review are separate loops.

## Implementation Plan

- [x] Add chord velocity-aware aria labels and visible compact velocity meter/label for chord slots.
- [x] Update CSS so chord velocity indicators coexist with chance badges, inversion labels, selected state, and playing state.
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

QA completes before review starts. Review should verify that chord velocity is easier to scan in chord slots, chance/inversion/selected/playing/edit behavior remains intact, layout stays compact, and the change stays UI-only without schema, playback, render, export, sampling, recording, or cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add compact velocity meters to existing chord slots instead of a new panel. | Producers need harmonic dynamics in context; beginners benefit from seeing strength on the same card they edit. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created in `codex/plan-365-chord-velocity-meter`. |
| 2026-06-19 | harness_builder | Added chord slot velocity meters, numeric velocity labels, and velocity-aware aria labels derived from existing `ChordEvent.velocity`. |
| 2026-06-19 | harness_builder | Updated product docs, quality rules, and static QA expectations for visible chord slot velocity meters. |
| 2026-06-19 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. |
| 2026-06-19 | quality_runner | Browser visual QA was attempted with `npm run dev -- --host 127.0.0.1 --port 5173`, but local server binding failed with `listen EPERM`; escalated execution was rejected by environment policy, so no browser workaround was used. |
| 2026-06-19 | review_judge | Post-QA review found no blocking issues; residual risk is limited to visual browser QA being blocked by local server binding policy. |
