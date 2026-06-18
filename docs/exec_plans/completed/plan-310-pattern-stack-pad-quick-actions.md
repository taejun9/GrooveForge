# plan-310-pattern-stack-pad-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Pattern Stack pad Quick Actions for every editable 808/chord/Synth stack so beginners can start a full harmonic sketch from command search and producers can quickly swap selected Pattern A/B/C stack options, while preserving the existing explicit undoable Pattern Stack apply path and disabling stacks that already match the selected Pattern.

## Non-Goals

- Do not change Pattern Stack definitions, event generation, Pattern Stack preview/result derivation, Pattern A/B/C independence, selected-note or selected-chord tools, arrangement, mixer, sound design, master, playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Pack, Handoff Sheet, or render behavior.
- Do not add automatic arrangement writing, hidden generation, command chains, autoplay, auto-save, auto-export, sampling, imported audio, audio clips, sampler devices, remote AI, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `patternStackOptions`, `patternStackPreviewSummary`, `patternStackMoveCount`, `applyPatternStack`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and command-search description.
- `docs/product/product.md`: Pattern Stack and Quick Actions product behavior.
- `docs/quality/rules.md`: Pattern Stack and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-310-pattern-stack-pad-quick-actions` and `.worktree/plan-310-pattern-stack-pad-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Pattern Stack pad and Quick Actions result patterns.
- [x] Add one direct Quick Action per Pattern Stack option that reuses `onApplyPatternStack`.
- [x] Disable direct stack commands when the selected Pattern already matches that stack.
- [x] Add local result metric/follow-up copy for direct Pattern Stack commands.
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
- Browser smoke if environment allows localhost: open the workstation, run direct Pattern Stack Quick Actions, confirm already-matching stacks are disabled, and verify no autoplay, hidden generation, sampling, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that direct Pattern Stack commands derive only from existing stack options, route only to the existing Pattern Stack apply handler, disable already-matching stacks, preserve undoable local Pattern A/B/C update semantics, and avoid autoplay, sampling, command chains, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for Pattern Stack pads. | Pattern Stack is a direct sample-free 808/chord/Synth sketching path; direct command access helps beginners start a complete idea and producers swap stack shapes quickly. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Pattern Stack has visible pads and one preview-target Quick Action, but no direct per-stack commands. |
| 2026-06-18 | harness_builder | Added direct Pattern Stack pad Quick Actions from local stack options, routed runs through `onApplyPatternStack`, disabled already-aligned stacks, and added result metric/follow-up copy. |
| 2026-06-18 | harness_builder | Updated README, product docs, quality rules, and QA expectations for direct Pattern Stack pad commands while keeping sampling out of scope. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run verify`, and `npm run qa`. |
| 2026-06-18 | quality_runner | Browser smoke was attempted, but starting the local Vite dev server on `127.0.0.1:5334` failed with sandbox `EPERM`; escalated retry was rejected by environment policy, so no browser workaround was used. |
| 2026-06-18 | review_judge | Reviewed the diff after QA. No follow-up findings found; residual risk is limited to missing interactive browser confirmation because localhost binding is blocked in this environment. |

## Completion Notes

- Direct Pattern Stack pad commands now appear in Quick Actions for each stack option.
- Already-matching stack commands are disabled using current local Pattern A/B/C stack move counts.
- Direct stack commands reuse the existing undoable Pattern Stack apply handler and keep result feedback UI-only.
- Durable docs and QA expectations now describe Pattern Stack and direct stack pads as direct composition tools, not sampling.
