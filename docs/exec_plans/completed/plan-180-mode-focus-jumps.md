# plan-180-mode-focus-jumps

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add explicit UI-local Jump controls to Mode Focus cards so Guided mode can send beginners to the current stage, writing focus, or local check, while Studio mode can send producers to the session scan, top issue, or handoff area without changing project data.

## Non-Goals

- Do not change Mode Focus scoring, Composer Guide scoring, Beat Map scoring, Finish Checklist scoring, Review Queue priority, Workflow Navigator behavior, musical events, arrangement, mixer, master, targets, Session Brief, snapshots, playback, save/load, undo/redo, render/export, Quick Actions, or Handoff behavior.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, cloud sync, plugin hosting, or destructive actions.

## Context Map

- `src/ui/App.tsx`: Mode Focus cards, workflow refs, focus/jump handlers, Mode Focus summary derivation.
- `src/styles.css`: Mode Focus layout and responsive card styling.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Mode Focus Jump guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-180-mode-focus-jumps` and `.worktree/plan-180-mode-focus-jumps` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Mode Focus, workflow jump, docs, styles, and QA expectations.
- [x] Add a focus target to each Mode Focus card derived from existing stage, Composer Guide, Finish Checklist, and Review Queue data.
- [x] Render explicit Jump buttons on Mode Focus cards and route clicks through existing panel refs without mutating project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Mode Focus Jump buttons render in Guided and Studio modes, clicking a Jump scrolls to the intended workstation panel, mode toggles still work, scoring text stays unchanged, and no horizontal overflow appears.

## Review Plan

QA completes before review starts. Review checks that Mode Focus Jump derives targets only from existing local summaries, stays UI-local, preserves all scoring and data behavior, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add Mode Focus Jump buttons instead of adding onboarding/tutorial content. | The immediate usability gap is routing from the existing focus summary into the workstation, not more explanatory text. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Mode Focus Jump controls. |
| 2026-06-17 | harness_builder | Added Mode Focus card jump targets, Jump buttons, responsive button styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Ran QA, typecheck, quality gate, verify, diff check, static dist/source token checks, and attempted Browser smoke. Browser smoke was blocked by localhost EPERM and escalated retry rejection. |
| 2026-06-17 | review_judge | Reviewed the implementation after QA and found no issues requiring code changes. |

## Completion Notes

Completed. Guided and Studio Mode Focus cards now include explicit Jump buttons that route to the matching Compose, Arrange, Mix, Master, or Deliver panel through existing local panel refs. Jump targets are derived from existing Beat Map stage ids, Composer Guide focus targets, Finish Checklist focus targets, and Review Queue focus targets. The change does not alter Mode Focus scoring, Composer Guide scoring, Beat Map scoring, Finish Checklist scoring, Review Queue priority, Workflow Navigator behavior, project data, playback, save/load, undo/redo, render/export, Quick Actions, or Handoff behavior.

Validation passed:

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- static dist/source token checks for `mode-focus-jump`

Browser smoke was attempted but blocked by `listen EPERM: operation not permitted 127.0.0.1:5271`; the escalated localhost server retry was rejected by environment policy, so no browser workaround was used.
