# plan-150-keyboard-capture-posture-readout

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Keyboard Capture posture readout near the transport controls so users can see whether capture is armed, which track receives keys, the next step, and the current capture defaults without opening the full note editor panel.

## Non-Goals

- Do not change Keyboard Capture note-entry behavior, key bindings, target switching, or default-edit controls.
- Do not persist capture posture readout fields in the project file or change save/load schema.
- Do not add Web MIDI, audio recording, sampler tracks, sampling, imported audio, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- Do not change playback, render, export, MIDI, Handoff Sheet, snapshots, local draft recovery, undo/redo, or Quick Actions behavior.

## Context Map

- `src/ui/App.tsx`: Keyboard Capture state, defaults, next-step calculation, command strip rendering, and readout derivation.
- `src/styles.css`: command strip and Keyboard Capture layout.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: Keyboard Capture quality boundary.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-150-keyboard-capture-posture-readout` and `.worktree/plan-150-keyboard-capture-posture-readout` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Add a derived capture posture summary from existing Keyboard Capture state, target, defaults, and next step.
- [x] Render the readout in the command strip with stable test IDs and no saved schema changes.
- [x] Add compact responsive styling that does not crowd transport or undo/redo controls.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for capture-off, capture-armed, target/default readout, and command strip containment.

## Review Plan

QA completes before review starts. Review checks that the readout is UI-local, derives only from existing Keyboard Capture state, preserves note-entry and project semantics, keeps the command strip usable, and avoids sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add a command-strip posture readout instead of changing capture controls. | The need is fast visibility, not a new note-entry model. |
| 2026-06-16 | Derive posture from armed state, target, next step, and current capture defaults. | These are the existing local inputs users need to avoid mistaken key entry. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Keyboard Capture posture visibility. |
| 2026-06-16 | harness_builder | Added Keyboard Capture posture summary, command-strip readout, compact styling, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `npm run qa`, and `npm run verify` passed. |
| 2026-06-16 | quality_runner | CDP smoke passed for capture-off, armed 808, armed Synth, and command strip containment. |
| 2026-06-16 | review_judge | Reviewed UI-local derivation, Keyboard Capture behavior preservation, layout containment, and no sampling/cloud/remote scope; no findings. |

## Completion Notes

Completed. GrooveForge now shows a UI-local Keyboard Capture posture readout beside transport and edit-history status. It reports capture armed/off state, 808/Synth target, next step, octave/length, and target-specific glide or velocity defaults from existing UI state without changing note-entry behavior, keyboard shortcuts, project schema, save/load, playback, render, export, MIDI, Handoff Sheet, snapshots, undo/redo, Quick Actions, or local draft recovery.
