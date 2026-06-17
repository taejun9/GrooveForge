# plan-233-blueprint-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily. Keep sampling secondary and keep the product centered on direct beat composition.

## Goal

Add a current-style Beat Blueprint command to Quick Actions so users can open the command palette and immediately apply the editable starter that matches the current style. The command should reuse existing local Blueprint derivation and the existing undoable Beat Blueprint apply/result path.

## Non-Goals

- Do not add new Beat Blueprint metadata, style profiles, pattern-generation rules, render logic, or project schema.
- Do not auto-apply a blueprint on style change or alter Quick Actions ordering outside the added command.
- Do not add sampling, imported audio, sampler devices, remote AI, plugin hosting, accounts, analytics, cloud sync, autoplay, auto-save, or auto-export.

## Context Map

- `src/ui/App.tsx`: Quick Actions definitions, Beat Blueprint apply path, current-style suggestion helper, command result derivation.
- `README.md`: public feature summary.
- `docs/product/product.md`: durable product capability inventory.
- `docs/quality/rules.md`: Quick Actions and Beat Blueprint guardrails.
- `harness/scripts/run_qa.py`: static product and UI-token expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-233-blueprint-quick-action` and `.worktree/plan-233-blueprint-quick-action` for git repository work.

## Implementation Plan

- [x] Add a Quick Actions command that labels the current style starter explicitly and calls `onApplyBlueprint(suggestedBlueprintId(project))`.
- [x] Keep the existing general Blueprint command and current Beat Blueprint panel behavior intact.
- [x] Update durable docs and static QA expectations so the command remains local, explicit, sample-free, and routed through the existing Blueprint apply/result path.
- [x] Run QA, then review the diff after QA passes.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run typecheck`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that the new Quick Action derives the style-matched starter from existing local project/style/blueprint state, routes through existing Blueprint apply/result behavior, preserves Quick Actions search/filter/recent semantics, and does not introduce sampling-first, hidden generation, remote, schema, playback, save/load, or export drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a separate current-style starter command instead of changing the existing generic Blueprint command. | The existing command already applies the suggested blueprint; a clearly named command improves discoverability without breaking existing command ids, recents, or search behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created after confirming durable docs already center direct beat composition and sampling remains optional. |
| 2026-06-17 | harness_builder | Added the current-style starter Quick Action and aligned docs/static QA expectations. |
| 2026-06-17 | quality_runner | `python3 harness/scripts/run_quality_gate.py` first failed because Completion Notes still contained the plan-template placeholder. |
| 2026-06-17 | quality_runner | QA passed: `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run typecheck`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run build`, and `npm run verify`. |
| 2026-06-17 | review_judge | Reviewed local derivation, explicit command routing, Quick Actions search/filter/recent behavior, no schema/render/playback drift, and sampling guardrails; no findings. |

## Completion Notes

Completed. Quick Actions now includes a current-style starter command that derives its label from the local style and routes explicit clicks through the existing Beat Blueprint apply/result path. The existing generic Blueprint command, scope filters, Spotlight, Recent Commands, save/load, playback, WAV/stem/MIDI export, and Handoff behavior are preserved.
