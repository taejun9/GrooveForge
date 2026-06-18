# plan-369-selected-music-length-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add direct Quick Actions for selected 808/Synth note length, selected 808 glide, and selected chord length so users can make articulation and duration corrections from the command palette without leaving the current writing flow.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new audio engines.
- No broad articulation generator, auto-composition, command chains, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing grid controls, Keyboard Capture defaults, 808 Glide Pads, Chord Rhythm/Voicing Pads, Pattern DNA, Pattern A/B/C independence, or copy/audition behavior.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected note, drum, and chord command definitions.
- `src/ui/App.tsx`: selected note/chord update handlers and Quick Actions wiring.
- `src/ui/workstationPatternTools.ts`: shared step-length clamp and chord update helpers.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected-note/chord QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Route selected note length/glide changes through the existing selected-note update paths.
- Route selected chord length changes through the existing selected-chord event update path.
- Keep actions scoped to the selected Pattern A/B/C slot and disabled when no active selected event exists.

## Implementation Plan

- [x] Add selected-note length shorter/longer Quick Actions with current/next length detail and disabled edge states.
- [x] Add selected 808 glide toggle Quick Action with bass-only availability.
- [x] Add selected-chord length shorter/longer Quick Actions with current/next length detail and disabled edge states.
- [x] Wire the new actions through existing handlers in `App.tsx`.
- [x] Update README, product docs, quality rules, and static QA expectations.

## QA Plan

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run harness:smoke` passed: 10/10 Beat Blueprints and 10/10 style profiles.
- `npm run build` passed.
- `npm run qa` passed.
- `npm run verify` passed.
- Browser/dev-server visual check attempted with `npm run dev -- --host 127.0.0.1 --port 5176`; sandboxed run failed with `listen EPERM`, and escalated retry was rejected by environment policy.

## Review Plan

QA completes before review starts. Review checks that selected-note/chord length and selected 808 glide commands are scoped to the selected Pattern A/B/C slot, preserve existing event fields, reuse existing explicit update paths, keep copy/audition semantics unchanged, respect length/glide edge states, and add no sampling or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add command-palette articulation nudges instead of a new editor surface. | Note/chord length and 808 glide already exist in the inspector; command access makes fast micro-edits easier for producers and more discoverable for beginners without schema churn. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected music length and glide Quick Actions. |
| 2026-06-19 | harness_builder | Added selected-note length, selected 808 glide, and selected-chord length Quick Actions through existing selected event update paths. |
| 2026-06-19 | quality_runner | QA, quality gate, diff check, typecheck, smoke, build, qa, and verify passed; localhost visual QA was blocked by environment policy. |
| 2026-06-19 | review_judge | Reviewed selected Pattern scope, disabled edge states, existing update path reuse, optional glide handling, and non-sampling boundary; fixed absent-glide handling before final QA rerun. |

## Completion Notes

Completed. Selected 808/Synth notes now expose Quick Actions to shorten/lengthen note duration, and selected 808 notes expose a glide toggle through the existing selected-note update path. Selected chords now expose Quick Actions to shorten/lengthen chord duration through the existing selected-chord event update path. README, product docs, quality rules, and static QA expectations describe and guard the expanded selected music articulation editing surface. No project schema, playback scheduling, render/export, sampling, imported audio, or remote scope changed.
