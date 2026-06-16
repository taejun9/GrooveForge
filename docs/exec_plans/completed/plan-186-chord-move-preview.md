# plan-186-chord-move-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Chord Move Preview inside Chord Editor that shows the selected chord, suggested harmonic pad, rhythm posture, voicing target, and pre-click move counts before users apply Chord Pads, Chord Rhythm Pads, or Chord Voicing Pads, so beginners understand chord-writing changes and producers can verify harmony direction quickly.

## Non-Goals

- Do not change Chord Pad, Chord Rhythm, or Chord Voicing definitions, ranking, apply behavior, chord event schema, progression presets, selected-chord editing tools, Pattern A/B/C independence, save/load, snapshots, undo/redo, playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add automatic chord writing, hidden generation, remote AI, sampling, imported audio, plugin hosting, accounts, analytics, cloud sync, modal tutorials, or destructive actions.

## Context Map

- `src/ui/App.tsx`: chord pad/rhythm/voicing option derivation, Chord Editor rendering, selected chord helpers.
- `src/styles.css`: Chord Editor layout.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Chord Move Preview guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-186-chord-move-preview` and `.worktree/plan-186-chord-move-preview` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Chord Editor, Chord Pad/Rhythm/Voicing option data, docs, styles, and QA expectations.
- [x] Add a UI-local Chord Move Preview derived from selected chord state and existing chord pad/rhythm/voicing options.
- [x] Render the preview without changing chord buttons, option definitions, apply behavior, or saved project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Chord Move Preview renders, shows selected chord or selection-needed state, updates after chord pad/rhythm/voicing clicks, chord buttons still apply through undoable paths, manual Chord Editor controls remain editable, and no horizontal overflow appears.

## Review Plan

QA completes before review starts. Review checks that the preview derives only from local selected chord state and existing chord pad/rhythm/voicing option targets, stays UI-local, preserves all apply behavior, avoids hidden generation and sampling-first framing, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a read-only Chord Move Preview instead of changing chord pad targets or applying suggested moves automatically. | The usability gap is understanding harmonic, rhythm, and voicing changes before clicking, not changing the chord editing model. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Chord Move Preview. |
| 2026-06-17 | harness_builder | Added Chord Move Preview summary, rendering, responsive styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Ran QA, typecheck, quality gate, verify, diff check, static dist/source token checks, and attempted Browser smoke. Browser smoke was blocked by localhost EPERM and escalated retry rejection. |
| 2026-06-17 | review_judge | Reviewed the implementation after QA and found no issues requiring code changes. |

## Completion Notes

Completed. Chord Editor now includes a UI-local Chord Move Preview showing the selected chord, harmonic role, suggested chord pad, rhythm posture, voicing target, and pre-click move counts before Chord Pad, Chord Rhythm, or Chord Voicing actions are applied. The preview derives from current local key, selected Pattern A/B/C chord event data, and existing Chord Pad/Rhythm/Voicing options, stays out of saved project data and undo history, and preserves chord option definitions, apply behavior, progression presets, selected-chord edit tools, Pattern A/B/C independence, project files, snapshots, realtime playback, WAV/stem/MIDI export, Handoff Sheet, and Handoff Pack semantics.

Validation passed:

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- static dist/source token checks for `chord-move-preview`

Browser smoke was attempted but blocked by `listen EPERM: operation not permitted 127.0.0.1:5277`; the escalated localhost server retry was rejected by environment policy, so no browser workaround was used.
