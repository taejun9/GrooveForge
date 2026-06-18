# plan-316-mix-balance-pad-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Quick Actions for every existing Mix Balance pad so beginners can choose a clear rough-balance posture from command search, and producers can quickly apply a specific mix pass without relying only on the current suggested preview target.

## Non-Goals

- Do not change Mix Balance pad definitions, preview scoring, visible pad behavior, result strip behavior, mixer schema, playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Pack, or Handoff Sheet behavior.
- Do not add auto-mixing, auto-mastering, loudness guarantees, command chains, hidden generation, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, reference-track upload, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Mix Balance pad options, preview/result, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: feature summary and command-search behavior.
- `docs/product/product.md`: mixer/master and Quick Actions product behavior.
- `docs/quality/rules.md`: Mix Balance and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-316-mix-balance-pad-quick-actions` and `.worktree/plan-316-mix-balance-pad-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Mix Balance pad, preview, result, and Quick Actions patterns.
- [x] Add direct Mix Balance pad Quick Actions for every existing pad, disabling pads already matching current mixer posture.
- [x] Route direct commands through the existing undoable Mix Balance apply handler.
- [x] Extend Quick Action result metrics and follow-up copy to cover direct Mix Balance pad command ids.
- [x] Update durable docs and QA expectations to keep Mix Balance commands explicit, undoable, local, editable, and sample-free.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run direct Mix Balance Quick Actions, confirm they use existing visible pad/result behavior, aligned commands are disabled, and no autoplay/export/sampling entry point appears.

## QA Results

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite large chunk warning.
- `npm run qa` passed.
- `npm run verify` passed with runtime smoke, typecheck, and build.
- `git diff --check` passed.
- Browser smoke blocked: `npm run dev -- --host 127.0.0.1 --port 5340` failed with `listen EPERM`, and the escalated retry was rejected by the environment policy. No workaround was attempted.

## Review Plan

QA completes before review starts. Review checks that direct Mix Balance commands derive only from existing Mix Balance pad definitions/options, route only through the existing Mix Balance apply handler, preserve undoable mixer edit semantics and result feedback, keep manual mixer controls editable afterward, and avoid sampling, autoplay, auto-export, auto-mixing, command chains, hidden generation, or cloud scope.

## Review Result

Review completed after QA. Direct Mix Balance pad Quick Actions derive from existing `mixBalancePadOptions`, disable already-matching pads, and route only through `onApplyMixBalance(pad.id)`. The result metric and follow-up paths now recognize `mix-balance-pad-*` ids. No Mix Balance pad definitions, mixer schema, playback, save/load, export, sampling, remote AI, accounts, analytics, or cloud behavior changed.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Mix Balance pad Quick Actions. | Mix Balance is part of the producer-facing finish path; direct command access lets beginners pick a rough balance and lets producers jump to a specific mixer posture quickly. |
| 2026-06-18 | Keep direct commands on the existing Mix Balance apply path. | This preserves undoable mixer edits, result feedback, manual mixer editability, and the local sample-free product boundary. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Quick Actions expose the current Mix Balance suggestion, not every visible Mix Balance pad. |
| 2026-06-18 | harness_builder | Added `mix-balance-pad-*` Quick Actions from existing `mixBalancePadOptions`, with aligned pads disabled and all runs routed through `onApplyMixBalance(pad.id)`. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, and QA expectations to describe direct Mix Balance pad commands as local, explicit, undoable, editable, and sample-free. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Browser smoke was blocked because localhost binding failed with `listen EPERM` and escalated retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Post-QA review found no follow-up changes required. |
