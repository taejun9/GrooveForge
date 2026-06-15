# plan-043-key-retarget-patterns

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue making GrooveForge into a desktop beat-making app that can satisfy working producers while staying easy for first-time composers.

## Goal

Make Key changes musically useful by retargeting all Pattern A/B/C bass notes, melody notes, and chord roots to the new key instead of leaving existing musical events in the old key. The mapping should preserve scale-degree intent, octave/register, timing, length, velocity, glide, and chance data while staying undoable and sample-free.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, plugin hosting, MIDI recording, remote AI, or audio warping.
- No advanced reharmonization, voice-leading engine, borrowed chord analysis, MIDI export, or full piano-roll rewrite.
- No mutation of arrangement blocks, mixer state, sound-design state, master state, or Pattern A/B/C independence beyond retargeting musical pitch/root values.

## Context Map

- `src/domain/workstation.ts`: key scale helpers, pattern data, note/chord event structures, style pattern generation.
- `src/ui/App.tsx`: Key select handler, selected note/chord UI, undoable project update path.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-043-key-retarget-patterns` and `.worktree/plan-043-key-retarget-patterns` for git repository work.
- Retargeting must use editable local musical event data, not generated audio, hidden assets, or sampling.

## Implementation Plan

- [x] Add domain helpers to map pitch names and note pitches from one key to another by nearest scale degree.
- [x] Add a project-level key retarget helper that updates Pattern A/B/C bass, melody, and chord roots while preserving event properties.
- [x] Wire the Key selector through the undoable retarget helper and clear stale note selection.
- [x] Update docs and QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run verify`
- [x] `git diff --check`
- [x] Browser smoke test: changed Key from F minor to A minor, confirmed Pattern A/B/C event counts stayed `A34 / B41 / C26`, visible 808/Synth/chord roots retargeted to A minor, undo restored F minor, playback started/stopped, and console errors were empty.

## Review Plan

QA completes before review starts. Review checks that key retargeting updates all Pattern A/B/C musical pitch/root data, preserves timing/length/velocity/glide/chance, remains undoable, does not mutate arrangement/mixer/sound/master data, and does not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Retarget existing musical events on Key changes instead of only changing the key label. | Beginners need key changes to keep the beat in-key, and producers need fast whole-project transposition without rebuilding patterns manually. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created after confirming the Key selector only changed `project.key`, leaving existing bass, melody, and chord events in the previous key. |
| 2026-06-15 | harness_builder | Added key retarget helpers for note pitches, chord roots, patterns, and whole-project key changes. |
| 2026-06-15 | quality_runner | Ran typecheck, static QA, quality gate, verify, diff check, and Browser smoke. |
| 2026-06-15 | review_judge | Confirmed key retargeting preserves event counts and keeps sampling out of the workflow. |

## Completion Notes

Implemented key retargeting for Pattern A/B/C 808/bass note pitches, melody note pitches, and chord roots. Key changes are undoable, keep timing/length/velocity/glide/chance fields intact, preserve Pattern A/B/C event counts, and remain direct-composition data rather than sampling workflow.
