# plan-168-quick-actions-scope-filter

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add explicit scope filters to Quick Actions so beginners can narrow the command palette to Compose, Arrange, Mix, Master, Project, or Export commands and producers can execute dense workstation commands faster.

## Non-Goals

- Do not change any Quick Action command behavior, keyboard shortcut behavior, command search token behavior, Composer Actions, Next Move, Beat Map, Review Queue, Finish Checklist, Mix Coach, export analysis, stem analysis, audio scheduling, render/export output, project schema, save/load migration, Pattern A/B/C event data, arrangement data, mixer/master values, snapshots, or Handoff data.
- Do not auto-run commands, auto-play audio, auto-save, auto-export, mutate project data from filtering, hide commands permanently, or add command macros.
- Do not add sampling, imported audio, waveform analysis, remote AI, accounts, analytics, cloud sync, plugin hosting, or collaboration services.

## Context Map

- `src/ui/App.tsx`: QuickAction type, QuickActions modal, filtering, Quick Action creation, command result flow.
- `src/styles.css`: Quick Actions modal and filter controls.
- `README.md`: Quick Actions product summary.
- `docs/product/product.md`: Quick Actions feature description.
- `docs/quality/rules.md`: Quick Actions scope filter guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-168-quick-actions-scope-filter` and `.worktree/plan-168-quick-actions-scope-filter` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Quick Action data model, modal rendering, and filtering.
- [x] Add UI-local Quick Action scope filter state and deterministic scope metadata for existing commands.
- [x] Render explicit scope filter controls and result count without changing command behavior or search tokens.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Local browser smoke for Quick Actions open/close, scope filters, filtered command count, search plus scope interaction, command execution still explicit, no auto-run/autoplay/export, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks scope metadata derivation, UI-local filter state only, no command behavior changes, no search regression, no shortcut regression, no command hiding outside the active filter, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add Quick Actions scope filters without changing command execution. | The command palette is central to a pro desktop workflow, while explicit scope filters make the dense action set easier for beginners to scan. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Quick Actions Scope Filter. |
| 2026-06-17 | harness_builder | Added UI-local Quick Actions scope state, scope-derived live counts, modal scope controls, docs, quality guardrails, and QA source/CSS expectations. |
| 2026-06-17 | quality_runner | Initial `python3 harness/scripts/run_qa.py` and `npm run typecheck` pass after harness expectation alignment. |
| 2026-06-17 | quality_runner | Full QA passed: `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. Browser smoke passed for Quick Actions open, scope filters, live counts, search plus scope, explicit master finish command click, no console warnings/errors, and no horizontal overflow. |
| 2026-06-17 | review_judge | Review found no blocking issues. Scope filters remain UI-local, derive from existing Quick Action groups/ids, preserve search token matching, and leave command handlers unchanged. |

## Completion Notes

Completed Quick Actions Scope Filters for All, Transport, Compose, Arrange, Mix, Master, Project, and Export with live counts and scoped visible command results. Filtering is UI-local, resets when Quick Actions opens, preserves explicit command clicks and Enter behavior within the visible filtered list, and does not change project schema, saved project data, sampling scope, export behavior, or command handlers.
