# plan-317-mix-fix-quick-action-results

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Make Mix Fix Quick Actions feel like reliable producer tools by giving Headroom, Stem Balance, and Low End commands specific post-run result metrics and follow-up guidance instead of the generic Mix posture feedback.

## Non-Goals

- Do not change Mix Fix preset definitions, Mix Fix Preview, visible Mix Fix buttons, Mix Fix Result panel behavior, mixer/master schema, save/load, undo/redo, playback, WAV/stem/MIDI export, Handoff Pack, or Handoff Sheet behavior.
- Do not add auto-fixing, auto-mastering, loudness guarantees, platform compliance claims, modal confirmations, command chains, autoplay, auto-save, auto-export, sampling, imported audio, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Mix Fix Quick Actions, result metric snapshots, result follow-up copy, export/stem analysis helpers.
- `README.md`: Quick Actions and Mix Fix feature summaries.
- `docs/product/product.md`: mixer/master and Quick Actions product behavior.
- `docs/quality/rules.md`: Mix Fix and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-317-mix-fix-quick-action-results` and `.worktree/plan-317-mix-fix-quick-action-results` for repository work.

## Implementation Plan

- [x] Inspect existing Mix Fix command ids, apply handler, result metric, and follow-up paths.
- [x] Add a local helper mapping Mix Fix Quick Action ids to their existing presets.
- [x] Return preset-specific Quick Action result metrics for Headroom, Stem Balance, and Low End using deterministic local export/stem/project state.
- [x] Return preset-specific audition cues and next checks that match the existing Mix Fix Result guidance.
- [x] Update durable docs and QA expectations to keep Mix Fix command feedback explicit, local, deterministic, editable, and sample-free.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run Mix Fix Headroom, Stem Balance, and Low End Quick Actions, confirm result metrics/follow-up copy are specific and no autoplay/export/sampling entry point appears.

## QA Results

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite large chunk warning.
- `npm run qa` passed.
- `npm run verify` passed with runtime smoke, typecheck, and build.
- `git diff --check` passed.
- Browser smoke blocked: `npm run dev -- --host 127.0.0.1 --port 5341` failed with `listen EPERM`, and the escalated retry was rejected by the environment policy. No workaround was attempted.

## Review Plan

QA completes before review starts. Review checks that Mix Fix Quick Action feedback derives only from existing Mix Fix ids and deterministic local project/export/stem state, keeps commands routed through existing `onApplyMixFix`, preserves undoable edit semantics and visible Mix Fix Result behavior, and avoids sampling, autoplay, auto-export, hidden mastering, command chains, or cloud scope.

## Review Result

Review completed after QA. Mix Fix Quick Action feedback derives from the existing `mix-headroom`, `mix-stem-balance`, and `mix-low-end` ids, maps them only to existing Mix Fix presets, and uses deterministic local export/stem/project posture helpers for result metrics and follow-up copy. The commands still route through existing `onApplyMixFix` handlers, and no Mix Fix preset definitions, project schema, playback, export, sampling, remote AI, accounts, analytics, or cloud behavior changed.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Mix Fix-specific Quick Action result metrics and follow-up copy. | The commands already exist, but generic post-run feedback weakens confidence for beginners and slows producers checking a finish move. |
| 2026-06-18 | Reuse existing Mix Fix posture helpers for Quick Actions feedback. | This keeps command result feedback consistent with the visible Mix Fix Result panel without adding new analysis or claims. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Mix Fix Quick Actions exist but use generic Mix posture result feedback. |
| 2026-06-18 | harness_builder | Added `mixFixQuickActionPreset` and wired Mix Fix Quick Actions to Headroom, Stem Balance, and Low End result metric/follow-up helpers. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for preset-specific Mix Fix Quick Actions feedback. |
| 2026-06-18 | quality_runner | QA passed; Browser smoke could not run because the environment rejects localhost dev server binding. |
| 2026-06-18 | review_judge | Post-QA review found no follow-up changes required. |
