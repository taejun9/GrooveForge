# plan-181-workflow-spotlight

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Workflow Spotlight readout to Workflow Navigator that shows the first workflow zone needing attention, ready/review/blocker counts, and the exact Jump target, so beginners can keep the beat-making path clear and producers can scan session bottlenecks quickly.

## Non-Goals

- Do not change Workflow Navigator item derivation, jump behavior, Mode Focus, Mode Focus Jump, Beat Map scoring, Export Preflight scoring, Composer Guide, Review Queue, Finish Checklist, Next Move recommendations, project data, playback, save/load, undo/redo, render/export, Quick Actions, or Handoff behavior.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, cloud sync, plugin hosting, or destructive actions.

## Context Map

- `src/ui/App.tsx`: Workflow Navigator items, component rendering, workflow zone jump handler.
- `src/styles.css`: Workflow Navigator layout and responsive styling.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Workflow Spotlight guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-181-workflow-spotlight` and `.worktree/plan-181-workflow-spotlight` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Workflow Navigator, docs, styles, and QA expectations.
- [x] Add a UI-local Workflow Spotlight summary derived only from existing Workflow Navigator items.
- [x] Render the spotlight without changing jump behavior or project state.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Workflow Spotlight renders, shows the first non-good zone or clear state, counts match visible navigator items, Jump target text matches the chosen card, Workflow Navigator buttons still scroll, mode toggles still work, and no horizontal overflow appears.

## Review Plan

QA completes before review starts. Review checks that Workflow Spotlight derives only from existing Workflow Navigator items, stays UI-local, preserves all scoring and jump behavior, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a Workflow Spotlight readout instead of changing Workflow Navigator ordering. | The gap is clarity about the next bottleneck, not a new workflow model or ranking system. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Workflow Spotlight. |
| 2026-06-17 | harness_builder | Added Workflow Spotlight summary, responsive styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Ran QA, typecheck, quality gate, verify, diff check, static dist/source token checks, and attempted Browser smoke. Browser smoke was blocked by localhost EPERM and escalated retry rejection. |
| 2026-06-17 | review_judge | Reviewed the implementation after QA and found no issues requiring code changes. |

## Completion Notes

Completed. Workflow Navigator now includes a UI-local Workflow Spotlight that shows the first blocker or review zone, the exact jump target, and ready/review/blocker counts derived only from the visible Workflow Navigator items. The change preserves Workflow Navigator item derivation, item order, jump behavior, Mode Focus, Mode Focus Jump, Beat Map scoring, Export Preflight scoring, Composer Guide, Review Queue, Finish Checklist, Next Move recommendations, project data, playback, save/load, undo/redo, render/export, Quick Actions, and Handoff behavior.

Validation passed:

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- static dist/source token checks for `workflow-spotlight`

Browser smoke was attempted but blocked by `listen EPERM: operation not permitted 127.0.0.1:5272`; the escalated localhost server retry was rejected by environment policy, so no browser workaround was used.
