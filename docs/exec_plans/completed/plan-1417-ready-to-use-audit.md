# plan-1417-ready-to-use-audit

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make the project immediately usable by fixing, improving, and adding the necessary features.

## Goal

Audit the real first-run experience, remove the highest-impact local usability blocker, and prove that a user can launch GrooveForge, create an editable sample-free beat, and reach a valid local export path.

## Non-Goals

- External distribution, notarization, release-channel credentials, or publishing.
- Cloud sync, accounts, analytics, remote AI, payments, or sampling-first workflows.
- Broad cosmetic redesign unrelated to a reproduced first-run blocker.

## Context Map

- `src/ui/App.tsx`: workstation state, commands, and top-level interaction handlers.
- `src/ui/workstationShellPanels.tsx`: first-run and shell-level guidance surfaces.
- `src/domain/workstation.ts`: editable project model and starter project helpers.
- `src/audio/render.ts`: local WAV render path.
- `harness/scripts/run_renderer_smoke.mjs`: renderer/source regression coverage.
- `harness/scripts/run_workflow_smoke.mjs`: first-beat workflow coverage.
- `harness/scripts/run_persona_readiness_smoke.mjs`: beginner and producer readiness evidence.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Preserve the sample-free, event-based, local-first product spine.

## Implementation Plan

- [x] Run baseline source and browser checks against the first-run experience.
- [x] Record the highest-impact reproduced usability blocker in the Decision Log.
- [x] Implement the smallest coherent feature improvement that removes that blocker.
- [x] Add focused automated smoke coverage for the new behavior.
- [x] Run targeted QA followed by the repository QA/verification commands required by `docs/quality/rules.md`.
- [x] Perform a separate review, complete this plan, and create the review mirror.

## QA Plan

- Run the focused smoke command for the affected workflow.
- Run `npm run qa`.
- Run `npm run verify` if the focused and standard QA loops pass.
- Re-open the local app in the browser and confirm the first-run route visually and interactively.

## Review Plan

QA completes before review starts. Review checks beginner clarity, direct-composition invariants, local-only behavior, regression risk, and test evidence.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-12 | Start with an evidence-based first-run audit before choosing the feature change. | The repository already has extensive functionality; implementation should target a reproduced user blocker instead of adding another disconnected surface. |
| 2026-07-12 | Add a compact launchpad to the existing transport brand column. | At 1280×720 the first viewport showed a large empty area and a fully populated 26-bar demo without a clear primary start action; the brand column can expose existing starter helpers without adding another deep workflow panel. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-12 | project_lead | Plan created on the dedicated feature worktree. |
| 2026-07-12 | repo_cartographer | Baseline QA passed and browser inspection reproduced the unclear first-run entry point. |
| 2026-07-12 | harness_builder | Added first-run launchpad actions for guided 8-bar, producer pass, and existing-project open, plus renderer smoke assertions. |
| 2026-07-12 | quality_runner | Typecheck, renderer smoke, workflow smoke, QA, full verify chain, Electron launch, packaging/install, project IO, and final external completion resume packet passed; temporary private input copies were removed. |
| 2026-07-12 | review_judge | Separate diff review found no blocking issues; starter replacement remains undoable and local-only. |

## Completion Notes

Added a visible first-run launchpad in the transport brand column with direct actions for a guided sample-free 8-bar beat, a professional studio pass, and opening an existing project. The actions reuse the existing starter project and native open handlers, so project history, local draft behavior, workflow derivations, and export paths remain consistent.

QA passed for `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run qa`, the full `npm run verify` chain with macOS GUI access and notarization submission disabled, and the final `npm run release:external-completion-resume-packet-smoke` (exit 0). Browser verification confirmed that the launchpad is visible and that the primary action changes the project to `First Guided Beat`, 86 BPM, with Undo enabled. External distribution remains intentionally outside this plan and is not claimed.
