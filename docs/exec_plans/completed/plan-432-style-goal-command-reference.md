# plan-432-style-goal-command-reference

## Status

completed

## Owner

project_lead / repo_cartographer

## User Request

Continue toward a completed GrooveForge desktop app that can satisfy working producers such as 그냥노창 or 그루비룸 while staying easy for a first-time composer.

## Goal

Expose the new direct Style Goal Action command family in the in-app Command Reference so beginners can discover guided style-writing moves and experienced producers can scan the command map for fast drums, 808/bass, harmony, melody, arrangement, and finish actions without leaving the workstation.

## Non-Goals

- Do not change Style Goal card derivation, Composer Action behavior, Quick Actions ranking, command execution, or result semantics.
- Do not add new writing generators, audio rendering behavior, project schema fields, playback changes, save/load changes, export changes, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not make Command Reference execute commands; it remains read-only.

## Context Map

- `src/ui/workstationShellPanels.tsx`: static Command Reference sections and rendering.
- `docs/product/product.md`: durable product surface and Command Reference description.
- `docs/quality/rules.md`: QA rule for Command Reference coverage and non-mutation boundary.
- `harness/scripts/run_qa.py`: static QA expectations for docs and command reference surface.
- `README.md`: public product feature summary.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-432-style-goal-command-reference` and `.worktree/plan-432-style-goal-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional.

## Implementation Plan

- [x] Add a read-only Command Reference entry for Style Goal Actions in the Create section.
- [x] Update product docs, README, and quality rules so the command map explicitly covers Style Goal Actions.
- [x] Extend static QA expectations to prevent the new command-map coverage from drifting.
- [x] Run formatting/diff checks plus the documented QA/build/verify commands.
- [x] Review after QA, then complete the plan and mirror the review.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should verify that Command Reference remains UI-local and read-only, the Style Goal Action entry is discoverable in the Create command-map section, docs and static QA expectations match, and no command execution, Composer Action, Style Goal, project schema, playback, export, sampling, remote AI, account, analytics, or cloud behavior changed.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add Command Reference coverage instead of another new writing action. | Style Goal Actions already exist in Quick Actions, but the desktop help map has not caught up; discoverability is a practical gap for beginners and fast producer use. |
| 2026-06-19 | Keep the change as static read-only reference text. | Command Reference should teach command families without triggering mutations or changing command behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | repo_cartographer | Added read-only Style Goal Actions coverage to Command Reference plus docs and QA expectations. |
| 2026-06-19 | quality_runner | QA passed: git diff --check, run_qa, quality_gate, typecheck, build, npm qa, and npm verify. |
| 2026-06-19 | review_judge | Review found no issues; change is read-only command-map coverage plus docs/static QA expectations. |

## Completion Notes

Added Style Goal Actions to the read-only Command Reference Create section, updated README/product/quality docs, and extended static QA expectations. No command execution, Composer Action, Style Goal derivation, project schema, playback, export, sampling, remote AI, account, analytics, or cloud behavior changed.
