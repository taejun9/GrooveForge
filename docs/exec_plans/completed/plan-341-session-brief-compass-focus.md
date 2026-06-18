# plan-341-session-brief-compass-focus

## Status

Completed

## Goal

Add explicit Session Brief Compass Focus controls so beginners can jump directly to the missing brief field and working producers can jump from handoff context to the right local workstation area without changing project data unless they edit a field themselves.

## Scope

- Add Focus controls to existing Session Brief Compass cards for Direction, Reference, Artist Context, and Handoff.
- Route Direction, Reference, and Artist Context focus to existing Session Brief inputs; route Handoff focus to the existing Deliver/Handoff area.
- Add Quick Actions for the current highest-priority Brief Compass focus and each direct compass card.
- Keep Session Brief Compass derivation, starter pads, blank-field-only starter writes, manual editing, clear behavior, Handoff Sheet, Handoff Pack, Export Preflight, save/load, snapshots, undo/redo, playback, WAV/stem/MIDI export, and sampling boundaries unchanged.
- Update docs and static QA expectations.

## Non-Goals

- No new Session Brief fields.
- No automatic brief writing, hidden generation, reference-track import, media upload, remote AI, cloud sync, accounts, analytics, sampling, imported audio, or plugin hosting.
- No Handoff Pack export behavior changes.

## Files

- `src/ui/App.tsx`
- `src/styles.css`
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
- 2026-06-18: `python3 harness/scripts/run_qa.py` initially failed on one stale README expectation, then passed after updating the expectation.
- 2026-06-18: `git diff --check` passed.
- 2026-06-18: `npm run build` passed with the existing Vite large chunk warning.
- 2026-06-18: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-18: `npm run qa` passed.
- 2026-06-18: `npm run verify` passed, including the runtime smoke for 10/10 sample-free 8-bar starts and all 10 supported style profiles.
- 2026-06-18: Browser smoke was not run because `tool_search` exposed no in-app Browser tool in this session.

## Review

- No findings. Focus buttons and Brief Compass Quick Actions route only to existing Session Brief field refs or the existing Handoff/Deliver panel ref.
- The change is UI-local except for existing manual Session Brief edits and existing starter pad behavior; no export, save/load, playback, sampling, remote AI, account, analytics, or cloud behavior changed.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add Brief Compass Focus instead of another starter preset. | The app already has starter pads; the missing workflow is direct navigation from context diagnosis to the relevant field or deliver area. |
| 2026-06-18 | Keep focus UI-local and reuse existing refs/inputs. | This improves beginner guidance and producer handoff scanning without changing saved data or export behavior. |

## Progress

- [x] Inspected current main and Session Brief Compass code.
- [x] Created `codex/plan-341-session-brief-compass-focus` worktree.
- [x] Add Session Brief Compass Focus controls.
- [x] Add Quick Actions and QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
