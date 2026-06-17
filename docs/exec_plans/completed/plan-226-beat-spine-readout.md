# plan-226-beat-spine-readout

## Status

active

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat-making mini DAW that can satisfy working producers while staying approachable for beginners. Keep sampling secondary and make the product read as direct beat composition, not a sampling app.

## Goal

Add a UI-local Beat Spine readout that makes the direct composition path visible near the first-run workflow: setup, drums, 808/bass, harmony, melody, arrangement, mix/master, and delivery. The readout should derive from existing local project/readiness data and route explicit clicks to existing workstation panels without mutating project data.

## Non-Goals

- No sampler, sample import, chopping, slicing, waveform, audio clip, audio recording, plugin hosting, remote AI, accounts, analytics, cloud sync, or hidden generation work.
- No project schema changes, saved UI state, undo history changes, playback changes, render/export changes, or automatic edits.
- No replacement of First Beat Path, Workflow Navigator, Composer Guide, Beat Map, or existing panel controls.

## Context Map

- `src/ui/App.tsx`: existing first-run workflow surfaces, readiness summaries, jump handlers, and top-level workstation layout.
- `src/styles.css`: workstation card/grid styling.
- `README.md`: public product summary and MVP feature list.
- `docs/product/product.md`: durable product definition and feature area list.
- `docs/quality/rules.md`: QA gates for UI-local direct beat-making helpers.
- `harness/scripts/run_qa.py`: static expectations for product guardrails and feature presence.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-226-beat-spine-readout` and `.worktree/plan-226-beat-spine-readout` for git repository work.
- Preserve the corrected product concept: GrooveForge is an all-genre event-based beat workstation, not a sampling-first app.

## Implementation Plan

- [x] Inspect existing First Beat Path, Workflow Navigator, Composer Guide, Beat Readiness, and jump handlers for reusable derivation.
- [x] Add typed Beat Spine summary/card derivation from current local project, style, readiness, arrangement, export, and target state.
- [x] Render the Beat Spine readout near the early workflow surfaces with explicit panel jumps only.
- [x] Add focused CSS that follows existing dense workstation styling and does not dominate the page.
- [x] Update README, product docs, quality rules, and static QA expectations.
- [x] Run the documented QA commands and perform review after QA.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser/dev-server smoke if the environment permits local server binding.

## Review Plan

QA completes before review starts. Review checks UI-local derivation, no project/schema/playback/export mutation, direct beat-making clarity, beginner/pro utility, no sampling-first drift, and layout containment.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Build a Beat Spine readout instead of changing sampling docs again. | Current durable docs already demote sampling; the next useful movement is making direct beat composition more visible in the actual app surface. |
| 2026-06-17 | Keep sampling language out of the visible Beat Spine UI. | Showing "sample-free" in the app surface would make sampling visible in the first workflow readout; docs and QA can carry the guardrail while UI leads with beat-making axes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created after auditing current docs/code for sampling-first drift. |
| 2026-06-17 | harness_builder | Added Beat Spine derivation, UI, styles, docs, and static QA expectations. |
| 2026-06-17 | quality_runner | `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify` passed. Browser smoke was blocked by localhost binding policy. |
| 2026-06-17 | review_judge | Reviewed UI-local derivation, explicit panel jumps, no project/schema/playback/export mutation, and no sampling-first drift. |

## Completion Notes

Implemented Beat Spine as a UI-local direct beat-making readout for Setup, Drums, 808/Bass, Harmony, Melody, Sound, Arrange, and Finish. It derives from existing local project, style, Beat Readiness, arranged Pattern A/B/C event counts, Export Preflight, and export analysis data, and its clicks only scroll to existing workstation panels. It does not change project schema, saved data, undo history, playback, render/export, or sampling scope.

Browser smoke could not run because `npm run dev -- --host 127.0.0.1` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; the escalated retry was rejected by environment policy, so no browser workaround was used.
