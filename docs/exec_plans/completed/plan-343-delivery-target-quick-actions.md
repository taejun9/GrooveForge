# plan-343-delivery-target-quick-actions

## Status

Completed

## Goal

Expose every Delivery Target as a direct Quick Action so beginners can set the session goal from command search and working producers can quickly switch between starter sketch, vocal session, beat-store demo, club demo, and custom delivery contexts without hunting through the workstation.

## Scope

- Add direct Quick Actions for each existing Delivery Target.
- Route each command through the existing Delivery Target selection path, not the alignment path.
- Keep Delivery Target Alignment Preview/Result and the existing Quick Actions Delivery Target Align command unchanged.
- Keep custom target editing, Beat Map, Session Brief, Handoff Pack, Export Preflight, save/load, snapshots, undo/redo, playback, WAV/stem/MIDI export, and sampling boundaries unchanged.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No new Delivery Target definitions.
- No auto-align, auto-export, auto-save, hidden generation, reference-track import, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.
- No changes to arrangement, mixer, master, export, or saved project schema beyond the existing selected Delivery Target field.

## Files

- `src/ui/App.tsx`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Validation

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run build`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`

## QA Log

- 2026-06-18: `npm run typecheck` passed.
- 2026-06-18: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-18: `git diff --check` passed.
- 2026-06-18: `npm run build` passed with the existing Vite large chunk warning.
- 2026-06-18: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-18: `npm run qa` passed.
- 2026-06-18: `npm run verify` passed, including runtime smoke coverage for 10/10 sample-free 8-bar blueprints and all supported style profiles.
- 2026-06-18: Browser smoke was not run because no in-app browser tool was available in this session.

## Review

- No findings. Direct Delivery Target Quick Actions derive from fixed local targets plus the bounded custom target, route only through the existing target-selection handler, disable only the selected target, and leave alignment/export/playback/project content changes to existing explicit commands.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add direct target-select Quick Actions rather than more alignment automation. | The app already aligns the selected target; the missing workflow is quickly choosing the target context itself. |
| 2026-06-18 | Reuse the existing target selection handler. | Selecting a target should only set session intent and preserve explicit alignment/export decisions. |

## Progress

- [x] Inspected current main and Delivery Target selection/Quick Actions.
- [x] Created `codex/plan-343-delivery-target-quick-actions` worktree.
- [x] Add direct Delivery Target Quick Actions.
- [x] Update docs and QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
