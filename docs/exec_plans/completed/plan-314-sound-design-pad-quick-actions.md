# plan-314-sound-design-pad-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Quick Actions for every existing Sound Preset, Drum Kit, and Sound Focus pad so beginners can find visible tone-design pads from command search and producers can quickly choose a specific built-in tone posture without relying only on the current suggested preview target.

## Non-Goals

- Do not change Sound Preset, Drum Kit, or Sound Focus pad definitions, preview scoring, visible pad behavior, result strip behavior, manual Sound Designer controls, project schema, playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Pack, or Handoff Sheet behavior.
- Do not add onboarding overlays, tutorials, macros, command chains, hidden generation, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, sampler devices, audio clips, remote AI, accounts, analytics, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Sound Preset, Drum Kit, Sound Focus pads/previews/results, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: feature summary and command-search behavior.
- `docs/product/product.md`: sound-design and Quick Actions product behavior.
- `docs/quality/rules.md`: Sound Preset, Drum Kit, Sound Focus, and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-314-sound-design-pad-quick-actions` and `.worktree/plan-314-sound-design-pad-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Sound Preset, Drum Kit, Sound Focus, Quick Actions, and result patterns.
- [x] Add direct Sound Preset Quick Actions for every existing sound preset id.
- [x] Add direct Drum Kit pad Quick Actions for every existing drum kit pad, disabling already-aligned kits.
- [x] Add direct Sound Focus pad Quick Actions for every existing focus pad, disabling already-aligned focus pads.
- [x] Route direct commands through existing undoable Sound Preset, Drum Kit, and Sound Focus handlers.
- [x] Update durable docs and QA expectations to keep commands explicit, undoable, local, and sample-free.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run direct Sound Preset, Drum Kit, and Sound Focus Quick Actions, confirm they use existing visible pad/apply result behavior, aligned pad commands are disabled, and no autoplay/export/sampling entry point appears.

## Review Plan

QA completes before review starts. Review checks that direct sound-design commands derive only from existing preset ids, Drum Kit pad options, and Sound Focus pad options, route only through existing apply handlers, preserve undoable edit semantics and result feedback, and avoid sampling, autoplay, command chains, hidden generation, or cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct sound-design pad Quick Actions. | Sound design is part of the beat-workstation spine; direct pad access lets producers pick exact tone posture quickly and helps beginners discover visible tone controls through command search. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Quick Actions expose only current Sound Preset, Drum Kit, and Sound Focus preview targets, not every visible sound-design pad. |
| 2026-06-18 | harness_builder | Added direct Sound Preset, Drum Kit, and Sound Focus Quick Actions from existing preset ids and pad options, with already-aligned commands disabled. |
| 2026-06-18 | harness_builder | Routed direct sound-design commands through existing `applySoundPreset`, `applyDrumKitPad`, and `applySoundFocusPad` handlers. |
| 2026-06-18 | harness_builder | Updated README, product docs, quality rules, and QA expectations for direct sound-design pad commands. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run typecheck`, and `git diff --check`. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run verify`, and `npm run qa`. |
| 2026-06-18 | quality_runner | Browser smoke was attempted, but starting the local Vite dev server on `127.0.0.1:5338` failed with sandbox `EPERM`; escalated retry was rejected by environment policy, so no browser workaround was used. |
| 2026-06-18 | review_judge | Reviewed the diff after QA. No blocking findings found; residual risk is limited to missing interactive browser confirmation because localhost binding is blocked in this environment. |

## Completion Notes

- Quick Actions now expose every existing Sound Preset as a direct preset command.
- Quick Actions now expose every existing Drum Kit pad and Sound Focus pad, disabling already-aligned pads.
- Direct commands route only through existing undoable Sound Preset, Drum Kit, and Sound Focus handlers.
- The change adds no sampling, imported audio, autoplay, auto-export, command chains, hidden generation, remote AI, accounts, analytics, or cloud sync.
