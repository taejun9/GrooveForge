# plan-315-arrangement-pad-quick-actions

## Status

active

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Quick Actions for every existing Arrangement Template, Arrangement Arc pad, and Arrangement Focus preset so beginners can choose song form and energy posture from command search, and producers can quickly apply a specific arrangement move without relying only on the current suggested preview target.

## Non-Goals

- Do not change Arrangement Template, Arrangement Arc, or Arrangement Focus definitions, preview scoring, visible button behavior, result strip behavior, arrangement block editor behavior, project schema, playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Pack, or Handoff Sheet behavior.
- Do not add onboarding overlays, tutorials, macros, command chains, hidden generation, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, sampler devices, audio clips, remote AI, accounts, analytics, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Arrangement Template, Arrangement Arc, Arrangement Focus previews/results/buttons, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: feature summary and command-search behavior.
- `docs/product/product.md`: arrangement and Quick Actions product behavior.
- `docs/quality/rules.md`: arrangement and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-315-arrangement-pad-quick-actions` and `.worktree/plan-315-arrangement-pad-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Arrangement Template, Arrangement Arc, Arrangement Focus, Quick Actions, and result patterns.
- [x] Add direct Arrangement Template Quick Actions for every existing template, disabling templates already matching the arrangement.
- [x] Add direct Arrangement Arc pad Quick Actions for every existing arc pad, disabling already-aligned pads.
- [x] Add direct Arrangement Focus preset Quick Actions for every existing focus preset when a selected block is available, disabling already-aligned presets.
- [x] Route direct commands through existing undoable Arrangement Template, Arrangement Arc, and Arrangement Focus handlers.
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
- Browser smoke if environment allows localhost: open the workstation, run direct Arrangement Template, Arrangement Arc, and Arrangement Focus Quick Actions, confirm they use existing visible button/result behavior, aligned commands are disabled, and no autoplay/export/sampling entry point appears.

## QA Results

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite large chunk warning.
- `npm run qa` passed.
- `npm run verify` passed with runtime smoke, typecheck, and build.
- `npm run harness:smoke` passed separately for all 10 sample-free Beat Blueprints and all 10 supported style profiles.
- `git diff --check` passed.
- Browser smoke blocked: `npm run dev -- --host 127.0.0.1 --port 5339` failed with `listen EPERM`, and the escalated retry was rejected by the environment policy. No workaround was attempted.

## Review Plan

QA completes before review starts. Review checks that direct arrangement commands derive only from existing Arrangement Template definitions, Arrangement Arc pad definitions, and Arrangement Focus presets, route only through existing apply handlers, preserve undoable edit semantics and result feedback, and avoid sampling, autoplay, command chains, hidden generation, or cloud scope.

## Review Result

Review completed after QA. Direct Arrangement Template, Arrangement Arc, and Arrangement Focus Quick Actions derive from existing template ids, arc pad options, and focus presets; no definitions, project schema, playback, export, sampling, or cloud behavior changed. Mutating commands route through the existing apply handlers, disabled states prevent no-op direct commands, and result metric/follow-up prefixes cover the new command ids.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Arrangement Template, Arc, and Focus Quick Actions. | Arrangement is part of the beat-workstation spine; direct command access lets beginners pick a song-form move and lets producers quickly apply a specific structure or energy posture. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Quick Actions expose current Arrangement Template, Arrangement Arc, and Arrangement Focus suggestions, not every visible arrangement template/pad/preset. |
| 2026-06-18 | harness_builder | Added direct Arrangement Template, Arrangement Arc pad, and Arrangement Focus preset Quick Actions plus result metric/follow-up prefix support. |
| 2026-06-18 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations to describe current-target and direct arrangement commands as explicit sample-free beat-workstation controls. |
| 2026-06-18 | quality_runner | QA passed; browser smoke could not run because the environment rejects localhost dev server binding. |
| 2026-06-18 | review_judge | Post-QA review found no follow-up changes required. |
