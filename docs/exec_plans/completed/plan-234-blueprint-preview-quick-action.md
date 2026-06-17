# plan-234-blueprint-preview-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily. Keep sampling secondary and keep the product centered on direct beat composition.

## Goal

Add a Quick Actions command that previews the current-style Beat Blueprint starter without mutating the project. This gives beginners a safer command-palette path before applying a full starter and gives producers a fast way to stage the current-style Blueprint preview.

## Non-Goals

- Do not change Beat Blueprint definitions, style profiles, project schema, render logic, save/load format, or export semantics.
- Do not remove or reorder the existing generic Blueprint apply command or the current-style starter apply command.
- Do not add hidden generation, auto-apply, command chains, modal confirmations, sampling, imported audio, sampler devices, remote AI, plugin hosting, accounts, analytics, cloud sync, autoplay, auto-save, or auto-export.

## Context Map

- `src/ui/App.tsx`: Quick Actions definitions, Beat Blueprint preview state, current-style suggestion helper, Quick Action result derivation.
- `README.md`: public feature summary.
- `docs/product/product.md`: durable product capability inventory.
- `docs/quality/rules.md`: Quick Actions and Beat Blueprint preview guardrails.
- `harness/scripts/run_qa.py`: static product and UI-token expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-234-blueprint-preview-quick-action` and `.worktree/plan-234-blueprint-preview-quick-action` for git repository work.

## Implementation Plan

- [x] Add a Quick Actions command that labels the current-style starter preview and calls a local preview handler using `suggestedBlueprintId(project)`.
- [x] Keep preview state UI-local and route only through existing Beat Blueprint preview state.
- [x] Add Quick Action result metric/follow-up copy for preview commands so the result does not imply project mutation.
- [x] Update docs/static QA expectations for the explicit, local, sample-free preview path.
- [x] Run QA, then review the diff after QA passes.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run typecheck`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that the preview command derives from local project/style/blueprint state, mutates only UI-local preview state, preserves existing Blueprint apply commands, preserves Quick Actions search/filter/Spotlight/Recent/result semantics, and does not introduce sampling-first, hidden generation, schema, playback, save/load, or export drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add preview as a separate Quick Action instead of changing the apply command. | Users need both a safe pre-apply command and a fast apply command; keeping separate ids preserves existing command behavior and recents. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created after confirming current Quick Actions can apply the style-matched starter but cannot stage its preview from the command palette. |
| 2026-06-17 | harness_builder | Added the current-style starter preview Quick Action, preview-only result status, and docs/static QA guardrails. |
| 2026-06-17 | review_judge | Removed extra project-status mutation from the preview handler so the command changes only Beat Blueprint preview state. |
| 2026-06-17 | quality_runner | QA passed: `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run typecheck`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run build`, and `npm run verify`. |
| 2026-06-17 | review_judge | Reviewed preview-only routing, Quick Actions result text, generic/apply command preservation, no schema/render/export drift, and sampling guardrails; no findings. |

## Completion Notes

Completed. Quick Actions now includes a current-style starter preview command that sets the matched Beat Blueprint preview without editing project data. The preview command shows a preview-only result status and follow-up copy, while existing generic Blueprint apply, current-style starter apply, panel preview/apply, scope filters, Spotlight, Recent Commands, save/load, playback, WAV/stem/MIDI export, and Handoff behavior are preserved.
