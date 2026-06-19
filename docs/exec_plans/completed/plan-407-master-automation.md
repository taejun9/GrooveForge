# plan-407-master-automation

## Status

Complete

## Goal

Add a small, explicit master fade automation lane so GrooveForge starts treating automation as first-class project data that affects realtime playback and WAV/stem export, improving professional finishing control while giving beginners safe one-click fade options.

## Scope

- Add master volume automation event data to the project model with safe migration for older project files.
- Add deterministic helpers for applying `none`, `fade_in`, `fade_out`, and `intro_outro` master automation presets.
- Apply master automation gain to realtime playback and offline render analysis/export.
- Add a Master Automation pad surface near Master Finish with UI-local preview/result feedback.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No DAW-wide automation editor, breakpoint drawing, per-track automation, MIDI CC recording, audio recording, imported audio, sampler devices, remote AI, analytics, accounts, cloud sync, plugin hosting, or hidden generation.
- No project file version bump unless existing migration cannot safely normalize missing automation data.
- No changes to note, drum, chord, arrangement, mixer balance, or master finish behavior beyond applying explicit master automation gain.

## Files

- `src/domain/workstation.ts`
- `src/audio/render.ts`
- `src/audio/scheduler.ts`
- `src/ui/App.tsx`
- `src/ui/workstationMixPanels.tsx`
- `src/ui/workstationUiModel.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-407-master-automation.md`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run harness:smoke`
- `npm run build`
- `npm run qa`
- `npm run verify`

## QA Log

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run harness:smoke` passed: 14/14 Beat Blueprints and 14/14 style profiles validated as sample-free 8-bar starts.
- `npm run build` passed. Vite still reports the existing 500 kB chunk-size warning for the main index chunk.
- `npm run qa` passed.
- `npm run verify` passed.
- Browser/dev-server visual check was not completed because sandboxed localhost listen failed with `EPERM` on `127.0.0.1:5173`, and the escalation request to run the Vite dev server was rejected by the environment policy.

## Review

- Post-QA review completed. No blocking findings.
- Residual risk: visual browser QA for the new Master Automation panel remains unverified in this environment because the dev server could not be started.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Start with master fade automation only. | It makes automation real project data and audible/exported behavior while keeping the first automation feature safe, explicit, and bounded for beginners and producers. |
| 2026-06-19 | Cap imported automation step normalization by delivery-target max bars, not single-block max bars. | Saved automation should remain valid for longer arrangements while still rejecting unbounded step values. |

## Progress

- [x] Created `codex/plan-407-master-automation` worktree.
- [x] Add master automation model, normalization, cloning, and presets.
- [x] Apply master automation to realtime playback and offline render.
- [x] Add Master Automation UI and result feedback.
- [x] Update docs/static QA.
- [x] Run QA/build/verify and review.
- [x] Move plan to completed and create review mirror.
