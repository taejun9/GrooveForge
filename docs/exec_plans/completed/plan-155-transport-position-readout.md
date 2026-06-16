# plan-155-transport-position-readout

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a compact Transport Position Readout to the command strip so users can see the current or cued Bar, Beat, Step, section, pattern, and loop scope while using Song, Block, or Pattern playback.

## Non-Goals

- Do not change playback scheduling, audio synthesis, metronome audio, export rendering, project schema, save/load migration, style profiles, key handling, or arrangement mutation behavior.
- Do not add count-in, tempo automation, marker editing, audio input, recording, beat detection, Web MIDI, imported audio, sampling, sampler tracks, remote analysis, accounts, analytics, or cloud sync.
- Do not persist readout state in `.grooveforge.json`; the readout must derive from local playback and selected project state.

## Context Map

- `src/ui/App.tsx`: command strip, transport loop state, playback snapshots, selected arrangement helpers.
- `src/styles.css`: command strip and transport readout layout.
- `README.md`: runtime transport description.
- `docs/product/product.md`: transport and MVP capabilities.
- `docs/quality/rules.md`: transport position guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-155-transport-position-readout` and `.worktree/plan-155-transport-position-readout` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current command strip, playback snapshot, and selected-block data.
- [x] Add a UI-local Transport Position Readout summary helper and stable test IDs.
- [x] Render the readout in the command strip with contained responsive styling.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for idle Song/Block/Pattern readouts, playback readout updates, layout containment, and no console errors.

QA evidence:

- `python3 harness/scripts/run_qa.py` passed.
- `npm run qa` passed.
- `npm run typecheck` passed.
- `git diff --check` passed.
- `npm run verify` passed, with Vite's existing chunk-size warning only.
- Browser smoke at `http://127.0.0.1:5246/` passed for idle Song, idle Block, idle Pattern, playing Song, playing Block, horizontal overflow false, and console errors 0.

## Review Plan

QA completes before review starts. Review checks UI-local derivation, readout correctness for Song/Block/Pattern modes, layout containment, no mutation/export changes, and no sampling/audio-input/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a command-strip readout instead of a new transport panel. | Position context belongs near play controls and should not add another large surface to the workstation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Transport Position Readout. |
| 2026-06-17 | harness_builder | Added the UI-local Transport Position Readout in the command strip for idle and playing Song/Block/Pattern context. |
| 2026-06-17 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for Transport Position Readout. |
| 2026-06-17 | quality_runner | Passed static QA, typecheck, diff check, verify, and browser smoke for readout states and layout containment. |
| 2026-06-17 | review_judge | Reviewed UI-local derivation, selected-block edge cases, no scheduler/export/schema mutations, and no sampling/remote scope; no findings. |

## Completion Notes

- The command strip now includes a Transport Position Readout with stable `transport-position-*` test IDs.
- Idle Song, Block, and Pattern modes show cued Bar/Beat, section or Pattern context, and loop scope before playback starts.
- Playing Song, Block, and Pattern modes derive Bar/Beat/Step, section, and Pattern labels from realtime playback snapshots, using the active snapshot arrangement index for Block playback.
- The implementation does not change project schema, playback scheduling, metronome behavior, Tap Tempo, Tempo Nudge Pads, save/load, WAV/stem/MIDI export, or optional-sampling scope.
