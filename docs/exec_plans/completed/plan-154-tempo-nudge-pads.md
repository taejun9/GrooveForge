# plan-154-tempo-nudge-pads

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add compact Tempo Nudge Pads to the transport so users can quickly adjust BPM by -1, +1, half-time, or double-time without typing.

## Non-Goals

- Do not add tempo automation, audio input, recording, beat detection, Web MIDI, imported audio, sampling, sampler tracks, or remote analysis.
- Do not change playback scheduling, metronome audio, export rendering, project schema, save/load migration, style profiles, key handling, or arrangement behavior.
- Do not add hidden BPM changes; every tempo pad must be an explicit user-clicked command.
- Do not persist UI-only pad state in `.grooveforge.json`; only the resulting BPM remains project data.

## Context Map

- `src/ui/App.tsx`: transport controls, Tap Tempo helpers, BPM update path, command strip rendering.
- `src/styles.css`: transport header and compact button layout.
- `README.md`: MVP feature list and runtime description.
- `docs/product/product.md`: transport and MVP capabilities.
- `docs/quality/rules.md`: transport/tempo guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-154-tempo-nudge-pads` and `.worktree/plan-154-tempo-nudge-pads` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Add explicit tempo pad definitions for -1, +1, half-time, and double-time.
- [x] Render compact Tempo Nudge Pads near the transport BPM control with stable test IDs.
- [x] Route pad clicks through existing undoable project BPM update history while resetting Tap Tempo UI state.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for tempo pad clicks updating BPM, resetting Tap Tempo readout, staying contained in transport layout, and undoing through project history.

## Review Plan

QA completes before review starts. Review checks explicit-click behavior, BPM clamping, undoability, Tap Tempo reset, layout containment, save/load/export boundaries, and no sampling/audio-input/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add four compact pads instead of another modal or command palette flow. | Tempo changes are part of the first-run transport workflow and should be reachable without search or typing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for transport Tempo Nudge Pads. |
| 2026-06-17 | harness_builder | Added -1, +1, half-time, and double-time tempo pads beside the BPM control, routed through undoable project BPM updates with Tap Tempo reset. |
| 2026-06-17 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for Tempo Nudge Pads and no audio-input/sampling scope. |
| 2026-06-17 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `git diff --check`, `npm run verify`, and CDP browser smoke for pad clicks, Tap Tempo reset, layout containment, and undo. |
| 2026-06-17 | review_judge | Reviewed explicit-click behavior, BPM clamping, undoability, Tap Tempo reset, layout containment, and save/load/export/sampling boundaries; no findings. |

## Completion Notes

- The transport now has compact `-1`, `+1`, `1/2`, and `x2` Tempo Nudge Pads next to the BPM field.
- Each pad derives the next BPM from the current project BPM, clamps to the supported 60-220 range, resets UI-local Tap Tempo state, and commits through existing undoable project history.
- The implementation does not change project schema, playback scheduling, metronome audio, render/export behavior, style profiles, key handling, arrangement data, or optional-sampling scope.
