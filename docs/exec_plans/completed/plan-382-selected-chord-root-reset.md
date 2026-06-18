# plan-382-selected-chord-root-reset

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action that resets the active selected chord root to the current key's tonic root inside the selected Pattern A/B/C slot.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new chord engine.
- No chord quality, inversion, timing, length, velocity, chance, progression replacement, reharmonization, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting changes.
- No change to existing selected-chord root down/up, quality reset/cycle, inversion reset, inversion, length reset, length, velocity, chance, copy, paste, duplicate, delete, audition, Chord Pads, Chord Rhythm Pads, or Chord Voicing Pads.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected chord Quick Action definitions and key tonic root derivation.
- `src/ui/App.tsx`: existing selected chord root update handler and Quick Actions wiring.
- `src/domain/workstation.ts`: `scalePitchNames` key root source.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected chord edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected chord root reset scoped to the selected Pattern A/B/C slot.
- Derive the reset target only from the current key's scale roots.
- Disable reset when no active selected chord exists, no key tonic root is available, or the selected chord root already matches the tonic root.
- Route the reset through the existing undoable selected-chord root update path.
- Keep the chord selected after a successful edit.

## Implementation Plan

- [x] Inspect selected chord root helpers and Quick Action definitions.
- [x] Add selected-chord root reset Quick Action using the existing selected-chord root update path.
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

QA completes before review starts. Review checks that selected chord root reset is explicit, selected-pattern scoped, key-aware, undoable, selected-chord preserving, and adds no quality changes, reharmonization, sampling, hidden generation, or remote scope.

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
| 2026-06-19 | `npm run dev -- --host 127.0.0.1 --port 5189` | blocked: sandbox returned `listen EPERM`; escalated retry was rejected by policy, so no browser visual check was run |

## Review Results

| date | reviewer | result |
|---|---|---|
| 2026-06-19 | review_judge | pass: reset target comes from the current key scale root list, root reset routes through the existing selected-chord root update path, only the chord root changes, and no schema, render, sampling, hidden generation, or remote scope was added. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected chord root reset to key tonic. | Beginners need a safe way to recover from root experiments; producers need fast anchor cleanup without replacing chord quality, timing, or the full progression. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected chord root reset Quick Action. |
| 2026-06-19 | harness_builder | Added `selected-chord-root-reset` Quick Action and synchronized README, product docs, quality rules, and static QA expectations. |
| 2026-06-19 | quality_runner | Standard QA suite passed; localhost browser check was blocked by sandbox/policy. |
| 2026-06-19 | review_judge | Post-QA review found no follow-up changes required. |
