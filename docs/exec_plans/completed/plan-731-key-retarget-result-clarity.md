# plan-731-key-retarget-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Key Retarget result feedback more explicit by showing before/after project key, total Pattern A/B/C musical event count, and current edit Pattern, so users can confirm a command-palette key change retargeted the beat without losing editable musical events.

## Non-Goals

- Do not change key options, scale definitions, `retargetProjectKey` transposition rules, Pattern A/B/C musical event data beyond the existing retargeting behavior, or Key Compass focus behavior.
- Do not change style selection, Pattern Cue/Switch/Use behavior, arrangement blocks, playback scheduling, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add command chains, hidden generation, automatic key changes, sampling, imported audio, audio clips, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Key Retarget Quick Actions, the key dropdown handler, and generic Quick Action Result metric snapshots.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-731-key-retarget-result-clarity` and `.worktree/plan-731-key-retarget-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Key Retarget Quick Action result metric and follow-up routing.
- [x] Update Key Retarget result metric text to clarify before/after key, Pattern A/B/C event count, and edit Pattern context.
- [x] Update product/docs language and QA harness expectations for Key Retarget result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Quick Actions Key Retarget result feedback is clearer while preserving key retargeting semantics, Pattern A/B/C event integrity, Key Compass behavior, playback, export, MIDI, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the existing Quick Action Result metric instead of adding a separate Key Retarget result model. | The command already produces local before/after feedback; the gap is proving the key retarget happened while editable Pattern A/B/C event posture remains visible. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Quick Actions Key Retarget result clarity. |
| 2026-06-25 | harness_builder | Quick Actions Key Retarget result metrics now show before/after key, Pattern A/B/C event count, and edit Pattern context. |
| 2026-06-25 | quality_runner | Full QA passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no key retargeting, Pattern data integrity, Key Compass, playback, export, MIDI, Handoff, remote, or sampling scope regressions. |

## Completion Notes

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.
- Quick Actions Key Retarget result metrics now show before/after key, Pattern A/B/C event count, and edit Pattern context.
- Result feedback remains UI-local and explicit-command-driven while key retargeting semantics, Pattern A/B/C event integrity, Key Compass, playback scheduling, render/export, MIDI export, Handoff, remote, and sampling boundaries remain unchanged.
