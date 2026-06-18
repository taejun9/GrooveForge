# plan-327-pattern-variation-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose the existing deterministic Subtle, Hook, and Break Pattern Variation tools from Quick Actions so users can apply selected Pattern A/B/C variation moves from the command palette while reusing existing undoable Pattern Variation behavior and local command result feedback.

## Non-Goals

- Do not change Pattern Variation algorithms, preset definitions, Pattern Fill, Pattern Clone, Pattern Stack, Layer Starter, Composer Actions, Next Move, arrangement, playback, render/export, save/load, or project schema.
- Do not add a new Pattern Variation Result strip in this plan.
- Do not add sampling, imported audio, remote AI, analytics, accounts, cloud sync, macros, autoplay, auto-arrangement, auto-export, or command chains.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: existing `applyPatternVariation` handler, Pattern Variation buttons, Quick Actions definitions, and Quick Action result/follow-up helpers.
- `README.md`: public feature summary for Pattern Variation Quick Actions.
- `docs/product/product.md`: product behavior for Pattern Variation command-palette access.
- `docs/quality/rules.md`: Pattern Variation and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs/code alignment.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Use `codex/plan-327-pattern-variation-quick-actions` and `.worktree/plan-327-pattern-variation-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect current Pattern Variation buttons, handler, and Quick Action result helpers.
- [x] Add direct Quick Actions for Subtle, Hook, and Break variation presets using the existing `applyPatternVariation` path.
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

QA completes before review starts. Review checks that Pattern Variation Quick Actions are explicit, searchable, route only through `applyPatternVariation`, preserve existing deterministic variation behavior and command result feedback, and avoid schema, playback, export, sampling, remote AI, autoplay, macros, auto-arrangement, or command-chain changes.

## QA Results

- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run build` passed; Vite reported `dist/assets/index-B4X5Qf_Y.js` at `500.48 kB` with the existing chunk-size warning.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke for 10/10 sample-free 8-bar blueprints and 10/10 supported style profiles.
- Browser smoke was not run because no callable in-app Browser control tool was exposed in this session.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Pattern Variation Quick Actions instead of a new variation workflow. | The direct buttons already own the behavior; command-palette access improves speed without changing the composition model. |
| 2026-06-18 | Keep Pattern Variation Quick Actions limited to Subtle, Hook, and Break presets. | This exposes existing deterministic variation behavior without creating macros, command chains, sampling, or new generation logic. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created on dedicated worktree from clean `main` at `957e5f0`. |
| 2026-06-18 | harness_builder | Added direct Quick Actions for the existing Pattern Variation presets and routed them through `applyPatternVariation`. |
| 2026-06-18 | quality_runner | QA, quality gate, typecheck, build, and verify passed; Browser smoke unavailable because no callable Browser tool was exposed. |
