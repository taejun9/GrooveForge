# plan-215-space-fx-pads

## Status

Complete.

## Goal

Add explicit Space FX Pads that let users quickly set built-in spatial send posture for drums, 808, synth, and chords, then see a UI-local result with before/after space posture and next listening check.

## User Value

- Beginners can choose a useful room/width/wash posture without understanding every mixer send slider first.
- Working producers can audition and commit repeatable spatial postures quickly, then continue manual mixer edits.
- The app gains more sound-design depth from built-in deterministic FX rather than sampling, plugin hosting, or remote processing.

## Non-Goals

- Do not add new audio assets, imported audio, sampling, plugin hosting, remote AI, convolution reverb, cloud sync, accounts, analytics, autoplay, auto-export, or hidden mastering.
- Do not change the project schema, Space bus algorithm, realtime scheduler, offline render semantics, stem isolation semantics, Mix Balance Pads, Stem Audition Pads, Mix Coach, Master Finish, Handoff Sheet, or Handoff Pack behavior.
- Do not make platform loudness, mastering, or genre-authenticity claims.

## Scope

- Add local Space FX Pad definitions for dry, room, wide, and wash send postures.
- Derive pad options from current mixer send values and apply selected pad changes through existing undoable mixer update paths.
- Render Space FX Pads in the Mixer panel near existing Stem Audition and Mix Balance controls.
- Show a UI-local Space FX Result only after explicit pad clicks, with before/after Drums, 808, Synth, Chords space posture, changed send count, audition cue, and next check.
- Update README/product/quality docs and static QA expectations.

## Outcome

- Added Space FX Pads for dry, room, wide, and wash send postures in the Mixer panel.
- Added a UI-local Space FX Result with before/after Drums, 808, Synth, and Chords send posture, changed-send impact, audition cue, and next check.
- Kept changes scoped to undoable mixer `send` values for existing stem channels with no schema, sampling, asset, plugin, remote, export, or render algorithm changes.
- Updated README, product docs, quality rules, and static QA expectations.

## QA

- Pass: `npm run typecheck`
- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `git diff --check`
- Pass: `npm run qa`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `npm run verify`
- Blocked: Browser smoke. `npm run dev -- --host 127.0.0.1 --port 5305` failed with `listen EPERM`, and the required escalated retry was rejected by environment policy.

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-17 | Add Space FX Pads on top of existing mixer send controls. | Fast built-in space postures improve beginner usability and producer speed while preserving manual mixer control and deterministic local rendering. |
| 2026-06-17 | Keep Space FX Result UI-local and outside project history. | Result feedback should explain the explicit pad click without changing saved project schema or undo history beyond the mixer send edit. |
