# plan-403-mix-snapshot-recall

## Status

Active

## Goal

Let users recall a captured Mix Snapshot A or B back into the current mixer/master state after comparing passes, so working producers can choose a mix pass quickly and beginners can recover a safer mix without guessing which sliders changed.

## Scope

- Extend UI-local Mix Snapshot captures with enough mixer/master state to recall the pass.
- Add visible Recall controls for captured A/B slots and direct Quick Actions recall commands.
- Route recall only through existing undoable project update paths, replacing mixer channels and master posture from the selected snapshot.
- Keep Mix Snapshot slots UI-local and out of saved project schema.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No persistent mix snapshot schema, project-file migration, audio render storage, reference audio, uploads, sampling, remote AI, plugin hosting, or cloud sync.
- No automatic recall, autoplay, auto-export, batch actions, or hidden mix selection.
- No changes to Mix Balance Pad definitions, Mix Coach scoring, render algorithms, WAV/stem/MIDI export bytes, or playback scheduling.

## Files

- `src/ui/App.tsx`
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
- `npm run qa`
- `npm run verify`

## QA Log

- 2026-06-19: `git diff --check` passed.
- 2026-06-19: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-19: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-19: `npm run typecheck` passed.
- 2026-06-19: `npm run build` passed; production main chunk stayed under the warning threshold at 499.76 kB.
- 2026-06-19: `npm run qa` passed.
- 2026-06-19: `npm run verify` passed, including runtime smoke for 11/11 Beat Blueprints and 11/11 supported style profiles.

## Review

Post-QA review complete. No blocking issues found. Residual risk: no browser click automation was added for the new Recall buttons; coverage is through typecheck, static QA expectations, production build, and runtime smoke.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Keep Mix Snapshot Recall UI-local but undoable. | The user needs practical A/B selection, but the slots should remain temporary comparison state rather than saved project data. |

## Progress

- [x] Created `codex/plan-403-mix-snapshot-recall` worktree.
- [x] Inspect current Mix Snapshot capture/comparison/Quick Actions.
- [x] Implement visible Recall controls and direct Quick Actions.
- [x] Update docs/static QA.
- [x] Run QA/build/verify and review.
- [x] Move plan to completed and create review mirror.
