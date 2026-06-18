# plan-367-selected-music-velocity-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add direct Quick Actions for selected 808/Synth note velocity and selected chord velocity so users can make small musical dynamics corrections from the command palette without leaving the current editing flow.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new audio engines.
- No broad velocity-generation system, auto-humanize pass, hidden composition, command chains, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing drum velocity Quick Actions, note/chord grid controls, chord voicing pads, Melody Move, 808 Move, Chord Move, Pattern DNA, or Pattern A/B/C independence.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected note, drum, and chord command definitions.
- `src/ui/App.tsx`: selected note/chord update handlers, Quick Actions wiring, and result copy.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected-note/chord QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Route note velocity changes through the existing selected-note velocity update path.
- Route chord velocity changes through the existing selected-chord event update path.
- Keep copy and audition commands UI-local until a separate explicit write command runs.

## Implementation Plan

- [x] Add selected-note velocity down/up Quick Actions with current/next velocity detail and disabled edge states.
- [x] Add selected-chord velocity down/up Quick Actions with current/next velocity detail and disabled edge states.
- [x] Wire the new actions through existing handlers in `App.tsx`.
- [x] Update README, product docs, quality rules, and static QA expectations.

## QA Plan

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed after replacing the active-plan placeholder completion note.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run harness:smoke` passed: 10/10 Beat Blueprints and 10/10 style profiles.
- `npm run build` passed.
- `npm run qa` passed.
- `npm run verify` passed.
- Browser/dev-server visual check attempted with `npm run dev -- --host 127.0.0.1 --port 5174`; sandboxed run failed with `listen EPERM`, and escalated retry was rejected by environment policy.

## Review Plan

QA completes before review starts. Review checks that selected-note/chord velocity commands are scoped to the selected Pattern A/B/C slot, preserve existing note/chord fields, reuse existing explicit update paths, keep copy/audition semantics unchanged, and add no sampling or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add command-palette velocity nudges instead of a new dynamics panel. | The grid already exposes velocity visually; command access makes small dynamics correction faster for producers and easier to discover for beginners without schema churn. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected music velocity Quick Actions. |
| 2026-06-19 | harness_builder | Added selected-note and selected-chord velocity Quick Actions through existing selected event update paths. |
| 2026-06-19 | quality_runner | QA, quality gate, typecheck, smoke, build, qa, and verify passed; localhost visual QA was blocked by environment policy. |

## Completion Notes

Completed. Selected 808/Synth notes now expose Quick Actions to soften or punch velocity through the existing selected-note velocity update path. Selected chords now expose Quick Actions to soften or lift velocity through the existing selected-chord event update path. README, product docs, quality rules, and static QA expectations describe and guard the expanded selected music velocity editing surface. No project schema, playback, render/export, sampling, imported audio, or remote scope changed.
