# plan-395-guidance-panel-chunk

## Status

Completed

## Goal

Restore production build hygiene by splitting Guided/Studio workflow guidance panels out of `src/ui/App.tsx` into a focused UI module so the desktop/web production build stays under the large-chunk warning threshold without changing app behavior.

## Scope

- Move render-only Mode Focus, First Beat Path, Session Pass, Workflow Navigator, and Workflow Spotlight UI code into a dedicated `src/ui/workstationGuidancePanels.tsx` module.
- Keep all panel props, data-testid contracts, button labels, focus/jump behavior, and local-only derivation semantics intact.
- Add a Vite/Rolldown code-splitting group for the new module.
- Update README, harness architecture, quality rules, and static QA expectations for the new chunk boundary.

## Non-Goals

- No project schema, save/load, playback, audio render, WAV/stem/MIDI export, Handoff, local draft, Quick Actions execution, sampling, imported audio, remote AI, analytics, accounts, payments, or cloud sync changes.
- No hiding warnings with `chunkSizeWarningLimit`.
- No redesign of Guided/Studio UX in this plan.

## Files

- `src/ui/App.tsx`
- `src/ui/workstationGuidancePanels.tsx`
- `vite.config.ts`
- `README.md`
- `docs/architecture/harness.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/reviews/plan-395-guidance-panel-chunk.md`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run verify`

## QA Log

- 2026-06-19: `git diff --check` passed.
- 2026-06-19: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-19: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-19: `npm run typecheck` passed.
- 2026-06-19: `npm run build` passed without the previous large-chunk warning; output includes `workstation-guidance-panels-Cty_7jYA.js` at 6.98 kB and `index-DTQXZNAI.js` at 498.61 kB.
- 2026-06-19: `npm run verify` passed without a large-chunk warning.

## Review

Post-QA review found the change is a render-only module extraction plus Vite/Rolldown chunk group addition. The Mode Focus, First Beat Path, Session Pass, Workflow Navigator, and Workflow Spotlight data-testid strings, button labels, focus/jump callbacks, and local-only derivation contracts are preserved in `src/ui/workstationGuidancePanels.tsx`. No project schema, save/load, playback, render/export, Handoff, Quick Actions execution, local draft, sampling, remote AI, analytics, accounts, or cloud behavior changed.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Split guidance panels before adding more UI surface. | The current build is functionally passing but emits a large main chunk warning after recent growth; extracting cohesive render-only guidance panels improves desktop build hygiene without changing product behavior. |
| 2026-06-19 | Export `createWorkflowSpotlightSummary` from the guidance module. | Workflow Navigator rendering and Quick Actions share the same UI-local spotlight derivation, so the helper should live with the extracted render-only guidance surface while preserving call sites. |

## Progress

- [x] Created `codex/plan-395-guidance-panel-chunk` worktree.
- [x] Extract guidance panels into a dedicated module.
- [x] Add build chunk group and update docs/static QA.
- [x] Run QA/build/verify and review.
- [x] Move plan to completed and create review mirror.
