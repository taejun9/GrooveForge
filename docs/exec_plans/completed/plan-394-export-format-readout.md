# plan-394-export-format-readout

## Status

Completed

## Goal

Add a UI-local Export Format Readout inside Handoff Pack so beginners and producers can confirm the exact outgoing format, duration, file set, MIDI scope, and handoff sheet context before explicit exports.

## Scope

- Derive the readout only from existing local project state, deterministic export analysis, stem analysis, existing file-name helpers, and Session Brief/Delivery Target data.
- Show WAV technical format, full-mix duration/file, stem file count/audible stem count, MIDI arrangement scope, and handoff sheet context without changing export handlers.
- Keep all export actions explicit; this readout must not create files, auto-export, upload, batch, zip, or mutate project data.
- Update README/product/quality/harness expectations.

## Non-Goals

- No export file content changes.
- No configurable sample rate, bit depth, dither, normalization, zip packaging, background render, upload, or native folder automation.
- No project schema, save/load, playback, render algorithm, MIDI byte, Handoff Sheet content, Electron, Vite, or sampling scope changes.
- No remote AI, cloud sync, accounts, analytics, payments, plugin hosting, or legal/licensing claims.

## Files

- `src/ui/App.tsx`
- `src/styles.css`
- `src/ui/workstationUiModel.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/reviews/plan-394-export-format-readout.md`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run harness:smoke`
- `npm run qa`
- `npm run build`
- `npm run verify`

## QA Log

- 2026-06-19: `git diff --check` passed.
- 2026-06-19: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-19: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-19: `npm run typecheck` passed.
- 2026-06-19: `npm run harness:smoke` passed.
- 2026-06-19: `npm run qa` passed.
- 2026-06-19: `npm run build` passed with the existing Vite large chunk warning.
- 2026-06-19: `npm run verify` passed with the existing Vite large chunk warning.
- 2026-06-19: Browser smoke could not run because sandboxed Vite server startup failed with `listen EPERM` on `127.0.0.1:5194`; the escalated retry was rejected by environment policy, and Browser `file://` access to the production build was also blocked by Browser URL policy.

## Review

Post-QA review found no export handler, file content, render byte, MIDI byte, Handoff Sheet, save/load, playback, or sampling-boundary regressions. Remaining risk is visual-only because Browser-based local UI verification was blocked by environment policy after CLI build and verify passed.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Add a read-only export format readout before considering render option changes. | The current renderer has a fixed 44.1 kHz stereo contract covered by smoke tests; exposing that contract improves delivery confidence without destabilizing exports. |
| 2026-06-19 | Keep the readout UI-local and derived from existing helpers. | Export confidence improves without adding configurable render settings, background export, archives, upload paths, or project schema changes. |

## Progress

- [x] Created `codex/plan-394-export-format-readout` worktree.
- [x] Implement Handoff Pack export format readout.
- [x] Update docs and static QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
