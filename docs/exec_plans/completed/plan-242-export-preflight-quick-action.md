# plan-242-export-preflight-quick-action

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop app that working composers/producers can respect while staying easy for first-time composers.

## Goal

Add a Quick Actions command that focuses the current highest-priority Export Preflight card. This gives beginners a direct delivery-risk command before export and gives producers a fast command-palette route to the most relevant send/export blocker.

## Non-Goals

- Do not change Export Preflight card derivation, scoring, status, file names, render/download handlers, or export contents.
- Do not auto-fix, auto-render, auto-export, trigger playback, save, or mutate project data.
- Do not change project schema, undo history, Handoff Pack behavior, sampling scope, accounts, analytics, cloud sync, or remote AI.
- Do not create a new delivery review surface; reuse the existing Export Preflight Focus handler.

## Context Map

- `src/ui/App.tsx`: Quick Actions, Export Preflight, `focusExportPreflightCard`, and Quick Action result strips.
- `README.md`: current product feature summary.
- `docs/product/product.md`: durable feature definitions and MVP scope.
- `docs/quality/rules.md`: Quick Actions and Export Preflight Focus rules.
- `harness/scripts/run_qa.py`: static expectations for docs and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary; this is delivery-risk navigation UX only.

## Implementation Plan

- [x] Inspect existing Export Preflight focus behavior and Quick Actions focus-only commands.
- [x] Add an `export-preflight-focus` Quick Action derived from the current highest-priority Export Preflight card.
- [x] Route the command through `focusExportPreflightCard` and disable it when no Export Preflight card exists.
- [x] Add a focus-only Quick Action result metric/follow-up for the command.
- [x] Update README, product docs, quality rules, and static QA expectations.
- [x] Run QA and review before merge.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run typecheck`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run verify`
- Attempt local dev server smoke if needed for UI validation; record environment blockers.

## Review Plan

QA completes before review starts. Review checks that the command is UI-local, explicit, searchable, disabled without a card, reuses the existing Export Preflight focus handler, preserves Export Preflight scoring/export contents, and does not mutate project data or introduce sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a top Export Preflight focus Quick Action. | Export Preflight already identifies delivery risk; command-palette access helps beginners find the export blocker and producers run a fast pre-send scan. |
| 2026-06-17 | Reuse the existing preflight card priority of danger, then warn, then first card. | Session Pass already used this delivery-risk priority; sharing it prevents divergent command-palette behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Created plan from the persistent goal and existing Export Preflight/Quick Actions surfaces. |
| 2026-06-17 | harness_builder | Added `export-preflight-focus` to Quick Actions, routed it through `focusExportPreflightCard`, and added UI-only result metric/follow-up copy. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for Export Preflight Quick Action coverage. |
| 2026-06-17 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run typecheck`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, and `npm run verify`. |
| 2026-06-17 | quality_runner | Browser smoke was blocked because `npm run dev` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; escalated retry was rejected by the environment policy. |
| 2026-06-17 | review_judge | Review found no blocking issues; command remains explicit, UI-local, and derived from the existing highest-priority Export Preflight card. |

## Completion Notes

Completed implementation, QA, and review. The only unresolved validation gap is local browser smoke because the environment denied starting the Vite dev server on `127.0.0.1:5173`.
