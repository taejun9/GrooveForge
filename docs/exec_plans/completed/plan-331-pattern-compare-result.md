# plan-331-pattern-compare-result

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Add a UI-local Pattern Compare Result for visible Pattern Compare Cue and Use actions so users can confirm the selected Pattern A/B/C target, audition scope, selected arrangement block placement, event posture, follow-up cue, and next check after explicitly cueing or placing a pattern.

## Non-Goals

- Do not change Pattern Compare summary derivation, Pattern Cue behavior, Pattern Use behavior, Quick Actions result behavior, Pattern A/B/C event data, arrangement length/sections/energy, playback scheduling, render/export, save/load, project schema, or undo semantics.
- Do not add sampling, imported audio, remote AI, analytics, accounts, cloud sync, autoplay, auto-arrangement, auto-export, or command chains.
- Do not persist Pattern Compare Result state in project data.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Pattern Compare Cue/Use handlers, visible Pattern Compare strip, result strip patterns, Quick Actions Pattern Cue/Use result copy.
- `src/ui/workstationUiModel.ts`: result summary type.
- `src/ui/workstationPatternTools.ts`: deterministic Pattern Compare Result summary helpers if kept with other pattern result helpers.
- `README.md`: public feature summary.
- `docs/product/product.md`: product behavior for Pattern Compare Result.
- `docs/quality/rules.md`: Pattern Compare guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs/code alignment.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Use `codex/plan-331-pattern-compare-result` and `.worktree/plan-331-pattern-compare-result` for repository work.

## Implementation Plan

- [x] Inspect existing Pattern Compare Cue/Use, Quick Actions Pattern Cue/Use result copy, and compact result strip patterns.
- [x] Add a UI-local Pattern Compare Result summary type and deterministic creator for Cue and Use outcomes.
- [x] Add result state and render a compact Pattern Compare Result strip after explicit visible Cue/Use actions while preserving existing handlers and Quick Actions behavior.
- [x] Update product/quality docs and static QA expectations.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment exposes a callable browser control tool; otherwise record the blocker.

## Review Plan

QA completes before review starts. Review checks that Pattern Compare Result is UI-local, derives only from selected Pattern A/B/C data, selected block arrangement state, explicit Cue/Use action, and existing Pattern Compare summary data, does not mutate project data beyond the existing Use handler, keeps Cue out of undo history, preserves Quick Actions result behavior, and avoids schema, playback, export, sampling, remote AI, autoplay, auto-arrangement, auto-export, or command-chain changes.

## QA Results

- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run build` passed. Vite still reports the expected chunk warning for `dist/assets/index-Dc4wLlCS.js` at 505.10 kB.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke for 10/10 sample-free blueprints and 10/10 style profiles.
- Browser smoke was not run because tool discovery did not expose a callable in-app Browser control tool.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add visible Pattern Compare Result after Pattern Cue/Use. | Beginners need confirmation of audition/placement actions, and producers need a fast readout of which variation is cued or assigned to the selected block. |
| 2026-06-18 | Keep Pattern Compare Result derived and UI-local. | Cue should remain an audition/view action outside undo history, and Use should stay on the existing selected-block assignment path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created on dedicated worktree from clean `main` at `1ec9666`. |
| 2026-06-18 | harness_builder | Added Pattern Compare Result types, UI-local state, result derivation for Cue/Use, and a compact result strip after visible Pattern Compare actions. |
| 2026-06-18 | harness_builder | Updated README, product docs, quality rules, and static QA expectations for Pattern Compare Result feedback. |
| 2026-06-18 | review_judge | Adjusted the implementation so only visible Pattern Compare Cue/Use buttons set Pattern Compare Result; Quick Actions keep their existing Quick Actions result feedback only. |
| 2026-06-18 | quality_runner | Completed typecheck, QA, diff check, build, quality gate, npm QA, and npm verify. Browser smoke unavailable because no callable in-app Browser tool was exposed. |
