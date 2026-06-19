# plan-415-key-compass-cadence

## Status

Completed

## Goal

Add a read-only Key Compass Cadence card so experienced producers can scan harmonic resolution quickly, and beginners can understand whether the selected Pattern's chords are missing, thin, tense, or resolving inside the current key.

## Scope

- Derive Cadence only from the selected Pattern's chord events and current project key.
- Show the card in Key Compass and expose it through the existing Key Compass focus buttons and Quick Actions card loop.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No automatic chord writing, reharmonization, genre-authenticity scoring, music-theory guarantees, changed key retargeting, changed chord event data, changed playback/export/render bytes, changed project schema, sampling, imported audio, remote AI, remote analysis, accounts, analytics, or cloud sync.

## Files

- `src/ui/App.tsx`
- `src/ui/workstationUiModel.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/completed/plan-415-key-compass-cadence.md`
- `docs/reviews/plan-415-key-compass-cadence-review.md`

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
- 2026-06-19: `npm run build` passed with the existing Vite chunk-size warning.
- 2026-06-19: `npm run qa` passed.
- 2026-06-19: `npm run verify` passed, including runtime smoke, typecheck, and build.
- 2026-06-19: `npm run dev -- --host 127.0.0.1` was blocked by sandbox `listen EPERM`; escalated retry was rejected by the environment policy, so browser/dev-server smoke was not run.

## Review

No findings. The Cadence card is read-only, derives from current key and selected Pattern chord events, routes through existing Key Compass focus and Quick Actions card loops, and does not mutate chord data, retarget keys, trigger playback, or change render/export behavior.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Add Cadence as a read-only Key Compass card. | Harmonic resolution guidance helps direct composition without auto-writing chords or claiming theory correctness. |
| 2026-06-19 | Treat cadence as local posture, not a theory or genre-authenticity guarantee. | Producers can scan resolution quickly while beginners get direction without hidden reharmonization. |

## Progress

- [x] Created `codex/plan-415-key-compass-cadence` worktree.
- [x] Inspect Key Compass derivation and routing.
- [x] Add read-only Cadence card.
- [x] Update docs/static QA.
- [x] Run validation and review.
- [x] Move plan to completed and create review mirror.
