# plan-105-stem-audition-pads

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working composers/producers can respect and first-time composers can use easily.

## Goal

Add Stem Audition Pads so users can quickly hear Full Mix, Drums, 808, Synth, or Chords through the existing mixer solo/mute state. Beginners should be able to isolate each core musical role by ear, while working producers can quickly check stem balance and arrangement masking before export.

## Non-Goals

- No new audio engine, rendered stem playback, sample import, audio clips, sampler tracks, audio recording, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No mutation of Pattern A/B/C musical events, arrangement blocks, sound design, master state, Delivery Target, Beat Readiness, Beat Map, Next Move, Finish Checklist, Review Queue, Project Snapshots, exports, MIDI, or Handoff Sheet semantics.
- No hidden auto-mix, hidden mastering, stem separation, source separation, LUFS, true-peak, platform compliance, publishing, licensing, professional release-readiness, or commercial success claims.
- No new project schema; pads use existing mixer `solo` and `muted` fields through explicit undoable project updates.

## Context Map

- `src/ui/App.tsx`: Mixer panel, mixer channel controls, updateProject/updateMixerChannel, Mix Coach, stem meters.
- `src/styles.css`: compact button row conventions.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product framing and QA guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and code tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-105-stem-audition-pads` and `.worktree/plan-105-stem-audition-pads` for git repository work.
- Stem Audition Pads must be explicit-click, local, undoable, and manually editable afterward through existing Mixer controls.
- Pads must preserve realtime playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Sheet, and all musical event semantics.
- Pads must not introduce imported audio, remote analysis, or hidden processing.

## Implementation Plan

- [x] Add Stem Audition pad types/options and deterministic changed-count helper.
- [x] Render Stem Audition Pads in the Mixer panel near existing mixer controls.
- [x] Route pad clicks through existing undoable project update path to set mixer solo/mute fields only.
- [x] Style pads responsively without horizontal overflow.
- [x] Update docs and QA expectations for stem audition workflow.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Stem Audition Pads render Full Mix/Drums/808/Synth/Chords buttons, clicking a stem pad solos that stem only, clicking Full Mix clears solo/mute audition state, manual mixer controls remain editable, console errors stay empty, and no horizontal overflow appears.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that Stem Audition Pads only mutate mixer solo/mute state through explicit undoable updates, remain useful for beginners and producers, preserve export/playback semantics, and stay inside the non-sampling product boundary.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Stem Audition Pads after Review Queue. | Review surfaces now identify mix/stem issues; users need a fast local way to hear each core stem role without changing musical data or exporting files. |
| 2026-06-16 | Use existing mixer solo/mute state instead of rendered stem preview audio. | This keeps the feature local, undoable, simple, realtime, and aligned with current mixer/export semantics. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for explicit local Stem Audition Pads. |
| 2026-06-16 | harness_builder | Added Full Mix/Drums/808/Synth/Chords Stem Audition Pads, mixer solo/mute transformation helpers, docs, and QA expectations. |
| 2026-06-16 | quality_runner | Ran `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, and `npm run verify`; all passed. |
| 2026-06-16 | quality_runner | Browser smoke confirmed five audition pads, 808 solo behavior, Full Mix reset behavior, editable mixer controls, no console errors, and no row/body overflow. |

## Completion Notes

Completed. Stem Audition Pads now provide explicit local Full Mix/Drums/808/Synth/Chords solo checks in the Mixer panel. They update only existing mixer `solo` and `muted` fields through undoable project history, preserve musical event and export semantics, and do not add rendered stem playback, sampling, remote analysis, or hidden processing.
