# plan-185-sound-focus-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Sound Focus Preview inside Sound Designer that shows the suggested tone posture, target focus, key parameter targets, and pre-click move count before users apply Punch, Warm, Air, or Space Sound Focus Pads, so beginners understand the sound-design change and producers can verify tonal direction quickly.

## Non-Goals

- Do not change Sound Focus Pad definitions, apply behavior, SoundDesign schema, sound preset behavior, manual Studio tone controls, Drum Kit Pads, mixer/master semantics, project save/load, snapshots, undo/redo, playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add automatic applying, remote AI, sample browsing, imported audio, plugin hosting, accounts, analytics, cloud sync, modal tutorials, or destructive actions.

## Context Map

- `src/ui/App.tsx`: Sound Focus pad definitions/options, Sound Designer rendering, SoundDesign update path.
- `src/styles.css`: Sound Designer and Sound Focus layout.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Sound Focus Preview guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-185-sound-focus-preview` and `.worktree/plan-185-sound-focus-preview` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Sound Designer, Sound Focus Pads, docs, styles, and QA expectations.
- [x] Add a UI-local Sound Focus Preview derived from current editable SoundDesign state and existing Sound Focus Pad options.
- [x] Render the preview without changing Sound Focus buttons, pad definitions, apply behavior, or saved project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Sound Focus Preview renders, shows the suggested tone posture or aligned state, updates after Sound Focus clicks, Sound Focus buttons still apply through undoable paths, manual Studio tone controls remain editable, and no horizontal overflow appears.

## Review Plan

QA completes before review starts. Review checks that the preview derives only from local SoundDesign state and existing Sound Focus Pad targets, stays UI-local, preserves all pad/apply behavior, avoids sampling-first framing, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a read-only Sound Focus Preview instead of changing pad targets or applying a focus automatically. | The gap is understanding direct sound-design tone posture before clicking, not changing the local sound engine model. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Sound Focus Preview. |
| 2026-06-17 | harness_builder | Added Sound Focus Preview summary, rendering, responsive styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Ran QA, typecheck, quality gate, verify, diff check, static dist/source token checks, and attempted Browser smoke. Browser smoke was blocked by localhost EPERM and escalated retry rejection. |
| 2026-06-17 | review_judge | Reviewed the implementation after QA and found no issues requiring code changes. |

## Completion Notes

Completed. Sound Designer now includes a UI-local Sound Focus Preview showing the suggested tone posture, focus label, key target values, and pre-click move count before Punch, Warm, Air, or Space Sound Focus Pads are applied. The preview derives from current local editable `SoundDesign` state and existing Sound Focus Pad targets, stays out of saved project data and undo history, and preserves Sound Focus Pad definitions, apply behavior, sound presets, manual Studio tone controls, Drum Kit Pads, musical events, arrangement, mixer/master, project files, snapshots, realtime playback, WAV/stem/MIDI export, Handoff Sheet, and Handoff Pack semantics.

Validation passed:

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- static dist/source token checks for `sound-focus-preview`

Browser smoke was attempted but blocked by `listen EPERM: operation not permitted 127.0.0.1:5276`; the escalated localhost server retry was rejected by environment policy, so no browser workaround was used.
