# plan-079-chord-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add key-aware Chord Pads to the chord editor so beginners can choose useful harmonic moves without theory setup, while working producers can quickly rewrite the selected Pattern A/B/C chord event as editable local musical data.

## Non-Goals

- No project schema fields.
- No audio recording, imported audio, sample import, chopping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No hidden generation or automatic chord replacement without an explicit user click.
- No changes to realtime playback, WAV/stem export, or MIDI export semantics beyond existing paths naturally rendering the edited chord events.

## Context Map

- `src/ui/App.tsx` owns `ChordEditor`, selected chord state, chord mutation handlers, and Pattern A/B/C update paths.
- `src/domain/workstation.ts` owns `ChordEvent`, scale pitch names, chord qualities, chord progressions, normalization, and render-consumed project state.
- `src/styles.css` owns compact editor controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Chord Pads must be deterministic from local key/style/project data.
- Chord Pad clicks must route through existing undoable chord update paths.
- Chord events must stay editable local musical event data.

## Implementation Plan

- [x] Add key-aware chord pad model and helper labels.
- [x] Add undoable Chord Pad application to the selected chord event.
- [x] Add a compact Chord Pads row in `ChordEditor` with current/suggested state.
- [x] Update docs and QA expectations for direct-composition chord pads.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke: click Chord Pads, confirm selected chord root/quality changes, undo restores it, console errors empty, and no horizontal overflow.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Chord Pads before hardware MIDI or sampling. | Fast harmonic editing improves direct beat composition for beginners and producers without adding permission prompts, imported audio, or non-editable generation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from clean main after plan-078. |
| 2026-06-16 | project_lead | Implemented key-aware Chord Pads for explicit selected-chord editing. |

## Completion Notes

Chord Pads are implemented in the chord editor. The Home, Lift, Tension, and Color pads derive root and quality from the current key, update only the selected chord event through the existing undoable chord update path, preserve step/length/velocity/chance fields, and keep the result as editable Pattern A/B/C chord data.

QA passed:

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `npm run qa`
- Browser smoke at `http://127.0.0.1:5187/`: Chord Pads rendered, Tension changed the selected first chord from `Fmin` to `C7`, Undo restored it to `Fmin`, console errors were empty, and desktop horizontal overflow was false. Undo also cleared the current selection through the existing history-restore behavior.
