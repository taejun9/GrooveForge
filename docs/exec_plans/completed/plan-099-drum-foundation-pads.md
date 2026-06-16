# plan-099-drum-foundation-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily.

## Goal

Add Drum Foundation Pads so users can quickly set the selected Pattern A/B/C kick, clap, hat, and perc foundation from explicit local rhythm presets while keeping the result fully editable.

## Non-Goals

- No new drum lanes, drum schema, audio sample import, sampler, plugin hosting, remote AI, remote analysis, cloud sync, accounts, analytics, or hidden generation.
- No automatic full-song composition or mutation outside the selected Pattern A/B/C drum event data.
- No genre authenticity, professional mix, mastering, platform, publishing, licensing, or release-readiness guarantee claims.

## Context Map

- `src/ui/App.tsx`: Groove Feel Pads, Drum Accent Pads, Pattern Fill tools, drum grid, selected drum inspector, drum helper functions.
- `src/styles.css`: compact pad panel styles.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: direct composition framing and guardrails.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-099-drum-foundation-pads` and `.worktree/plan-099-drum-foundation-pads` for git repository work.
- Drum Foundation Pads must update only selected Pattern A/B/C drum pattern, velocity, timing, probability, and hat repeat data through existing undoable project update paths.
- Results must remain manually editable through the drum grid and inspector, preserve realtime playback plus WAV/stem export semantics, and avoid imported audio or sampling workflow scope.

## Implementation Plan

- [x] Add Drum Foundation Pad definitions and preview derivation.
- [x] Add an explicit `applyDrumFoundation` handler scoped to selected Pattern A/B/C drum data.
- [x] Render compact Drum Foundation Pads near Groove Feel/Drum Accent Pads.
- [x] Update docs and QA expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Drum Foundation Pads render four options, applying one option changes active drum steps in the selected pattern, keeps manual controls available, console errors stay empty, and no horizontal overflow appears.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that foundation pads are explicit, selected-pattern scoped, undoable, deterministic, manually editable afterward, and preserve the non-sampling product boundary.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Drum Foundation Pads after 808 Contour Pads. | Drums are the first feel signal in a beat; beginners need fast usable foundations and producers need editable rhythm starts without importing loops or samples. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Drum Foundation Pads. |
| 2026-06-16 | repo_cartographer | Rebasing branch onto latest main kept the sampling-optional guardrails in the plan-099 baseline. |
| 2026-06-16 | harness_builder | Added implementation, docs, styles, and static QA expectations for Drum Foundation Pads. |
| 2026-06-16 | quality_runner | Validation passed: typecheck, run_qa, verify, qa, diff check, and browser smoke on localhost:5207. |
| 2026-06-16 | review_judge | Reviewed selected-pattern scope, undoability, manual edit controls, export semantics, and non-sampling boundary. |

## Completion Notes

Drum Foundation Pads are implemented for Straight, Bounce, Half, and Club rhythm starts. Each pad updates only the selected Pattern A/B/C kick, clap, hat, and perc drum pattern plus velocity, timing, probability, and hat repeat data through the existing undoable pattern update path. The resulting drum grid remains editable through the existing inspector controls, and docs plus static QA now protect the feature and its non-sampling boundary.
