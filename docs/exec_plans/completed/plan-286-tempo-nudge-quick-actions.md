# plan-286-tempo-nudge-quick-actions

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Expose existing Tempo Nudge Pads through Quick Actions so users can adjust BPM from command search without hunting for the transport setup controls.

## Scope

- Add Quick Actions for the existing Tempo Nudge Pad options: -1 BPM, +1 BPM, half-time, and double-time.
- Route each command only through the existing `applyTempoNudgePad` handler and `tempoNudgePadBpm` calculation.
- Keep tempo commands explicit, local, undoable, searchable, and result-labeled after each command run.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- Do not add tap-tempo command behavior, tempo automation, beat detection, audio input, or new BPM algorithms.
- Do not change manual BPM input, Tap Tempo timing/history behavior, Tempo Nudge Pad UI behavior, playback, metronome, save/load, snapshots, render/export, MIDI export, Handoff, Style Quick Picks, Key Retarget, or Beat Blueprint behavior.
- Do not add sampling, imported audio, hidden generation, remote AI, plugin hosting, accounts, analytics, cloud sync, or command chains.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for Tempo Nudge Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Create task branch and worktree.
- [x] Create active exec plan.
- [x] Inspect existing Tempo Nudge Pads, manual BPM input, and Quick Actions patterns.
- [x] Add Tempo Nudge Quick Actions using the existing pad handler.
- [x] Update docs and static QA.
- [x] Run QA before review.
- [x] Move this plan to completed and create a review mirror.
- [ ] Merge to `main`, push, delete branch, and remove worktree.

## Validation

Run:

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
npm run harness:smoke
npm run typecheck
npm run build
npm run qa
npm run verify
git diff --check
```

Browser smoke if environment allows localhost: Quick Actions shows Tempo Nudge commands for -1, +1, half-time, and double-time, command details name the current and target BPM, running a command adjusts BPM through the existing undoable tempo nudge path, Tap Tempo state resets, playback/metronome still follow the project BPM, the project remains sample-free, and no console errors occur.

## Review

QA completed before review.

Findings: no blocking issues found. Tempo Nudge Quick Actions are explicit Transport commands, derive target BPM through `tempoNudgePadBpm`, run only through `applyTempoNudgePad`, and reuse the existing undoable Tap Tempo reset path. The change does not add audio input, beat detection, tempo automation, hidden generation, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or command chains.

Residual risk: browser smoke could not run because the sandbox rejected local Vite listen on `127.0.0.1:5310` with `EPERM`, and the escalated retry was rejected by environment policy. CLI coverage passed, including sample-free all-style runtime smoke.

QA results:

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run harness:smoke` passed for 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite large-chunk warning for `dist/assets/index-Ck7xtoPA.js` at 513.91 kB.
- `npm run qa` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Browser smoke blocked: `npm run dev -- --host 127.0.0.1 --port 5310` failed with `listen EPERM`; escalated retry was rejected by environment policy.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Expose existing Tempo Nudge Pads through Quick Actions instead of adding new BPM logic. | The product already has explicit undoable tempo pads; command search improves BPM setup speed for producers and makes the first-run BPM/key/style flow easier for beginners without changing transport contracts. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Started plan-286 from `main` in `.worktree/plan-286-tempo-nudge-quick-actions`. |
| 2026-06-18 | repo_cartographer | Confirmed product docs keep GrooveForge framed as an all-genre beat workstation with sampling optional and subordinate. |
| 2026-06-18 | harness_builder | Added Tempo Nudge Quick Actions expectations to README/product/quality/App static QA checks. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed after implementation. |
| 2026-06-18 | quality_runner | Full CLI QA passed; browser smoke blocked by sandbox localhost bind policy. |
| 2026-06-18 | review_judge | Reviewed after QA; no blocking findings. |
| 2026-06-18 | doc_gardener | Moved plan to completed and created `docs/reviews/plan-286-tempo-nudge-quick-actions-review.md`. |
