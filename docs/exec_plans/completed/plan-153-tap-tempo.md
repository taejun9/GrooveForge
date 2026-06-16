# plan-153-tap-tempo

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add Tap Tempo to the transport so users can set project BPM by clicking a pulse instead of typing a number.

## Non-Goals

- Do not add audio input, recording, beat detection, Web MIDI, imported audio, sampling, sampler tracks, or remote analysis.
- Do not add background tempo automation, hidden BPM changes, cloud sync, accounts, analytics, or remote AI.
- Do not change playback scheduling, metronome audio, export rendering, project schema, save/load migration, style profiles, or arrangement behavior.
- Do not persist tap history in `.grooveforge.json`; only the resulting BPM is project data.

## Context Map

- `src/ui/App.tsx`: transport controls, project BPM update path, command strip, and UI-local state.
- `src/styles.css`: transport header and command strip layout.
- `README.md`: MVP feature list and runtime description.
- `docs/product/product.md`: transport and MVP capabilities.
- `docs/quality/rules.md`: transport/tempo guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-153-tap-tempo` and `.worktree/plan-153-tap-tempo` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Add UI-local tap tempo state and deterministic interval-to-BPM calculation.
- [x] Add a transport Tap button with a compact readout for tap count and calculated BPM.
- [x] Route accepted tempo changes through existing undoable project update history.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for repeated tap tempo clicks updating BPM and showing the readout without layout overflow.

## Review Plan

QA completes before review starts. Review checks that tap history is UI-local, BPM updates are explicit and undoable, playback/export/save/load semantics are preserved, and no sampling/audio-input/remote scope was introduced.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Keep tap history UI-local and persist only the resulting BPM through existing project state. | Users need a fast tempo entry helper without changing the project format or adding hidden automation. |
| 2026-06-16 | Debounce Tap Tempo project commits until the user pauses briefly. | During QA, committing BPM after every tap triggered local draft writes between taps; a short UI-local settle window keeps tap timing accurate and commits one undoable BPM change. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for transport Tap Tempo. |
| 2026-06-16 | harness_builder | Added Tap Tempo UI-local state, readout, bounded BPM calculation, debounced undoable BPM commit, and reset handling for load, manual BPM entry, undo, and redo. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for Tap Tempo and no audio-input/sampling scope. |
| 2026-06-16 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `git diff --check`, `npm run verify`, in-app Browser visibility check, and CDP Tap Tempo smoke with undo. |
| 2026-06-16 | review_judge | Reviewed UI-local tap history, explicit click flow, undoable BPM commit, save/load/export boundaries, and sampling/audio-input guardrails; no findings. |

## Completion Notes

- Transport now includes a Tap button plus command-strip readout for tap count, calculated BPM, pending/apply state, and current BPM fallback.
- Tap history and commit timers are UI-local only; `.grooveforge.json` persists only the resulting BPM through existing project state.
- Repeated taps are averaged and committed once after a short pause so local draft writes do not disrupt tap timing.
- Project load, manual BPM entry, undo, and redo reset the Tap Tempo readout back to the current project BPM.
