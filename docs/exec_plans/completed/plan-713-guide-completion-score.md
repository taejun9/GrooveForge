# plan-713-guide-completion-score

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Add a UI-local Beat Completion Score to Guide Quick Start so beginners can see how close the current beat is to a usable export path and producers can scan session completeness quickly, without mutating project data or expanding sampling scope.

## Non-Goals

- Do not add onboarding, tutorials, modal help, hidden generation, automatic fixes, auto-export, or command chains.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, Handoff Sheet, Quick Actions execution, or Command Reference behavior.
- Do not add sampling, imported audio, audio clips, sampler devices, sample browsing, remote AI, accounts, analytics, cloud sync, platform compliance, or publishing/licensing claims.

## Context Map

- `src/ui/workstationGuidancePanels.tsx` renders Guide Quick Start and owns guide-local decision, priority, context, and result helpers.
- `src/ui/App.tsx` derives `FirstBeatPathSummary`, `SessionPassSummary`, `WorkflowSpotlightSummary`, and Quick Actions metadata.
- `src/ui/workstationUiModel.ts` owns exported guide-related types.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-713-guide-completion-score` and `.worktree/plan-713-guide-completion-score` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Derive a Guide Quick Start completion score from existing First Beat Path, Session Pass, and Workflow Spotlight readiness signals.
- [x] Render the score as a read-only Guide Quick Start readout with current blocker/review/ready posture and next check.
- [x] Update docs and harness expectations to pin the UI-local, non-mutating, sample-free scope.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that the completion score is derived only from existing local guide/readiness signals, stays UI-local and read-only, and does not change project data, playback, export, Quick Actions execution, remote behavior, or sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add Beat Completion Score inside Guide Quick Start. | The existing guide already combines beginner path and producer session scan, so a read-only score there improves first-read usability without adding another workflow surface. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Guide Quick Start Beat Completion Score. |
| 2026-06-25 | harness_builder | Added a read-only Guide Quick Start Beat Completion Score derived from existing path, session, and workflow readiness tones, plus responsive styles, docs, and harness coverage. |
| 2026-06-25 | quality_runner | Ran git diff --check, run_qa.py, typecheck, quality gate, build, npm QA, and verify; all passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Reviewed the diff and confirmed the score is UI-local/read-only, creates no new command execution path, and leaves App/domain/audio/package files untouched. |

## Completion Notes

- Added a Guide Quick Start Beat Completion Score that displays percent complete, blocker/review/ready status, readiness metric, and next-check text.
- The score derives only from existing First Beat Path step tones, Session Pass card tones, visible Workflow Navigator item tones, and Workflow Spotlight fallback tone.
- Updated responsive styles, README, product notes, quality rules, and harness expectations.
- Preserved direct beat composition as the product center and kept sampling, imported audio, sampler devices, remote AI, accounts, analytics, and cloud sync out of scope.
- Validation passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`.
