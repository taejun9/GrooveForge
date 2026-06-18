# plan-396-mode-switch-actions

## Status

Completed

## Goal

Make Guided/Studio mode switching explicit and command-palette accessible so beginners can return to a guided next-step route and producers can jump back to a studio scan without hunting for the segmented control.

## Scope

- Add visible UI-local mode switch result feedback after Guided/Studio button clicks or direct Quick Actions mode commands.
- Add direct Quick Actions for Guided mode and Studio mode that reuse the same explicit mode switch handler.
- Derive result labels from existing Mode Focus, Session Pass, and First Beat Path summaries.
- Update README/product/quality/harness expectations.

## Non-Goals

- No new mode type, onboarding overlay, tutorial, macro, command chain, auto-run, autoplay, auto-save, auto-export, project schema change, playback change, render/export change, Handoff change, sampling/imported audio scope, remote AI, analytics, accounts, payments, or cloud sync.
- No change to existing Mode Focus, First Beat Path, Session Pass, Workflow Navigator, or Quick Actions ranking semantics beyond adding the two explicit mode commands.

## Files

- `src/ui/App.tsx`
- `src/ui/workstationGuidancePanels.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

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
- 2026-06-19: `npm run build` passed with main chunk at 499.74 kB and no large-chunk warning after moving mode switch result rendering/action helpers into `workstationGuidancePanels.tsx`.
- 2026-06-19: `npm run verify` passed, including runtime smoke, typecheck, and build.
- 2026-06-19: Browser/dev-server verification not run; sandboxed `npm run dev -- --host 127.0.0.1 --port 5196` failed with `listen EPERM`, and the required escalated retry was rejected by the environment policy.
- 2026-06-19: After review copy tightening, `python3 harness/scripts/run_qa.py` passed and `npm run verify` passed again.

## Review

2026-06-19 post-QA review complete. No code issues found. UI copy was tightened once during review so the visible result cue stays focused on direct beat-making steps while sampling boundaries remain in docs/QA.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Add direct mode commands plus UI-local result feedback. | Guided/Studio is already a meaningful beginner/pro split; making the switch explicit and searchable improves workstation ergonomics without changing composition, playback, or export behavior. |
| 2026-06-19 | Derive Mode Switch Result from Mode Focus, Session Pass, and First Beat Path only. | The result should explain workflow posture and next checks without adding onboarding overlays, generation, playback, export, sampling, or schema scope. |
| 2026-06-19 | Keep Mode Switch Result rendering and Quick Action creation in `workstationGuidancePanels.tsx`. | This preserves the existing Vite guidance-panel chunk split and keeps the main app chunk below the 500 kB warning threshold. |

## Progress

- [x] Created `codex/plan-396-mode-switch-actions` worktree.
- [x] Implement mode switch result and Quick Actions.
- [x] Update docs and static QA expectations.
- [x] Run QA/build/verify.
- [x] Review.
- [x] Move plan to completed and create review mirror.
