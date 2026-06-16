# plan-190-pattern-stack-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Pattern Stack Preview inside the Drums pattern editor that shows the selected Pattern A/B/C 808/chord/Synth posture, suggested Pattern Stack target, and pre-click move counts before users apply Pattern Stack Pads. Beginners should understand that a stack rewrites multiple musical layers, and producers should scan the low-end/harmony/top-line change quickly.

## Non-Goals

- Do not change Pattern Stack definitions, ranking, apply behavior, bass/chord/melody schemas, selected-note or selected-chord edit tools, Pattern A/B/C independence, save/load, snapshots, undo/redo, playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add automatic arrangement writing, hidden generation, remote AI, sampling, imported audio, plugin hosting, accounts, analytics, cloud sync, modal tutorials, or destructive actions.

## Context Map

- `src/ui/App.tsx`: Pattern Stack option derivation, pad rendering, stack apply path, bass/chord/melody comparison helpers.
- `src/styles.css`: Pattern Stack pad layout and compact preview styling.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Pattern Stack Preview guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-190-pattern-stack-preview` and `.worktree/plan-190-pattern-stack-preview` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Pattern Stack option data, docs, styles, and QA expectations.
- [x] Add a UI-local Pattern Stack Preview derived from current selected Pattern A/B/C bass notes, chord events, melody notes, and existing Pattern Stack targets.
- [x] Render the preview without changing Pattern Stack buttons, option definitions, apply behavior, or saved project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Pattern Stack Preview renders, shows current stack posture, updates after Pattern Stack clicks, Pattern Stack buttons still apply through undoable paths, existing Pattern A/B/C editing remains independent, and no horizontal overflow appears.

## Review Plan

QA completes before review starts. Review checks that the preview derives only from local key, selected Pattern A/B/C bass/chord/melody data, and existing Pattern Stack option targets, stays UI-local, preserves all apply behavior, avoids hidden generation and sampling-first framing, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a read-only Pattern Stack Preview instead of changing Pattern Stack targets or auto-applying suggestions. | The usability gap is seeing multi-layer 808/chord/Synth replacement scope before clicking, not changing the explicit stack editing model. |
| 2026-06-17 | Prefer an already aligned stack before suggesting a different stack. | If the selected Pattern A/B/C already matches a Pattern Stack target, the preview should report aligned status instead of nudging toward the first different stack. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Pattern Stack Preview. |
| 2026-06-17 | repo_cartographer | Inspected Pattern Stack option creation, apply behavior, docs, quality rules, and harness expectations. |
| 2026-06-17 | harness_builder | Added a UI-local Pattern Stack Preview before Pattern Stack Pads, plus doc and harness guardrails. |
| 2026-06-17 | quality_runner | Ran static QA, typecheck, quality gate, verify/build, diff whitespace, and dist token checks. Browser smoke was blocked by localhost listen permission. |
| 2026-06-17 | review_judge | Reviewed the preview path for UI-local derivation, aligned-stack behavior, apply behavior preservation, schema safety, and no sampling/cloud/AI scope; no findings. |

## Completion Notes

Pattern Stack Preview now appears before Pattern Stack Pads and summarizes the selected Pattern A/B/C 808/chord/Synth event counts, the current or suggested Pattern Stack target, target layer counts, and pre-click move counts. It derives from the current key, selected Pattern data, and existing Pattern Stack targets only, stays out of project schema and undo history, and preserves Pattern Stack apply behavior.

QA passed:

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- `rg -l "pattern-stack-preview|Suggested stack|Stack aligned|Start stack|data-preview-pattern-stack" dist`

Browser smoke was attempted with `npm run dev -- --host 127.0.0.1 --port 5281`, but the dev server failed with `listen EPERM`. The required escalated retry was rejected by policy, so no localhost Browser smoke was possible in this environment.
