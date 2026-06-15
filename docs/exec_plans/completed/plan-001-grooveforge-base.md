# plan-001-grooveforge-base

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Bootstrap the base project structure for `GrooveForge` from the attached project brief.

## Goal

Create an agent-readable repository base for a web-first, event-based mini DAW / beat workstation where direct beat composition is central and sampling is optional.

## Non-Goals

- Implement product features.
- Install the Next.js/TypeScript app stack.
- Add unverified package commands.
- Add broad permissions, trackers, ads, cloud sync, payments, or remote AI calls.

## Context Map

- `AGENTS.md`: concise agent map and GrooveForge invariants.
- `README.md`: public entry point, MVP target, runnable base commands, and repository layout.
- `docs/product/product.md`: product definition, users, features, MVP, roadmap, non-goals, and constraints.
- `docs/architecture/product-architecture.md`: product layers, stack assumption, data model direction, track types, scheduling, and export rules.
- `docs/architecture/harness.md`: agent harness and worktree lifecycle.
- `docs/quality/rules.md`: planning, QA/review, safety, commands, and product QA gates.
- `docs/privacy/principles.md`: local-first data, audio/sample handling, and AI boundaries.
- `docs/references/official-sources.md`: official source registry and source gaps.
- `harness/scripts/run_qa.py`: base QA script.
- `harness/scripts/run_quality_gate.py`: strict base quality gate.

## Constraints

- QA and review are separate loops.
- Do not create or use `docs/plan`.
- Do not implement, commit, or push feature work directly on `main`.
- Future repository work should use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>`.
- Official-source-dependent facts must be recorded in `docs/references/official-sources.md`.

## Implementation Plan

- [x] Create base repository map.
- [x] Create durable docs directories.
- [x] Create harness templates.
- [x] Replace placeholder commands with runnable base validation commands.
- [x] Record official sources for stack candidates and audio/domain references.
- [x] Add GrooveForge-specific product and architecture docs.
- [x] Add QA and quality-gate scripts.
- [x] Add completion review mirror.

## QA Plan

- Verify base files exist.
- Verify README and AGENTS agree with the repository layout.
- Verify plan paths use `docs/exec_plans/active/` and `docs/exec_plans/completed/`.
- Verify `docs/plan` is absent.
- Verify root Markdown is limited to `README.md` and `AGENTS.md`.
- Verify official sources no longer contain placeholder rows.

## Review Plan

QA completes before review starts. Review mirror is recorded in `docs/reviews/plan-001-grooveforge-base-review.md`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Use the agent-readable base scaffold. | The repo was empty and needed durable project, quality, reference, and harness structure. |
| 2026-06-15 | Center the product docs on editable musical events. | The brief explicitly redirects the project away from a sampling-first app toward direct beat composition and sound design. |
| 2026-06-15 | Keep package-manager commands out of README for now. | No app stack is installed yet, so documenting npm commands would be false. |
| 2026-06-15 | Treat the unborn `main` branch as an initial-bootstrap exception. | There is no initial commit to branch from; future implementation work must use the documented worktree flow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Base scaffold created. |
| 2026-06-15 | repo_cartographer | Product and architecture docs adapted to GrooveForge. |
| 2026-06-15 | harness_builder | Added base QA and strict quality-gate scripts. |
| 2026-06-15 | quality_runner | `python3 harness/scripts/run_qa.py` passed before completion. |

## Completion Notes

The base is complete. The next implementation task should start as `docs/exec_plans/active/plan-002-<task>.md`.
