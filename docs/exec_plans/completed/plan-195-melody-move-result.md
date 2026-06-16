# plan-195-melody-move-result

## Status

active

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Melody Move Result strip after explicit Melody Motif, Melody Accent, or Melody Contour Pad clicks so users can see which synth melody move was applied, how selected Pattern A/B/C melody note count, rhythm, pitch range, velocity, and chance changed, what to audition next, and which existing selected-note edit surface to check.

## Non-Goals

- Do not change Melody Motif, Melody Accent, or Melody Contour definitions, ranking, apply behavior, project schema, snapshots, save/load, undo/redo, selected-note edit tools, playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add automatic melody writing beyond explicit pad clicks, hidden generation, remote AI, sampling, imported audio, plugin hosting, accounts, analytics, cloud sync, modal tutorials, autoplay, or export triggers.

## Context Map

- `src/ui/App.tsx`: Melody Motif/Accent/Contour apply paths, Melody Move Preview, result state, render placement, result helper functions.
- `src/styles.css`: compact result strip styling and responsive behavior.
- `README.md`: public runtime feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Melody Move Result guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-195-melody-move-result` and `.worktree/plan-195-melody-move-result` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Melody Motif, Accent, and Contour apply behavior, result strip patterns, docs, and harness checks.
- [x] Add UI-local Melody Move Result state populated only after explicit Melody pad clicks.
- [x] Render the result near Melody Move Preview/Pads without changing pad apply behavior or saved project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Melody Move Result renders after Motif/Accent/Contour clicks, reports changed note/rhythm/pitch/velocity/chance posture, clears on no-op/context changes, preserves undoable melody updates, and has no responsive overflow.

## Review Plan

QA completes before review starts. Review checks that the result strip is created only from explicit Melody pad clicks and local before/after selected Pattern A/B/C data, stays UI-local, preserves all Melody pad definitions and apply behavior, avoids hidden generation and sampling-first framing, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add post-click Melody Move Result instead of altering Melody Move Preview or pad behavior. | The feature should confirm explicit user action results without changing the melody composition model or saved schema. |
| 2026-06-17 | Clear stale Melody Move Result on project/view/history changes and no-op Melody pad paths. | The result strip must describe only the latest explicit successful Melody Motif, Accent, or Contour click. |
| 2026-06-17 | Keep Browser smoke blocked after sandbox and escalated dev-server attempts failed. | The environment returned `listen EPERM` for localhost and rejected escalated dev-server execution with an instruction not to work around it. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Melody Move Result. |
| 2026-06-17 | harness_builder | Added UI-local Melody Move Result state, result strip, metrics, and CSS after explicit Melody pad clicks. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality rules, and QA expectations for Melody Move Preview and Result. |
| 2026-06-17 | quality_runner | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify`; Browser smoke was blocked by localhost permission policy. |

## Completion Notes

Melody Move Result is UI-local and appears only after explicit successful Melody Motif, Melody Accent, or Melody Contour Pad clicks. It reports applied move, Pattern A/B/C Synth scope, note/rhythm/range/velocity/chance before-after labels, changed-move impact, audition cue, and next-check text from local before/after selected Pattern melody data. Static QA and production build passed. Browser smoke could not run because localhost dev-server binding was blocked by `EPERM` and escalated execution was rejected with no-workaround guidance.
