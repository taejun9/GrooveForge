# plan-667-beat-passport-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, and report completion progress after each task.

## Goal

Mark Beat Passport as a readout-backed Quick Actions entry in Command Reference so users can discover the existing local beat identity summary, Focus Readout action, Beat Passport focus command, direct metric commands, and local Focus Result feedback from the Guide command map.

## Non-Goals

- Do not change Beat Passport metric derivation, scoring, metric order, focus routing, or result labels.
- Do not change Quick Actions command execution semantics.
- Do not change project data, saved schema, playback, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add tutorials, macros, auto-run, hidden generation, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Beat Passport summary, Focus Readout action, direct metric focus commands, and UI-local Focus Result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-667-beat-passport-command-reference` and `.worktree/plan-667-beat-passport-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Update the Guide Command Reference row for Beat Passport to show `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Beat Passport command-map coverage without expanding scope.
- [x] Add harness expectations that pin the row and the direct-composition/local-only boundaries.

## QA Plan

| command | result |
|---|---|
| `git diff --check` | Pass. |
| `python3 harness/scripts/run_qa.py` | Pass after moving the product-only command-map coverage expectation from the README expectation block into the product expectation block. |
| `npm run typecheck` | Pass. |
| `python3 harness/scripts/run_quality_gate.py` | Pass after the same harness expectation fix. |
| `npm run build` | Pass. Existing Vite large-chunk warning only. |
| `npm run qa` | Pass. |
| `npm run verify` | Pass. Quality gate, runtime smoke, typecheck, and build passed; runtime smoke reported 14/14 sample-free blueprints and 14/14 supported styles. Existing Vite large-chunk warning only. |

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Beat Passport derivation, focus routing, Quick Actions execution, project data, playback/export, sampling, and remote boundaries are preserved.

Review result: passed. No findings. The implementation changes only the Command Reference Beat Passport shortcut label plus aligned README, product, quality, and harness text; `src/ui/App.tsx` and Beat Passport derivation/focus/result handlers were not changed.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Beat Passport as a readout-backed Quick Actions command-reference entry. | The app already exposes local identity metrics, a Focus Readout action, direct Beat Passport focus commands, and local Focus Result feedback; the command map should make that visible without changing behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created for Beat Passport Command Reference alignment. |
| 2026-06-21 | harness_builder | Updated the Beat Passport Command Reference row to `Quick Actions / Readout` and aligned README, product, quality, and QA harness coverage while preserving Beat Passport derivation, focus routing, playback/export, project data, sampling, and remote boundaries. |
| 2026-06-21 | quality_runner | Full QA passed: diff check, harness QA, typecheck, quality gate, build, qa, and verify. Runtime smoke covered 14/14 sample-free blueprints and 14/14 supported styles. |
| 2026-06-21 | review_judge | No findings. Confirmed this is a Command Reference/docs/harness-only alignment and does not change Beat Passport behavior, Quick Actions execution, project data, playback/export, sampling, or remote behavior. |

## Completion Notes

Beat Passport is now marked as `Quick Actions / Readout` in the Guide Command Reference, matching the existing local beat identity summary, Focus Readout action, Beat Passport focus command, direct metric commands, and Focus Result feedback. Docs and harness expectations now pin the behavior and local-first/direct-composition boundaries.
