# plan-381-selected-chord-quality-reset

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action that resets the active selected chord quality to the current key's diatonic default quality for that chord root inside the selected Pattern A/B/C slot.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new chord engine.
- No chord root changes, reharmonization, progression replacement, chord generation, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing selected-chord move, root up/down, quality cycle, inversion reset, inversion, length reset, length, velocity, chance, copy, paste, duplicate, delete, audition, Chord Pads, Chord Rhythm Pads, or Chord Voicing Pads.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected chord Quick Action definitions and key-aware default quality derivation.
- `src/ui/App.tsx`: existing selected chord quality update handler and Quick Actions wiring.
- `src/ui/workstationPatternTools.ts`: `chordPadQualityFromDegree` helper used for key-aware chord quality defaults.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected chord edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected chord quality reset scoped to the selected Pattern A/B/C slot.
- Derive the reset target only from the current key, selected chord root, and existing key-aware chord quality helper.
- Disable reset when no active selected chord exists, the selected chord root is outside the current key scale roots, or the selected chord already matches the default quality.
- Route the reset through the existing undoable selected-chord quality update path.
- Keep the chord selected after a successful edit.

## Implementation Plan

- [x] Inspect selected chord quality helpers and Quick Action definitions.
- [x] Add selected-chord quality reset Quick Action using the existing selected-chord quality update path.
- [x] Update README, product docs, quality rules, and static QA expectations.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `git diff --check`
- `npm run typecheck`
- `npm run harness:smoke`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Browser/dev-server visual check if the environment allows localhost.

## Review Plan

QA completes before review starts. Review checks that selected chord quality reset is explicit, selected-pattern scoped, key-aware, undoable, selected-chord preserving, and adds no reharmonization, sampling, hidden generation, or remote scope.

## QA Results

| date | command | result |
|---|---|---|
| 2026-06-19 | `python3 harness/scripts/run_qa.py` | pass |
| 2026-06-19 | `python3 harness/scripts/run_quality_gate.py` | pass |
| 2026-06-19 | `git diff --check` | pass |
| 2026-06-19 | `npm run typecheck` | pass |
| 2026-06-19 | `npm run harness:smoke` | pass |
| 2026-06-19 | `npm run build` | pass |
| 2026-06-19 | `npm run qa` | pass |
| 2026-06-19 | `npm run verify` | pass |
| 2026-06-19 | `npm run dev -- --host 127.0.0.1 --port 5188` | blocked: sandbox returned `listen EPERM`; escalated retry was rejected by policy, so no browser visual check was run |

## Review Results

| date | reviewer | result |
|---|---|---|
| 2026-06-19 | review_judge | pass: reset target is derived from the existing key-aware helper, disabled for inactive/out-of-key/already-default chords, routed through the existing selected-chord quality update path, and does not add schema, render, sampling, hidden generation, or remote scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected chord quality reset to key-aware defaults. | Beginners need a safe way to recover from chord color experiments; producers need fast harmonic cleanup without changing chord root or timing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected chord quality reset Quick Action. |
| 2026-06-19 | harness_builder | Added `selected-chord-quality-reset` Quick Action and synchronized README, product docs, quality rules, and static QA expectations. |
| 2026-06-19 | quality_runner | Standard QA suite passed; localhost browser check was blocked by sandbox/policy. |
| 2026-06-19 | review_judge | Post-QA review found no follow-up changes required. |
