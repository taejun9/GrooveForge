# plan-309-layer-starter-direct-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Layer Starter Quick Actions for Drums, 808, Chords, and Synth so beginners can start the exact missing or thin layer they understand from command search and producers can quickly reinforce a selected Pattern layer, while preserving the existing explicit local Layer Starter apply paths and disabling ready layers.

## Non-Goals

- Do not change Layer Starter derivation, Composer Actions, Pattern DNA, Pattern Compare, Pattern Stack, Beat Blueprint, selected Pattern data outside the explicitly clicked layer starter, playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Pack, Handoff Sheet, or render behavior.
- Do not add hidden generation, automatic layer filling, command chains, auto-arrangement, autoplay, auto-save, auto-export, sampling, imported audio, audio clips, sampler devices, remote AI, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `LayerStarterOption`, `layerStarterOptions`, `activeLayerStarterQuickActionOption`, `applyLayerStarter`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and command-search description.
- `docs/product/product.md`: Layer Starter and Quick Actions product behavior.
- `docs/quality/rules.md`: Layer Starter and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-309-layer-starter-direct-quick-actions` and `.worktree/plan-309-layer-starter-direct-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Layer Starter pad and Quick Actions result patterns.
- [x] Add one direct Quick Action per Layer Starter option that reuses `onApplyLayerStarter`.
- [x] Disable direct layer commands when their layer is already ready.
- [x] Add local result metric/follow-up copy for direct Layer Starter commands.
- [x] Update durable docs and QA expectations to keep commands explicit, undoable, and sample-free.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run direct Layer Starter Quick Actions for missing/thin layers, confirm ready layers are disabled, and verify no autoplay, hidden generation, sampling, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that direct Layer Starter commands derive only from existing Layer Starter options, route only to the existing starter apply handler, disable ready layers, preserve undoable local project update semantics, and avoid autoplay, sampling, command chains, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for Layer Starter pads. | Direct layer starts move the product toward fast sample-free beat composition for beginners and producers without changing the underlying starter handlers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Layer Starter has visible Drums/808/Chords/Synth pads and one highest-priority Quick Action, but no direct per-layer commands. |
| 2026-06-18 | harness_builder | Added direct Layer Starter Quick Actions derived from `layerStarterOptions`, routed them through `onApplyLayerStarter`, and disabled direct commands for ready layers. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations to document direct Layer Starter commands as explicit, undoable, sample-free composition starts. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check`; `npm run verify` passed with the existing Vite 500 kB chunk warning. |
| 2026-06-18 | quality_runner | Browser smoke was not run because sandboxed localhost binding failed with `listen EPERM`, and the escalated `npm run dev -- --host 127.0.0.1 --port 5333` retry was rejected by policy. |
| 2026-06-18 | review_judge | Review found no code issues; direct commands derive from existing Layer Starter options, disable ready layers, and do not add autoplay, sampling, command chains, export, or remote scope. |

## Completion Notes

- Direct Quick Actions now expose Drums, 808, Chords, and Synth Layer Starter commands with ids derived from `layer-starter-${option.id}`.
- Direct ready-layer commands are disabled; missing/thin layer commands call the existing `onApplyLayerStarter(option.id)` handler.
- Result metrics and follow-up copy now describe direct Layer Starter runs without storing feedback in project data.
- Durable docs and the QA harness now require direct Layer Starter commands to stay explicit, undoable, sample-free, and project-local.
- Browser smoke remains a residual environment gap because the local dev server could not bind under the current sandbox and escalation policy.
